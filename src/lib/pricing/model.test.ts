import { describe, it, expect } from 'vitest';
import { calculateBreakEvenRentals } from './model';

describe('calculateBreakEvenRentals', () => {
  it('returns 0 when profit_per_rental is 0', () => {
    expect(
      calculateBreakEvenRentals({
        monthly_cost: 1000,
        profit_per_rental: 0,
      })
    ).toBe(0);
  });

  it('returns 0 when profit_per_rental is negative', () => {
    expect(
      calculateBreakEvenRentals({
        monthly_cost: 1000,
        profit_per_rental: -50,
      })
    ).toBe(0);
  });

  it('returns correct value for positive profit_per_rental and positive monthly_cost', () => {
    expect(
      calculateBreakEvenRentals({
        monthly_cost: 1000,
        profit_per_rental: 200,
      })
    ).toBe(5); // 1000 / 200 = 5
  });

  it('returns 0 when monthly_cost is 0', () => {
    expect(
      calculateBreakEvenRentals({
        monthly_cost: 0,
        profit_per_rental: 100,
      })
    ).toBe(0); // 0 / 100 = 0
  });

  it('handles floating point division properly', () => {
     expect(
      calculateBreakEvenRentals({
        monthly_cost: 1000,
        profit_per_rental: 300,
      })
    ).toBeCloseTo(3.3333, 4);
  });
});
