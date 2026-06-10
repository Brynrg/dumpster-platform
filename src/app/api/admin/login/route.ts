import { NextResponse } from "next/server";
import { LRUCache } from "lru-cache";

const rateLimit = new LRUCache<string, number>({
  max: 500,
  ttl: 1000 * 60 * 15, // 15 minutes
});

export async function POST(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : "unknown";

  const count = (rateLimit.get(ip) || 0) as number;
  if (count >= 5) {
    return NextResponse.json(
      { ok: false, error: "Too many login attempts. Please try again later." },
      { status: 429 },
    );
  }
  rateLimit.set(ip, count + 1);

  const adminToken = process.env.ADMIN_TOKEN;

  if (!adminToken) {
    return NextResponse.json(
      { ok: false, error: "ADMIN_TOKEN is not configured." },
      { status: 500 },
    );
  }

  let body: { token?: string };
  try {
    body = (await request.json()) as { token?: string };
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON payload." },
      { status: 400 },
    );
  }

  if (!body.token || body.token !== adminToken) {
    return NextResponse.json(
      { ok: false, error: "Invalid admin token." },
      { status: 401 },
    );
  }

  // Reset rate limit on successful login
  rateLimit.delete(ip);

  const response = NextResponse.json({ ok: true });
  response.cookies.set("admin", "1", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });

  return response;
}
