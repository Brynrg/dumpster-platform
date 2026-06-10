jest.mock("server-only", () => {
  return {};
});

import { sendSms, isSmsEnabled, normalizePhone } from "./server";
import Twilio from "twilio";

jest.mock("twilio");

describe("twilio server", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe("isSmsEnabled", () => {
    it("returns true when SMS_ENABLED is true", () => {
      process.env.SMS_ENABLED = "true";
      expect(isSmsEnabled()).toBe(true);
    });

    it("returns false when SMS_ENABLED is not true", () => {
      process.env.SMS_ENABLED = "false";
      expect(isSmsEnabled()).toBe(false);

      delete process.env.SMS_ENABLED;
      expect(isSmsEnabled()).toBe(false);
    });
  });

  describe("normalizePhone", () => {
    it("formats 10 digit number", () => {
      expect(normalizePhone("1234567890")).toBe("+11234567890");
    });

    it("formats 11 digit number starting with 1", () => {
      expect(normalizePhone("11234567890")).toBe("+11234567890");
    });

    it("formats number starting with +1", () => {
      expect(normalizePhone("+11234567890")).toBe("+11234567890");
    });

    it("returns empty string for invalid numbers", () => {
      expect(normalizePhone("123")).toBe("");
      expect(normalizePhone("21234567890")).toBe("");
      expect(normalizePhone("abc")).toBe("");
    });
  });

  describe("sendSms", () => {
    it("throws an error if SMS is disabled", async () => {
      process.env.SMS_ENABLED = "false";
      await expect(sendSms("+12345678901", "Test")).rejects.toThrow(
        "SMS is disabled. Set SMS_ENABLED=true to send messages."
      );
    });

    it("throws an error if TWILIO env vars are missing when SMS is enabled", async () => {
      process.env.SMS_ENABLED = "true";
      delete process.env.TWILIO_ACCOUNT_SID;
      delete process.env.TWILIO_AUTH_TOKEN;
      delete process.env.TWILIO_FROM_NUMBER;

      await expect(sendSms("+12345678901", "Test")).rejects.toThrow(
        "Missing Twilio env vars: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_FROM_NUMBER are required when SMS is enabled."
      );
    });

    it("throws an error if destination phone is invalid", async () => {
      process.env.SMS_ENABLED = "true";
      process.env.TWILIO_ACCOUNT_SID = "test-sid";
      process.env.TWILIO_AUTH_TOKEN = "test-token";
      process.env.TWILIO_FROM_NUMBER = "+19876543210";

      await expect(sendSms("123", "Test")).rejects.toThrow(
        "Invalid destination phone number."
      );
    });

    it("sends SMS successfully", async () => {
      process.env.SMS_ENABLED = "true";
      process.env.TWILIO_ACCOUNT_SID = "test-sid";
      process.env.TWILIO_AUTH_TOKEN = "test-token";
      process.env.TWILIO_FROM_NUMBER = "+19876543210";

      const mockCreate = jest.fn().mockResolvedValue({ sid: "message-sid" });
      (Twilio as unknown as jest.Mock).mockReturnValue({
        messages: {
          create: mockCreate,
        },
      });

      const result = await sendSms("+11234567890", "Test message");

      expect(result).toEqual({ sid: "message-sid" });
      expect(Twilio).toHaveBeenCalledWith("test-sid", "test-token");
      expect(mockCreate).toHaveBeenCalledWith({
        to: "+11234567890",
        from: "+19876543210",
        body: "Test message",
      });
    });
  });
});
