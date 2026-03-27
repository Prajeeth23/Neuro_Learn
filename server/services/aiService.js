const Groq = require('groq-sdk');
const fs = require('fs');
const path = require('path');
const mammoth = require('mammoth');

const apiKey = process.env.GROQ_API_KEY || process.env.VITE_GROQ_API_KEY;

if (!apiKey) {
  console.warn('GROQ_API_KEY or VITE_GROQ_API_KEY must be provided in environment variables.');
}

const groq = new Groq({ apiKey });
const DEFAULT_MODEL = 'llama-3.3-70b-versatile';
const VISION_MODEL = 'llama-3.2-11b-vision-preview';

const cache = new Map();

/**
 * Helper: Send prompt to Groq and return text
 */
const generateResponse = async (prompt, isVision = false) => {
  if (!apiKey) {
    throw new Error("Groq API key missing. Please provide GROQ_API_KEY in environment variables.");
  }
  try {
    const params = {
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      model: isVision ? VISION_MODEL : DEFAULT_MODEL,
      temperature: 0.1, // Lower temperature for more consistent JSON/structured data
    };

    // If it's a JSON-focused prompt, we can use response_format if the model supports it
    if (prompt.includes('JSON')) {
       params.response_format = { type: "json_object" };
    }

    const chatCompletion = await groq.chat.completions.create(params);
    return chatCompletion.choices[0]?.message?.content || "";
  } catch (error) {
    console.error('Groq API Error:', error);
    throw new Error('Failed to generate response from Groq API');
  }
};

/**
 * Get level description for system prompts
 */
const getLevelDescription = (level) => {
  if (level === 5) return 'advanced (5-star). Provide detailed, in-depth, technical explanations.';
  if (level === 4) return 'intermediate (4-star). Use moderate explanation with clarity. Not too simple, not too complex.';
  return 'beginner (3-star). Use very simple language, everyday examples, and short sentences. Avoid jargon.';
};

/**
 * Robustly parse AI-generated JSON
 */
const parseAIJSON = (text, type = 'object') => {
  try {
    // Groq with json_object usually returns clean JSON, but we'll be safe
    const startChar = type === 'array' ? '[' : '{';
    const endChar = type === 'array' ? ']' : '}';
    
    const startIdx = text.indexOf(startChar);
    const endIdx = text.lastIndexOf(endChar) + 1;
    
    if (startIdx === -1 || endIdx === 0) {
      throw new Error(`Could not find ${type} in AI response`);
    }
    
    let jsonText = text.substring(startIdx, endIdx);
    return JSON.parse(jsonText);
  } catch (e) {
    console.error('JSON Parse Error:', e.message, 'Text:', text);
    throw new Error(`Failed to parse AI response as JSON (${type})`);
  }
};

/**
 * AI Tutor Chat
 */
const chatTutor = async (history, message, level = 3, topic = '') => {
  const levelDesc = getLevelDescription(level);
  const topicContext = topic ? `The current topic is: "${topic}".` : '';

  const systemPrompt = `You are an AI Tutor for NeuroLearn, an adaptive learning platform.
The student's level is: ${levelDesc}
${topicContext}

RULES:
- Answer based on their level and the current topic
- Ensure clarity and correctness
- No unnecessary complexity for beginner users
- Be concise, encouraging, and clear
- If the student asks something off-topic, gently redirect them

The student asks: ${message}`;

  try {
    return await generateResponse(systemPrompt);
  } catch (err) {
    console.error('Groq Chat Error:', err.message);
    throw new Error('Failed to respond to chat');
  }
};

/**
 * Generate a video summary
 */
const generateSummary = async (videoTranscriptOrDescription) => {
  const cacheKey = `summary:${videoTranscriptOrDescription.substring(0, 50)}`;
  if (cache.has(cacheKey)) return cache.get(cacheKey);

  try {
    const prompt = `Provide a concise, clearly formatted summary for the following educational content. 
Use bullet points and highlight key concepts.

Content:
${videoTranscriptOrDescription}`;

    const summary = await generateResponse(prompt);
    cache.set(cacheKey, summary);
    return summary;
  } catch (err) {
    console.error('Groq Summary Error:', err.message);
    throw new Error('Failed to generate summary');
  }
};

/**
 * Generate Summary + Quiz
 */
