import { ObjectId } from "mongodb";

/**
 * @typedef {Object} User
 * @property {ObjectId} _id - The unique identifier for the user.
 * @property {string} name - Full name of the user.
 * @property {string} email - Email address (used for login).
 * @property {string} passwordHash - Bcrypt hash of the password.
 * @property {'litigant'|'lawyer'|'clerk'|'judge'|'admin'} role - The user's role in the system.
 * @property {string} [barNumber] - Lawyer's bar registration number (if role is lawyer).
 * @property {ObjectId} [courtId] - The court the user is assigned to (if role is clerk or judge).
 * @property {Date} createdAt - Timestamp of user creation.
 */

// This file is strictly for JSDoc typings to provide IDE autocompletion for MongoDB documents.
export {};
