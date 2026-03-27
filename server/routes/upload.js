const express = require('express');
const router = express.Router();
const multer = require('multer');
const authMiddleware = require('../middleware/auth');
const aiService = require('../services/aiService');

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Tutor Chat — handles text + optional file (PDF, DOCX, JPG, PNG)
router.post('/tutor', authMiddleware, upload.single('file'), async (req, res) => {
  const { message, history, level, topic } = req.body;
  const file = req.file;

  try {
    if (!message && !file) {
      return res.status(400).json({ error: 'Message or file is required' });
    }
    
    // Parse history if it comes as a JSON string from FormData
    let parsedHistory = [];
    try {
      if (history) parsedHistory = JSON.parse(history);
    } catch (e) { 
      console.error('History parse error', e); 
    }

    const reply = await aiService.chatTutorMultimodal(
      parsedHistory, 
      message || 'Explain this document/image', 
      file, 
      level ? parseInt(level) : 3, 
      topic || ''
    );
    
    res.json({ reply });
  } catch (err) {
    console.error(`Upload Route Error [${req.path}]:`, err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
