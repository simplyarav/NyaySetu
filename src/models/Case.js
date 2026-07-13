import { ObjectId } from "mongodb";

/**
 * @typedef {Object} Case
 * @property {ObjectId} _id - The unique identifier for the case.
 * @property {string} caseNumber - Auto-generated format (e.g., CV-2026-000123).
 * @property {string} title - The title of the case (e.g., Smith v. Jones).
 * @property {'civil'|'criminal'|'family'|'commercial'} caseType - The category of the case.
 * @property {'filed'|'admitted'|'hearing_scheduled'|'adjourned'|'evidence'|'judgment_reserved'|'closed'} status - Current status of the case.
 * @property {Date} filedDate - The date the case was officially filed.
 * @property {ObjectId} courtId - The court handling the case.
 * @property {ObjectId} judgeId - The judge assigned to the case.
 * @property {ObjectId[]} litigantIds - Array of User IDs (litigants) involved in the case.
 * @property {ObjectId[]} lawyerIds - Array of User IDs (lawyers) representing parties in the case.
 * @property {number} pendencyScore - Calculated score (0-100) indicating how "stuck" the case is.
 * @property {number} adjournmentCount - Number of times the case has been adjourned.
 * @property {Date} lastActionDate - Timestamp of the last significant action or hearing.
 * @property {Date} createdAt - Timestamp of case creation.
 * @property {Date} updatedAt - Timestamp of last update.
 */

// This file is strictly for JSDoc typings to provide IDE autocompletion for MongoDB documents.
export {};
