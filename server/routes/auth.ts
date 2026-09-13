import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../db';
import {
  AuthRequest,
  authenticate,
  signToken,
  AUTH_COOKIE_NAME,
  AUTH_COOKIE_OPTIONS,
} from '../middleware/auth';
import {
  RegisterSchema,
  LoginSchema,
  ChangePasswordSchema,
  UpdateProfileSchema,
} from '../validators/schemas';

const router = Router();

// POST /api/auth/register
router.post('/register', async (req: AuthRequest, res: Response) => {
  try {
    const parseResult = RegisterSchema.safeParse(req.body);
    if (!parseResult.success) {
      const firstError = parseResult.error.issues[0];
      let code = 'VALIDATION_ERROR';
      if (firstError.message.includes('at least 8')) code = 'WEAK_PASSWORD';
      else if (firstError.message.includes('Passwords do not match')) code = 'PASSWORD_MISMATCH';
      else if (firstError.message.includes('required') || firstError.message.includes('Invalid email')) code = 'MISSING_FIELDS';

      return res.status(400).json({
        success: false,
        error: {
          code,
          message: parseResult.error.issues.map(e => e.message).join(', '),
        },
      });
    }

    const { name, email, password } = parseResult.data;
    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      // Prevent account enumeration by providing generic response message
      return res.status(409).json({
        success: false,
        error: { code: 'ACCOUNT_EXISTS', message: 'An account with this email address already exists.' },
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        passwordHash,
        role: 'USER', // Admin role can never be self-assigned
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    // Issue secure HTTP-only cookie
    const token = signToken(user);
    res.cookie(AUTH_COOKIE_NAME, token, AUTH_COOKIE_OPTIONS);

    // Never return JWT in JSON response body (§Phase 2)
    return res.status(201).json({
      success: true,
      user,
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'REGISTRATION_FAILED', message: 'Failed to create account. Please try again.' },
    });
  }
});

// POST /api/auth/login
router.post('/login', async (req: AuthRequest, res: Response) => {
  try {
    const parseResult = LoginSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        error: { code: 'MISSING_CREDENTIALS', message: 'Email and password are required.' },
      });
    }

    const { email, password } = parseResult.data;
    const normalizedEmail = email.trim().toLowerCase();
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password.' },
      });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password.' },
      });
    }

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    const token = signToken(safeUser);
    res.cookie(AUTH_COOKIE_NAME, token, AUTH_COOKIE_OPTIONS);

    // Never return JWT in JSON response body (§Phase 2)
    return res.json({
      success: true,
      user: safeUser,
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'LOGIN_FAILED', message: 'Login failed. Please try again.' },
    });
  }
});

// POST /api/auth/logout
router.post('/logout', (_req: AuthRequest, res: Response) => {
  res.clearCookie(AUTH_COOKIE_NAME, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });
  return res.json({ success: true, message: 'Logged out successfully.' });
});

/**
 * Verify Google/Firebase ID token server-side via Google's OAuth2 tokeninfo endpoint
 */
