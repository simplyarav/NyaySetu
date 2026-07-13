import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import { requireRole } from "@/lib/auth/requireRole";
import { ObjectId } from "mongodb";

export async function GET(req, { params }) {
  try {
    const user = requireRole(["clerk", "judge", "admin", "litigant", "lawyer"]);
    if (user instanceof NextResponse) return user;

    const { id } = params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid case ID" }, { status: 400 });
    }
    const caseId = new ObjectId(id);

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);

    const caseData = await db.collection("cases").findOne({ _id: caseId });
    if (!caseData) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 });
    }

    // Authorization check for party members
    if (["litigant", "lawyer"].includes(user.role)) {
      const field = user.role === "litigant" ? "litigantIds" : "lawyerIds";
      if (!caseData[field] || !caseData[field].some(pid => pid.toString() === user.id)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    // Fetch related records concurrently
    const [auditLogs, hearings, documents] = await Promise.all([
      db.collection("auditLogs").find({ caseId }).sort({ timestamp: -1 }).toArray(),
      db.collection("hearings").find({ caseId }).sort({ scheduledDate: -1 }).toArray(),
      db.collection("caseDocuments").find({ caseId }).sort({ uploadedAt: -1 }).toArray()
    ]);

    return NextResponse.json({
      ...caseData,
      auditLogs,
      hearings,
      documents
    });
  } catch (error) {
    console.error("GET case details Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
