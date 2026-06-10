import { describe, it, expect } from 'vitest';
import { calculateBreakEvenRentals } from '../model';

describe('calculateBreakEvenRentals', () => {
  it('returns 0 when profit_per_rental is 0', () => {
    expect(calculateBreakEvenRentals({ monthly_cost: 1000, profit_per_rental: 0 })).toBe(0);
  });

  it('returns 0 when profit_per_rental is negative', () => {
    expect(calculateBreakEvenRentals({ monthly_cost: 1000, profit_per_rental: -50 })).toBe(0);
  });

  it('calculates correctly when profit_per_rental is positive', () => {
    expect(calculateBreakEvenRentals({ monthly_cost: 1000, profit_per_rental: 200 })).toBe(5);
  });

  it('handles monthly cost of 0 correctly', () => {
      expect(calculateBreakEvenRentals({ monthly_cost: 0, profit_per_rental: 100 })).toBe(0);
  });

  it('calculates correctly with non-integer results', () => {
    expect(calculateBreakEvenRentals({ monthly_cost: 1000, profit_per_rental: 300 })).toBeCloseTo(3.333, 3);
  });
});
