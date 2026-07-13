import { NextResponse } from "next/server";
import { verifyTokenNode, signAccessToken } from "@/lib/auth/jwt";

export async function POST(req) {
  try {
    const refreshToken = req.cookies.get("refreshToken")?.value;

    if (!refreshToken) {
      return NextResponse.json({ error: "No refresh token provided" }, { status: 401 });
    }

    const payload = verifyTokenNode(refreshToken, process.env.JWT_REFRESH_SECRET);
    if (!payload) {
      return NextResponse.json({ error: "Invalid refresh token" }, { status: 403 });
    }

    // Issue new access token
    const newPayload = { id: payload.id, role: payload.role };
    const accessToken = signAccessToken(newPayload);

    const response = NextResponse.json({ message: "Token refreshed successfully" });

    response.cookies.set("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60, // 15 minutes
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Refresh Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
