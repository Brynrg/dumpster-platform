import { describe, it, expect } from 'vitest';
import { calculateOperatingCost } from './model';

describe('calculateOperatingCost', () => {
  it('should calculate the operating cost correctly with normal inputs', () => {
    const input = {
      avg_mpg: 10,
      avg_distance_miles: 100,
      fuel_price: 3.5,
      labor_cost: 200,
      overhead_per_day: 50,
    };
    // (100 / 10) * 3.5 = 35 fuel cost
    // 35 + 200 + 50 = 285 total cost
    expect(calculateOperatingCost(input)).toBe(285);
  });

  it('should handle avg_mpg of 0 by treating it as 1', () => {
    const input = {
      avg_mpg: 0,
      avg_distance_miles: 10,
      fuel_price: 3,
      labor_cost: 100,
      overhead_per_day: 20,
    };
    // mpg = 1
    // (10 / 1) * 3 = 30 fuel cost
    // 30 + 100 + 20 = 150 total cost
    expect(calculateOperatingCost(input)).toBe(150);
  });

  it('should handle negative avg_mpg by treating it as 1', () => {
    const input = {
      avg_mpg: -5,
      avg_distance_miles: 10,
      fuel_price: 3,
      labor_cost: 100,
      overhead_per_day: 20,
    };
    // mpg = 1
    // (10 / 1) * 3 = 30 fuel cost
    // 30 + 100 + 20 = 150 total cost
    expect(calculateOperatingCost(input)).toBe(150);
  });

  it('should handle 0 values for costs', () => {
    const input = {
      avg_mpg: 10,
      avg_distance_miles: 0,
      fuel_price: 0,
      labor_cost: 0,
      overhead_per_day: 0,
    };
    expect(calculateOperatingCost(input)).toBe(0);
  });
});
