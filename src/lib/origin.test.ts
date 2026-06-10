import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getRequestOrigin } from './origin';
import { headers } from 'next/headers';

vi.mock('next/headers', () => ({
  headers: vi.fn(),
}));

function createMockHeaders(init: Record<string, string>) {
  return {
    get: vi.fn((key: string) => init[key] || null)
  } as unknown as ReturnType<typeof headers>;
}

describe('getRequestOrigin', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should use x-forwarded-host and x-forwarded-proto when available', async () => {
    vi.mocked(headers).mockResolvedValue(
      createMockHeaders({
        'x-forwarded-host': 'example.com',
        'x-forwarded-proto': 'http',
      }) as unknown as Awaited<ReturnType<typeof headers>>
    );

    const origin = await getRequestOrigin();
    expect(origin).toBe('http://example.com');
  });

  it('should fallback to host when x-forwarded-host is not present', async () => {
    vi.mocked(headers).mockResolvedValue(
      createMockHeaders({
        'host': 'my-host.com',
        'x-forwarded-proto': 'http',
      }) as unknown as Awaited<ReturnType<typeof headers>>
    );

    const origin = await getRequestOrigin();
    expect(origin).toBe('http://my-host.com');
  });

  it('should fallback to https when x-forwarded-proto is not present', async () => {
    vi.mocked(headers).mockResolvedValue(
      createMockHeaders({
        'x-forwarded-host': 'secure.com',
      }) as unknown as Awaited<ReturnType<typeof headers>>
    );

    const origin = await getRequestOrigin();
    expect(origin).toBe('https://secure.com');
  });

  it('should prioritize x-forwarded-host over host', async () => {
    vi.mocked(headers).mockResolvedValue(
      createMockHeaders({
        'x-forwarded-host': 'forwarded.com',
        'host': 'ignored.com',
      }) as unknown as Awaited<ReturnType<typeof headers>>
    );

    const origin = await getRequestOrigin();
    expect(origin).toBe('https://forwarded.com');
  });

  it('should return http://localhost:3000 if no host headers are present', async () => {
    vi.mocked(headers).mockResolvedValue(createMockHeaders({}) as unknown as Awaited<ReturnType<typeof headers>>);

    const origin = await getRequestOrigin();
    expect(origin).toBe('http://localhost:3000');
  });
});
