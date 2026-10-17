import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

import authRoutes from './server/routes/auth';
import examsRoutes from './server/routes/exams';
import testsRoutes from './server/routes/tests';
import attemptsRoutes from './server/routes/attempts';
import resultsRoutes from './server/routes/results';
import dashboardRoutes from './server/routes/dashboard';
import practiceRoutes from './server/routes/practice';
import bookmarksRoutes from './server/routes/bookmarks';
import leaderboardRoutes from './server/routes/leaderboard';
import adminRoutes from './server/routes/admin';
import analyticsRoutes from './server/routes/analytics';
import geminiRoutes from './server/routes/gemini';
import reportsRoutes from './server/routes/reports';
import dailyChallengeRoutes from './server/routes/dailyChallenge';

import {
  securityHeaders,
  corsMiddleware,
  noCacheHeaders,
  createRateLimiter,
  errorHandler,
} from './server/middleware/security';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  // Strict CORS Middleware (§Phase 3)
  app.use(corsMiddleware);

  // Security Headers & CSP (§Phase 3)
  app.use(securityHeaders);

  // Global Middlewares with bounded payload size (§Phase 3)
  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: true, limit: '2mb' }));
  app.use(cookieParser());

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      service: 'ABHI MOCK TEST Examination Engine',
      timestamp: new Date().toISOString(),
    });
  });

  // Granular Rate Limiters for sensitive endpoints (§Phase 4)
  const authRateLimiter = createRateLimiter({
    windowMs: 15 * 60 * 1000,
    maxRequests: 15,
    message: 'Too many authentication attempts. Please wait a few minutes before retrying.',
  });

  const aiRateLimiter = createRateLimiter({
    windowMs: 60 * 1000,
    maxRequests: 20,
    message: 'AI Mentor rate limit reached. Please wait a moment before sending another query.',
  });

  const submitRateLimiter = createRateLimiter({
    windowMs: 10 * 60 * 1000,
    maxRequests: 20,
    message: 'Too many exam submission requests in a short period.',
  });

  const adminRateLimiter = createRateLimiter({
    windowMs: 60 * 1000,
    maxRequests: 60,
    message: 'Admin operations rate limit exceeded.',
  });

  const reportRateLimiter = createRateLimiter({
    windowMs: 60 * 60 * 1000,
    maxRequests: 10,
    message: 'Report submission rate limit reached. Thank you for your feedback.',
  });

  // Apply cache-prevention to sensitive routes
  app.use('/api/attempts', noCacheHeaders);
  app.use('/api/results', noCacheHeaders);
  app.use('/api/auth', noCacheHeaders);

  // API Routes with appropriate rate limiters
  app.use('/api/auth/login', authRateLimiter);
  app.use('/api/auth/register', authRateLimiter);
  app.use('/api/auth/guest-session', authRateLimiter);
  app.use('/api/auth/firebase-sync', authRateLimiter);
  app.use('/api/auth/change-password', authRateLimiter);
  app.use('/api/auth', authRoutes);

  app.use('/api/exams', examsRoutes);
  app.use('/api/tests', testsRoutes);

  app.use('/api/attempts/:id/submit', submitRateLimiter);
  app.use('/api/attempts', attemptsRoutes);

  app.use('/api/results', resultsRoutes);
  app.use('/api/dashboard', dashboardRoutes);
  app.use('/api/practice', practiceRoutes);
  app.use('/api/bookmarks', bookmarksRoutes);
  app.use('/api/leaderboard', leaderboardRoutes);

  app.use('/api/admin', adminRateLimiter, adminRoutes);
  app.use('/api/analytics', analyticsRoutes);

  app.use('/api/gemini/chat', aiRateLimiter);
  app.use('/api/gemini', geminiRoutes);

  app.use('/api/reports', reportRateLimiter, reportsRoutes);

  app.use('/api/daily-challenge/submit', submitRateLimiter);
  app.use('/api/daily-challenge', dailyChallengeRoutes);

  // Vite middleware in dev or static files in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Centralized error handler preventing stack leaks (§Phase 3 & 12)
  app.use(errorHandler);

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
