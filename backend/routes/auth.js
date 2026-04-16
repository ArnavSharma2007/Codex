const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const validate = require('../middleware/validate');
const { authLimiter } = require('../middleware/rateLimiter');
const { authFailures } = require('../metrics/prometheus');
const logger = require('../middleware/logger');
const { registerSchema, loginSchema, setPremiumSchema } = require('../validators/authValidators');
const auth = require('../middleware/authMiddleware');

const signToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, isPremium: user.isPremium },
    process.env.JWT_SECRET,
    { expiresIn: process.env.TOKEN_EXPIRY || '7d' }
  );
};

// POST /api/auth/register
router.post('/register', authLimiter, validate(registerSchema), async (req, res) => {
  const { name, email, password } = req.body;

  const existing = await User.findOne({ email });
  if (existing) {
    authFailures.inc({ reason: 'email_taken' });
    return res.status(409).json({ message: 'Email already registered' });
  }

  const salt = await bcrypt.genSalt(12);
  const hash = await bcrypt.hash(password, salt);
  const user = new User({ name, email, passwordHash: hash });
  await user.save();

  const token = signToken(user);
  logger.info(`New user registered: ${email}`);
  res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email, isPremium: user.isPremium } });
});

// POST /api/auth/login
router.post('/login', authLimiter, validate(loginSchema), async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    authFailures.inc({ reason: 'user_not_found' });
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    authFailures.inc({ reason: 'wrong_password' });
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = signToken(user);
  logger.info(`User login: ${email}`);
  res.json({ token, user: { id: user._id, name: user.name, email: user.email, isPremium: user.isPremium } });
});

// POST /api/auth/set-premium (admin only)
router.post('/set-premium', validate(setPremiumSchema), async (req, res) => {
  const { email, adminKey } = req.body;
  if (adminKey !== process.env.ADMIN_KEY) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: 'User not found' });
  user.isPremium = true;
  await user.save();
  logger.info(`User ${email} upgraded to premium`);
  res.json({ message: 'User upgraded to premium' });
});

// POST /api/auth/get-user-status
router.post('/get-user-status', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email required' });
  const user = await User.findOne({ email }).select('email isPremium');
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json({ email: user.email, isPremium: user.isPremium });
});

// GET /api/auth/verify
router.get('/verify', auth, async (req, res) => {
  // auth middleware already attached req.user
  res.json({ user: req.user });
});

module.exports = router;
