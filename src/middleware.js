import { NextResponse } from "next/server";
import { verifyTokenEdge } from "@/lib/auth/jwtEdge";

// Run middleware only on dashboard routes
export const config = {
  matcher: ["/dashboard/:path*"],
};

export async function middleware(req) {
  const token = req.cookies.get("accessToken")?.value;

  if (!token) {
    // Missing token: redirect to login
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("reason", "missing");
    return NextResponse.redirect(loginUrl);
  }

  // Verify token on Edge runtime using jose
  const result = await verifyTokenEdge(token, process.env.JWT_SECRET);

  if (!result.valid) {
    // Token expired or malformed: redirect to login without crashing
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("reason", result.reason);
    return NextResponse.redirect(loginUrl);
  }

  const { role } = result.payload;
  const path = req.nextUrl.pathname;

  // Authorization checks based on paths
  if (path.startsWith("/dashboard/staff") && !["clerk", "judge", "admin"].includes(role)) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (path.startsWith("/dashboard/party") && !["litigant", "lawyer", "admin"].includes(role)) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (path.startsWith("/dashboard/admin") && role !== "admin") {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Pass through if authorized
  return NextResponse.next();
}
