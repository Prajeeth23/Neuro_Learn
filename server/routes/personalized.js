const express = require('express');
const router = express.Router();
console.log('--- Personalized Learning Router Loaded ---');
const multer = require('multer');
const path = require('path');
const os = require('os');
const authMiddleware = require('../middleware/auth');
const geminiService = require('../services/geminiService');
const fileService = require('../services/fileService');

// Configure multer for file uploads (temp directory)
const upload = multer({
  dest: path.join(os.tmpdir(), 'neurolearn-uploads'),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowed = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg', 'image/jpg', 'image/png',
      'text/plain'
    ];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${file.mimetype}. Allowed: PDF, DOCX, JPG, PNG, TXT`));
    }
  }
});

// Get all personalized materials for authenticated user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { data, error } = await req.supabaseClient
      .from('personalized_materials')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Generate full AI analysis from text input
router.post('/generate', authMiddleware, async (req, res) => {
  const { title, material_text, deadline_days } = req.body;
  const userId = req.user.id;

  try {
    if (!title || !material_text || !deadline_days) {
      return res.status(400).json({ error: 'Title, material text, and deadline (days) are required.' });
    }

    // Full AI analysis
    const analysis = await geminiService.analyzePersonalizedContent(material_text, parseInt(deadline_days) || 7);

    // Save to DB
    const { data, error } = await req.supabaseClient
      .from('personalized_materials')
      .insert({
        user_id: userId,
        title,
        material_text,
        deadline: new Date(Date.now() + (parseInt(deadline_days) || 7) * 86400000).toISOString(),
        study_plan: analysis.studyPlan,
        notes: {
          summary: analysis.summary,
          keyTopics: analysis.keyTopics,
          importantPoints: analysis.importantPoints,
          quiz: analysis.quiz
        }
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase Insert Error (Personalized):', error);
      throw new Error(`Failed to save to database: ${error.message}`);
    }
    res.json({ message: 'Analysis complete', plan: data, analysis });
  } catch (err) {
    console.error('Personalized Gen Error:', err.stack);
    res.status(500).json({ error: err.message });
  }
});

// Upload file → extract text → full AI analysis
router.post('/upload', authMiddleware, upload.single('file'), async (req, res) => {
  const userId = req.user.id;

  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { title, deadline_days } = req.body;
    if (!title || !deadline_days) {
      return res.status(400).json({ error: 'Title and deadline (days) are required.' });
    }

    // Extract text from file
    const extractedText = await fileService.extractTextFromFile(
      req.file.path,
      req.file.mimetype,
      req.file.originalname
    );

    if (!extractedText || extractedText.trim().length < 20) {
      return res.status(400).json({ error: 'Could not extract sufficient text from the uploaded file.' });
    }

    // Full AI analysis
    const analysis = await geminiService.analyzePersonalizedContent(extractedText, parseInt(deadline_days));

    // Save to DB
    const { data, error } = await req.supabaseClient
      .from('personalized_materials')
      .insert({
        user_id: userId,
        title,
        material_text: extractedText.substring(0, 5000), // Store first 5000 chars preview
        deadline: new Date(Date.now() + (parseInt(deadline_days) || 7) * 86400000).toISOString(),
        study_plan: analysis.studyPlan,
        notes: {
          summary: analysis.summary,
          keyTopics: analysis.keyTopics,
          importantPoints: analysis.importantPoints,
          quiz: analysis.quiz
        }
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase Insert Error (Personalized Upload):', error);
      throw new Error(`Failed to save to database: ${error.message}`);
    }
    res.json({ message: 'File analyzed successfully', plan: data, analysis });
  } catch (err) {
    require('fs').appendFileSync('upload_error.log', `[${new Date().toISOString()}] ${err.stack}\n\n`);
    console.error('File Upload Analysis Error:', err.stack);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
