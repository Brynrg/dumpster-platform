import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { track } from "./analytics";

describe("analytics track", () => {
  const originalEnv = process.env.NODE_ENV;
  let gtagMock: ReturnType<typeof vi.fn>;
  let consoleSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    gtagMock = vi.fn();
    consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    vi.stubGlobal("window", {
      gtag: gtagMock,
    });
  });

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("should call window.gtag if it exists", () => {
    track("test_event", { foo: "bar" });
    expect(gtagMock).toHaveBeenCalledWith("event", "test_event", { foo: "bar" });
  });

  it("should default props to empty object if not provided for window.gtag", () => {
    track("test_event");
    expect(gtagMock).toHaveBeenCalledWith("event", "test_event", {});
  });

  it("should not throw if window is undefined", () => {
    vi.unstubAllGlobals();
    // window is now undefined (in Node environment)
    expect(() => track("test_event")).not.toThrow();
  });

  it("should not throw if window.gtag is not a function", () => {
    vi.stubGlobal("window", { gtag: "not-a-function" });
    expect(() => track("test_event")).not.toThrow();
  });

  it("should call console.log in non-production environments", () => {
    process.env.NODE_ENV = "development";
    track("dev_event", { dev: true });
    expect(consoleSpy).toHaveBeenCalledWith("[track]", "dev_event", { dev: true });
  });

  it("should default props to empty object in console.log", () => {
    process.env.NODE_ENV = "development";
    track("dev_event");
    expect(consoleSpy).toHaveBeenCalledWith("[track]", "dev_event", {});
  });

  it("should not call console.log in production environments", () => {
    process.env.NODE_ENV = "production";
    track("prod_event");
    expect(consoleSpy).not.toHaveBeenCalled();
  });
});
