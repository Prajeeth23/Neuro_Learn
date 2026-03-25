const express = require('express');
const router = express.Router();
const supabase = require('../db/supabaseClient');
const authMiddleware = require('../middleware/auth');
const { getRecommendedModules } = require('../services/adaptiveEngine');

// Get all courses — supports ?domain= and ?q= query params
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { domain, q } = req.query;
    let query = req.supabaseClient.from('courses').select('*');

    if (domain && domain !== 'All') {
      query = query.eq('domain', domain);
    }

    if (q) {
      query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%,category.ilike.%${q}%`);
    }

    const { data, error } = await query;
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Search courses (dedicated search endpoint)
router.get('/search', authMiddleware, async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 2) {
      return res.json([]);
    }
    const { data, error } = await req.supabaseClient
      .from('courses')
      .select('*')
      .or(`title.ilike.%${q}%,description.ilike.%${q}%,category.ilike.%${q}%`);

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single course details
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const { data, error } = await req.supabaseClient.from('courses').select('*').eq('id', req.params.id).single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get modules for a course (adaptive logic applied)
router.get('/:courseId/modules', authMiddleware, async (req, res) => {
  const { courseId } = req.params;
  const userId = req.user.id;
  try {
    // 1. Check if user is admin to bypass assessment
    const { data: userProfile, error: roleError } = await req.supabaseClient
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();

    if (roleError) {
      console.log('Role check error in modules route:', roleError.message);
    }

    if (userProfile?.role === 'admin') {
      console.log('Bypassing assessment for admin:', userId);
      const { data: allModules, error: mError } = await req.supabaseClient
        .from('modules')
        .select('*')
        .eq('course_id', courseId)
        .order('order_index', { ascending: true });
      
      if (mError) {
        console.error('Error fetching modules for admin:', mError.message);
        throw mError;
      }
      return res.json(allModules);
    }

    // 2. Get user's current progress/level for this course
    const { data: progress, error: pError } = await req.supabaseClient
      .from('user_progress')
      .select('level')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .single();

    if (!progress) {
      console.log(`403: No progress found for user ${userId} in course ${courseId}`);
      return res.status(403).json({ error: 'User has not taken the initial assessment for this course' });
    }

    // 2. Fetch modules matching the current adaptive level
    const recommendedModules = await getRecommendedModules(courseId, progress.level);
    res.json(recommendedModules);
  } catch (err) {
    console.error('Modules route general error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
