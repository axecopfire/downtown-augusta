import { NextRequest, NextResponse } from "next/server";
import { verifyToken, COOKIE_NAME } from "@/lib/auth";

const PROTECTED_API_PREFIXES = ["/api/businesses", "/api/events"];
const MUTATION_METHODS = new Set(["POST", "PUT", "DELETE", "PATCH"]);

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow login page through
  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  // Allow auth API routes through (login/logout handle their own logic)
  if (pathname.startsWith("/api/auth/")) {
    return NextResponse.next();
  }

  // For API routes, only protect mutation methods
  const isApiRoute = PROTECTED_API_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  );
  if (isApiRoute && !MUTATION_METHODS.has(request.method)) {
    return NextResponse.next();
  }

  // Check for valid session cookie
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token || !(await verifyToken(token))) {
    // Admin pages: redirect to login
    if (pathname.startsWith("/admin")) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // API routes: return 401
    if (isApiRoute) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/businesses/:path*", "/api/events/:path*"],
};
