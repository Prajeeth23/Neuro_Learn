const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const aiService = require('../services/aiService');
const recommendationEngine = require('../services/recommendationEngine');

// Tutor Chat — level-aware
router.post('/tutor', authMiddleware, async (req, res) => {
  const { message, history, level, topic } = req.body;
  try {
    if (!message) return res.status(400).json({ error: 'Message is required' });
    const reply = await aiService.chatTutor(history, message, level || 3, topic || '');
    res.json({ reply });
  } catch (err) {
    console.error(`AI Route Error [${req.path}]:`, err);
    res.status(500).json({ error: err.message });
  }
});

// Video Summary
router.post('/summary', authMiddleware, async (req, res) => {
  const { content } = req.body;
  try {
    if (!content) return res.status(400).json({ error: 'Content is required for summary generation' });
    const summary = await aiService.generateSummary(content);
    res.json({ summary });
  } catch (err) {
    console.error(`AI Route Error [${req.path}]:`, err);
    res.status(500).json({ error: err.message });
  }
});

// Summary + Quiz from content (for course modules)
router.post('/summary-and-quiz', authMiddleware, async (req, res) => {
  const { content, level } = req.body;
  try {
    if (!content) return res.status(400).json({ error: 'Content is required' });
    const result = await aiService.generateSummaryAndQuiz(content, level || 3);
    res.json(result);
  } catch (err) {
    console.error(`AI Route Error [${req.path}]:`, err);
    res.status(500).json({ error: err.message });
  }
});

// Generate Quiz (10 MCQs) from content
router.post('/quiz', authMiddleware, async (req, res) => {
  const { content, difficulty } = req.body;
  try {
    if (!content) return res.status(400).json({ error: 'Content is required' });
    const quiz = await aiService.generateQuiz(content, difficulty || 'moderate');
    res.json({ quiz });
  } catch (err) {
    console.error(`AI Route Error [${req.path}]:`, err);
    res.status(500).json({ error: err.message });
  }
});

// Generate assessment questions for a course
router.post('/assessment-questions', authMiddleware, async (req, res) => {
  const { topic } = req.body;
  try {
    if (!topic) return res.status(400).json({ error: 'Topic is required' });
    const questions = await aiService.generateAssessmentQuestions(topic);
    res.json({ questions });
  } catch (err) {
    console.error(`AI Route Error [${req.path}]:`, err);
    res.status(500).json({ error: err.message });
  }
});

// Generate Launch Test (10 questions) before enrolling
router.post('/launch-test', authMiddleware, async (req, res) => {
  const { courseTitle, courseDescription } = req.body;
  try {
    if (!courseTitle) return res.status(400).json({ error: 'Course Title is required' });
    const test = await aiService.generateLaunchTest(courseTitle, courseDescription || '');
    res.json({ test });
  } catch (err) {
    console.error(`AI Route Error [${req.path}]:`, err);
    res.status(500).json({ error: err.message });
  }
});

// =====================================================
// NEW ENDPOINTS
// =====================================================

// Generate career roles for a domain
router.post('/career-roles', authMiddleware, async (req, res) => {
  const { domain } = req.body;
  try {
    if (!domain) return res.status(400).json({ error: 'Domain is required' });
    const result = await aiService.generateCareerRoles(domain);
    res.json(result);
  } catch (err) {
    console.error(`AI Route Error [${req.path}]:`, err);
    res.status(500).json({ error: err.message });
  }
});

// Generate learning roadmap for domain + role
router.post('/roadmap', authMiddleware, async (req, res) => {
  const { domain, role } = req.body;
  try {
    if (!domain || !role) return res.status(400).json({ error: 'Domain and role are required' });
    const roadmap = await aiService.generateRoadmap(domain, role);
    
    // Save to DB
    try {
      await req.supabaseClient.from('roadmaps').insert({
        user_id: req.user.id,
        domain,
        role,
        roadmap_data: roadmap
      });
    } catch (dbErr) {
      console.error('Failed to save roadmap to DB:', dbErr.message);
    }

    res.json(roadmap);
  } catch (err) {
    console.error(`AI Route Error [${req.path}]:`, err);
    res.status(500).json({ error: err.message });
  }
});

// Generate AI course info (why learn + achievable roles)
router.post('/course-info', authMiddleware, async (req, res) => {
  const { courseTitle, courseDescription } = req.body;
  try {
    if (!courseTitle) return res.status(400).json({ error: 'Course title is required' });
    const info = await aiService.generateCourseInfo(courseTitle, courseDescription);
    res.json(info);
  } catch (err) {
    console.error(`AI Route Error [${req.path}]:`, err);
    res.status(500).json({ error: err.message });
  }
});

// Generate personalized learning insights
router.post('/learning-insights', authMiddleware, async (req, res) => {
  const { progressData } = req.body;
  try {
    if (!progressData) return res.status(400).json({ error: 'Progress data is required' });
    const insights = await recommendationEngine.getRecommendations(progressData);
    res.json(insights);
  } catch (err) {
    console.error(`AI Route Error [${req.path}]:`, err);
    res.status(500).json({ error: err.message });
  }
});

// Generate prerequisite level test
router.post('/level-test', authMiddleware, async (req, res) => {
  const { courseTitle, targetLevel } = req.body;
  try {
    if (!courseTitle || !targetLevel) return res.status(400).json({ error: 'Course title and target level are required' });
    const test = await aiService.generateLevelTest(courseTitle, targetLevel);
    res.json({ test });
  } catch (err) {
    console.error(`AI Route Error [${req.path}]:`, err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
