export interface RateLimitInfo {
  count: number;
  resetTime: number;
}

export class RateLimiter {
  private limit: number;
  private windowMs: number;
  private store: Map<string, RateLimitInfo>;
  private gcIntervalMs: number;
  private gcTimer: ReturnType<typeof setInterval> | null;

  constructor(limit: number, windowMs: number, gcIntervalMs = 60000) {
    this.limit = limit;
    this.windowMs = windowMs;
    this.store = new Map();
    this.gcIntervalMs = gcIntervalMs;
    this.gcTimer = null;
    this.startGC();
  }

  private startGC() {
    if (this.gcTimer) return;
    this.gcTimer = setInterval(() => {
      this.garbageCollect();
    }, this.gcIntervalMs);

    // Allow the process to exit even if the timer is running
    if (this.gcTimer && typeof this.gcTimer.unref === 'function') {
      this.gcTimer.unref();
    }
  }

  public stopGC() {
    if (this.gcTimer) {
      clearInterval(this.gcTimer);
      this.gcTimer = null;
    }
  }

  public check(key: string): { success: boolean; limit: number; remaining: number; reset: number } {
    const currentTime = new Date().getTime();
    let info = this.store.get(key);

    if (!info || info.resetTime < currentTime) {
      info = {
        count: 1,
        resetTime: currentTime + this.windowMs,
      };
      this.store.set(key, info);
      return {
        success: true,
        limit: this.limit,
        remaining: this.limit - 1,
        reset: info.resetTime,
      };
    }

    info.count += 1;
    this.store.set(key, info);

    if (info.count > this.limit) {
      return {
        success: false,
        limit: this.limit,
        remaining: 0,
        reset: info.resetTime,
      };
    }

    return {
      success: true,
      limit: this.limit,
      remaining: Math.max(0, this.limit - info.count),
      reset: info.resetTime,
    };
  }

  public garbageCollect() {
    const currentTime = new Date().getTime();
    for (const [key, info] of this.store.entries()) {
      if (info.resetTime < currentTime) {
        this.store.delete(key);
      }
    }
  }
}
