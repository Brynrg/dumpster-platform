import { describe, it, expect } from 'vitest';
import { buildLocalBusinessSchema, buildServiceSchema } from './schema';

describe('buildLocalBusinessSchema', () => {
  it('should map inputs correctly and return a valid LocalBusiness schema', () => {
    const input = {
      name: 'Test Dumpster Rentals',
      areaServed: ['Spring, TX', 'The Woodlands, TX'],
      url: 'https://example.com/dumpster-rentals',
    };

    const result = buildLocalBusinessSchema(input);

    expect(result).toEqual({
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      name: 'Test Dumpster Rentals',
      url: 'https://example.com/dumpster-rentals',
      areaServed: ['Spring, TX', 'The Woodlands, TX'],
      sameAs: [],
    });
  });

  it('should handle empty areaServed', () => {
    const input = {
      name: 'Test Dumpster Rentals',
      areaServed: [],
      url: 'https://example.com',
    };

    const result = buildLocalBusinessSchema(input);

    expect(result.areaServed).toEqual([]);
  });
});

describe('buildServiceSchema', () => {
  it('should map inputs correctly and return a valid Service schema', () => {
    const input = {
      serviceName: '10 Yard Dumpster Rental',
      areaServed: ['Austin, TX'],
      url: 'https://example.com/10-yard-dumpster',
    };

    const result = buildServiceSchema(input);

    expect(result).toEqual({
      "@context": "https://schema.org",
      "@type": "Service",
      name: '10 Yard Dumpster Rental',
      serviceType: '10 Yard Dumpster Rental',
      areaServed: ['Austin, TX'],
      url: 'https://example.com/10-yard-dumpster',
    });
  });

  it('should handle empty areaServed', () => {
    const input = {
      serviceName: 'General Service',
      areaServed: [],
      url: 'https://example.com/service',
    };

    const result = buildServiceSchema(input);

    expect(result.areaServed).toEqual([]);
  });
});
