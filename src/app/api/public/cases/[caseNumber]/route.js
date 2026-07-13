import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";

export async function GET(req, { params }) {
  try {
    const { caseNumber } = params;
    
    if (!caseNumber) {
      return NextResponse.json({ error: "Case number is required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);

    // Case-insensitive exact match
    const caseData = await db.collection("cases").findOne({ 
      caseNumber: { $regex: new RegExp(`^${caseNumber}$`, "i") }
    });

    if (!caseData) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 });
    }

    // Fetch chronological audit log
    const auditLogs = await db.collection("auditLogs")
      .find({ caseId: caseData._id })
      .sort({ timestamp: 1 }) // Chronological for docket view
      .toArray();

    // Sanitize data for public view (remove sensitive IDs, internal judge notes, etc.)
    const publicCase = {
      caseNumber: caseData.caseNumber,
      title: caseData.title,
      caseType: caseData.caseType,
      status: caseData.status,
      filedDate: caseData.filedDate,
      lastActionDate: caseData.lastActionDate,
      pendencyScore: caseData.pendencyScore,
      adjournmentCount: caseData.adjournmentCount,
      // Omit judgeId, litigantIds, lawyerIds
    };

    const publicLogs = auditLogs.map(log => ({
      action: log.action,
      fromStatus: log.fromStatus,
      toStatus: log.toStatus,
      reason: log.reason,
      timestamp: log.timestamp,
      // Omit actorId, strictly show actorRole for context
      actorRole: log.actorRole 
    }));

    return NextResponse.json({
      case: publicCase,
      logs: publicLogs
    });

  } catch (error) {
    console.error("GET public case Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
