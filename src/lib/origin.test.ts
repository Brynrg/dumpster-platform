import { describe, it, expect, vi } from "vitest";
import { getRequestOrigin } from "./origin";

// Mock next/headers
vi.mock("next/headers", () => {
  return {
    headers: vi.fn(),
  };
});

import { headers } from "next/headers";

describe("getRequestOrigin", () => {
  it("should return localhost:3000 when no host headers are present", async () => {
    vi.mocked(headers).mockResolvedValue(new Map() as unknown as Headers);

    const origin = await getRequestOrigin();
    expect(origin).toBe("http://localhost:3000");
  });

  it("should use x-forwarded-host and x-forwarded-proto if present", async () => {
    vi.mocked(headers).mockResolvedValue(
      new Map([
        ["x-forwarded-host", "example.com"],
        ["x-forwarded-proto", "http"],
      ]) as unknown as Headers,
    );

    const origin = await getRequestOrigin();
    expect(origin).toBe("http://example.com");
  });

  it("should fall back to host and default proto if x-forwarded-* are not present", async () => {
    vi.mocked(headers).mockResolvedValue(
      new Map([["host", "fallback.com"]]) as unknown as Headers,
    );

    const origin = await getRequestOrigin();
    expect(origin).toBe("https://fallback.com");
  });
});
