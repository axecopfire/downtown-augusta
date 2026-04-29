import { SignJWT, jwtVerify } from "jose";

const COOKIE_NAME = "admin-session";
const TOKEN_EXPIRY = "24h";

function getJwtSecret(): Uint8Array {
  const secret = process.env.ADMIN_JWT_SECRET;
  if (!secret && process.env.NODE_ENV === "production") {
    throw new Error("ADMIN_JWT_SECRET must be set in production");
  }
  return new TextEncoder().encode(secret || "dev-secret-do-not-use-in-prod");
}

function getAdminPassword(): string {
  const password = process.env.ADMIN_PASSWORD;
  if (!password && process.env.NODE_ENV === "production") {
    throw new Error("ADMIN_PASSWORD must be set in production");
  }
  return password || "admin";
}

export function verifyPassword(input: string): boolean {
  const expected = getAdminPassword();
  if (input.length !== expected.length) return false;
  let mismatch = 0;
  for (let i = 0; i < input.length; i++) {
    mismatch |= input.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return mismatch === 0;
}

export async function signToken(): Promise<string> {
  return new SignJWT({ sub: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRY)
    .sign(getJwtSecret());
}

export async function verifyToken(token: string): Promise<boolean> {
  try {
    await jwtVerify(token, getJwtSecret());
    return true;
  } catch {
    return false;
  }
}

export function getSessionCookieOptions(maxAge?: number) {
  return {
    name: COOKIE_NAME,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: maxAge ?? 60 * 60 * 24, // 24 hours
  };
}

export { COOKIE_NAME };
