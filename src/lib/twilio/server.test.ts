import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { isSmsEnabled, normalizePhone, sendSms } from "./server";
import Twilio from "twilio";

// Mock server-only to avoid errors during testing
vi.mock("server-only", () => ({}));

// Mock twilio
vi.mock("twilio", () => {
  return {
    default: vi.fn(() => ({
      messages: {
        create: vi.fn().mockResolvedValue({ sid: "mock_sid" }),
      },
    })),
  };
});

describe("twilio/server", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.clearAllMocks();
  });

  describe("isSmsEnabled", () => {
    it("returns true when SMS_ENABLED is 'true'", () => {
      process.env.SMS_ENABLED = "true";
      expect(isSmsEnabled()).toBe(true);
    });

    it("returns false when SMS_ENABLED is not 'true'", () => {
      process.env.SMS_ENABLED = "false";
      expect(isSmsEnabled()).toBe(false);

      process.env.SMS_ENABLED = undefined;
      expect(isSmsEnabled()).toBe(false);
    });
  });

  describe("normalizePhone", () => {
    it("formats 10-digit numbers correctly", () => {
      expect(normalizePhone("1234567890")).toBe("+11234567890");
      expect(normalizePhone("(123) 456-7890")).toBe("+11234567890");
    });

    it("handles 11-digit numbers starting with 1", () => {
      expect(normalizePhone("11234567890")).toBe("+11234567890");
    });

    it("handles numbers already starting with +1 and longer digits", () => {
      expect(normalizePhone("+11234567890")).toBe("+11234567890");
      expect(normalizePhone("+1 (123) 456-7890")).toBe("+11234567890");
      expect(normalizePhone("+112345678901")).toBe("+11234567890");
    });

    it("returns empty string for invalid numbers", () => {
      expect(normalizePhone("123")).toBe("");
      expect(normalizePhone("abcdefghij")).toBe("");
    });
  });

  describe("sendSms", () => {
    it("throws an error when SMS is disabled", async () => {
      process.env.SMS_ENABLED = "false";

      await expect(sendSms("1234567890", "Test message")).rejects.toThrow(
        "SMS is disabled. Set SMS_ENABLED=true to send messages."
      );
    });

    it("throws an error when Twilio credentials are missing", async () => {
      process.env.SMS_ENABLED = "true";
      process.env.TWILIO_ACCOUNT_SID = "";
      process.env.TWILIO_AUTH_TOKEN = "";
      process.env.TWILIO_FROM_NUMBER = "";

      await expect(sendSms("1234567890", "Test message")).rejects.toThrow(
        "Missing Twilio env vars: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_FROM_NUMBER are required when SMS is enabled."
      );
    });

    it("throws an error for invalid phone numbers", async () => {
      process.env.SMS_ENABLED = "true";
      process.env.TWILIO_ACCOUNT_SID = "sid";
      process.env.TWILIO_AUTH_TOKEN = "token";
      process.env.TWILIO_FROM_NUMBER = "+1234567890";

      await expect(sendSms("invalid", "Test message")).rejects.toThrow(
        "Invalid destination phone number."
      );
    });

    it("sends an SMS successfully", async () => {
      process.env.SMS_ENABLED = "true";
      process.env.TWILIO_ACCOUNT_SID = "sid";
      process.env.TWILIO_AUTH_TOKEN = "token";
      process.env.TWILIO_FROM_NUMBER = "+19876543210";

      const result = await sendSms("1234567890", "Test message");

      expect(result).toEqual({ sid: "mock_sid" });
      expect(Twilio).toHaveBeenCalledWith("sid", "token");
    });
  });
});
