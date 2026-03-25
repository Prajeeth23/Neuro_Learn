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

    // Save quiz result
    try {
      await req.supabaseClient.from('quiz_results').insert({
        user_id: userId,
        course_id: courseId,
        score,
        total_questions: 10,
        level: initialLevel,
        quiz_type: 'launch'
      });
    } catch (qErr) {
      console.error('Failed to save quiz result:', qErr.message);
    }

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

    // 2. Save quiz result to quiz_results table
    try {
      await req.supabaseClient.from('quiz_results').insert({
        user_id: userId,
        course_id: courseId || null,
        module_id: moduleId,
        score,
        total_questions: 10,
        quiz_type: 'module'
      });
    } catch (qErr) {
      console.error('Failed to save quiz result:', qErr.message);
    }

    // 3. Fetch current progress level
    const { data: progress } = await req.supabaseClient.from('user_progress').select('*').eq('user_id', userId).eq('course_id', courseId).single();
    
    if (progress) {
      // 4. Evaluate new level
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

// =====================================================
// LEVEL-BASED PREREQUISITE TESTS
// =====================================================

// Submit level prerequisite test (for Medium/Advanced access)
router.post('/level-test/:courseId/submit', authMiddleware, async (req, res) => {
  const { score, targetLevel } = req.body; // targetLevel: 'medium' or 'advanced'
  const courseId = req.params.courseId;
  const userId = req.user.id;

  try {
    // Determine if student passes
    const passed = score >= 30; // 30% threshold
    
    let newLevel;
    if (targetLevel === 'advanced') {
      newLevel = passed ? 5 : 4; // fail → downgrade to medium
    } else {
      // medium
      newLevel = passed ? 4 : 3; // fail → downgrade to beginner
    }

    // Update user progress
    const { data, error } = await req.supabaseClient
      .from('user_progress')
      .upsert({ 
        user_id: userId, 
        course_id: courseId, 
        level: newLevel, 
        last_assessment_date: new Date() 
      }, { onConflict: 'user_id,course_id' })
      .select()
      .single();
      
    if (error) throw error;

    // Save quiz result
    try {
      await req.supabaseClient.from('quiz_results').insert({
        user_id: userId,
        course_id: courseId,
        score,
        total_questions: 10,
        level: newLevel,
        quiz_type: 'level-test'
      });
    } catch (qErr) {
      console.error('Failed to save quiz result:', qErr.message);
    }

    const levelMappings = { 3: 'Beginner', 4: 'Medium', 5: 'Advanced' };

    res.json({ 
      passed,
      message: passed 
        ? `Congratulations! You've unlocked ${levelMappings[newLevel]} level.`
        : `Score below 30%. You've been placed in ${levelMappings[newLevel]} level.`,
      newLevel,
      levelName: levelMappings[newLevel],
      progress: data
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
