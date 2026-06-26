export class RateLimiter {
  private map = new Map<string, { count: number; expiresAt: number }>();
  private windowMs: number;
  private limit: number;
  private lastGCTime: number;
  private gcIntervalMs: number;

  constructor(limit: number, windowMs: number) {
    this.limit = limit;
    this.windowMs = windowMs;
    // Use new Date().getTime() or Date.now()
    this.lastGCTime = Date.now();
    this.gcIntervalMs = 60 * 1000; // 1 minute
  }

  public check(ip: string): { success: boolean; headers: Record<string, string> } {
    this.gc();
    const now = Date.now();
    let info = this.map.get(ip);

    if (info && info.expiresAt > now) {
      info.count++;
    } else {
      info = { count: 1, expiresAt: now + this.windowMs };
      this.map.set(ip, info);
    }

    const remaining = Math.max(0, this.limit - info.count);
    return {
      success: info.count <= this.limit,
      headers: {
        "X-RateLimit-Limit": this.limit.toString(),
        "X-RateLimit-Remaining": remaining.toString(),
        "X-RateLimit-Reset": info.expiresAt.toString(),
      },
    };
  }

  private gc() {
    const now = Date.now();
    if (now - this.lastGCTime > this.gcIntervalMs) {
      for (const [key, info] of this.map.entries()) {
        if (info.expiresAt <= now) {
          this.map.delete(key);
        }
      }
      this.lastGCTime = now;
    }
  }
}
