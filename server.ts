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
  createRateLimiter,
  errorHandler,
} from './server/middleware/security';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  // Security Headers (§Phase 3)
  app.use(securityHeaders);

  // Global Middlewares with bounded payload size (§Phase 3)
  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: true, limit: '2mb' }));
  app.use(cookieParser());

  // CORS and preflight handling
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.header(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    );
    res.header('Access-Control-Allow-Credentials', 'true');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      service: 'ABHI MOCK TEST Examination Engine',
      timestamp: new Date().toISOString(),
    });
  });

  // Rate limiters for sensitive endpoints (§Phase 3)
  const authRateLimiter = createRateLimiter({
    windowMs: 60 * 1000,
    maxRequests: 20,
    message: 'Too many authentication attempts. Please wait 1 minute before retrying.',
  });

  const aiRateLimiter = createRateLimiter({
    windowMs: 60 * 1000,
    maxRequests: 30,
    message: 'AI Mentor rate limit exceeded. Please wait a moment before sending another query.',
  });

  // API Routes
  app.use('/api/auth/login', authRateLimiter);
  app.use('/api/auth/register', authRateLimiter);
  app.use('/api/auth', authRoutes);
  app.use('/api/exams', examsRoutes);
  app.use('/api/tests', testsRoutes);
  app.use('/api/attempts', attemptsRoutes);
  app.use('/api/results', resultsRoutes);
  app.use('/api/dashboard', dashboardRoutes);
  app.use('/api/practice', practiceRoutes);
  app.use('/api/bookmarks', bookmarksRoutes);
  app.use('/api/leaderboard', leaderboardRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/analytics', analyticsRoutes);
  app.use('/api/gemini/chat', aiRateLimiter);
  app.use('/api/gemini', geminiRoutes);
  app.use('/api/reports', reportsRoutes);
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
