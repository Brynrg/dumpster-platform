import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getSupabaseAdmin } from './server';
import { createClient } from '@supabase/supabase-js';

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(),
}));

describe('getSupabaseAdmin', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.clearAllMocks();
  });

  it('should return a Supabase client when env vars are present', () => {
    process.env.SUPABASE_URL = 'https://example.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'super-secret-key';

    const mockClient = { auth: {} };
    vi.mocked(createClient).mockReturnValue(mockClient as any);

    const client = getSupabaseAdmin();

    expect(client).toBe(mockClient);
    expect(createClient).toHaveBeenCalledWith(
      'https://example.supabase.co',
      'super-secret-key',
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    );
  });

  it('should throw an error when SUPABASE_URL is missing', () => {
    delete process.env.SUPABASE_URL;
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'super-secret-key';

    expect(() => getSupabaseAdmin()).toThrowError(
      'Missing Supabase server env vars: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.'
    );
  });

  it('should throw an error when SUPABASE_SERVICE_ROLE_KEY is missing', () => {
    process.env.SUPABASE_URL = 'https://example.supabase.co';
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;

    expect(() => getSupabaseAdmin()).toThrowError(
      'Missing Supabase server env vars: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.'
    );
  });

  it('should throw an error when both env vars are missing', () => {
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;

    expect(() => getSupabaseAdmin()).toThrowError(
      'Missing Supabase server env vars: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.'
    );
  });
});
