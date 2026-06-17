import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "./route";

// Mock dependencies
vi.mock("next/server", () => ({
  NextResponse: {
    json: (body: Record<string, unknown>, init?: { status?: number }) => {
      return {
        status: init?.status ?? 200,
        json: async () => body,
      };
    },
  },
}));

vi.mock("@/lib/supabase/server", () => ({
  getSupabaseAdmin: vi.fn(),
}));

vi.mock("@/lib/twilio/server", () => ({
  isSmsEnabled: vi.fn(() => false),
  normalizePhone: vi.fn((phone) => phone),
  sendSms: vi.fn(),
}));

describe("POST /api/lead", () => {
  beforeEach(() => {
    // Reset any mocks and state if necessary.
    vi.clearAllMocks();
  });

  const createRequest = (ip: string | null, payload: unknown, method: string = "POST", rawBody: string | null = null) => {
    const headers = new Headers({
      "Content-Type": "application/json",
    });
    if (ip !== null) {
      headers.set("x-forwarded-for", ip);
    }
    return new Request("http://localhost:3000/api/lead", {
      method,
      headers,
      body: rawBody !== null ? rawBody : JSON.stringify(payload),
    });
  };

  const validPayload = {
    region: "test-region",
    product: "test-product",
    phone: "1234567890",
    sms_opt_in: true,
  };

  it("should return 400 if JSON payload is invalid", async () => {
    // A request with invalid JSON body
    const request = createRequest(null, null, "POST", "invalid-json");

    const response = await POST(request) as unknown as { status: number, json: () => Promise<Record<string, unknown>> };

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data).toEqual({ ok: false, error: "Invalid JSON payload." });
  });

  it("should rate limit requests exceeding the threshold", async () => {
    const ip = "192.168.1.100";

    // MAX_REQUESTS_PER_WINDOW is 5
    for (let i = 0; i < 5; i++) {
      const request = createRequest(ip, validPayload);
      const response = await POST(request) as unknown as { status: number, json: () => Promise<Record<string, unknown>> };
      expect(response.status).not.toBe(429);
    }

    // The 6th request should be rate-limited
    const request = createRequest(ip, validPayload);
    const response = await POST(request) as unknown as { status: number, json: () => Promise<Record<string, unknown>> };

    expect(response.status).toBe(429);
    const body = await response.json();
    expect(body.ok).toBe(false);
    expect(body.error).toBe("Too many requests. Please try again later.");
  });

  it("should track rate limits per IP independently", async () => {
    const ip1 = "10.0.0.1";
    const ip2 = "10.0.0.2";

    // Exhaust limit for ip1
    for (let i = 0; i < 5; i++) {
      await POST(createRequest(ip1, validPayload));
    }
    const rateLimitedRes1 = await POST(createRequest(ip1, validPayload)) as unknown as { status: number, json: () => Promise<Record<string, unknown>> };
    expect(rateLimitedRes1.status).toBe(429);

    // ip2 should still be allowed
    const allowedRes2 = await POST(createRequest(ip2, validPayload)) as unknown as { status: number, json: () => Promise<Record<string, unknown>> };
    expect(allowedRes2.status).not.toBe(429);
  });

  it("should parse x-forwarded-for securely", async () => {
    const ipSpoofed = "1.2.3.4, 10.0.0.3"; // Client tries to spoof IP

    // We should track rate limits by the first IP in the list (the real client IP)
    for (let i = 0; i < 5; i++) {
      await POST(createRequest(ipSpoofed, validPayload));
    }

    // 6th request with the same real IP should be rate limited, even if they spoof a different proxy IP
    const rateLimitedRes = await POST(createRequest("1.2.3.4, 10.0.0.4", validPayload)) as unknown as { status: number, json: () => Promise<Record<string, unknown>> };
    expect(rateLimitedRes.status).toBe(429);
  });
});