const generateSummaryAndQuiz = async (content, level = 3) => {
  const levelDesc = getLevelDescription(level);
  const prompt = `Analyze the following educational content and provide a summary and exactly 10 MCQs.
Student Level: ${levelDesc}

MCQ Rules:
- 4 options (A, B, C, D)
- Correct answer letter
- Match the student level difficulty

Respond in EXACT JSON format:
{
  "summary": "...",
  "quiz": [
    { "question": "...", "options": { "A": "...", "B": "...", "C": "...", "D": "..." }, "answer": "A" }
  ]
}

CONTENT:
${content}`;

  try {
    const response = await generateResponse(prompt);
    return parseAIJSON(response, 'object');
  } catch (err) {
    console.error('Groq SummaryAndQuiz Error:', err.message);
    throw err;
  }
};

/**
 * Generate Quiz
 */
const generateQuiz = async (content, difficulty = 'moderate') => {
  const prompt = `Generate exactly 10 MCQs based on the content at ${difficulty} difficulty.
Respond in EXACT JSON array format:
[
  { "question": "...", "options": { "A": "...", "B": "...", "C": "...", "D": "..." }, "answer": "A" }
]

CONTENT:
${content}`;

  try {
    const response = await generateResponse(prompt);
    return parseAIJSON(response, 'array');
  } catch (err) {
    console.error('Groq Quiz Error:', err.message);
    throw err;
  }
};

/**
 * Generate Assessment Questions
 */
const generateAssessmentQuestions = async (courseTopic) => {
  const prompt = `Generate exactly 10 MCQs to assess knowledge in "${courseTopic}".
Questions 1-3: Easy, 4-7: Medium, 8-10: Hard.

Respond in EXACT JSON array format:
[
  { "question": "...", "options": { "A": "...", "B": "...", "C": "...", "D": "..." }, "answer": "A", "difficulty": "easy/medium/hard" }
]`;

  try {
    const response = await generateResponse(prompt);
    return parseAIJSON(response, 'array');
  } catch (err) {
    console.error('Groq Assessment Questions Error:', err.message);
    throw err;
  }
};

/**
 * Analyze Personalized Content
 */
const analyzePersonalizedContent = async (materialText, deadlineDays) => {
  const prompt = `Produce a study guide for the material below for a ${deadlineDays}-day deadline.
Include: summary, keyTopics, importantPoints, studyPlan (daily tasks), and a 10-question quiz.

Respond in EXACT JSON format:
{
  "summary": "...",
  "keyTopics": [],
  "importantPoints": [],
  "studyPlan": [{ "day": 1, "title": "...", "tasks": [] }],
  "quiz": [ { "question": "...", "options": {}, "answer": "A" } ]
}

MATERIAL:
${materialText}`;

  try {
    const response = await generateResponse(prompt);
    return parseAIJSON(response, 'object');
  } catch (err) {
    console.error('Groq Personalized Analysis Error:', err.message);
    throw err;
  }
};

/**
 * Course Metadata
 */
const generateCourseMetadata = async (title) => {
  const prompt = `Generate a 2-3 sentence description and a broad category for a course titled "${title}".
Respond in EXACT JSON format:
{ "description": "...", "category": "..." }`;

  try {
    const response = await generateResponse(prompt);
    return parseAIJSON(response, 'object');
  } catch (err) {
    console.error('Groq Metadata Error:', err.message);
    throw err;
  }
};

/**
 * Launch Test
 */
const generateLaunchTest = async (courseTitle, courseDescription) => {
  const prompt = `Generate exactly 10 MCQs for a launch test for "${courseTitle}".
Description: ${courseDescription}

Respond in EXACT JSON array format:
[ { "question": "...", "options": {}, "answer": "A" } ]`;

  try {
    const response = await generateResponse(prompt);
    return parseAIJSON(response, 'array');
  } catch (err) {
    console.error('Groq Launch Test Error:', err.message);
    throw err;
  }
};

/**
 * Career Roles
 */
const generateCareerRoles = async (domain) => {
  const cacheKey = `roles:${domain}`;
  if (cache.has(cacheKey)) return cache.get(cacheKey);

  const prompt = `Given the domain "${domain}", list 6-8 career roles with description, salary range, and demand.
Respond in EXACT JSON format:
{ "roles": [{ "title": "...", "description": "...", "avgSalary": "...", "demand": "..." }] }`;

  try {
    const response = await generateResponse(prompt);
    const result = parseAIJSON(response, 'object');
    cache.set(cacheKey, result);
    return result;
  } catch (err) {
    console.error('Groq Career Roles Error:', err.message);
    throw err;
  }
};

/**
 * Learning Roadmap
 */
