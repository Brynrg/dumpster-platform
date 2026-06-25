import { POST } from "./route";
import { ADMIN_SESSION_COOKIE, createAdminSession } from "@/lib/adminSession";
import { getSupabaseAdmin } from "@/lib/supabase/server";

const SECRET = "test-secret-at-least-32-characters-long!!";

vi.mock("@/lib/supabase/server", () => ({
  getSupabaseAdmin: vi.fn(),
}));

describe("POST /api/admin/pricing", () => {
  let mockSupabase: Record<string, unknown>;

  beforeEach(() => {
    process.env.ADMIN_SESSION_SECRET = SECRET;

    mockSupabase = {
      from: vi.fn().mockReturnThis(),
      upsert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi
        .fn()
        .mockResolvedValue({
          data: { id: 1, region: "test-region" },
          error: null,
        }),
    };
    (getSupabaseAdmin as unknown as ReturnType<typeof vi.fn>).mockReturnValue(mockSupabase);
  });

  afterEach(() => {
    delete process.env.ADMIN_SESSION_SECRET;
    vi.clearAllMocks();
  });

  it("should return 401 if unauthorized", async () => {
    const mockRequest = {
      cookies: { get: () => undefined },
      json: async () => ({}),
    } as unknown as Request;

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
    } as unknown as Request;

    const response = await POST(mockRequest);

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data).toEqual({ ok: false, error: "Invalid JSON payload." });
  });

  it("should return 400 if region is missing", async () => {
    const token = await createAdminSession();
    const mockRequest = {
      cookies: {
        get: (name: string) =>
          name === ADMIN_SESSION_COOKIE ? { value: token } : undefined,
      },
      json: async () => ({ fuel_price: 3.5 }),
    } as unknown as Request;

    const response = await POST(mockRequest);

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data).toEqual({ ok: false, error: "region is required." });
  });

  it("should return 500 if Supabase upsert fails", async () => {
    const token = await createAdminSession();
    const mockRequest = {
      cookies: {
        get: (name: string) =>
          name === ADMIN_SESSION_COOKIE ? { value: token } : undefined,
      },
      json: async () => ({ region: "test-region", fuel_price: 3.5 }),
    } as unknown as Request;

    (mockSupabase.single as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: null,
      error: { message: "DB Error" },
    });

    const response = await POST(mockRequest);

    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data).toEqual({
      ok: false,
      error: "Failed to upsert pricing config.",
    });
  });

  it("should return 500 if an exception is thrown during upsert", async () => {
    const token = await createAdminSession();
    const mockRequest = {
      cookies: {
        get: (name: string) =>
          name === ADMIN_SESSION_COOKIE ? { value: token } : undefined,
      },
      json: async () => ({ region: "test-region", fuel_price: 3.5 }),
    } as unknown as Request;

    (mockSupabase.single as ReturnType<typeof vi.fn>).mockImplementation(() => {
      throw new Error("Unexpected Error");
    });

    const response = await POST(mockRequest);

    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data).toEqual({ ok: false, error: "Unexpected Error" });
  });

  it("should return 200 and parse values correctly on successful upsert", async () => {
    const token = await createAdminSession();
    const mockRequest = {
      cookies: {
        get: (name: string) =>
          name === ADMIN_SESSION_COOKIE ? { value: token } : undefined,
      },
      json: async () => ({
        region: " test-region ", // test trimming
        fuel_price: "3.5", // string to number
        trailer_term_months: "48.9", // string to integer
        notes: "  Some notes  ", // test trimming
        avg_mpg: "invalid", // should be null
        labor_cost: undefined, // should be null
      }),
    } as unknown as Request;

    const response = await POST(mockRequest);

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual({ ok: true, pricingId: 1, region: "test-region" });

    expect(mockSupabase.from).toHaveBeenCalledWith("pricing_configs");
    expect(mockSupabase.upsert).toHaveBeenCalledWith(
      {
        region: "test-region",
        fuel_price: 3.5,
        avg_mpg: null, // invalid number parsed to null
        avg_distance_miles: null,
        labor_cost: null,
        overhead_per_day: null,
        dump_margin_percent: null,
        trailer_payment: null,
        trailer_term_months: 48, // 48.9 truncated to 48
        maintenance_per_month: null,
        target_utilization: null,
        notes: "Some notes",
      },
      { onConflict: "region" },
    );
  });
});
