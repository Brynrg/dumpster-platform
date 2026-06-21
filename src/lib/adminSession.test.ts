import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_MAX_AGE,
  createAdminSession,
  isAuthedAdmin,
  timingSafeEqual,
  verifyAdminSession,
} from "./adminSession";

const SECRET = "test-secret-at-least-32-characters-long!!";

function cookieReq(value: string | undefined) {
  return {
    cookies: {
      get: (name: string) =>
        name === ADMIN_SESSION_COOKIE && value !== undefined ? { value } : undefined,
    },
  };
}

describe("adminSession", () => {
  beforeEach(() => {
    process.env.ADMIN_SESSION_SECRET = SECRET;
  });
  afterEach(() => {
    delete process.env.ADMIN_SESSION_SECRET;
    vi.useRealTimers();
  });

  it("accepts a freshly minted token", async () => {
    const token = await createAdminSession();
    expect(await verifyAdminSession(token)).toBe(true);
    expect(await isAuthedAdmin(cookieReq(token))).toBe(true);
  });

  it("rejects the old forged constant cookie value", async () => {
    // The whole point: an `admin=1`-style forgery must no longer authorize.
    expect(await verifyAdminSession("1")).toBe(false);
    expect(await isAuthedAdmin(cookieReq("1"))).toBe(false);
  });

  it("rejects missing / malformed tokens", async () => {
    expect(await verifyAdminSession(undefined)).toBe(false);
    expect(await verifyAdminSession("")).toBe(false);
    expect(await verifyAdminSession("no-dot")).toBe(false);
    expect(await verifyAdminSession(".sig")).toBe(false);
    expect(await verifyAdminSession("123.")).toBe(false);
    expect(await verifyAdminSession("notdigits.sig")).toBe(false);
    expect(await isAuthedAdmin(cookieReq(undefined))).toBe(false);
  });

  it("rejects a tampered signature", async () => {
    const token = await createAdminSession();
    const [exp, sig] = token.split(".");
    const flipped = sig.slice(0, -1) + (sig.endsWith("A") ? "B" : "A");
    expect(await verifyAdminSession(`${exp}.${flipped}`)).toBe(false);
  });

  it("rejects a forged/extended expiry (signature lifted from another payload)", async () => {
    const token = await createAdminSession();
    const sig = token.slice(token.indexOf(".") + 1);
    const farFuture = String(Date.now() + 1_000_000_000);
    // The signature only covers its own expiry, so pairing it with a new exp fails.
    expect(await verifyAdminSession(`${farFuture}.${sig}`)).toBe(false);
  });

  it("rejects a correctly-signed but expired token", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));
    const token = await createAdminSession(); // exp = now + MAX_AGE
    expect(await verifyAdminSession(token)).toBe(true);

    // Jump just past expiry — same valid signature, but now stale.
    vi.setSystemTime(Date.now() + (ADMIN_SESSION_MAX_AGE + 1) * 1000);
    expect(await verifyAdminSession(token)).toBe(false);
  });

  it("timingSafeEqual behaves like equality", () => {
    expect(timingSafeEqual("abc", "abc")).toBe(true);
    expect(timingSafeEqual("abc", "abd")).toBe(false);
    expect(timingSafeEqual("abc", "ab")).toBe(false);
  });

  it("throws if the secret is unset or too short", async () => {
    delete process.env.ADMIN_SESSION_SECRET;
    await expect(createAdminSession()).rejects.toThrow(/ADMIN_SESSION_SECRET/);
    process.env.ADMIN_SESSION_SECRET = "short";
    await expect(createAdminSession()).rejects.toThrow(/ADMIN_SESSION_SECRET/);
  });
});
