import { ObjectId } from "mongodb";

/**
 * @typedef {Object} CaseDocument
 * @property {ObjectId} _id - The unique identifier for the document.
 * @property {ObjectId} caseId - The case this document is attached to.
 * @property {ObjectId} uploadedBy - The user who uploaded the document.
 * @property {string} fileName - Original name of the uploaded file.
 * @property {string} fileUrl - The URL where the file is stored (e.g., Cloudinary).
 * @property {'affidavit'|'order'|'evidence'|'judgment'|'other'} docType - The type of document.
 * @property {Date} uploadedAt - Timestamp when the document was uploaded.
 */

// This file is strictly for JSDoc typings to provide IDE autocompletion for MongoDB documents.
export {};
