const express = require('express');
const router = express.Router();
const supabase = require('../db/supabaseClient');
const authMiddleware = require('../middleware/auth');

// Get progress for all enrolled courses
router.get('/', authMiddleware, async (req, res) => {
  const userId = req.user.id;
  try {
    const { data: progressData, error } = await req.supabaseClient
      .from('user_progress')
      .select(`
        *,
        course:courses(title, category, domain)
      `)
      .eq('user_id', userId);

    if (error) throw error;
    res.json(progressData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get recent activity
router.get('/activity', authMiddleware, async (req, res) => {
  const userId = req.user.id;
  try {
    const { data: activityData, error } = await req.supabaseClient
      .from('user_activity')
      .select(`
        *,
        module:modules(title, course_id)
      `)
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .limit(10);

    if (error) throw error;
    res.json(activityData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =====================================================
// SCREEN TIME TRACKING
// =====================================================

// POST /api/progress/screen-time — Log a screen time session
router.post('/screen-time', authMiddleware, async (req, res) => {
  const { course_id, duration_seconds } = req.body;
  const userId = req.user.id;

  try {
    if (!duration_seconds || duration_seconds < 1) {
      return res.status(400).json({ error: 'Valid duration_seconds required' });
    }

    const today = new Date().toISOString().split('T')[0];

    // Upsert: add to existing entry for today or create new
    const { data: existing } = await req.supabaseClient
      .from('screen_time')
      .select('id, duration_seconds')
      .eq('user_id', userId)
      .eq('session_date', today)
      .eq('course_id', course_id || null)
      .maybeSingle();

    if (existing) {
      const { error } = await req.supabaseClient
        .from('screen_time')
        .update({ duration_seconds: existing.duration_seconds + duration_seconds })
        .eq('id', existing.id);
      if (error) throw error;
    } else {
      const insertData = {
        user_id: userId,
        duration_seconds,
        session_date: today
      };
      if (course_id) insertData.course_id = course_id;

      const { error } = await req.supabaseClient
        .from('screen_time')
        .insert(insertData);
      if (error) throw error;
    }

    res.json({ message: 'Screen time logged' });
  } catch (err) {
    console.error('Screen time log error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/progress/screen-time — Get screen time history
router.get('/screen-time', authMiddleware, async (req, res) => {
  const userId = req.user.id;
  try {
    const { data, error } = await req.supabaseClient
      .from('screen_time')
      .select('*')
      .eq('user_id', userId)
      .order('session_date', { ascending: false })
      .limit(30);

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =====================================================
// ANALYTICS
// =====================================================

// GET /api/progress/analytics — Aggregated analytics
router.get('/analytics', authMiddleware, async (req, res) => {
  const userId = req.user.id;
  try {
    // Fetch all data in parallel
    const [screenTimeRes, quizRes, progressRes, activityRes] = await Promise.all([
      req.supabaseClient
        .from('screen_time')
        .select('*')
        .eq('user_id', userId)
        .order('session_date', { ascending: true })
        .limit(30),
      req.supabaseClient
        .from('quiz_results')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true })
        .limit(50),
      req.supabaseClient
        .from('user_progress')
        .select('*, course:courses(title, category)')
        .eq('user_id', userId),
      req.supabaseClient
        .from('user_activity')
        .select('*, module:modules(title)')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })
        .limit(20)
    ]);

    const screenTime = screenTimeRes.data || [];
    const quizResults = quizRes.data || [];
    const progress = progressRes.data || [];
    const activity = activityRes.data || [];

    // Calculate stats
    const totalScreenTime = screenTime.reduce((sum, s) => sum + s.duration_seconds, 0);
    const avgQuizScore = quizResults.length > 0 
      ? Math.round(quizResults.reduce((sum, q) => sum + q.score, 0) / quizResults.length) 
      : 0;
    const totalQuizzes = quizResults.length;
    const coursesEnrolled = progress.length;
    const avgLevel = progress.length > 0
      ? (progress.reduce((sum, p) => sum + (p.level || 3), 0) / progress.length).toFixed(1)
      : 3;

    res.json({
      summary: {
        totalScreenTimeMinutes: Math.round(totalScreenTime / 60),
        avgQuizScore,
        totalQuizzes,
        coursesEnrolled,
        avgLevel: parseFloat(avgLevel)
      },
      screenTime,
      quizResults,
      progress,
      recentActivity: activity
    });
  } catch (err) {
    console.error('Analytics error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/progress/quiz-result — Save a quiz result
router.post('/quiz-result', authMiddleware, async (req, res) => {
  const { course_id, module_id, score, total_questions, level, quiz_type } = req.body;
  const userId = req.user.id;

  try {
    const { data, error } = await req.supabaseClient
      .from('quiz_results')
      .insert({
        user_id: userId,
        course_id: course_id || null,
        module_id: module_id || null,
        score: score || 0,
        total_questions: total_questions || 10,
        level: level || 3,
        quiz_type: quiz_type || 'module'
      })
      .select()
      .single();

    if (error) throw error;
    res.json({ message: 'Quiz result saved', result: data });
  } catch (err) {
    console.error('Quiz result save error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
