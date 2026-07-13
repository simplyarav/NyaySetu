import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/requireRole";
import clientPromise from "@/lib/db";
import { ObjectId } from "mongodb";

export async function POST(req, { params }) {
  try {
    const user = requireRole(["clerk", "judge", "admin"]);
    if (user instanceof NextResponse) return user;

    const { id } = params;
    const body = await req.json();
    const { judgeId, scheduledDate, courtroom, notes } = body;

    if (!judgeId || !scheduledDate || !courtroom) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!ObjectId.isValid(id) || !ObjectId.isValid(judgeId)) {
      return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
    }

    const caseIdObj = new ObjectId(id);
    const judgeIdObj = new ObjectId(judgeId);
    const dateObj = new Date(scheduledDate);

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);

    // Verify case exists
    const caseData = await db.collection("cases").findOne({ _id: caseIdObj });
    if (!caseData) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 });
    }

    // Conflict Check for Judge on this specific date (ignoring time for simplicity in this demo, or check exact range)
    // For now, we'll just check if they have a hearing at the EXACT same time.
    // In a real app, we'd check overlapping time ranges.
    const conflict = await db.collection("hearings").findOne({
      judgeId: judgeIdObj,
      scheduledDate: dateObj,
      status: { $in: ["scheduled"] }
    });

    if (conflict) {
      return NextResponse.json({ error: "Judge already has a hearing scheduled at this exact time" }, { status: 409 });
    }

    // Insert hearing
    const hearing = {
      _id: new ObjectId(),
      caseId: caseIdObj,
      judgeId: judgeIdObj,
      scheduledDate: dateObj,
      courtroom,
      status: "scheduled",
      notes: notes || "",
      createdAt: new Date()
    };

    await db.collection("hearings").insertOne(hearing);

    // If the judge is new for this case, update the case's judgeId
    if (!caseData.judgeId || caseData.judgeId.toString() !== judgeId) {
      await db.collection("cases").updateOne(
        { _id: caseIdObj },
        { $set: { judgeId: judgeIdObj, updatedAt: new Date() } }
      );

      // Audit log for judge reassignment
      await db.collection("auditLogs").insertOne({
        caseId: caseIdObj,
        actorId: new ObjectId(user.id),
        actorRole: user.role,
        action: "judge_reassigned",
        reason: `Assigned new judge during hearing scheduling in ${courtroom}`,
        timestamp: new Date()
      });
    }

    // Audit log for hearing
    await db.collection("auditLogs").insertOne({
      caseId: caseIdObj,
      actorId: new ObjectId(user.id),
      actorRole: user.role,
      action: "hearing_scheduled",
      reason: `Hearing scheduled for ${dateObj.toISOString()} in ${courtroom}`,
      timestamp: new Date()
    });

    return NextResponse.json({ message: "Hearing scheduled successfully", hearing }, { status: 201 });
  } catch (error) {
    console.error("POST hearing Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
