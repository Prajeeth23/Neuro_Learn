const express = require('express');
const router = express.Router();
const supabase = require('../db/supabaseClient');
const authMiddleware = require('../middleware/auth');
const { determineInitialLevel, evaluateProgress } = require('../services/adaptiveEngine');

// Get initial assessment for a course
router.get('/initial/:courseId', authMiddleware, async (req, res) => {
  try {
    const { data, error } = await req.supabaseClient
      .from('assessments')
      .select('*')
      .eq('course_id', req.params.courseId)
      .eq('is_initial', true)
      .single();
    if (error && error.code !== 'PGRST116') throw error; // Not found is okay if no assessment exists
    res.json(data || { message: 'No initial assessment found' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Submit initial assessment -> calculate level -> save progress
router.post('/initial/:courseId/submit', authMiddleware, async (req, res) => {
  const { score } = req.body; // Score from 0-100
  const courseId = req.params.courseId;
  const userId = req.user.id;

  try {
    const initialLevel = determineInitialLevel(score);
    
    // Upsert user progress
    const { data, error } = await req.supabaseClient
      .from('user_progress')
      .upsert({ user_id: userId, course_id: courseId, level: initialLevel, last_assessment_date: new Date() }, { onConflict: 'user_id,course_id' })
      .select()
      .single();
      
    if (error) throw error;
    res.json({ message: `Assessment complete. Assigned adaptive level: ${initialLevel}`, progress: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Submit a module end quiz -> adjust level
router.post('/module/:moduleId/submit', authMiddleware, async (req, res) => {
  const { score, courseId } = req.body;
  const moduleId = req.params.moduleId;
  const userId = req.user.id;

  try {
    // 1. Record activity
    await req.supabaseClient.from('user_activity').upsert({ user_id: userId, module_id: moduleId, quiz_score: score, completed: true }, { onConflict: 'user_id,module_id' });

    // 2. Fetch current progress level
    const { data: progress } = await req.supabaseClient.from('user_progress').select('*').eq('user_id', userId).eq('course_id', courseId).single();
    
    if (progress) {
      // 3. Evaluate new level
      const newLevel = evaluateProgress(progress.level, score);
      if (newLevel !== progress.level) {
        await req.supabaseClient.from('user_progress').update({ level: newLevel }).eq('id', progress.id);
        return res.json({ message: `Level updated from ${progress.level} to ${newLevel}`, newLevel });
      }
    }
    
    res.json({ message: 'Quiz submitted. Level unchanged.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
