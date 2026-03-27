require('dotenv').config({ path: '../.env' });
const aiService = require('./services/aiService');

async function testGroq() {
  try {
    process.on('unhandledRejection', (reason, promise) => {
      console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    });
    process.on('uncaughtException', (err) => {
      console.error('Uncaught Exception:', err);
    });

    console.log('Testing Course Metadata generation with Groq...');
    const result = await aiService.generateCourseMetadata('Advanced React Patterns');
    console.log('Success! Result preview:', JSON.stringify(result));
    process.exit(0);
  } catch(e) {
    console.error('AI Error caught in test script:', e);
    process.exit(1);
  }
}

testGroq();
