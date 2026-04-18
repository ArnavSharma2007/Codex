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
      collaborators: [] // ✅ ensure array exists
    });

    await note.save();

    return res.status(201).json(note);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// List notes for authenticated user
router.get('/', auth, async (req, res) => {
  try {
    const notes = await Note.find({
      $or: [
        { owner: req.user.id.toString(), },
        { collaborators: owner: req.user.id.toString(), }
      ]
    }).sort({ updatedAt: -1 });

    return res.json(notes);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Public notes
router.get('/public/all', async (req, res) => {
  try {
    const notes = await Note.find({ isPrivate: false }).sort({ updatedAt: -1 });
    return res.json(notes);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Get note by ID
router.get('/:id', async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    // ✅ Public note → allow directly
    if (!note.isPrivate) {
      return res.json(note);
    }

    // ✅ Private → require auth
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ')
      ? authHeader.split(' ')[1]
      : null;

    if (!token) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const jwt = require('jsonwebtoken');

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.id;

      const isOwner = note.owner.toString() === userId;
      const isCollaborator = (note.collaborators || [])
        .map(String)
        .includes(userId);

      if (!isOwner && !isCollaborator) {
        return res.status(403).json({ message: 'Access denied' });
      }

      return res.json(note);
    } catch (e) {
      return res.status(403).json({ message: 'Invalid token' });
    }

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Share note
router.post('/:id/share', auth, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    if (note.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only owner can share' });
    }

    const { email } = req.body;

    const userToShare = await User.findOne({ email });
    if (!userToShare) {
      return res.status(404).json({ message: 'User to share with not found' });
    }

    const uid = userToShare._id.toString();

    if (!(note.collaborators || []).map(String).includes(uid)) {
      note.collaborators.push(userToShare._id);
      await note.save();
    }

    return res.json({
      message: 'Shared successfully',
      noteId: note._id,
      sharedWith: userToShare.email
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
