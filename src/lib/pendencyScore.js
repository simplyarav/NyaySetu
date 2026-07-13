/**
 * Calculates a "pendency score" (0-100) for a case to indicate how stuck or delayed it is.
 * A higher score means the case requires urgent attention or is severely delayed.
 * 
 * The heuristic is based on three weighted factors:
 * 1. Case Age (40% weight): Older cases get a higher score. We cap this at 5 years (1825 days) for the max age score.
 * 2. Adjournment Count (35% weight): Each adjournment adds disproportionate weight because it signals stalling.
 *    We use an exponential curve where 4+ adjournments quickly pushes this sub-score to 100.
 * 3. Inactivity (25% weight): Days since the last recorded action. We cap this at 1 year (365 days) for max inactivity score.
 * 
 * @param {Object} caseData
 * @param {Date} caseData.filedDate - The date the case was filed
 * @param {number} caseData.adjournmentCount - Number of times adjourned
 * @param {Date} caseData.lastActionDate - The date of the last recorded action
 * @param {Date} [currentDate=new Date()] - Used for calculating durations (mostly for testability)
 * @returns {number} Score between 0 and 100
 */
export function calculatePendencyScore(caseData, currentDate = new Date()) {
  const { filedDate, adjournmentCount = 0, lastActionDate } = caseData;

  if (!filedDate || !lastActionDate) {
    return 0; // Cannot calculate properly without these dates
  }

  const msPerDay = 1000 * 60 * 60 * 24;

  // 1. Case Age Score (0-100)
  // Maxes out at 5 years (1825 days)
  const ageInDays = Math.max(0, (currentDate - new Date(filedDate)) / msPerDay);
  const ageScore = Math.min(100, (ageInDays / 1825) * 100);

  // 2. Adjournment Score (0-100)
  // Exponential growth: 1 -> 15, 2 -> 42, 3 -> 77, 4+ -> 100
  // Formula: Math.pow(count, 1.5) * 15
  const adjournmentScore = Math.min(100, Math.pow(adjournmentCount, 1.5) * 15);

  // 3. Inactivity Score (0-100)
  // Maxes out at 1 year (365 days)
  const inactivityDays = Math.max(0, (currentDate - new Date(lastActionDate)) / msPerDay);
  const inactivityScore = Math.min(100, (inactivityDays / 365) * 100);

  // Apply weights
  const AGE_WEIGHT = 0.40;
  const ADJOURNMENT_WEIGHT = 0.35;
  const INACTIVITY_WEIGHT = 0.25;

  const finalScore = 
    (ageScore * AGE_WEIGHT) + 
    (adjournmentScore * ADJOURNMENT_WEIGHT) + 
    (inactivityScore * INACTIVITY_WEIGHT);

  // Return integer between 0 and 100
  return Math.round(finalScore);
}
