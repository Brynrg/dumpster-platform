import { NextResponse } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_MAX_AGE,
  createAdminSession,
  timingSafeEqual,
} from "@/lib/adminSession";
import { RateLimiter } from "@/lib/rateLimit";

// Limit to 5 requests per 1 minute window per IP
const loginRateLimiter = new RateLimiter(5, 60 * 1000);

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const { success, headers } = loginRateLimiter.check(ip);

  if (!success) {
    return NextResponse.json(
      { ok: false, error: "Too many login attempts. Please try again later." },
      { status: 429, headers }
    );
  }

  const adminToken = process.env.ADMIN_TOKEN;

  if (!adminToken) {
    return NextResponse.json(
      { ok: false, error: "ADMIN_TOKEN is not configured." },
      { status: 500, headers },
    );
  }

  let body: { token?: string };
  try {
    body = (await request.json()) as { token?: string };
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON payload." },
      { status: 400, headers },
    );
  }

  if (!body.token || !timingSafeEqual(body.token, adminToken)) {
    return NextResponse.json(
      { ok: false, error: "Invalid admin token." },
      { status: 401, headers },
    );
  }

  const response = NextResponse.json({ ok: true }, { headers });
  response.cookies.set(ADMIN_SESSION_COOKIE, await createAdminSession(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: ADMIN_SESSION_MAX_AGE,
  });

  return response;
}
