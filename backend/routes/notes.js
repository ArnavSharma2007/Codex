const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const Note = require('../models/Note');
const User = require('../models/User');

// Create a note (authenticated)
router.post('/', auth, async (req, res) => {
  try {
    const { title, quillDelta, isPrivate } = req.body;
    const note = new Note({
      title: title || 'Untitled',
      owner: req.user.id,
      quillDelta: quillDelta || null,
      isPrivate: typeof isPrivate === 'boolean' ? isPrivate : true,
    });
    await note.save();
    res.status(201).json(note);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// List notes for authenticated user (owner or collaborator)
router.get('/', auth, async (req, res) => {
  try {
    const notes = await Note.find({
      $or: [
        { owner: req.user.id },
        { collaborators: req.user.id }
      ]
    }).sort({ updatedAt: -1 }).limit(200);
    res.json(notes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Public list: anyone can fetch public notes
router.get('/public/all', async (req, res) => {
  try {
    const notes = await Note.find({ isPrivate: false }).sort({ updatedAt: -1 }).limit(200);
    res.json(notes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get note by id - public allowed if not private, else requires auth and permission
router.get('/:id', async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: 'Note not found' });

    if (!note.isPrivate) return res.json(note);

    // private: require auth header
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
    if (!token) return res.status(403).json({ message: 'Access denied' });

    // verify via jwt on server side
    const jwt = require('jsonwebtoken');
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.id;
      const allowed = note.owner.toString() === userId || (note.collaborators || []).map(String).includes(userId);
      if (!allowed) return res.status(403).json({ message: 'Access denied' });
      return res.json(note);
    } catch (e) {
      return res.status(403).json({ message: 'Invalid token' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Share note: add collaborator by email (owner only)
router.post('/:id/share', auth, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: 'Note not found' });
    if (note.owner.toString() !== req.user.id) return res.status(403).json({ message: 'Only owner can share' });

    const { email } = req.body;
    const userToShare = await User.findOne({ email });
    if (!userToShare) return res.status(404).json({ message: 'User to share with not found' });

    // avoid duplicates
    const uid = userToShare._id.toString();
    const exists = (note.collaborators || []).map(String).includes(uid);
    if (!exists) {
      note.collaborators = note.collaborators || [];
      note.collaborators.push(userToShare._id);
      await note.save();
    }

    res.json({ message: 'Shared successfully', noteId: note._id, sharedWith: userToShare.email });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
