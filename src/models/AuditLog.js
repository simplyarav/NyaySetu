import { ObjectId } from "mongodb";

/**
 * @typedef {Object} AuditLog
 * @property {ObjectId} _id - The unique identifier for the audit log entry.
 * @property {ObjectId} caseId - The case this log pertains to.
 * @property {ObjectId} actorId - The user who performed the action.
 * @property {string} actorRole - The role of the user (e.g., 'clerk', 'judge') at the time of action.
 * @property {string} action - Description of the action (e.g., 'status_change', 'hearing_scheduled', 'document_uploaded').
 * @property {string} [fromStatus] - The status of the case before the action.
 * @property {string} [toStatus] - The status of the case after the action.
 * @property {string} [reason] - Optional reason provided for the action (critical for adjournments).
 * @property {Date} timestamp - When the action occurred.
 */

// This file is strictly for JSDoc typings to provide IDE autocompletion for MongoDB documents.
export {};
