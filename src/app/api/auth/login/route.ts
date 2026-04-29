import { NextRequest, NextResponse } from "next/server";
import { verifyPassword, signToken, getSessionCookieOptions } from "@/lib/auth";

// In-memory rate limiter
const loginAttempts = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute

function pruneExpired() {
  const now = Date.now();
  for (const [key, entry] of loginAttempts) {
    if (now > entry.resetAt) loginAttempts.delete(key);
  }
}

function isRateLimited(ip: string): boolean {
  pruneExpired();
  const now = Date.now();
  const entry = loginAttempts.get(ip);

  if (!entry || now > entry.resetAt) {
    loginAttempts.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  entry.count++;
  return entry.count > RATE_LIMIT_MAX;
}

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many login attempts. Try again in a minute." },
      { status: 429 }
    );
  }

  let body: { password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }

  if (!body.password || typeof body.password !== "string") {
    return NextResponse.json(
      { error: "Password is required" },
      { status: 400 }
    );
  }

  if (!verifyPassword(body.password)) {
    return NextResponse.json(
      { error: "Invalid password" },
      { status: 401 }
    );
  }

  const token = await signToken();
  const cookieOptions = getSessionCookieOptions();

  const response = NextResponse.json({ success: true });
  response.cookies.set(cookieOptions.name, token, {
    httpOnly: cookieOptions.httpOnly,
    secure: cookieOptions.secure,
    sameSite: cookieOptions.sameSite,
    path: cookieOptions.path,
    maxAge: cookieOptions.maxAge,
  });

  return response;
}
