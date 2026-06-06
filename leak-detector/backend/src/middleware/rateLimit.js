import rateLimit from 'express-rate-limit';

/**
 * Scan rate limiting (protect GitHub API + costs)
 */
export const scanRateLimit = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,  // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX) || 20,  // 20 scans/IP
  skip: (req) => {
    // Skip for localhost (development)
    return req.ip === '::1' || req.ip === '127.0.0.1' || req.ip === '::ffff:127.0.0.1';
  },
  message: {
    error: 'Rate limit exceeded',
    reset: 'Try again in 15 minutes',
    hint: 'Upgrade to PRO for unlimited scans!'
  },
  standardHeaders: true,  // X-RateLimit-Limit, X-RateLimit-Remaining
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: 'Rate limit exceeded',
      reset: Math.ceil((Date.now() + (req.rateLimit.resetMs || 0) - Date.now()) / 1000),
      remaining: req.rateLimit.remaining || 0,
      windowMs: req.rateLimit.windowMs || 900000
    });
  }
});

/**
 * General API rate limit (dashboard, health)
 */
export const apiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 100,
  skip: (req) => {
    // Skip localhost + health checks
    const skipPaths = ['/health', '/api/health'];
    return skipPaths.some(path => req.path.includes(path)) || 
           req.ip === '::1' || req.ip === '127.0.0.1';
  },
  standardHeaders: true,
  handler: (req, res) => {
    res.status(429).json({
      error: 'API rate limit exceeded',
      reset: Math.ceil((req.rateLimit.resetMs - Date.now()) / 1000),
      remaining: req.rateLimit.remaining
    });
  }
});

/**
 * Trusted IPs bypass (production - add your Vercel/Railway IPs)
 */
export const trustedIPs = [
  '127.0.0.1',
  '::1',
  '::ffff:127.0.0.1'
];

/**
 * Health check middleware (always allow)
 */
export const skipRateLimit = (req, res, next) => {
  if (req.path === '/health' || req.path === '/api/health') {
    return next();
  }
  next();
};

export default { 
  scanRateLimit, 
  apiRateLimit, 
  trustedIPs, 
  skipRateLimit 
};