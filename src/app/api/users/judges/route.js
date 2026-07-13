import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/requireRole";
import clientPromise from "@/lib/db";

export async function GET(req) {
  try {
    const user = requireRole(["clerk", "judge", "admin"]);
    if (user instanceof NextResponse) return user;

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);

    const judges = await db.collection("users").find(
      { role: "judge" }, 
      { projection: { _id: 1, name: 1, email: 1 } }
    ).toArray();

    return NextResponse.json(judges);
  } catch (error) {
    console.error("GET judges Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
