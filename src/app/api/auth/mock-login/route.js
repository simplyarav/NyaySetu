import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import { signAccessToken, signRefreshToken } from "@/lib/auth/jwt";
import { ObjectId } from "mongodb";

export async function POST(req) {
  // Security guard: Only allow in development
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not Found" }, { status: 404 });
  }

  try {
    const { role } = await req.json();

    const validRoles = ["litigant", "lawyer", "clerk", "judge", "admin"];
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);

    // Capitalize role for the name
    const roleName = role.charAt(0).toUpperCase() + role.slice(1);
    const mockEmail = `mock_${role}@example.com`;

    let user = await db.collection("users").findOne({ email: mockEmail });

    if (!user) {
      // Create the mock user if they don't exist
      user = {
        _id: new ObjectId(),
        name: `Mock ${roleName}`,
        email: mockEmail,
        passwordHash: "MOCK_USER_NO_PASSWORD", // Un-loginable via normal flow
        role: role,
        createdAt: new Date(),
      };
      await db.collection("users").insertOne(user);
    }

    // Payload includes user ID and role
    const payload = {
      id: user._id.toString(),
      role: user.role,
    };

    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    const response = NextResponse.json({ 
      message: `Mock logged in as ${role}`,
      role: user.role 
    }, { status: 200 });

    // Set Cookies exactly like normal login
    response.cookies.set("accessToken", accessToken, {
      httpOnly: true,
      secure: false, // development only
      sameSite: "lax",
      maxAge: 15 * 60, 
      path: "/",
    });

    response.cookies.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false, // development only
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, 
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Mock Login Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
