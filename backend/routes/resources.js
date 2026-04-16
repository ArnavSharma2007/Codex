const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const User = require('../models/User');

router.post('/upload', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const today = new Date();
    const lastDate = user.lastUploadDate ? new Date(user.lastUploadDate) : null;
    const isSameDay = lastDate &&
      lastDate.getFullYear() === today.getFullYear() &&
      lastDate.getMonth() === today.getMonth() &&
      lastDate.getDate() === today.getDate();

    if (!isSameDay) {
      user.dailyUploadCount = 0;
      user.lastUploadDate = today;
    }

    const freeLimit = 1;
    const premiumLimit = 2;
    const allowedLimit = user.isPremium ? premiumLimit : freeLimit;

    if (user.dailyUploadCount >= allowedLimit) {
      return res.status(429).json({ message: 'Upload limit reached for today' });
    }

    user.dailyUploadCount += 1;
    user.lastUploadDate = today;
    await user.save();

    res.json({ message: 'Upload accepted (placeholder)', dailyUploadCount: user.dailyUploadCount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