const generateRoadmap = async (domain, role) => {
  const cacheKey = `roadmap:${domain}:${role}`;
  if (cache.has(cacheKey)) return cache.get(cacheKey);

  const prompt = `Generate a structured learning roadmap for becoming a "${role}" in "${domain}".
4-6 phases, skills, tools, and duration.

Respond in EXACT JSON format:
{
  "title": "...",
  "estimatedDuration": "...",
  "phases": [{ "phase": 1, "title": "...", "description": "...", "skills": [], "tools": [], "projects": [] }],
  "tips": []
}

DOMAIN: ${domain}`;

  try {
    const response = await generateResponse(prompt);
    const result = parseAIJSON(response, 'object');
    cache.set(cacheKey, result);
    return result;
  } catch (err) {
    console.error('Groq Roadmap Error:', err.message);
    throw err;
  }
};

/**
 * Course Info
 */
const generateCourseInfo = async (courseTitle, courseDescription) => {
  const cacheKey = `courseinfo:${courseTitle}`;
  if (cache.has(cacheKey)) return cache.get(cacheKey);

  const prompt = `For course "${courseTitle}", explain why to learn it and list 3-5 achievable job roles.
Description: ${courseDescription || 'Not provided'}

Respond in EXACT JSON format:
{ "whyLearn": "...", "achievableRoles": [] }`;

  try {
    const response = await generateResponse(prompt);
    const result = parseAIJSON(response, 'object');
    cache.set(cacheKey, result);
    return result;
  } catch (err) {
    console.error('Groq Course Info Error:', err.message);
    throw err;
  }
};

/**
 * Learning Insights
 */
const generateLearningInsights = async (progressData) => {
  const prompt = `Analyze student data and provide insights on study times, weak areas, and next recommendations.
Data: ${JSON.stringify(progressData)}

Respond in EXACT JSON format:
{ "bestStudyTime": "...", "weakAreas": [], "nextRecommendation": "...", "insights": [], "revisionSuggestions": [], "overallRating": 4 }`;

  try {
    const response = await generateResponse(prompt);
    return parseAIJSON(response, 'object');
  } catch (err) {
    console.error('Groq Insights Error:', err.message);
    throw err;
  }
};

/**
 * Level Test
 */
const generateLevelTest = async (courseTitle, targetLevel) => {
  const prompt = `Generate exactly 10 MCQs to test readiness for the "${targetLevel}" level of "${courseTitle}".
Respond in EXACT JSON array format:
[ { "question": "...", "options": {}, "answer": "A" } ]`;

  try {
    const response = await generateResponse(prompt);
    return parseAIJSON(response, 'array');
  } catch (err) {
    console.error('Groq Level Test Error:', err.message);
    throw err;
  }
};

/**
 * Multimodal Chat (Word/PDF text extraction + Vision if possible)
 */
const chatTutorMultimodal = async (history, message, file, level = 3, topic = '') => {
  const levelDesc = getLevelDescription(level);
  const topicContext = topic ? `The current topic is: "${topic}".` : '';
  
  let systemPrompt = `You are an AI Tutor for NeuroLearn. Student Level: ${levelDesc}. ${topicContext}\n\n`;

  try {
    let promptParts = [systemPrompt, `The student asks: ${message}`];

    if (file) {
      const mimeType = file.mimetype;
      if (mimeType.includes('wordprocessingml') || mimeType.includes('msword')) {
        const result = await mammoth.extractRawText({ buffer: file.buffer });
        promptParts.push(`\n\nATTACHED DOCUMENT CONTENT:\n${result.value}`);
      } else if (['image/jpeg', 'image/png', 'image/webp'].includes(mimeType)) {
        // Groq Vision models support base64 images in messages
        const base64Image = file.buffer.toString('base64');
        return await groq.chat.completions.create({
          messages: [
            {
              role: "user",
              content: [
                { type: "text", text: promptParts.join('\n') },
                {
                  type: "image_url",
                  image_url: {
                    url: `data:${mimeType};base64,${base64Image}`,
                  },
                },
              ],
            },
          ],
          model: VISION_MODEL,
        }).then(res => res.choices[0]?.message?.content || "");
      }
    }

    return await generateResponse(promptParts.join('\n'));
  } catch (err) {
    console.error('Groq Multimodal Error:', err.message);
    throw new Error('Failed multimodal chat');
  }
};

module.exports = {
  generateSummary,
  chatTutor,
  chatTutorMultimodal,
  generateSummaryAndQuiz,
  generateQuiz,
  generateAssessmentQuestions,
  analyzePersonalizedContent,
  generateCourseMetadata,
  generateLaunchTest,
  generateCareerRoles,
  generateRoadmap,
  generateCourseInfo,
  generateLearningInsights,
  generateLevelTest
};
