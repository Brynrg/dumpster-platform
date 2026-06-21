import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { normalizePhone, sendSms, isSmsEnabled } from './server';
import Twilio from 'twilio';

vi.mock('twilio', () => {
  const createMock = vi.fn().mockResolvedValue({ sid: 'mock_sid_123' });
  return {
    default: vi.fn(() => ({
      messages: {
        create: createMock,
      },
    })),
  };
});

describe('normalizePhone', () => {
  it('should normalize a 10-digit phone number', () => {
    expect(normalizePhone('1234567890')).toBe('+11234567890');
    expect(normalizePhone('(123) 456-7890')).toBe('+11234567890');
    expect(normalizePhone('123.456.7890')).toBe('+11234567890');
  });

  it('should normalize an 11-digit phone number starting with 1', () => {
    expect(normalizePhone('11234567890')).toBe('+11234567890');
    expect(normalizePhone('1 (123) 456-7890')).toBe('+11234567890');
  });

  it('should normalize a phone number starting with +1', () => {
    expect(normalizePhone('+11234567890')).toBe('+11234567890');
    expect(normalizePhone(' +1 123 456 7890 ')).toBe('+11234567890');
    expect(normalizePhone('+11234567890123')).toBe('+11234567890');
  });

  it('should return an empty string for invalid phone numbers', () => {
    expect(normalizePhone('123')).toBe('');
    expect(normalizePhone('21234567890')).toBe('');
    expect(normalizePhone('invalid')).toBe('');
  });
});

describe('isSmsEnabled', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should return true when SMS_ENABLED is true', () => {
    process.env.SMS_ENABLED = 'true';
    expect(isSmsEnabled()).toBe(true);
  });

  it('should return false when SMS_ENABLED is not true', () => {
    process.env.SMS_ENABLED = 'false';
    expect(isSmsEnabled()).toBe(false);

    delete process.env.SMS_ENABLED;
    expect(isSmsEnabled()).toBe(false);
  });
});

describe('sendSms', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv };
    process.env.SMS_ENABLED = 'true';
    process.env.TWILIO_ACCOUNT_SID = 'test_account_sid';
    process.env.TWILIO_AUTH_TOKEN = 'test_auth_token';
    process.env.TWILIO_FROM_NUMBER = '+10987654321';
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should throw an error if SMS is disabled', async () => {
    process.env.SMS_ENABLED = 'false';
    await expect(sendSms('+11234567890', 'Test message')).rejects.toThrow('SMS is disabled. Set SMS_ENABLED=true to send messages.');
  });

  it('should throw an error if missing Twilio env vars', async () => {
    delete process.env.TWILIO_ACCOUNT_SID;
    await expect(sendSms('+11234567890', 'Test message')).rejects.toThrow('Missing Twilio env vars');
  });

  it('should throw an error if destination phone number is invalid', async () => {
    await expect(sendSms('invalid', 'Test message')).rejects.toThrow('Invalid destination phone number.');
  });

  it('should send SMS and return sid on success', async () => {
    const result = await sendSms('+11234567890', 'Test message');

    expect(Twilio).toHaveBeenCalledWith('test_account_sid', 'test_auth_token');

    // Have to get the mock instance to check its messages.create call
    const mockTwilioClient = vi.mocked(Twilio).mock.results[0].value;
    expect(mockTwilioClient.messages.create).toHaveBeenCalledWith({
      to: '+11234567890',
      from: '+10987654321',
      body: 'Test message',
    });

    expect(result).toEqual({ sid: 'mock_sid_123' });
  });
});
