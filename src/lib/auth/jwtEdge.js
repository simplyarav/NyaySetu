import { jwtVerify } from "jose";

// Using jose for Edge runtime (middleware.js)
export async function verifyTokenEdge(token, secretStr) {
  try {
    const secret = new TextEncoder().encode(secretStr);
    const { payload } = await jwtVerify(token, secret);
    return { valid: true, payload };
  } catch (err) {
    // jwtVerify throws errors for malformed, expired, etc.
    if (err.code === "ERR_JWT_EXPIRED") {
      return { valid: false, reason: "expired" };
    }
    return { valid: false, reason: "malformed" };
  }
}
