import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import clientPromise from "@/lib/db";
import { ObjectId } from "mongodb";
import { requireRole } from "@/lib/auth/requireRole";

export async function POST(req) {
  try {
    // Only admins can create staff accounts
    const user = requireRole(["admin"]);
    if (user instanceof NextResponse) return user;

    const body = await req.json();
    const { name, email, password, role } = body;

    if (!name || !email || !password || !role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const validStaffRoles = ["clerk", "judge", "admin"];
    if (!validStaffRoles.includes(role)) {
      return NextResponse.json({ error: "Invalid staff role specified" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    
    // Check if user exists
    const existingUser = await db.collection("users").findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: "User already exists with this email" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = {
      _id: new ObjectId(),
      name,
      email,
      passwordHash,
      role,
      createdAt: new Date(),
    };

    await db.collection("users").insertOne(newUser);

    return NextResponse.json({ message: "Staff account created successfully" }, { status: 201 });
  } catch (error) {
    console.error("Admin Staff Provisioning Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
