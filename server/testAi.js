require('dotenv').config({ path: '../.env' });
const geminiService = require('./services/geminiService');

async function testGemini() {
  try {
    process.on('unhandledRejection', (reason, promise) => {
      console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    });
    process.on('uncaughtException', (err) => {
      console.error('Uncaught Exception:', err);
    });

    console.log('Testing Study Plan generation...');
    const result = await geminiService.generateStudyPlan('React Fundamentals', '2026-04-01');
    console.log('Success! Result preview:', JSON.stringify(result).substring(0, 100));
    process.exit(0);
  } catch(e) {
    console.error('AI Error caught in test script:', e);
    process.exit(1);
  }
}

testGemini();
