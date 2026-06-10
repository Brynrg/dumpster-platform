import { describe, it, expect } from 'vitest';
import { getCityBySlug, getCitiesByRegion } from './cities';

describe('getCityBySlug', () => {
  it('should return the correct city for a valid slug', () => {
    const slug = 'spring-tx';
    const result = getCityBySlug(slug);
    expect(result).toBeDefined();
    expect(result?.slug).toBe(slug);
    expect(result?.displayName).toBe('Spring');
    expect(result?.regionId).toBe('tx-spring');
    expect(result?.state).toBe('TX');
    expect(result?.nearby).toEqual(['klein-tx', 'tomball-tx', 'the-woodlands-tx']);
  });

  it('should return the correct city for another valid slug', () => {
    const slug = 'melbourne-fl';
    const result = getCityBySlug(slug);
    expect(result).toBeDefined();
    expect(result?.slug).toBe(slug);
    expect(result?.displayName).toBe('Melbourne');
    expect(result?.regionId).toBe('fl-brevard');
    expect(result?.state).toBe('FL');
    expect(result?.nearby).toEqual(['palm-bay-fl', 'rockledge-fl', 'viera-fl']);
  });

  it('should return undefined for an invalid slug', () => {
    const slug = 'invalid-city-slug';
    const result = getCityBySlug(slug);
    expect(result).toBeUndefined();
  });

  it('should return undefined for an empty slug', () => {
    const slug = '';
    const result = getCityBySlug(slug);
    expect(result).toBeUndefined();
  });

  it('should return undefined when slug only partially matches', () => {
    const result = getCityBySlug('spring');
    expect(result).toBeUndefined();
  });
});

describe('getCitiesByRegion', () => {
  it('should return cities matching the region', () => {
    const result = getCitiesByRegion('tx-spring');
    expect(result.length).toBeGreaterThan(0);
    expect(result.every(city => city.regionId === 'tx-spring')).toBe(true);
  });

  it('should return empty array for an invalid region', () => {
    // @ts-expect-error Testing invalid runtime value
    const result = getCitiesByRegion('invalid-region');
    expect(result).toEqual([]);
  });
});
