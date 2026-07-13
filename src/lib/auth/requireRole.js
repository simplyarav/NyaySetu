import { NextResponse } from "next/server";
import { verifyTokenNode } from "./jwt";
import { cookies } from "next/headers";

/**
 * Helper to protect API routes (Node runtime).
 * Use this inside your app/api/.../route.js files.
 * 
 * @param {string|string[]} allowedRoles 
 * @returns {Object|NextResponse} Returns the user payload if valid, otherwise a NextResponse error
 */
export function requireRole(allowedRoles) {
  const token = cookies().get("accessToken")?.value;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = verifyTokenNode(token, process.env.JWT_SECRET);
  
  if (!payload) {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
  }

  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  if (!roles.includes(payload.role)) {
    return NextResponse.json({ error: "Forbidden: Insufficient permissions" }, { status: 403 });
  }

  return payload; // { id, role }
}
