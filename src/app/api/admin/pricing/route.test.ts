import { POST } from "./route";
import { ADMIN_SESSION_COOKIE, createAdminSession } from "@/lib/adminSession";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { getSupabaseAdmin } from "@/lib/supabase/server";

const SECRET = "test-secret-at-least-32-characters-long!!";

// Mock Supabase admin client
vi.mock("@/lib/supabase/server", () => {
  const chain = {
    upsert: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    single: vi.fn(),
  };
  return {
    getSupabaseAdmin: vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue(chain),
    }),
  };
});

describe("POST /api/admin/pricing", () => {
  beforeEach(() => {
    process.env.ADMIN_SESSION_SECRET = SECRET;
    vi.clearAllMocks();
  });

  afterEach(() => {
    delete process.env.ADMIN_SESSION_SECRET;
  });

  it("returns 401 if unauthorized", async () => {
    const mockRequest = {
      cookies: { get: () => undefined },
      json: async () => ({}),
    } as any;

    const response = await POST(mockRequest);

    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data).toEqual({ ok: false, error: "Unauthorized." });
  });

  it("returns 400 if JSON payload is invalid", async () => {
    const token = await createAdminSession();
    const mockRequest = {
      cookies: {
        get: (name: string) =>
          name === ADMIN_SESSION_COOKIE ? { value: token } : undefined,
      },
      json: async () => {
        throw new Error("Invalid JSON");
      },
    } as any;

    const response = await POST(mockRequest);

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data).toEqual({ ok: false, error: "Invalid JSON payload." });
  });

  it("returns 400 if region is missing", async () => {
    const token = await createAdminSession();
    const mockRequest = {
      cookies: {
        get: (name: string) =>
          name === ADMIN_SESSION_COOKIE ? { value: token } : undefined,
      },
      json: async () => ({ fuel_price: 3.5 }), // Missing region
    } as any;

    const response = await POST(mockRequest);

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data).toEqual({ ok: false, error: "region is required." });
  });

  it("returns 500 if Supabase upsert fails", async () => {
    const token = await createAdminSession();
    const mockRequest = {
      cookies: {
        get: (name: string) =>
          name === ADMIN_SESSION_COOKIE ? { value: token } : undefined,
      },
      json: async () => ({ region: "test-region", fuel_price: 3.5 }),
    } as any;

    const supabaseAdmin = getSupabaseAdmin();
    // Use the chained mock object directly
    const chain = supabaseAdmin.from("any") as any;
    chain.single.mockResolvedValueOnce({ error: new Error("DB Error"), data: null });

    const response = await POST(mockRequest);

    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data).toEqual({ ok: false, error: "Failed to upsert pricing config." });
  });

  it("returns 200 and upserts data correctly on success", async () => {
    const token = await createAdminSession();
    const mockRequest = {
      cookies: {
        get: (name: string) =>
          name === ADMIN_SESSION_COOKIE ? { value: token } : undefined,
      },
      json: async () => ({
        region: " test-region ", // should be trimmed
        fuel_price: "3.5",
        avg_mpg: 10,
        trailer_term_months: "48.5", // should be truncated to integer
        invalid_field: "should be ignored by toNumber"
      }),
    } as any;

    const supabaseAdmin = getSupabaseAdmin();
    // Use the chained mock object directly
    const chain = supabaseAdmin.from("any") as any;

    chain.single.mockResolvedValueOnce({
      error: null,
      data: { id: 1, region: "test-region" },
    });

    const response = await POST(mockRequest);

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual({ ok: true, pricingId: 1, region: "test-region" });

    expect(chain.upsert).toHaveBeenCalledWith(
      {
        region: "test-region",
        fuel_price: 3.5,
        avg_mpg: 10,
        avg_distance_miles: null,
        labor_cost: null,
        overhead_per_day: null,
        dump_margin_percent: null,
        trailer_payment: null,
        trailer_term_months: 48,
        maintenance_per_month: null,
        target_utilization: null,
        notes: null,
      },
      { onConflict: "region" }
    );
  });
});
