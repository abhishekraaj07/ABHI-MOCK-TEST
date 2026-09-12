import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../db';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

const JWT_SECRET = process.env.JWT_SECRET || 'abhi-mock-test-secret-key-2026';

export function signToken(user: AuthUser): string {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export async function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    let token: string | undefined;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({ error: 'Authentication required. Please log in.' });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, name: true, email: true, role: true },
    });

    if (!user) {
      return res.status(401).json({ error: 'User account not found or deactivated.' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired session. Please log in again.' });
  }
}

export async function optionalAuth(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    let token: string | undefined;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (token) {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: { id: true, name: true, email: true, role: true },
      });
      if (user) {
        req.user = user;
      }
    }
  } catch (error) {
    // Ignore invalid token in optionalAuth
  }
  next();
}

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Access denied. Administrator privileges required.' });
  }
  next();
}
