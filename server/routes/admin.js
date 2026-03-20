const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const supabase = require('../db/supabaseClient');
const geminiService = require('../services/geminiService');

// Middleware to check admin role
const adminMiddleware = async (req, res, next) => {
  try {
    const { data: userProfile, error } = await req.supabaseClient
      .from('users')
      .select('role')
      .eq('id', req.user.id)
      .single();

    if (error || !userProfile || userProfile.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Admin access only' });
    }
    next();
  } catch (err) {
    res.status(500).json({ error: 'Failed to verify admin status' });
  }
};

// Check if current user is admin
router.get('/check', authMiddleware, adminMiddleware, (req, res) => {
  res.json({ isAdmin: true });
});

// Add a new course from playlist url
router.post('/courses', authMiddleware, adminMiddleware, async (req, res) => {
  const { title, playlist_url } = req.body;
  if (!title || !playlist_url) {
    return res.status(400).json({ error: 'Title and Playlist URL required' });
  }

  try {
    // Generate description and category using AI
    let description = 'A new course to enhance your skills.';
    let category = 'General';
    try {
      const generated = await geminiService.generateCourseMetadata(title);
      description = generated.description || description;
      category = generated.category || category;
    } catch (aiErr) {
      console.error('AI Metadata generation failed, using defaults:', aiErr.message);
    }

    const { data: course, error: courseError } = await supabase
      .from('courses')
      .insert({ title, description, category })
      .select()
      .single();
    
    if (courseError) {
      console.error('Course insert error:', courseError);
      throw courseError;
    }

    const { data: moduleData, error: moduleError } = await supabase
      .from('modules')
      .insert({
        course_id: course.id,
        title: `${title} - Full Playlist`,
        video_url: playlist_url,
        difficulty_level: '3',
        order_index: 1
      })
      .select()
      .single();
      
    if (moduleError) {
      console.error('Module insert error:', moduleError);
      throw moduleError;
    }

    res.status(201).json({ course, module: moduleData });
  } catch (err) {
    console.error('Error creating course:', err);
    res.status(500).json({ error: 'Failed to create course' });
  }
});

// Delete a course and its modules
router.delete('/courses/:id', authMiddleware, adminMiddleware, async (req, res) => {
  const courseId = req.params.id;

  try {
    // 1. Delete all modules for this course first
    const { error: modError } = await supabase
      .from('modules')
      .delete()
      .eq('course_id', courseId);

    if (modError) {
      console.error('Module delete error:', modError);
    }

    // 2. Delete user progress for this course
    const { error: progressError } = await supabase
      .from('user_progress')
      .delete()
      .eq('course_id', courseId);

    if (progressError) {
      console.error('Progress delete error:', progressError);
    }

    // 3. Delete assessments for this course
    const { error: assessError } = await supabase
      .from('assessments')
      .delete()
      .eq('course_id', courseId);

    if (assessError) {
      console.error('Assessment delete error:', assessError);
    }

    // 4. Delete the course itself
    const { error: courseError } = await supabase
      .from('courses')
      .delete()
      .eq('id', courseId);

    if (courseError) {
      console.error('Course delete error:', courseError);
      throw courseError;
    }

    res.json({ message: 'Course deleted successfully' });
  } catch (err) {
    console.error('Error deleting course:', err);
    res.status(500).json({ error: 'Failed to delete course' });
  }
});

module.exports = router;
