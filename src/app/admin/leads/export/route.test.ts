import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { GET } from "./route";
import { ADMIN_SESSION_COOKIE, createAdminSession } from "@/lib/adminSession";

const SECRET = "test-secret-at-least-32-characters-long!!";

// Mock the Supabase admin client with payloads that attempt CSV/formula injection.
vi.mock("@/lib/supabase/server", () => {
  const limitMock = vi.fn().mockResolvedValue({
    data: [
      {
        created_at: "2023-01-01",
        region: "=cmd|' /C calc'!A0",
        product: "+1+1",
        zip: "-1-1",
        requested_date: "@SUM(1+1)",
        urgency: "\t=cmd",
        duration: "\r+cmd",
        material_type: "Normal",
        name: "Test User",
        phone: "1234567890",
        email: "test@example.com",
        notified: true,
      },
      {
        created_at: "2023-01-02",
        region: "Safe",
        product: "Product",
        zip: "12345",
        requested_date: "2023-01-02",
        urgency: "High",
        duration: "1 week",
        material_type: "Wood",
        name: '"Quotes"',
        phone: "0987654321",
        email: "safe@example.com",
        notified: false,
      },
    ],
    error: null,
  });
  const chain = {
    select: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    ilike: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    lte: vi.fn().mockReturnThis(),
    limit: limitMock,
  };
  return {
    getSupabaseAdmin: vi.fn().mockReturnValue({ from: vi.fn().mockReturnValue(chain) }),
  };
});

async function authedRequest() {
  const token = await createAdminSession();
  return new NextRequest("http://localhost/admin/leads/export", {
    headers: { cookie: `${ADMIN_SESSION_COOKIE}=${token}` },
  });
}

describe("leads export route", () => {
  beforeEach(() => {
    process.env.ADMIN_SESSION_SECRET = SECRET;
  });
  afterEach(() => {
    delete process.env.ADMIN_SESSION_SECRET;
  });

  it("rejects unauthenticated requests", async () => {
    const res = await GET(new NextRequest("http://localhost/admin/leads/export"));
    expect(res.status).toBe(401);
  });

  it("neutralizes CSV/formula injection in exported cells", async () => {
    const res = await GET(await authedRequest());
    expect(res.status).toBe(200);

    const rows = (await res.text()).split("\n");
    expect(rows.length).toBe(3); // header + 2 data rows

    const dangerous = rows[1];
    // Every formula-leading field is prefixed with a single quote inside the cell.
    expect(dangerous).toContain(`"'=cmd|' /C calc'!A0"`);
    expect(dangerous).toContain(`"'+1+1"`);
    expect(dangerous).toContain(`"'-1-1"`);
    expect(dangerous).toContain(`"'@SUM(1+1)"`);
    expect(dangerous).toContain(`"'\t=cmd"`);
    expect(dangerous).toContain(`"'\r+cmd"`);

    // Safe values are untouched (no spurious quote prefix); double quotes still escaped.
    const safe = rows[2];
    expect(safe).toContain(`"Safe"`);
    expect(safe).not.toContain(`"'Safe"`);
    expect(safe).toContain(`"""Quotes"""`);
  });
});
