import { NextResponse } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_MAX_AGE,
  createAdminSession,
  timingSafeEqual,
} from "@/lib/adminSession";
import { RateLimiter } from "@/lib/rateLimit";

// Global rate limiter: 5 requests per 15 minutes
const loginRateLimiter = new RateLimiter(5, 15 * 60 * 1000);

export async function POST(request: Request) {
  // Apply rate limiting
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const rateLimitResult = loginRateLimiter.check(ip);

  if (!rateLimitResult.success) {
    return NextResponse.json(
      { ok: false, error: "Too many login attempts. Please try again later." },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': rateLimitResult.limit.toString(),
          'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
          'X-RateLimit-Reset': Math.ceil(rateLimitResult.reset / 1000).toString(),
        }
      }
    );
  }

  const adminToken = process.env.ADMIN_TOKEN;

  if (!adminToken) {
    return NextResponse.json(
      { ok: false, error: "ADMIN_TOKEN is not configured." },
      {
        status: 500,
        headers: {
          'X-RateLimit-Limit': rateLimitResult.limit.toString(),
          'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
          'X-RateLimit-Reset': Math.ceil(rateLimitResult.reset / 1000).toString(),
        }
      },
    );
  }

  let body: { token?: string };
  try {
    body = (await request.json()) as { token?: string };
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON payload." },
      {
        status: 400,
        headers: {
          'X-RateLimit-Limit': rateLimitResult.limit.toString(),
          'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
          'X-RateLimit-Reset': Math.ceil(rateLimitResult.reset / 1000).toString(),
        }
      },
    );
  }

  if (!body.token || !timingSafeEqual(body.token, adminToken)) {
    return NextResponse.json(
      { ok: false, error: "Invalid admin token." },
      {
        status: 401,
        headers: {
          'X-RateLimit-Limit': rateLimitResult.limit.toString(),
          'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
          'X-RateLimit-Reset': Math.ceil(rateLimitResult.reset / 1000).toString(),
        }
      },
    );
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_SESSION_COOKIE, await createAdminSession(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: ADMIN_SESSION_MAX_AGE,
  });

  // Include rate limit headers for successful requests too
  response.headers.set('X-RateLimit-Limit', rateLimitResult.limit.toString());
  response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString());
  response.headers.set('X-RateLimit-Reset', Math.ceil(rateLimitResult.reset / 1000).toString());

  return response;
}
