import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { RateLimiter } from './rateLimit';

describe('RateLimiter', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('allows requests within limit', () => {
    const limiter = new RateLimiter(3, 1000);

    expect(limiter.check('ip1').success).toBe(true);
    expect(limiter.check('ip1').success).toBe(true);
    expect(limiter.check('ip1').success).toBe(true);

    limiter.stopGC();
  });

  it('blocks requests over limit', () => {
    const limiter = new RateLimiter(3, 1000);

    limiter.check('ip1');
    limiter.check('ip1');
    limiter.check('ip1');

    const result = limiter.check('ip1');
    expect(result.success).toBe(false);
    expect(result.remaining).toBe(0);

    limiter.stopGC();
  });

  it('resets limit after window expires', () => {
    const limiter = new RateLimiter(2, 1000);

    limiter.check('ip1');
    limiter.check('ip1');
    expect(limiter.check('ip1').success).toBe(false);

    vi.advanceTimersByTime(1001);

    expect(limiter.check('ip1').success).toBe(true);

    limiter.stopGC();
  });

  it('keeps track of different keys independently', () => {
    const limiter = new RateLimiter(2, 1000);

    limiter.check('ip1');
    limiter.check('ip1');
    expect(limiter.check('ip1').success).toBe(false);

    expect(limiter.check('ip2').success).toBe(true);
    expect(limiter.check('ip2').success).toBe(true);
    expect(limiter.check('ip2').success).toBe(false);

    limiter.stopGC();
  });

  it('garbage collects expired entries', () => {
    const limiter = new RateLimiter(2, 1000, 500); // 1s window, 500ms GC

    // Using vi.setSystemTime to be sure Date.now() returns predictable values
    vi.setSystemTime(new Date(10000));

    limiter.check('ip1'); // expires at 11000

    vi.setSystemTime(new Date(10501)); // advance to 10501
    vi.advanceTimersByTime(501); // trigger setInterval

    limiter.check('ip2'); // expires at 11501

    vi.setSystemTime(new Date(11002)); // advance past ip1's expiry
    vi.advanceTimersByTime(501); // trigger setInterval

    // Check internal state
    // @ts-expect-error accessing private property for testing
    expect(limiter.store.has('ip1')).toBe(false);
    // @ts-expect-error accessing private property for testing
    expect(limiter.store.has('ip2')).toBe(true);

    limiter.stopGC();
  });
});