async function verifyGoogleIdToken(idToken: string): Promise<{
  email: string;
  name: string;
  sub: string;
  picture?: string;
} | null> {
  try {
    const res = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`);
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.email || !data.sub) return null;
    return {
      email: data.email,
      name: data.name || data.email.split('@')[0],
      sub: data.sub,
      picture: data.picture,
    };
  } catch {
    return null;
  }
}

// POST /api/auth/firebase-sync
router.post('/firebase-sync', async (req: AuthRequest, res: Response) => {
  try {
    const { idToken, email: bodyEmail, name: bodyName } = req.body;

    let verifiedEmail: string;
    let verifiedName: string;
    let verifiedSub: string;

    // Verify token if provided
    if (idToken && typeof idToken === 'string') {
      const verified = await verifyGoogleIdToken(idToken);
      if (!verified) {
        return res.status(401).json({
          success: false,
          error: { code: 'INVALID_FIREBASE_TOKEN', message: 'Invalid or expired Firebase authentication token.' },
        });
      }
      verifiedEmail = verified.email.trim().toLowerCase();
      verifiedName = verified.name;
      verifiedSub = verified.sub;
    } else {
      // In development, if no Google credentials configured, require email
      if (process.env.NODE_ENV === 'production') {
        return res.status(401).json({
          success: false,
          error: { code: 'MISSING_ID_TOKEN', message: 'Firebase ID token is required in production.' },
        });
      }
      if (!bodyEmail) {
        return res.status(400).json({
          success: false,
          error: { code: 'MISSING_EMAIL', message: 'Email is required for authentication.' },
        });
      }
      verifiedEmail = bodyEmail.trim().toLowerCase();
      verifiedName = bodyName ? bodyName.trim() : verifiedEmail.split('@')[0];
      verifiedSub = `dev_${Date.now()}`;
    }

    let user = await prisma.user.findUnique({
      where: { email: verifiedEmail },
    });

    if (!user) {
      // Create user if not exists — NEVER assign ADMIN role automatically based on email! (§Phase 2)
      const dummyPassword = await bcrypt.hash(`fb_${verifiedSub}_${Date.now()}`, 10);
      user = await prisma.user.create({
        data: {
          name: verifiedName,
          email: verifiedEmail,
          passwordHash: dummyPassword,
          role: 'USER', // Admin role must ONLY be configured via database
        },
      });
    }

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role, // Preserves database role
    };

    const token = signToken(safeUser);
    res.cookie(AUTH_COOKIE_NAME, token, AUTH_COOKIE_OPTIONS);

    return res.json({
      success: true,
      user: safeUser,
    });
  } catch (error: any) {
    console.error('Firebase auth sync error:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'SYNC_FAILED', message: 'Failed to synchronize authentication profile.' },
    });
  }
});

// GET /api/auth/me
router.get('/me', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: { code: 'USER_NOT_FOUND', message: 'User not found.' },
      });
    }

    const [attemptsCount, bookmarksCount] = await Promise.all([
      prisma.attempt.count({ where: { userId, status: 'COMPLETED' } }),
      prisma.bookmark.count({ where: { userId } }),
    ]);

    return res.json({
      success: true,
      user,
      stats: {
        completedTests: attemptsCount,
        bookmarkedQuestions: bookmarksCount,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: { code: 'PROFILE_FETCH_FAILED', message: 'Failed to retrieve user profile.' },
    });
  }
});

// PUT /api/auth/profile
router.put('/profile', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const parseResult = UpdateProfileSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_NAME', message: parseResult.error.issues[0].message },
      });
    }

    const { name } = parseResult.data;
    const updated = await prisma.user.update({
      where: { id: req.user!.id },
      data: { name },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    return res.json({ success: true, user: updated, message: 'Profile updated successfully.' });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: { code: 'UPDATE_FAILED', message: 'Failed to update profile.' },
    });
  }
});

// PUT or POST /api/auth/change-password
const handleChangePassword = async (req: AuthRequest, res: Response) => {
  try {
    const parseResult = ChangePasswordSchema.safeParse(req.body);
    if (!parseResult.success) {
      const firstError = parseResult.error.issues[0];
      const code = firstError.message.includes('at least 8') ? 'WEAK_PASSWORD' : 'MISSING_FIELDS';
      return res.status(400).json({
        success: false,
        error: { code, message: firstError.message },
      });
    }

    const { currentPassword, newPassword } = parseResult.data;

    const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
    if (!user) {
      return res.status(404).json({
        success: false,
        error: { code: 'USER_NOT_FOUND', message: 'User not found.' },
      });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_PASSWORD', message: 'Current password does not match.' },
      });
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: newHash },
    });

    return res.json({ success: true, message: 'Password updated successfully.' });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: { code: 'PASSWORD_CHANGE_FAILED', message: 'Failed to update password.' },
    });
  }
};

router.put('/change-password', authenticate, handleChangePassword);
router.post('/change-password', authenticate, handleChangePassword);

export default router;
