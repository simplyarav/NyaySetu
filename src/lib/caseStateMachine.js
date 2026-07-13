import clientPromise from "./db";
import { ObjectId } from "mongodb";

// Define legal status transitions
const VALID_TRANSITIONS = {
  filed: ["admitted", "closed"],
  admitted: ["hearing_scheduled", "closed"],
  hearing_scheduled: ["evidence", "judgment_reserved", "adjourned", "closed"],
  adjourned: ["hearing_scheduled", "closed"],
  evidence: ["judgment_reserved", "adjourned", "closed"],
  judgment_reserved: ["closed"],
  closed: [], // Terminal state
};

/**
 * Validates if a transition from currentStatus to nextStatus is legally allowed.
 * @param {string} currentStatus 
 * @param {string} nextStatus 
 * @returns {boolean}
 */
export function isValidTransition(currentStatus, nextStatus) {
  const allowed = VALID_TRANSITIONS[currentStatus];
  if (!allowed) return false;
  return allowed.includes(nextStatus);
}

/**
 * Transitions a case to a new status and records an audit log.
 * 
 * NOTE: In a production system with a replica set guaranteed, this compound write
 * would be wrapped in a session/transaction to prevent a partial write if
 * the process crashes between the two operations. For this project we're
 * choosing availability/simplicity over strict atomicity.
 * 
 * @param {Object} params
 * @param {string|ObjectId} params.caseId
 * @param {string} params.newStatus
 * @param {Object} params.actor - { _id: ObjectId, role: string }
 * @param {string} [params.reason] - Required for some transitions like adjourned
 * @param {string} [params.action] - A short description of the action
 * @returns {Promise<{ok: boolean, newStatus?: string, reason?: string}>}
 */
export async function transitionCaseState({ caseId, newStatus, actor, reason, action }) {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const caseCollection = db.collection("cases");
    const auditCollection = db.collection("auditLogs");

    const caseIdObj = typeof caseId === 'string' ? new ObjectId(caseId) : caseId;

    // Fetch current case state
    const currentCase = await caseCollection.findOne({ _id: caseIdObj });
    if (!currentCase) {
      return { ok: false, reason: "Case not found" };
    }

    const currentStatus = currentCase.status;

    // Validate transition
    if (currentStatus === newStatus) {
      return { ok: false, reason: "Case is already in the requested status" };
    }

    if (!isValidTransition(currentStatus, newStatus)) {
      return { ok: false, reason: `Invalid transition from '${currentStatus}' to '${newStatus}'` };
    }

    // specific business rules
    if (newStatus === "adjourned" && !reason) {
      return { ok: false, reason: "A reason is required when adjourning a case." };
    }

    // Prepare update object
    const updateDoc = {
      $set: {
        status: newStatus,
        lastActionDate: new Date(),
        updatedAt: new Date()
      }
    };

    if (newStatus === "adjourned") {
      updateDoc.$inc = { adjournmentCount: 1 };
    }

    // 1. Update Case Status
    const updateResult = await caseCollection.updateOne(
      { _id: caseIdObj },
      updateDoc
    );

    if (updateResult.modifiedCount !== 1) {
      return { ok: false, reason: "Failed to update case status" };
    }

    // 2. Insert AuditLog Entry right after
    const auditEntry = {
      caseId: caseIdObj,
      actorId: typeof actor._id === 'string' ? new ObjectId(actor._id) : actor._id,
      actorRole: actor.role,
      action: action || "status_change",
      fromStatus: currentStatus,
      toStatus: newStatus,
      reason: reason || null,
      timestamp: new Date()
    };

    await auditCollection.insertOne(auditEntry);

    return { ok: true, newStatus };

  } catch (error) {
    console.error("State transition error:", error);
    return { ok: false, reason: "Internal server error during state transition" };
  }
}
