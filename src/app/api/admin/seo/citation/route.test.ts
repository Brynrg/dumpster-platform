import type { NextRequest } from "next/server";
import { POST } from "./route";
import { ADMIN_SESSION_COOKIE, createAdminSession } from "@/lib/adminSession";

const SECRET = "test-secret-at-least-32-characters-long!!";

const mockSingle = vi.fn();
const mockSelect = vi.fn().mockReturnValue({ single: mockSingle });
const mockEq = vi.fn().mockReturnValue({ select: mockSelect });
const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq });
const mockUpsert = vi.fn().mockReturnValue({ select: mockSelect });

const mockFrom = vi.fn().mockReturnValue({
  update: mockUpdate,
  upsert: mockUpsert,
});

const mockSupabaseAdmin = {
  from: mockFrom,
};

vi.mock("@/lib/supabase/server", () => ({
  getSupabaseAdmin: () => mockSupabaseAdmin,
}));

describe("POST /api/admin/seo/citation", () => {
  beforeEach(() => {
    process.env.ADMIN_SESSION_SECRET = SECRET;
    vi.clearAllMocks();
  });
  afterEach(() => {
    delete process.env.ADMIN_SESSION_SECRET;
  });

  const createMockRequest = async (
    payload: Record<string, unknown> = {},
    authenticated = true,
  ) => {
    let token: string | undefined;
    if (authenticated) {
      token = await createAdminSession();
    }

    return {
      cookies: {
        get: (name: string) =>
          name === ADMIN_SESSION_COOKIE && token ? { value: token } : undefined,
      },
      json: async () => payload,
    } as unknown as NextRequest;
  };

  it("should return 401 if unauthorized", async () => {
    const mockRequest = await createMockRequest({}, false);
    const response = await POST(mockRequest);

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

    const response = await POST(mockRequest);

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data).toEqual({ ok: false, error: "Invalid JSON payload." });
  });

  it("should return 400 if market is invalid", async () => {
    const mockRequest = await createMockRequest({
      market: "invalid-market",
      provider: "test-provider",
    });
    const response = await POST(mockRequest);

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data).toEqual({ ok: false, error: "Invalid market." });
  });

  it("should return 400 if provider is missing", async () => {
    const mockRequest = await createMockRequest({
      market: "tx-spring",
      provider: "   ",
    });
    const response = await POST(mockRequest);

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data).toEqual({ ok: false, error: "provider is required." });
  });

  it("should return 400 if status is invalid", async () => {
    const mockRequest = await createMockRequest({
      market: "tx-spring",
      provider: "test-provider",
      status: "invalid-status",
    });
    const response = await POST(mockRequest);

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data).toEqual({ ok: false, error: "Invalid status." });
  });

  describe("when providing an ID (update)", () => {
    it("should return 500 if update fails", async () => {
      mockSingle.mockResolvedValueOnce({
        data: null,
        error: new Error("DB Error"),
      });
      const mockRequest = await createMockRequest({
        id: "123",
        market: "tx-spring",
        provider: "test-provider",
      });
      const response = await POST(mockRequest);

      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data).toEqual({ ok: false, error: "Failed to update citation." });

      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          market: "tx-spring",
          provider: "test-provider",
          status: "todo",
        }),
      );
      expect(mockEq).toHaveBeenCalledWith("id", "123");
    });

    it("should return 200 and updated data on success", async () => {
      const mockCitation = {
        id: "123",
        market: "tx-spring",
        provider: "test-provider",
      };
      mockSingle.mockResolvedValueOnce({ data: mockCitation, error: null });
      const mockRequest = await createMockRequest({
        id: "123",
        market: "tx-spring",
        provider: "test-provider",
        status: "live",
      });
      const response = await POST(mockRequest);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toEqual({ ok: true, citation: mockCitation });
    });
  });

  describe("when not providing an ID (upsert)", () => {
    it("should return 500 if upsert fails", async () => {
      mockSingle.mockResolvedValueOnce({
        data: null,
        error: new Error("DB Error"),
      });
      const mockRequest = await createMockRequest({
        market: "tx-spring",
        provider: "test-provider",
      });
      const response = await POST(mockRequest);

      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data).toEqual({ ok: false, error: "Failed to save citation." });

      expect(mockUpsert).toHaveBeenCalledWith(
        expect.objectContaining({
          market: "tx-spring",
          provider: "test-provider",
          status: "todo",
        }),
        { onConflict: "market,provider" },
      );
    });

    it("should return 200 and saved data on success", async () => {
      const mockCitation = {
        id: "456",
        market: "tx-spring",
        provider: "test-provider",
      };
      mockSingle.mockResolvedValueOnce({ data: mockCitation, error: null });
      const mockRequest = await createMockRequest({
        market: "tx-spring",
        provider: "test-provider",
        nap_name: "Test Name",
      });
      const response = await POST(mockRequest);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toEqual({ ok: true, citation: mockCitation });
    });
  });

  it("should return 500 if getSupabaseAdmin throws", async () => {
    vi.mocked(mockFrom).mockImplementationOnce(() => {
      throw new Error("Supabase init error");
    });

    const mockRequest = await createMockRequest({
      market: "tx-spring",
      provider: "test-provider",
    });
    const response = await POST(mockRequest);

    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data).toEqual({ ok: false, error: "Supabase init error" });
  });
});
