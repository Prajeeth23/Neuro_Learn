// Services for Adaptive Learning Logic (No AI is used for level decisions)

const supabase = require('../db/supabaseClient');

/**
 * Assigns an initial level based on the assessment score
 * @param {number} score - 0 to 100
 * @returns {number} level - 3, 4, or 5
 */
const determineInitialLevel = (score) => {
  if (score >= 80) return 5;
  if (score >= 50) return 4;
  return 3;
};

/**
 * Adjusts the user's level based on a post-module quiz score
 * @param {number} currentLevel 
 * @param {number} quizScore - 0 to 100
 * @returns {number} new level
 */
const evaluateProgress = (currentLevel, quizScore) => {
  let newLevel = currentLevel;
  if (quizScore > 85 && currentLevel < 5) {
    newLevel += 1; // Upgrade
  } else if (quizScore < 30 && currentLevel > 3) {
    newLevel -= 1; // Downgrade
  }
  return newLevel;
};

/**
 * Recommends the next module based on the user's current level
 * Level 3 -> difficulty 1-2
 * Level 4 -> difficulty 2-3
 * Level 5 -> difficulty 3-5
 */
const getRecommendedModules = async (courseId, currentLevel) => {
  let minDiff = 1, maxDiff = 5;
  
  if (currentLevel === 3) { maxDiff = 3; }
  else if (currentLevel === 4) { minDiff = 2; maxDiff = 4; }
  else if (currentLevel === 5) { minDiff = 3; maxDiff = 5; }

  const { data, error } = await supabase
    .from('modules')
    .select('*')
    .eq('course_id', courseId)
    .gte('difficulty_level', minDiff)
    .lte('difficulty_level', maxDiff)
    .order('order_index', { ascending: true });

  if (error) throw error;
  return data;
};

module.exports = {
  determineInitialLevel,
  evaluateProgress,
  getRecommendedModules
};
