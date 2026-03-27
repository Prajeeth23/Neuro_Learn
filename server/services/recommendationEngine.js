const { generateLearningInsights } = require('./aiService');

/**
 * AI Recommendation Engine
 * 
 * Inputs:
 * - Quiz scores
 * - Weak topics
 * - Screen time
 * 
 * Outputs:
 * - Study suggestions
 * - Weak area identification
 * - Next recommended course
 */
const getRecommendations = async (progressData) => {
  // Delegate to the AI service to generate personalized learning insights 
  // based on the comprehensive progress payload mapped in the PRD.
  const recommendations = await generateLearningInsights(progressData);
  return recommendations;
};

module.exports = {
  getRecommendations
};
