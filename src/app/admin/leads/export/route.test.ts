import { describe, it, expect, vi } from "vitest";
import { GET } from "./route";

// Mock the Supabase admin client
vi.mock("@/lib/supabase/server", () => {
  const selectMock = vi.fn().mockReturnThis();
  const orderMock = vi.fn().mockReturnThis();
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

  return {
    getSupabaseAdmin: vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        select: selectMock,
        order: orderMock,
        limit: limitMock,
        eq: vi.fn().mockReturnThis(),
        ilike: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
      }),
    }),
  };
});

describe("Leads Export Route", () => {
  it("escapes CSV injection characters and quotes", async () => {
    const request = new Request("http://localhost/api/leads/export");
    const response = await GET(request);

    expect(response.status).toBe(200);

    const csv = await response.text();
    const rows = csv.split("\n");

    expect(rows.length).toBe(3); // Header + 2 data rows

    const header = rows[0];
    expect(header).toBe(
      "created_at,region,product,zip,requested_date,urgency,duration,material_type,name,phone,email,notified",
    );

    const firstDataRow = rows[1];
    // Check that injection characters are escaped
    expect(firstDataRow).toContain("\"'=cmd|' /C calc'!A0\""); // =
    expect(firstDataRow).toContain('"\'+1+1"'); // +
    expect(firstDataRow).toContain('"\'-1-1"'); // -
    expect(firstDataRow).toContain('"\'@SUM(1+1)"'); // @
    expect(firstDataRow).toContain('"\'\t=cmd"'); // \t
    expect(firstDataRow).toContain('"\'\r+cmd"'); // \r
    expect(firstDataRow).toContain('"Normal"'); // normal string

    const secondDataRow = rows[2];
    // Check that quotes are escaped properly
    expect(secondDataRow).toContain('"""Quotes"""'); // "Quotes" -> """Quotes"""
    expect(secondDataRow).toContain('"Safe"');
  });
});
