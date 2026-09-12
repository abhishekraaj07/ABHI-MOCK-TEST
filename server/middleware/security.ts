import { Request, Response, NextFunction } from 'express';

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

/**
 * In-memory sliding window rate limiter without external Redis dependency
 */
export function createRateLimiter(options: {
  windowMs: number;
  maxRequests: number;
  message?: string;
}) {
  const store = new Map<string, RateLimitRecord>();

  // Periodic cleanup of stale entries every 2 minutes
  const cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [ip, record] of store.entries()) {
      if (now > record.resetTime) {
        store.delete(ip);
      }
    }
  }, 120000);

  // Prevent process hanging in tests
  if (cleanupInterval.unref) {
    cleanupInterval.unref();
  }

  return (req: Request, res: Response, next: NextFunction) => {
    const ip =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() ||
      req.socket.remoteAddress ||
      'unknown-ip';

    const now = Date.now();
    const record = store.get(ip);

    if (!record || now > record.resetTime) {
      store.set(ip, {
        count: 1,
        resetTime: now + options.windowMs,
      });
      res.setHeader('X-RateLimit-Limit', options.maxRequests);
      res.setHeader('X-RateLimit-Remaining', options.maxRequests - 1);
      return next();
    }

    if (record.count >= options.maxRequests) {
      const retryAfterSeconds = Math.ceil((record.resetTime - now) / 1000);
      res.setHeader('Retry-After', retryAfterSeconds);
      res.setHeader('X-RateLimit-Limit', options.maxRequests);
      res.setHeader('X-RateLimit-Remaining', 0);
      return res.status(429).json({
        error:
          options.message ||
          `Too many requests from this IP. Please try again in ${retryAfterSeconds} seconds.`,
      });
    }

    record.count++;
    res.setHeader('X-RateLimit-Limit', options.maxRequests);
    res.setHeader('X-RateLimit-Remaining', options.maxRequests - record.count);
    next();
  };
}

/**
 * Standard HTTP Security Headers Middleware
 */
export function securityHeaders(_req: Request, res: Response, next: NextFunction) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), payment=()'
  );
  next();
}

/**
 * Global structured error handler preventing stack trace leaks
 */
export function errorHandler(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  console.error('Unhandled Server Error:', err);

  const status = typeof err.status === 'number' ? err.status : 500;
  const message =
    process.env.NODE_ENV === 'production' && status === 500
      ? 'An internal server error occurred. Please try again later.'
      : err.message || 'Internal server error.';

  return res.status(status).json({
    error: message,
    status,
    timestamp: new Date().toISOString(),
  });
}
