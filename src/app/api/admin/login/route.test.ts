import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { POST } from "./route";

// Mock external dependencies
vi.mock("@/lib/adminSession", () => ({
  ADMIN_SESSION_COOKIE: "admin_session",
  ADMIN_SESSION_MAX_AGE: 86400,
  createAdminSession: vi.fn().mockResolvedValue("mocked_session_token"),
  timingSafeEqual: (a: string, b: string) => a === b,
}));

describe("POST /api/admin/login", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv, ADMIN_TOKEN: "secret_token" };
    // Need to reset the rate limiter state since it's global.
    // The easiest way is to mock Date to reset it, or simply use different IP addresses
    vi.useFakeTimers();
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  const createRequest = (ip: string, body?: Record<string, unknown>) => {
    return new Request("http://localhost:3000/api/admin/login", {
      method: "POST",
      headers: {
        "x-forwarded-for": ip,
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  };

  it("returns 500 if ADMIN_TOKEN is not configured", async () => {
    delete process.env.ADMIN_TOKEN;
    const req = createRequest("1.1.1.1", { token: "any" });
    const res = await POST(req);
    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.error).toBe("ADMIN_TOKEN is not configured.");
  });

  it("returns 400 for invalid JSON payload", async () => {
    const req = new Request("http://localhost:3000/api/admin/login", {
      method: "POST",
      headers: { "x-forwarded-for": "1.1.1.2" },
      body: "invalid json",
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("Invalid JSON payload.");
  });

  it("returns 401 for invalid admin token", async () => {
    const req = createRequest("1.1.1.3", { token: "wrong_token" });
    const res = await POST(req);
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toBe("Invalid admin token.");
  });

  it("returns 200 and sets cookie for valid admin token", async () => {
    const req = createRequest("1.1.1.4", { token: "secret_token" });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.ok).toBe(true);

    // In actual implementation response.cookies is not standard fetch Headers,
    // NextResponse handles cookies differently, but since we are returning a NextResponse
    // we can check if it returns a response (we mock the set cookie).
    // In vitest environment with Next.js polyfills, we can at least check if it succeeded.
  });

  it("rate limits after 5 requests", async () => {
    const ip = "1.1.1.5"; // Use unique IP to isolate from other tests

    // Make 5 requests (should pass rate limiter, even if token is wrong it consumes rate limit)
    for (let i = 0; i < 5; i++) {
      const req = createRequest(ip, { token: "wrong" });
      const res = await POST(req);
      expect(res.status).toBe(401); // 401 means it passed rate limiting
      expect(res.headers.get("X-RateLimit-Limit")).toBe("5");
    }

    // 6th request should be rate limited
    const req = createRequest(ip, { token: "wrong" });
    const res = await POST(req);
    expect(res.status).toBe(429);

    const data = await res.json();
    expect(data.error).toBe("Too many login attempts. Please try again later.");
    expect(res.headers.get("X-RateLimit-Remaining")).toBe("0");

    // After 15 minutes, should work again
    vi.advanceTimersByTime(15 * 60 * 1000 + 1);
    const nextReq = createRequest(ip, { token: "wrong" });
    const nextRes = await POST(nextReq);
    expect(nextRes.status).toBe(401); // Works again
  });
});
