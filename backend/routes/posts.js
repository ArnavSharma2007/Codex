const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const Post = require('../models/Post');

router.post('/', auth, async (req, res) => {
  try {
    const { title, content } = req.body;
    const userEmail = req.user.email;
    const post = new Post({ title, content, authorEmail: userEmail });
    await post.save();
    res.status(201).json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/', async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 }).limit(200);
    res.json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
