import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import clientPromise from "@/lib/db";
import { signAccessToken, signRefreshToken } from "@/lib/auth/jwt";

const rateLimitMap = new Map();

// A precomputed bcrypt hash (cost 12) for dummy comparison
const DUMMY_HASH = "$2b$12$70Qxj2gYvKe.e3J4eBVV.e6N7n082emQ.G6h2TNCApVyx5UsskbR.";

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Missing email or password" }, { status: 400 });
    }

    // Rate Limiting
    const ip = req.headers.get("x-forwarded-for") || "unknown-ip";
    const limitKey = `${email}:${ip}`;
    const now = Date.now();

    let attemptData = rateLimitMap.get(limitKey) || { count: 0, firstAttempt: now, lockedUntil: null };

    // Reset window after 15 minutes
    if (now - attemptData.firstAttempt > 15 * 60 * 1000) {
      attemptData = { count: 0, firstAttempt: now, lockedUntil: null };
    }

    // Check if locked
    if (attemptData.lockedUntil && now < attemptData.lockedUntil) {
      const remainingMin = Math.ceil((attemptData.lockedUntil - now) / 60000);
      return NextResponse.json(
        { error: `Too many attempts, try again in ${remainingMin} minutes` }, 
        { status: 429 }
      );
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);

    const user = await db.collection("users").findOne({ email });
    let isMatch = false;

    if (!user) {
      // Dummy compare to avoid timing attack
      await bcrypt.compare(password, DUMMY_HASH);
    } else {
      isMatch = await bcrypt.compare(password, user.passwordHash);
    }

    if (!user || !isMatch) {
      // Record failed attempt
      attemptData.count += 1;
      if (attemptData.count >= 5) {
        attemptData.lockedUntil = now + 5 * 60 * 1000; // lock for 5 mins
      }
      rateLimitMap.set(limitKey, attemptData);

      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    // Login successful, clear attempts
    rateLimitMap.delete(limitKey);

    // Payload includes user ID and role
    const payload = {
      id: user._id.toString(),
      role: user.role,
    };

    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    const response = NextResponse.json({ 
      message: "Logged in successfully",
      role: user.role 
    }, { status: 200 });

    // Set Cookies
    response.cookies.set("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 15 * 60, // 15 minutes
      path: "/",
    });

    response.cookies.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
