import { describe, it, expect, vi, beforeEach } from "vitest";
import { getRequestOrigin, buildCanonical, buildOgImageUrl } from "./seo";
import { getRequestOrigin as getOriginFromHeaders } from "@/lib/origin";

vi.mock("@/lib/origin", () => ({
  getRequestOrigin: vi.fn(),
}));

describe("seo utilities", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe("getRequestOrigin", () => {
    it("should return the origin from headers", async () => {
      vi.mocked(getOriginFromHeaders).mockResolvedValue("https://example.com");

      const origin = await getRequestOrigin();

      expect(origin).toBe("https://example.com");
      expect(getOriginFromHeaders).toHaveBeenCalledOnce();
    });
  });

  describe("buildCanonical", () => {
    it("should prepend origin and ensure leading slash when path does not have one", async () => {
      vi.mocked(getOriginFromHeaders).mockResolvedValue("https://example.com");

      const url = await buildCanonical("some-path");

      expect(url).toBe("https://example.com/some-path");
    });

    it("should prepend origin without adding extra slash when path has leading slash", async () => {
      vi.mocked(getOriginFromHeaders).mockResolvedValue("https://example.com");

      const url = await buildCanonical("/another-path");

      expect(url).toBe("https://example.com/another-path");
    });

    it("should handle empty string pathname gracefully", async () => {
      vi.mocked(getOriginFromHeaders).mockResolvedValue("https://example.com");

      const url = await buildCanonical("");

      expect(url).toBe("https://example.com/");
    });
  });

  describe("buildOgImageUrl", () => {
    it("should return origin with /og.png appended", async () => {
      vi.mocked(getOriginFromHeaders).mockResolvedValue("https://example.com");

      const url = await buildOgImageUrl();

      expect(url).toBe("https://example.com/og.png");
    });
  });
});
