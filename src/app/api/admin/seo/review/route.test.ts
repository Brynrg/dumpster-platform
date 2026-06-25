import { vi, describe, beforeEach, afterEach, it, expect, Mock } from "vitest";
import { POST } from "./route";
import type { NextRequest } from "next/server";
import { ADMIN_SESSION_COOKIE, createAdminSession } from "@/lib/adminSession";
import { getSupabaseAdmin } from "@/lib/supabase/server";

vi.mock("@/lib/supabase/server", () => ({
  getSupabaseAdmin: vi.fn(),
}));

const SECRET = "test-secret-at-least-32-characters-long!!";

function createMockRequest(payload: unknown, token?: string) {
  return {
    cookies: {
      get: (name: string) =>
        name === ADMIN_SESSION_COOKIE && token ? { value: token } : undefined,
    },
    json: async () => payload,
  } as unknown as NextRequest;
}

describe("POST /api/admin/seo/review", () => {
  let mockSupabase: Record<string, unknown>;

  beforeEach(() => {
    process.env.ADMIN_SESSION_SECRET = SECRET;
    vi.clearAllMocks();

    mockSupabase = {
      from: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn(),
    };
    (getSupabaseAdmin as Mock).mockReturnValue(mockSupabase);
  });

  afterEach(() => {
    delete process.env.ADMIN_SESSION_SECRET;
  });

  it("should return 401 if unauthorized", async () => {
    const mockRequest = createMockRequest({});
    const response = await POST(mockRequest as unknown as NextRequest);
    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data).toEqual({ ok: false, error: "Unauthorized." });
  });

  it("should return 400 if JSON payload is invalid", async () => {
    const token = await createAdminSession();
    const mockRequest = {
      cookies: {
        get: (name: string) =>
          name === ADMIN_SESSION_COOKIE ? { value: token } : undefined,
      },
      json: async () => {
        throw new Error("Unexpected end of JSON input");
      },
    } as unknown as NextRequest;

    const response = await POST(mockRequest as unknown as NextRequest);
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data).toEqual({ ok: false, error: "Invalid JSON payload." });
  });

  it("should return 400 if market is invalid", async () => {
    const token = await createAdminSession();
    const mockRequest = createMockRequest({ market: "invalid-market" }, token);
    const response = await POST(mockRequest as unknown as NextRequest);
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data).toEqual({ ok: false, error: "Invalid market." });
  });

  it("should return 400 if channel is invalid", async () => {
    const token = await createAdminSession();
    const mockRequest = createMockRequest(
      { market: "tx-spring", channel: "pigeon" },
      token,
    );
    const response = await POST(mockRequest as unknown as NextRequest);
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data).toEqual({ ok: false, error: "Invalid channel." });
  });

  it("should return 400 if status is invalid", async () => {
    const token = await createAdminSession();
    const mockRequest = createMockRequest(
      { market: "tx-spring", status: "in-progress" },
      token,
    );
    const response = await POST(mockRequest as unknown as NextRequest);
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data).toEqual({ ok: false, error: "Invalid status." });
  });

  it("should successfully update an existing review request", async () => {
    const token = await createAdminSession();
    const payload = {
      id: "123",
      market: "tx-spring",
      channel: "email",
      status: "completed",
    };
    const mockRequest = createMockRequest(payload, token);
    const mockReviewData = {
      id: "123",
      market: "tx-spring",
      status: "completed",
    };

    (mockSupabase.single as Mock).mockResolvedValueOnce({
      data: mockReviewData,
      error: null,
    });

    const response = await POST(mockRequest as unknown as NextRequest);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual({ ok: true, review: mockReviewData });
    expect(mockSupabase.update).toHaveBeenCalledWith(
      expect.objectContaining({
        market: "tx-spring",
        channel: "email",
        status: "completed",
      }),
    );
    expect(mockSupabase.eq).toHaveBeenCalledWith("id", "123");
  });

  it("should fail to update an existing review request gracefully", async () => {
    const token = await createAdminSession();
    const payload = {
      id: "123",
      market: "tx-spring",
    };
    const mockRequest = createMockRequest(payload, token);

    (mockSupabase.single as Mock).mockResolvedValueOnce({
      data: null,
      error: new Error("DB Error"),
    });

    const response = await POST(mockRequest as unknown as NextRequest);
    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data).toEqual({
      ok: false,
      error: "Failed to update review request.",
    });
  });

  it("should successfully insert a new review request", async () => {
    const token = await createAdminSession();
    const payload = {
      market: "fl-brevard",
    };
    const mockRequest = createMockRequest(payload, token);
    const mockReviewData = { id: "456", market: "fl-brevard", status: "draft" };

    (mockSupabase.single as Mock).mockResolvedValueOnce({
      data: mockReviewData,
      error: null,
    });

    const response = await POST(mockRequest as unknown as NextRequest);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual({ ok: true, review: mockReviewData });
    expect(mockSupabase.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        market: "fl-brevard",
        status: "draft",
        channel: "sms",
      }),
    );
  });

  it("should fail to insert a new review request gracefully", async () => {
    const token = await createAdminSession();
    const payload = {
      market: "tx-spring",
    };
    const mockRequest = createMockRequest(payload, token);

    (mockSupabase.single as Mock).mockResolvedValueOnce({
      data: null,
      error: new Error("DB Error"),
    });

    const response = await POST(mockRequest as unknown as NextRequest);
    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data).toEqual({
      ok: false,
      error: "Failed to create review request.",
    });
  });

  it("should handle unexpected errors with a 500 status code", async () => {
    const token = await createAdminSession();
    const payload = {
      market: "tx-spring",
    };
    const mockRequest = createMockRequest(payload, token);

    (mockSupabase.from as Mock).mockImplementationOnce(() => {
      throw new Error("Unexpected explosion");
    });

    const response = await POST(mockRequest as unknown as NextRequest);
    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data).toEqual({ ok: false, error: "Unexpected explosion" });
  });
});
