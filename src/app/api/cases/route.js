import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import { requireRole } from "@/lib/auth/requireRole";
import { ObjectId } from "mongodb";

export async function GET(req) {
  try {
    const user = requireRole(["clerk", "judge", "admin", "litigant", "lawyer"]);
    if (user instanceof NextResponse) return user; // Unauthorized

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);

    let query = {};
    // If party, only show cases they are part of
    if (["litigant", "lawyer"].includes(user.role)) {
      const field = user.role === "litigant" ? "litigantIds" : "lawyerIds";
      query[field] = new ObjectId(user.id);
    }

    const cases = await db.collection("cases").find(query).sort({ lastActionDate: -1 }).toArray();

    return NextResponse.json(cases);
  } catch (error) {
    console.error("GET cases Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
