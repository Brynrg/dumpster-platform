import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { logger } from "./logger";

describe("logger", () => {
  beforeEach(() => {
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-01-01T00:00:00Z"));
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("should log info", () => {
    logger.info("test info", { some: "meta" });
    expect(console.log).toHaveBeenCalledWith(
      JSON.stringify({
        level: "info",
        timestamp: "2024-01-01T00:00:00.000Z",
        message: "test info",
        some: "meta",
      })
    );
  });

  it("should log warn", () => {
    logger.warn("test warn", { warning: true });
    expect(console.warn).toHaveBeenCalledWith(
      JSON.stringify({
        level: "warn",
        timestamp: "2024-01-01T00:00:00.000Z",
        message: "test warn",
        warning: true,
      })
    );
  });

  it("should log error without error object", () => {
    logger.error("test error");
    expect(console.error).toHaveBeenCalledWith(
      JSON.stringify({
        level: "error",
        timestamp: "2024-01-01T00:00:00.000Z",
        message: "test error",
      })
    );
  });

  it("should log error with Error object", () => {
    const error = new Error("boom");
    error.stack = "fake stack";
    logger.error("test error", error);
    expect(console.error).toHaveBeenCalledWith(
      JSON.stringify({
        level: "error",
        timestamp: "2024-01-01T00:00:00.000Z",
        message: "test error",
        errorMessage: "boom",
        stack: "fake stack",
      })
    );
  });

  it("should log error with string error", () => {
    logger.error("test error", "string error");
    expect(console.error).toHaveBeenCalledWith(
      JSON.stringify({
        level: "error",
        timestamp: "2024-01-01T00:00:00.000Z",
        message: "test error",
        errorMessage: "string error",
      })
    );
  });
});
