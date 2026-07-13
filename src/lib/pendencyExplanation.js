import { differenceInDays } from "date-fns";

/**
 * Rules-based generator to provide a plain-English explanation of a case's pendency score.
 * Explains the dominant driver based on adjournment count, days since last action, and case age.
 *
 * @param {Object} caseData The case data object
 * @returns {string} One-line plain English explanation
 */
export function generatePendencyExplanation(caseData) {
  const { 
    filedDate, 
    lastActionDate, 
    adjournmentCount = 0, 
    caseType = "civil",
    pendencyScore = 0
  } = caseData;

  const now = new Date();
  const fileDateObj = new Date(filedDate || now);
  const actionDateObj = new Date(lastActionDate || fileDateObj);

  const ageDays = differenceInDays(now, fileDateObj);
  const daysSinceAction = differenceInDays(now, actionDateObj);

  // Thresholds for explanation tuning
  const ADJOURNMENT_THRESHOLD = 3;
  const INACTION_RATIO_THRESHOLD = 0.4; // 40% of case life spent inactive
  const INACTION_DAYS_THRESHOLD = 30; // Minimum 30 days of absolute inaction to trigger inaction rule
  const NORMAL_PENDENCY_SCORE_THRESHOLD = 30;

  // Rule 1: High Adjournment Count (Dominant driver)
  // Triggered if adjourned > 3 times, especially if it's the primary reason for a high score.
  if (adjournmentCount > ADJOURNMENT_THRESHOLD && (adjournmentCount * 10) > (daysSinceAction / 3)) {
    return `Adjourned ${adjournmentCount} times, which is higher than typical for ${caseType} cases.`;
  }

  // Rule 2: Prolonged Inaction
  // Triggered if a significant portion of the case's life has had no action, 
  // AND the absolute days of inaction is high.
  if (daysSinceAction > INACTION_DAYS_THRESHOLD && (daysSinceAction / Math.max(1, ageDays)) > INACTION_RATIO_THRESHOLD) {
    return `No action taken in ${daysSinceAction} days despite being open for ${ageDays} days.`;
  }

  // Rule 3: Overall Healthy/Low Score
  if (pendencyScore < NORMAL_PENDENCY_SCORE_THRESHOLD) {
    return "Progressing normally — no red flags.";
  }

  // Rule 4: Aging but otherwise normal (Fallback for moderate/high scores driven solely by age)
  return `Open for ${ageDays} days, within normal range but aging steadily.`;
}
