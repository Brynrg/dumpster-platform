import { describe, it, expect } from "vitest";
import { isValidPhone, isValidEmail } from "./validation";

describe("isValidPhone", () => {
  it("should return true for valid phone numbers", () => {
    expect(isValidPhone("1234567890")).toBe(true);
    expect(isValidPhone("+1234567890")).toBe(true);
    expect(isValidPhone("123-456-7890")).toBe(true);
    expect(isValidPhone("(123) 456-7890")).toBe(true);
    expect(isValidPhone("+1 (123) 456-7890")).toBe(true);
    expect(isValidPhone("123 456 7890")).toBe(true);
  });

  it("should return true for valid phone numbers with leading/trailing whitespaces", () => {
    expect(isValidPhone("  1234567890  ")).toBe(true);
    expect(isValidPhone("\t1234567890\n")).toBe(true);
  });

  it("should return false for phone numbers that are too short", () => {
    expect(isValidPhone("123456789")).toBe(false); // 9 chars
  });

  it("should return false for phone numbers that are too long", () => {
    expect(isValidPhone("123456789012345678901")).toBe(false); // 21 chars
  });

  it("should return false for phone numbers containing invalid characters", () => {
    expect(isValidPhone("1234567890a")).toBe(false);
    expect(isValidPhone("phone12345")).toBe(false);
    expect(isValidPhone("123.456.7890")).toBe(false); // regex doesn't include '.'
  });

  it("should return false for empty strings", () => {
    expect(isValidPhone("")).toBe(false);
    expect(isValidPhone("   ")).toBe(false);
  });
});

describe("isValidEmail", () => {
  it("should return true for valid emails", () => {
    expect(isValidEmail("test@example.com")).toBe(true);
    expect(isValidEmail("user.name+tag@example.co.uk")).toBe(true);
    expect(isValidEmail("a@b.cd")).toBe(true);
  });

  it("should return true for valid emails with leading/trailing whitespaces", () => {
    expect(isValidEmail("  test@example.com  ")).toBe(true);
    expect(isValidEmail("\ttest@example.com\n")).toBe(true);
  });

  it("should return false for invalid emails missing parts", () => {
    expect(isValidEmail("test@example")).toBe(false); // missing dot
    expect(isValidEmail("test.com")).toBe(false); // missing @
    expect(isValidEmail("@example.com")).toBe(false); // missing local part
    expect(isValidEmail("test@")).toBe(false); // missing domain
    expect(isValidEmail("test@.com")).toBe(false); // missing domain name
  });

  it("should return false for emails containing spaces", () => {
    expect(isValidEmail("test @example.com")).toBe(false);
    expect(isValidEmail("test@ example.com")).toBe(false);
    expect(isValidEmail("test@example .com")).toBe(false);
  });

  it("should return false for empty strings", () => {
    expect(isValidEmail("")).toBe(false);
    expect(isValidEmail("   ")).toBe(false);
  });
});
