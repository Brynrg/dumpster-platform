import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { getSupabaseAdmin } from './server';
import { createClient } from '@supabase/supabase-js';

vi.mock('@supabase/supabase-js', () => {
  return {
    createClient: vi.fn(() => ({})),
  };
});

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

  it('should throw an error if SUPABASE_URL is missing', () => {
    delete process.env.SUPABASE_URL;
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-key';

    expect(() => getSupabaseAdmin()).toThrowError(
      'Missing Supabase server env vars: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.'
    );
  });

  it('should throw an error if SUPABASE_SERVICE_ROLE_KEY is missing', () => {
    process.env.SUPABASE_URL = 'https://test.supabase.co';
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;

    expect(() => getSupabaseAdmin()).toThrowError(
      'Missing Supabase server env vars: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.'
    );
  });

  it('should return a SupabaseClient when both env vars are present', () => {
    process.env.SUPABASE_URL = 'https://test.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-key';

    const client = getSupabaseAdmin();

    expect(createClient).toHaveBeenCalledWith(
      'https://test.supabase.co',
      'test-key',
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    );

    // The mocked createClient returns {}
    expect(client).toEqual({});
  });
});
