import { ObjectId } from "mongodb";

/**
 * @typedef {Object} Hearing
 * @property {ObjectId} _id - The unique identifier for the hearing.
 * @property {ObjectId} caseId - The case this hearing belongs to.
 * @property {ObjectId} judgeId - The judge presiding over the hearing.
 * @property {Date} scheduledDate - The date and time the hearing is scheduled.
 * @property {string} courtroom - The courtroom where the hearing will take place.
 * @property {'scheduled'|'completed'|'adjourned'|'cancelled'} status - Current status of the hearing.
 * @property {string} [notes] - Optional notes from the hearing (clerk/judge entries).
 * @property {Date} createdAt - Timestamp of hearing creation.
 */

// This file is strictly for JSDoc typings to provide IDE autocompletion for MongoDB documents.
export {};
