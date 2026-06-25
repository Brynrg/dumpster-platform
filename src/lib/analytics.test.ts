import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { track } from "./analytics";

describe("analytics track", () => {
  let gtagMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    gtagMock = vi.fn();
    vi.stubGlobal("window", {
      gtag: gtagMock,
    });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("should call window.gtag if it exists", () => {
    track("test_event", { foo: "bar" });
    expect(gtagMock).toHaveBeenCalledWith("event", "test_event", {
      foo: "bar",
    });
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
});
