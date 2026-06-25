import { describe, it, expect, vi } from "vitest";
import { getRequestOrigin, buildCanonical, buildOgImageUrl } from "./seo";

vi.mock("@/lib/origin", () => {
  return {
    getRequestOrigin: vi.fn(),
  };
});

import { getRequestOrigin as getOriginFromHeaders } from "@/lib/origin";

describe("SEO Utilities", () => {
  describe("getRequestOrigin", () => {
    it("should return the origin provided by getOriginFromHeaders", async () => {
      const mockOrigin = "https://example.com";
      vi.mocked(getOriginFromHeaders).mockResolvedValue(mockOrigin);

      const origin = await getRequestOrigin();
      expect(origin).toBe(mockOrigin);
      expect(getOriginFromHeaders).toHaveBeenCalled();
    });
  });

  describe("buildCanonical", () => {
    it("should build URL correctly when given a path starting with a slash", async () => {
      const mockOrigin = "https://example.com";
      vi.mocked(getOriginFromHeaders).mockResolvedValue(mockOrigin);

      const canonical = await buildCanonical("/about");
      expect(canonical).toBe("https://example.com/about");
    });

    it("should build URL correctly when given a path without a leading slash", async () => {
      const mockOrigin = "https://example.com";
      vi.mocked(getOriginFromHeaders).mockResolvedValue(mockOrigin);

      const canonical = await buildCanonical("about");
      expect(canonical).toBe("https://example.com/about");
    });

    it("should handle an empty pathname correctly", async () => {
      const mockOrigin = "https://example.com";
      vi.mocked(getOriginFromHeaders).mockResolvedValue(mockOrigin);

      const canonical = await buildCanonical("");
      expect(canonical).toBe("https://example.com/");
    });
  });

  describe("buildOgImageUrl", () => {
    it("should append /og.png to the mocked request origin", async () => {
      const mockOrigin = "https://example.com";
      vi.mocked(getOriginFromHeaders).mockResolvedValue(mockOrigin);

      const ogImageUrl = await buildOgImageUrl();
      expect(ogImageUrl).toBe("https://example.com/og.png");
    });
  });
});
