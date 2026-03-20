const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const geminiService = require('../services/geminiService');

// Tutor Chat — level-aware
router.post('/tutor', authMiddleware, async (req, res) => {
  const { message, history, level, topic } = req.body;
  try {
    if (!message) return res.status(400).json({ error: 'Message is required' });
    const reply = await geminiService.chatTutor(history, message, level || 3, topic || '');
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
    const summary = await geminiService.generateSummary(content);
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
    const result = await geminiService.generateSummaryAndQuiz(content, level || 3);
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
    const quiz = await geminiService.generateQuiz(content, difficulty || 'moderate');
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
    const questions = await geminiService.generateAssessmentQuestions(topic);
    res.json({ questions });
  } catch (err) {
    console.error(`AI Route Error [${req.path}]:`, err);
    res.status(500).json({ error: err.message });
  }
});

// Generate Launch Test (5 questions) before enrolling
router.post('/launch-test', authMiddleware, async (req, res) => {
  const { courseTitle, courseDescription } = req.body;
  try {
    if (!courseTitle) return res.status(400).json({ error: 'Course Title is required' });
    const test = await geminiService.generateLaunchTest(courseTitle, courseDescription || '');
    res.json({ test });
  } catch (err) {
    console.error(`AI Route Error [${req.path}]:`, err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
