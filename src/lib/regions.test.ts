import { describe, it, expect } from 'vitest';
import { getAllRegions, getRegionById, buildCheckUrl } from './regions';

describe('getAllRegions', () => {
  it('should return all defined regions', () => {
    const regions = getAllRegions();
    expect(regions).toBeInstanceOf(Array);
    expect(regions.length).toBeGreaterThan(0);
    // Since there are 3 regions defined in the code, verify the length is 3
    expect(regions.length).toBe(3);

    // Check if a known region is in the array
    const txSpring = regions.find((r) => r.id === 'tx-spring');
    expect(txSpring).toBeDefined();
    expect(txSpring?.displayName).toBe('Spring, TX');
  });
});

describe('getRegionById', () => {
  it('should return the correct region for a valid ID', () => {
    const region = getRegionById('tx-north-houston');
    expect(region).toBeDefined();
    expect(region.id).toBe('tx-north-houston');
    expect(region.displayName).toBe('North Houston, TX');
    expect(region.state).toBe('TX');
    expect(region.pathPrefix).toBe('/tx/north-houston');
    expect(region.cities).toContain('Cypress');
  });

  it('should return the correct region for another valid ID', () => {
    const region = getRegionById('fl-brevard');
    expect(region).toBeDefined();
    expect(region.id).toBe('fl-brevard');
    expect(region.displayName).toBe('Brevard County, FL');
    expect(region.state).toBe('FL');
    expect(region.pathPrefix).toBe('/fl/brevard-county');
    expect(region.cities).toContain('Melbourne');
  });

  it('should return undefined for an invalid ID', () => {
    // @ts-expect-error Testing invalid runtime value
    const region = getRegionById('invalid-region-id');
    expect(region).toBeUndefined();
  });
});

describe('buildCheckUrl', () => {
  it('should build a valid check URL for a region ID', () => {
    const url = buildCheckUrl('tx-spring');
    expect(url).toBe('/check?region=tx-spring');
  });

  it('should build a valid check URL for another region ID', () => {
    const url = buildCheckUrl('fl-brevard');
    expect(url).toBe('/check?region=fl-brevard');
  });

  it('should handle empty string', () => {
    // @ts-expect-error Testing invalid runtime value
    const url = buildCheckUrl('');
    expect(url).toBe('/check?region=');
  });

  it('should handle invalid string', () => {
    // @ts-expect-error Testing invalid runtime value
    const url = buildCheckUrl('invalid');
    expect(url).toBe('/check?region=invalid');
  });
});
