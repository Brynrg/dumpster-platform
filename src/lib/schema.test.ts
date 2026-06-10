import { describe, it, expect } from 'vitest';
import { buildLocalBusinessSchema, buildServiceSchema } from './schema';

describe('buildLocalBusinessSchema', () => {
  it('should build a schema with all fields correctly mapped', () => {
    const input = {
      name: 'Spring Dumpsters',
      areaServed: ['Spring', 'Houston'],
      url: 'https://springdumpsters.com',
    };
    const schema = buildLocalBusinessSchema(input);
    expect(schema).toEqual({
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      name: 'Spring Dumpsters',
      url: 'https://springdumpsters.com',
      areaServed: ['Spring', 'Houston'],
      sameAs: [],
    });
  });

  it('should handle empty areaServed', () => {
    const input = {
      name: 'Test Dumpsters',
      areaServed: [],
      url: 'https://test.com',
    };
    const schema = buildLocalBusinessSchema(input);
    expect(schema.areaServed).toEqual([]);
  });

  it('should handle empty string inputs', () => {
    const input = {
      name: '',
      areaServed: [],
      url: '',
    };
    const schema = buildLocalBusinessSchema(input);
    expect(schema.name).toBe('');
    expect(schema.url).toBe('');
  });
});

describe('buildServiceSchema', () => {
  it('should build a schema with all fields correctly mapped', () => {
    const input = {
      serviceName: 'Dumpster Rental',
      areaServed: ['Spring'],
      url: 'https://springdumpsters.com/services',
    };
    const schema = buildServiceSchema(input);
    expect(schema).toEqual({
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: 'Dumpster Rental',
      serviceType: 'Dumpster Rental',
      areaServed: ['Spring'],
      url: 'https://springdumpsters.com/services',
    });
  });

  it('should handle empty areaServed', () => {
    const input = {
      serviceName: 'Test Service',
      areaServed: [],
      url: 'https://test.com',
    };
    const schema = buildServiceSchema(input);
    expect(schema.areaServed).toEqual([]);
  });
});
