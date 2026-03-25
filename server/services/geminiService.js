const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Using the provided Groq API Key
const apiKey = process.env.GROQ_API_KEY;

if (!apiKey) {
  console.warn('GROQ_API_KEY must be provided in .env. Falling back to default error handling.');
}

const GROQ_URL = `https://api.groq.com/openai/v1/chat/completions`;
const MODEL_NAME = 'llama-3.3-70b-versatile';

// Simple caching dictionary to minimize API calls
const cache = new Map();

/**
 * Helper: Send prompt to Groq and return text
 */
const callAI = async (prompt) => {
  if (!apiKey) throw new Error("API key missing. Please provide GROQ_API_KEY.");
  
  const response = await axios.post(GROQ_URL, {
    model: MODEL_NAME,
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7
  }, {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    }
  });

  if (response.data.choices && response.data.choices[0].message) {
    return response.data.choices[0].message.content;
  }
  throw new Error('Invalid AI response structure');
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
 * Robustly parse AI-generated JSON, handling literal newlines and common errors.
 */
const parseAIJSON = (text, type = 'object') => {
  try {
    const startChar = type === 'array' ? '[' : '{';
    const endChar = type === 'array' ? ']' : '}';
    
    const startIdx = text.indexOf(startChar);
    const endIdx = text.lastIndexOf(endChar) + 1;
    
    if (startIdx === -1 || endIdx === 0) {
      throw new Error(`Could not find ${type} in AI response`);
    }
    
    let jsonText = text.substring(startIdx, endIdx);
    
    // Replace literal newlines inside strings with \n
    // This regex looks for newlines that are preceded by an odd number of quotes
    const cleanedJsonText = jsonText.replace(/\n/g, (match, offset, str) => {
      const preceding = str.slice(0, offset);
      const quoteMatches = preceding.match(/"/g) || [];
      const escapedQuoteMatches = preceding.match(/\\"/g) || [];
      const quoteCount = quoteMatches.length - escapedQuoteMatches.length;
      if (quoteCount % 2 !== 0) {
        return "\\n";
      }
      return match;
    });

    return JSON.parse(cleanedJsonText);
  } catch (e) {
    const debugPath = path.join(__dirname, '..', 'debug.log');
    fs.appendFileSync(debugPath, `\n\n--- FAILED PARSE ---\nTYPE: ${type}\nRAW TEXT: ${text}\nERROR: ${e.message}\n--- END ---\n`);
    const error = new Error(`JSON Parse Error (${type}). See server/debug.log`);
    error.rawText = text;
    throw error;
  }
};


/**
 * AI Tutor Chat — Level-aware
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
    const reply = await callAI(systemPrompt);
    return reply;
  } catch (err) {
    console.error('Groq Chat Error:', err.response?.data || err.message);
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
Keep it concise, use bullet points if helpful, and highlight key concepts only.

Content:
${videoTranscriptOrDescription}`;

    const summary = await callAI(prompt);
    cache.set(cacheKey, summary);
    return summary;
  } catch (err) {
    console.error('Groq Generate Summary Error:', err.response?.data || err.message);
    throw new Error('Failed to generate summary');
  }
};

/**
 * Generate Summary + Quiz from video transcript/content
 * Returns structured object: { summary, quiz }
 */
const generateSummaryAndQuiz = async (content, level = 3) => {
  const levelDesc = getLevelDescription(level);

  const prompt = `You are an educational AI tutor.
The student's knowledge level for this topic is: ${levelDesc}

Your task is to analyze the following educational module content (which may include a Video URL and description) and provide a tailored summary and quiz.

1. Generate a clear summary:
   - Provide a concise summary of the key concepts.
   - Use bullet points.
   - Ensure the language is appropriate for the student's level (${levelDesc}).

2. Generate EXACTLY 10 multiple-choice questions (MCQs):
   - Each question MUST have exactly 4 options: A, B, C, D.
   - Provide the correct answer letter.
   - **CRITICAL: The difficulty of the questions MUST strictly match the student's level (${levelDesc}).**
     - Beginner (Level 3): Focus on basic definitions and core ideas. Simple wording.
     - Intermediate (Level 4): Focus on application and relationships between concepts.
     - Advanced (Level 5): Focus on deep technical implementation, edge cases, and high-level architectural trade-offs.
   - All questions must be based on the provided content.

You MUST respond in this EXACT JSON format (no markdown, no code blocks, just raw JSON). 
IMPORTANT: All string values (especially the 'summary') MUST be properly escaped for JSON. Do NOT include literal newlines in string values; use \n instead.

{
  "summary": "the summary text here with \\n for newlines...",
  "quiz": [
    {
      "question": "Question text?",
      "options": { "A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D" },
      "answer": "A"
    }
  ]
}

CONTENT TO ANALYZE:
${content}`;

  try {
    const text = await callAI(prompt);
    return parseAIJSON(text, 'object');
  } catch (err) {
    console.error('Groq Summary+Quiz Error:', err.message);
    throw err;
  }
};

/**
 * Generate EXACTLY 10 quiz questions from any content
 */
const generateQuiz = async (content, difficulty = 'moderate') => {
  const prompt = `Generate EXACTLY 10 multiple-choice questions (MCQs) from the following content.

Rules:
- Each question MUST have exactly 4 options: A, B, C, D
- Provide the correct answer letter
- Questions must test understanding, not memorization
- Difficulty: ${difficulty}
- Questions must be based ONLY on the provided content

You MUST respond in this EXACT JSON format (no markdown, no code blocks, just raw JSON):
[
  {
    "question": "Question text?",
    "options": { "A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D" },
    "answer": "A"
  }
]

CONTENT:
${content}`;

  try {
    const text = await callAI(prompt);
    return parseAIJSON(text, 'array');
  } catch (err) {
    console.error('Groq Quiz Error:', err.message);
    throw err;
  }
};

/**
 * Generate assessment questions for a course topic (for initial assessment)
 */
const generateAssessmentQuestions = async (courseTopic) => {
  const prompt = `Generate EXACTLY 10 multiple-choice assessment questions to evaluate a student's knowledge level on the topic: "${courseTopic}".

The questions should range from easy to hard to properly assess the student's level:
- Questions 1-3: Easy (beginner level)
- Questions 4-7: Medium (intermediate level)
- Questions 8-10: Hard (advanced level)

Rules:
- Each question MUST have exactly 4 options: A, B, C, D
- Provide the correct answer letter
- Questions should test fundamental understanding of the topic

You MUST respond in this EXACT JSON format (no markdown, no code blocks, just raw JSON):
[
  {
    "question": "Question text?",
    "options": { "A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D" },
    "answer": "A",
    "difficulty": "easy"
  }
]

TOPIC: ${courseTopic}`;

  try {
    const text = await callAI(prompt);
    return parseAIJSON(text, 'array');
  } catch (err) {
    console.error('Groq Assessment Error:', err.message);
    throw err;
  }
};

/**
 * Analyze personalized content — full analysis with study plan
 * Returns: { summary, keyTopics, importantPoints, studyPlan, quiz }
 */
const analyzePersonalizedContent = async (materialText, deadlineDays) => {
  const prompt = `You are an educational AI study planner. Analyze the following study material and produce a comprehensive study guide.

Perform ALL of the following:

1. SUMMARY: Summarize the material clearly and concisely.

2. KEY TOPICS: Extract the main topics covered.

3. IMPORTANT POINTS: List the most important points and exam-relevant concepts.

4. STUDY PLAN: Create a daily study plan for ${deadlineDays} days.
   - Divide content into daily chunks
   - Include revision days (at least 1-2 at the end)
   - Keep workload balanced across days

5. QUIZ: Generate EXACTLY 10 exam-level multiple-choice questions with answers.
   - Each question MUST have 4 options: A, B, C, D
   - Include the correct answer letter

You MUST respond in this EXACT JSON format (no markdown, no code blocks, just raw JSON):
{
  "summary": "Concise summary here...",
  "keyTopics": ["Topic 1", "Topic 2", "Topic 3"],
  "importantPoints": ["Point 1", "Point 2", "Point 3"],
  "studyPlan": [
    { "day": 1, "title": "Day title", "tasks": ["Task 1", "Task 2"] },
    { "day": 2, "title": "Day title", "tasks": ["Task 1", "Task 2"] }
  ],
  "quiz": [
    {
      "question": "Question text?",
      "options": { "A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D" },
      "answer": "A"
    }
  ]
}

MATERIAL (${deadlineDays} days deadline):
${materialText}`;

  try {
    const text = await callAI(prompt);
    return parseAIJSON(text, 'object');
  } catch (err) {
    console.error('Groq Personalized Analysis Error:', err.message);
    throw err;
  }
};

/**
 * Generate Study Plan (legacy)
 */
const generateStudyPlan = async (materialText, deadlineDate) => {
  try {
    const prompt = `Generate a structured daily study plan for the following material to be completed by ${deadlineDate}. Format as JSON string with keys 'days' array containing 'date', 'topic', 'tasks' array.\n\nMaterial: ${materialText}`;
    const text = await callAI(prompt);
    return parseAIJSON(text, 'object');
  } catch (err) {
    console.error('Groq Study Plan Error:', err.message);
    throw err;
  }
};

/**
 * Generate course metadata (description and category) from a title
 */
const generateCourseMetadata = async (title) => {
  const prompt = `You are an AI curriculum designer. Generate a short, compelling description and a categorical label for a course titled: "${title}".

Rules:
- Description should be 2-3 sentences max.
- Category should be a short, broad subject area (e.g. "Computer Science", "Business", "Mathematics", "Design").

You MUST respond in this EXACT JSON format (no markdown, no code blocks, just raw JSON):
{
  "description": "This course covers...",
  "category": "Computer Science"
}`;

  try {
    const text = await callAI(prompt);
    return parseAIJSON(text, 'object');
  } catch (err) {
    console.error('Groq Metadata Error:', err.message);
    throw err;
  }
};

/**
 * Generate Launch Test (5 questions) before enrolling
 */
const generateLaunchTest = async (courseTitle, courseDescription) => {
  const prompt = `Generate EXACTLY 10 multiple-choice questions to act as a "Launch Test" before a student enrolls in the following course.

Course Title: ${courseTitle}
Course Description: ${courseDescription}

Rules:
- Each question MUST have exactly 4 options: A, B, C, D
- Provide the correct answer letter
- Questions should test baseline knowledge or basic concepts introduced in the description.

You MUST respond in this EXACT JSON format (no markdown, no code blocks, just raw JSON):
[
  {
    "question": "Question text?",
    "options": { "A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D" },
    "answer": "A"
  }
]`;

  try {
    const text = await callAI(prompt);
    return parseAIJSON(text, 'array');
  } catch (err) {
    console.error('Groq Launch Test Error:', err.message);
    throw err;
  }
};

/**
 * Generate career roles based on a domain
 */
const generateCareerRoles = async (domain) => {
  const cacheKey = `roles:${domain}`;
  if (cache.has(cacheKey)) return cache.get(cacheKey);

  const prompt = `You are a career advisor AI. Given the domain "${domain}", generate a list of 6-8 specific career roles a student can pursue.

You MUST respond in this EXACT JSON format (no markdown, no code blocks, just raw JSON):
{
  "roles": [
    { "title": "Role Title", "description": "One sentence description", "avgSalary": "$XX,XXX - $XXX,XXX", "demand": "High" }
  ]
}

DOMAIN: ${domain}`;

  try {
    const text = await callAI(prompt);
    const result = parseAIJSON(text, 'object');
    cache.set(cacheKey, result);
    return result;
  } catch (err) {
    console.error('Career Roles Error:', err.message);
    throw err;
  }
};

/**
 * Generate a learning roadmap for a domain + role
 */
const generateRoadmap = async (domain, role) => {
  const cacheKey = `roadmap:${domain}:${role}`;
  if (cache.has(cacheKey)) return cache.get(cacheKey);

  const prompt = `You are an educational AI curriculum designer. Generate a detailed, structured learning roadmap for someone who wants to become a "${role}" in the "${domain}" domain.

The roadmap should have 4-6 phases, each with specific skills, tools, and estimated timeframes.

You MUST respond in this EXACT JSON format (no markdown, no code blocks, just raw JSON):
{
  "title": "Roadmap to become ${role}",
  "estimatedDuration": "X months",
  "phases": [
    {
      "phase": 1,
      "title": "Phase Title",
      "duration": "X weeks",
      "description": "Brief description",
      "skills": ["Skill 1", "Skill 2"],
      "tools": ["Tool 1", "Tool 2"],
      "projects": ["Project idea 1"]
    }
  ],
  "tips": ["Tip 1", "Tip 2", "Tip 3"]
}`;

  try {
    const text = await callAI(prompt);
    const result = parseAIJSON(text, 'object');
    cache.set(cacheKey, result);
    return result;
  } catch (err) {
    console.error('Roadmap Error:', err.message);
    throw err;
  }
};

/**
 * Generate rich course info: "Why learn this" + "Achievable roles"
 */
const generateCourseInfo = async (courseTitle, courseDescription) => {
  const cacheKey = `courseinfo:${courseTitle}`;
  if (cache.has(cacheKey)) return cache.get(cacheKey);

  const prompt = `You are an educational AI advisor. For the following course, generate two sections:
1. "Why should you learn this course?" — A compelling 2-3 sentence explanation
2. "What roles can you achieve after completing this course?" — List of 3-5 specific job roles

Course Title: ${courseTitle}
Course Description: ${courseDescription || 'Not provided'}

You MUST respond in this EXACT JSON format (no markdown, no code blocks, just raw JSON):
{
  "whyLearn": "Compelling reason to learn this course...",
  "achievableRoles": ["Role 1", "Role 2", "Role 3"]
}`;

  try {
    const text = await callAI(prompt);
    const result = parseAIJSON(text, 'object');
    cache.set(cacheKey, result);
    return result;
  } catch (err) {
    console.error('Course Info Error:', err.message);
    throw err;
  }
};

/**
 * Generate personalized learning insights from progress data
 */
const generateLearningInsights = async (progressData) => {
  const prompt = `You are an AI learning analytics engine. Analyze the following student performance data and provide personalized insights and suggestions.

Student Data:
${JSON.stringify(progressData, null, 2)}

Provide insights in these categories:
1. Best study times (based on screen time patterns)
2. Weak areas that need revision
3. Next recommended course or topic
4. General performance insights

You MUST respond in this EXACT JSON format (no markdown, no code blocks, just raw JSON):
{
  "bestStudyTime": "You perform best during...",
  "weakAreas": ["Area 1", "Area 2"],
  "nextRecommendation": "Based on your progress, you should...",
  "insights": [
    "You perform better in the morning",
    "Your quiz scores improve after short breaks"
  ],
  "revisionSuggestions": ["Topic 1", "Topic 2"],
  "overallRating": 4
}`;

  try {
    const text = await callAI(prompt);
    return parseAIJSON(text, 'object');
  } catch (err) {
    console.error('Learning Insights Error:', err.message);
    throw err;
  }
};

/**
 * Generate prerequisite test for course level entry
 */
const generateLevelTest = async (courseTitle, targetLevel) => {
  const levelName = targetLevel === 'advanced' ? 'Advanced' : 'Medium';
  const prompt = `Generate EXACTLY 10 multiple-choice questions to test if a student is ready for the ${levelName} level of the course: "${courseTitle}".

${targetLevel === 'advanced' 
  ? 'Questions should be challenging, testing deep understanding, edge cases, and advanced concepts.'
  : 'Questions should test intermediate knowledge, application of concepts, and practical understanding.'}

Rules:
- Each question MUST have exactly 4 options: A, B, C, D
- Provide the correct answer letter
- Questions should properly assess readiness for the ${levelName} level

You MUST respond in this EXACT JSON format (no markdown, no code blocks, just raw JSON):
[
  {
    "question": "Question text?",
    "options": { "A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D" },
    "answer": "A"
  }
]`;

  try {
    const text = await callAI(prompt);
    return parseAIJSON(text, 'array');
  } catch (err) {
    console.error('Level Test Generation Error:', err.message);
    throw err;
  }
};

module.exports = {
  generateSummary,
  chatTutor,
  generateStudyPlan,
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
