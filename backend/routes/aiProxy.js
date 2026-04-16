// backend/routes/aiProxy.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');

// dynamic import of node-fetch so it works on older Node versions
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

router.post('/query', auth, async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ message: 'Missing prompt' });

    if (!req.user.isPremium) {
      return res.status(403).json({ message: 'AI Assistant is a premium feature. Upgrade to use.' });
    }

    const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';
    
    // --- START OF UPDATED CODE ---
    const body = {
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        maxOutputTokens: 2048 // Increased from 512 to give the model room to answer
      }
    };
    // --- END OF UPDATED CODE ---

    const apiKey = process.env.GEMINI_API_KEY;

    const resp = await fetch(url + '?key=' + apiKey, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    const data = await resp.json();

    if (!resp.ok || data.error) {
      console.error('Google API Error:', data.error);
      return res.status(502).json({ message: data.error ? data.error.message : 'Bad response from AI provider' });
    }

    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      // This will no longer be triggered, but we keep it as a safety net
      console.error('Unexpected Google API response structure:', data);
      return res.status(500).json({ message: 'Could not parse AI response.' });
    }

    res.json({ result: text });
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;