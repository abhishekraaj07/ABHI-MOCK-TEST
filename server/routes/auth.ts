import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../db';
import { AuthRequest, authenticate, signToken } from '../middleware/auth';

const router = Router();

// POST /api/auth/register
router.post('/register', async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return res.status(409).json({ error: 'An account with this email address already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        passwordHash,
        role: 'USER',
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    const token = signToken(user);
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: 'lax',
    });

    return res.status(201).json({ user, token });
  } catch (error: any) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'Failed to create account. Please try again.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req: AuthRequest, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    const token = signToken(safeUser);
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: 'lax',
    });

    return res.json({ user: safeUser, token });
  } catch (error: any) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});

// POST /api/auth/logout
router.post('/logout', (_req: AuthRequest, res: Response) => {
  res.clearCookie('token');
  return res.json({ success: true, message: 'Logged out successfully.' });
});

// POST /api/auth/firebase-sync
router.post('/firebase-sync', async (req: AuthRequest, res: Response) => {
  try {
    const { uid, email, name, photoURL } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required for Firebase sync.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    let user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      // Create user if not exists
      const dummyPassword = await bcrypt.hash(`fb_auth_${uid || 'user'}_${Date.now()}`, 10);
      user = await prisma.user.create({
        data: {
          name: name ? name.trim() : (email.split('@')[0] || 'Candidate Aspirant'),
          email: normalizedEmail,
          passwordHash: dummyPassword,
          role: normalizedEmail === 'admin@abhimocktest.com' ? 'ADMIN' : 'USER',
        },
      });
    }

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      photoURL: photoURL || null,
      firebaseUid: uid || null,
    };

    const token = signToken(safeUser);
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: 'lax',
    });

    return res.json({ user: safeUser, token });
  } catch (error: any) {
    console.error('Firebase auth sync error:', error);
    return res.status(500).json({ error: 'Failed to synchronize Firebase user profile.' });
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
      return res.status(404).json({ error: 'User not found.' });
    }

    // Quick stats for user
    const [attemptsCount, bookmarksCount] = await Promise.all([
      prisma.attempt.count({ where: { userId, status: 'COMPLETED' } }),
      prisma.bookmark.count({ where: { userId } }),
    ]);

    return res.json({
      user,
      stats: {
        completedTests: attemptsCount,
        bookmarkedQuestions: bookmarksCount,
      },
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to retrieve user profile.' });
  }
});

// PUT /api/auth/profile
router.put('/profile', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Name cannot be empty.' });
    }

    const updated = await prisma.user.update({
      where: { id: req.user!.id },
      data: { name: name.trim() },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    return res.json({ user: updated, message: 'Profile updated successfully.' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update profile.' });
  }
});

// PUT or POST /api/auth/change-password
const handleChangePassword = async (req: AuthRequest, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long.' });
    }

    const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ error: 'Current password does not match.' });
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: newHash },
    });

    return res.json({ message: 'Password updated successfully.' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update password.' });
  }
};

router.put('/change-password', authenticate, handleChangePassword);
router.post('/change-password', authenticate, handleChangePassword);

export default router;
