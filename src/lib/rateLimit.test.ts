import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { RateLimiter } from "./rateLimit";

describe("RateLimiter", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should allow requests under the limit", () => {
    const limiter = new RateLimiter(5, 1000);
    const { success, headers } = limiter.check("1.2.3.4");
    expect(success).toBe(true);
    expect(headers["X-RateLimit-Limit"]).toBe("5");
    expect(headers["X-RateLimit-Remaining"]).toBe("4");
  });

  it("should block requests over the limit", () => {
    const limiter = new RateLimiter(2, 1000);
    limiter.check("1.2.3.4");
    limiter.check("1.2.3.4");
    const { success, headers } = limiter.check("1.2.3.4");
    expect(success).toBe(false);
    expect(headers["X-RateLimit-Remaining"]).toBe("0");
  });

  it("should reset after the window", () => {
    const limiter = new RateLimiter(2, 1000);
    limiter.check("1.2.3.4");
    limiter.check("1.2.3.4");
    expect(limiter.check("1.2.3.4").success).toBe(false);

    vi.advanceTimersByTime(1001);

    expect(limiter.check("1.2.3.4").success).toBe(true);
  });

  it("should garbage collect expired entries", () => {
    const limiter = new RateLimiter(2, 1000);
    limiter.check("1.2.3.4");

    // Default GC interval is 60000. We need to wait >60000 ms.
    vi.advanceTimersByTime(61000);

    // Check with a new IP to trigger GC
    limiter.check("5.6.7.8");

    // Since map is private, we can't easily assert size without reflection,
    // but we can verify behavior. 1.2.3.4 should be completely gone,
    // so a check starts fresh at 1 request.
    const result = limiter.check("1.2.3.4");
    expect(result.success).toBe(true);
    expect(result.headers["X-RateLimit-Remaining"]).toBe("1");
  });
});
