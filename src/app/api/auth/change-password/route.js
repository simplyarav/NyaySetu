import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import clientPromise from "@/lib/db";
import { ObjectId } from "mongodb";
import { requireRole } from "@/lib/auth/requireRole";

export async function POST(req) {
  try {
    // Require authentication (any valid role can change their password)
    const userPayload = requireRole(["admin", "judge", "clerk", "lawyer", "litigant"]);
    if (userPayload instanceof NextResponse) return userPayload;

    const body = await req.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (newPassword.length < 8) {
      return NextResponse.json({ error: "New password must be at least 8 characters long" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    
    // Find the current user in the database
    const user = await db.collection("users").findOne({ _id: new ObjectId(userPayload.id) });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json({ error: "Incorrect current password" }, { status: 401 });
    }

    // Hash the new password
    const newPasswordHash = await bcrypt.hash(newPassword, 10);
    
    // Update the database
    await db.collection("users").updateOne(
      { _id: new ObjectId(userPayload.id) },
      { $set: { passwordHash: newPasswordHash, updatedAt: new Date() } }
    );

    return NextResponse.json({ message: "Password updated successfully" }, { status: 200 });
  } catch (error) {
    console.error("Change Password Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
