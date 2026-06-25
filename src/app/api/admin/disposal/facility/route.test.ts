import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { POST } from "./route";
import { ADMIN_SESSION_COOKIE, createAdminSession } from "@/lib/adminSession";
import { getSupabaseAdmin } from "@/lib/supabase/server";

vi.mock("@/lib/supabase/server", () => ({
  getSupabaseAdmin: vi.fn(),
}));

const SECRET = "test-secret-at-least-32-characters-long!!";

describe("POST /api/admin/disposal/facility", () => {
  let mockSupabase: any;

  beforeEach(() => {
    process.env.ADMIN_SESSION_SECRET = SECRET;

    mockSupabase = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn(),
      single: vi.fn(),
    };

    (getSupabaseAdmin as any).mockReturnValue(mockSupabase);
  });

  afterEach(() => {
    delete process.env.ADMIN_SESSION_SECRET;
    vi.clearAllMocks();
  });

  it("should return 401 if unauthorized", async () => {
    const mockRequest = {
      cookies: { get: () => undefined },
    } as any;

    const response = await POST(mockRequest);
    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ ok: false, error: "Unauthorized." });
  });

  it("should return 400 if JSON payload is invalid", async () => {
    const token = await createAdminSession();
    const mockRequest = {
      cookies: {
        get: (name: string) =>
          name === ADMIN_SESSION_COOKIE ? { value: token } : undefined,
      },
      headers: new Headers({ "content-type": "application/json" }),
      json: async () => {
        throw new Error("Unexpected end of JSON input");
      },
    } as any;

    const response = await POST(mockRequest);
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ ok: false, error: "Invalid JSON payload." });
  });

  it("should return 400 if required fields are missing", async () => {
    const token = await createAdminSession();
    const mockRequest = {
      cookies: {
        get: (name: string) =>
          name === ADMIN_SESSION_COOKIE ? { value: token } : undefined,
      },
      headers: new Headers({ "content-type": "application/json" }),
      json: async () => ({
        market: "   ",
        name: "",
      }),
    } as any;

    const response = await POST(mockRequest);
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ ok: false, error: "market and name are required." });
  });

  it("should process formData properly", async () => {
    const token = await createAdminSession();
    const formData = new FormData();
    formData.append("market", "Test Market");
    formData.append("name", "Test Name");

    const mockRequest = {
      cookies: {
        get: (name: string) =>
          name === ADMIN_SESSION_COOKIE ? { value: token } : undefined,
      },
      headers: new Headers({ "content-type": "multipart/form-data" }),
      formData: async () => formData,
    } as any;

    mockSupabase.maybeSingle.mockResolvedValue({ data: null, error: null });
    mockSupabase.insert.mockReturnThis();
    mockSupabase.single.mockResolvedValue({ data: { id: "new-id" }, error: null });

    const response = await POST(mockRequest);
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true, facilityId: "new-id", mode: "created" });
  });

  it("should return 500 if supabase query fails", async () => {
    const token = await createAdminSession();
    const mockRequest = {
      cookies: {
        get: (name: string) =>
          name === ADMIN_SESSION_COOKIE ? { value: token } : undefined,
      },
      headers: new Headers({ "content-type": "application/json" }),
      json: async () => ({
        market: "Test Market",
        name: "Test Name",
      }),
    } as any;

    mockSupabase.maybeSingle.mockResolvedValue({ error: new Error("DB Error") });

    const response = await POST(mockRequest);
    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ ok: false, error: "Failed to query facility." });
  });

  it("should return 500 if supabase update fails", async () => {
    const token = await createAdminSession();
    const mockRequest = {
      cookies: {
        get: (name: string) =>
          name === ADMIN_SESSION_COOKIE ? { value: token } : undefined,
      },
      headers: new Headers({ "content-type": "application/json" }),
      json: async () => ({
        id: "existing-id",
        market: "Test Market",
        name: "Test Name",
      }),
    } as any;

    mockSupabase.update.mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: new Error("DB Update Error") }) });

    const response = await POST(mockRequest);
    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ ok: false, error: "Failed to update facility." });
  });

  it("should return 500 if supabase insert fails", async () => {
    const token = await createAdminSession();
    const mockRequest = {
      cookies: {
        get: (name: string) =>
          name === ADMIN_SESSION_COOKIE ? { value: token } : undefined,
      },
      headers: new Headers({ "content-type": "application/json" }),
      json: async () => ({
        market: "Test Market",
        name: "Test Name",
      }),
    } as any;

    mockSupabase.maybeSingle.mockResolvedValue({ data: null, error: null });
    mockSupabase.single.mockResolvedValue({ error: new Error("DB Insert Error") });

    const response = await POST(mockRequest);
    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ ok: false, error: "Failed to create facility." });
  });

  it("should insert successfully if no existing facility found", async () => {
    const token = await createAdminSession();
    const mockRequest = {
      cookies: {
        get: (name: string) =>
          name === ADMIN_SESSION_COOKIE ? { value: token } : undefined,
      },
      headers: new Headers({ "content-type": "application/json" }),
      json: async () => ({
        market: "Test Market",
        name: "Test Name",
      }),
    } as any;

    mockSupabase.maybeSingle.mockResolvedValue({ data: null, error: null });
    mockSupabase.single.mockResolvedValue({ data: { id: "new-id" }, error: null });

    const response = await POST(mockRequest);
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true, facilityId: "new-id", mode: "created" });
  });

  it("should update successfully via explicitly provided ID", async () => {
    const token = await createAdminSession();
    const mockRequest = {
      cookies: {
        get: (name: string) =>
          name === ADMIN_SESSION_COOKIE ? { value: token } : undefined,
      },
      headers: new Headers({ "content-type": "application/json" }),
      json: async () => ({
        id: "explicit-id",
        market: "Test Market",
        name: "Test Name",
      }),
    } as any;

    mockSupabase.update.mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) });

    const response = await POST(mockRequest);
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true, facilityId: "explicit-id", mode: "updated" });
  });

  it("should update successfully via queried existing ID", async () => {
    const token = await createAdminSession();
    const mockRequest = {
      cookies: {
        get: (name: string) =>
          name === ADMIN_SESSION_COOKIE ? { value: token } : undefined,
      },
      headers: new Headers({ "content-type": "application/json" }),
      json: async () => ({
        market: "Test Market",
        name: "Test Name",
      }),
    } as any;

    mockSupabase.maybeSingle.mockResolvedValue({ data: { id: "queried-id" }, error: null });
    mockSupabase.update.mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) });

    const response = await POST(mockRequest);
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true, facilityId: "queried-id", mode: "updated" });
  });

  it("should return 500 if an unexpected error occurs in try block", async () => {
    const token = await createAdminSession();
    const mockRequest = {
      cookies: {
        get: (name: string) =>
          name === ADMIN_SESSION_COOKIE ? { value: token } : undefined,
      },
      headers: new Headers({ "content-type": "application/json" }),
      json: async () => ({
        market: "Test Market",
        name: "Test Name",
      }),
    } as any;

    mockSupabase.maybeSingle.mockRejectedValue(new Error("Unexpected throw"));

    const response = await POST(mockRequest);
    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ ok: false, error: "Unexpected throw" });
  });
});
