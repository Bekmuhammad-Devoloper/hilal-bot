import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // /app sahifasi uchun keshni to'liq o'chirish
  if (request.nextUrl.pathname.startsWith("/app")) {
    response.headers.set("Cache-Control", "no-cache, no-store, must-revalidate, max-age=0, s-maxage=0");
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");
    response.headers.set("x-nextjs-cache", "BYPASS");
    response.headers.set("CDN-Cache-Control", "no-store");
  }

  // CORS / iframe uchun
  response.headers.set("X-Frame-Options", "ALLOWALL");
  response.headers.set("Content-Security-Policy", "frame-ancestors *;");

  return response;
}

export const config = {
  matcher: ["/app/:path*", "/app"],
};
