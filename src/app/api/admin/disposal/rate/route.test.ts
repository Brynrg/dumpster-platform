import { POST } from "./route";
import { ADMIN_SESSION_COOKIE, createAdminSession } from "@/lib/adminSession";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";

const SECRET = "test-secret-at-least-32-characters-long!!";

// Mock Supabase
vi.mock("@/lib/supabase/server", () => ({
  getSupabaseAdmin: vi.fn(),
}));

import { getSupabaseAdmin } from "@/lib/supabase/server";
import { NextRequest } from "next/server";

describe("POST /api/admin/disposal/rate", () => {
  beforeEach(() => {
    process.env.ADMIN_SESSION_SECRET = SECRET;
    vi.clearAllMocks();
  });
  afterEach(() => {
    delete process.env.ADMIN_SESSION_SECRET;
  });

  const createRequest = async (
    body: Record<string, unknown> | FormData,
    isAuthenticated = true,
  ) => {
    let token = "";
    if (isAuthenticated) {
      token = await createAdminSession();
    }

    const headers = new Headers();
    const requestInit: RequestInit = {
      method: "POST",
      headers,
    };

    if (body instanceof FormData) {
      requestInit.body = body;
    } else {
      headers.set("Content-Type", "application/json");
      requestInit.body = JSON.stringify(body);
    }

    const request = new Request(
      "http://localhost/api/admin/disposal/rate",
      requestInit,
    ) as unknown as NextRequest;

    // Polyfill cookies.get for NextRequest expected by isAuthedAdmin
    Object.defineProperty(request, "cookies", {
      value: {
        get: (name: string) => {
          if (name === ADMIN_SESSION_COOKIE && token) {
            return { value: token };
          }
          return undefined;
        },
      },
    });

    return request;
  };

  it("should return 401 if unauthorized", async () => {
    const request = await createRequest({}, false);
    const response = await POST(request);

    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data).toEqual({ ok: false, error: "Unauthorized." });
  });

  it("should return 400 if JSON payload is invalid", async () => {
    const token = await createAdminSession();
    const request = new Request("http://localhost/api/admin/disposal/rate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: "invalid-json",
    }) as unknown as NextRequest;

    Object.defineProperty(request, "cookies", {
      value: {
        get: (name: string) => {
          if (name === ADMIN_SESSION_COOKIE) {
            return { value: token };
          }
          return undefined;
        },
      },
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data).toEqual({ ok: false, error: "Invalid JSON payload." });
  });

  it("should return 400 if facility_id or material_category are missing", async () => {
    const request = await createRequest({ facility_id: "  " });
    const response = await POST(request);

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data).toEqual({
      ok: false,
      error: "facility_id and material_category are required.",
    });
  });

  it("should return 400 if price is non-numeric", async () => {
    const request = await createRequest({
      facility_id: "f1",
      material_category: "m1",
      price: "not-a-number",
    });
    const response = await POST(request);

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data).toEqual({ ok: false, error: "price must be numeric." });
  });

  it("should parse form data successfully and return 500 if Supabase fails to insert", async () => {
    const formData = new FormData();
    formData.append("facility_id", "f1");
    formData.append("material_category", "m1");
    formData.append("price", "10");

    const request = await createRequest(formData);

    const mockSupabase = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
      insert: vi.fn().mockReturnThis(),
      single: vi
        .fn()
        .mockResolvedValue({ data: null, error: new Error("DB Error") }),
    };
    (getSupabaseAdmin as ReturnType<typeof vi.fn>).mockReturnValue(
      mockSupabase,
    );

    const response = await POST(request);

    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data).toEqual({ ok: false, error: "Failed to create rate." });
  });

  it("should create a new rate successfully", async () => {
    const request = await createRequest({
      facility_id: "f1",
      material_category: "m1",
      price: 15.5,
    });

    const mockSupabase = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
      insert: vi.fn().mockReturnThis(),
      single: vi
        .fn()
        .mockResolvedValue({ data: { id: "new-rate-id" }, error: null }),
    };
    (getSupabaseAdmin as ReturnType<typeof vi.fn>).mockReturnValue(
      mockSupabase,
    );

    const response = await POST(request);

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual({ ok: true, rateId: "new-rate-id", mode: "created" });
  });

  it("should update an existing rate by id", async () => {
    const request = await createRequest({
      id: "existing-id",
      facility_id: "f1",
      material_category: "m1",
      price: 20,
    });

    const mockSupabase = {
      from: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ error: null }),
    };
    (getSupabaseAdmin as ReturnType<typeof vi.fn>).mockReturnValue(
      mockSupabase,
    );

    const response = await POST(request);

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual({ ok: true, rateId: "existing-id", mode: "updated" });
  });

  it("should lookup existing rate and update if found", async () => {
    const request = await createRequest({
      facility_id: "f1",
      material_category: "m1",
      unit: "tons",
    });

    const mockSupabase = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({
        data: { id: "found-id" },
        error: null,
      }),
      update: vi.fn().mockReturnThis(),
    };

    // The query part calls .eq 4 times.
    // The update part calls .eq 1 time.
    mockSupabase.eq.mockImplementation((field, val) => {
      // Return the mockSupabase itself for chaining until maybeSingle is called, except for the last eq which belongs to update.
      if (field === "id" && val === "found-id") {
        // this is the update's eq
        return { error: null };
      }
      return mockSupabase;
    });

    (getSupabaseAdmin as ReturnType<typeof vi.fn>).mockReturnValue(
      mockSupabase,
    );

    const response = await POST(request);

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual({ ok: true, rateId: "found-id", mode: "updated" });
  });

  it("should return 500 if query existing rate fails", async () => {
    const request = await createRequest({
      facility_id: "f1",
      material_category: "m1",
    });

    const mockSupabase = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({
        data: null,
        error: new Error("DB error"),
      }),
    };

    (getSupabaseAdmin as ReturnType<typeof vi.fn>).mockReturnValue(
      mockSupabase,
    );

    const response = await POST(request);

    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data).toEqual({ ok: false, error: "Failed to query rate." });
  });

  it("should return 500 if update rate fails", async () => {
    const request = await createRequest({
      id: "existing-id",
      facility_id: "f1",
      material_category: "m1",
    });

    const mockSupabase = {
      from: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ error: new Error("Update failed") }),
    };

    (getSupabaseAdmin as ReturnType<typeof vi.fn>).mockReturnValue(
      mockSupabase,
    );

    const response = await POST(request);

    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data).toEqual({ ok: false, error: "Failed to update rate." });
  });
});
