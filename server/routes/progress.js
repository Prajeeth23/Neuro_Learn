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
        course:courses(title, category)
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

module.exports = router;
