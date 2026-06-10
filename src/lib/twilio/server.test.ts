import { describe, it, expect } from 'vitest';
import { normalizePhone } from './server';

describe('normalizePhone', () => {
  it('formats a 10-digit number correctly', () => {
    expect(normalizePhone('1234567890')).toBe('+11234567890');
  });

  it('formats an 11-digit number starting with 1 correctly', () => {
    expect(normalizePhone('11234567890')).toBe('+11234567890');
  });

  it('formats an E.164 formatted number with exactly 11 digits correctly', () => {
    expect(normalizePhone('+11234567890')).toBe('+11234567890');
  });

  it('strips special characters and spaces and formats correctly', () => {
    expect(normalizePhone('(123) 456-7890')).toBe('+11234567890');
    expect(normalizePhone('123-456-7890')).toBe('+11234567890');
    expect(normalizePhone('123.456.7890')).toBe('+11234567890');
    expect(normalizePhone(' 123 456 7890 ')).toBe('+11234567890');
    expect(normalizePhone('+1 (123) 456-7890')).toBe('+11234567890');
  });

  it('returns empty string for invalid length numbers (too short)', () => {
    expect(normalizePhone('12345')).toBe('');
    expect(normalizePhone('123456789')).toBe('');
  });

  it('returns empty string for invalid length numbers (too long)', () => {
    expect(normalizePhone('123456789012')).toBe(''); // 12 digits
    expect(normalizePhone('112345678901')).toBe(''); // 12 digits starting with 1
  });

  it('handles too long numbers starting with +1 correctly (trims to 11 digits)', () => {
    expect(normalizePhone('+112345678901')).toBe('+11234567890'); // 11 digits
  });

  it('returns empty string for empty string or whitespace', () => {
    expect(normalizePhone('')).toBe('');
    expect(normalizePhone('   ')).toBe('');
  });

  it('returns empty string for string with letters only', () => {
    expect(normalizePhone('abcdefghij')).toBe('');
    expect(normalizePhone('phone number')).toBe('');
  });

  it('returns empty string for 11 digit numbers not starting with 1 (unless they started with +1 and got truncated)', () => {
    expect(normalizePhone('21234567890')).toBe('');
  });
});
