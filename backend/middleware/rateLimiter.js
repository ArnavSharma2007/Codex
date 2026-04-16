const rateLimit = require('express-rate-limit');
const logger = require('./logger');

/**
 * General API rate limiter — 200 req / 15 min per IP
 */
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`Rate limit exceeded: ${req.ip} → ${req.originalUrl}`);
    res.status(429).json({ message: 'Too many requests. Please try again later.' });
  },
});

/**
 * Strict auth limiter — 20 req / 15 min for /api/auth
 * Prevents brute-force attacks on login/register.
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`Auth rate limit exceeded: ${req.ip} → ${req.originalUrl}`);
    res.status(429).json({ message: 'Too many auth attempts. Please try again in 15 minutes.' });
  },
});

/**
 * AI endpoint limiter — 30 req / 15 min (Gemini is expensive)
 */
const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({ message: 'AI rate limit exceeded. Upgrade to premium for higher limits.' });
  },
});

module.exports = { generalLimiter, authLimiter, aiLimiter };
