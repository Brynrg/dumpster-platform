import { describe, bench, vi } from 'vitest';
import { seedDisposalData } from './seedToSupabase';

// We need to mock supabase
vi.mock('@/lib/supabase/server', () => {
  const mockSupabase = {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: { id: 'mock-id' }, error: null })
  };
  return {
    getSupabaseAdmin: () => mockSupabase
  };
});

describe('seedDisposalData', () => {
  bench('seed', async () => {
    await seedDisposalData();
  });
});
