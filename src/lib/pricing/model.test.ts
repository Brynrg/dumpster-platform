import { describe, it, expect } from "vitest";
import {
  calculateOperatingCost,
  calculateMonthlyEquipmentCost,
  calculateBreakEvenRentals,
  calculateSuggestedPrice,
  calculatePricingModel,
  OperatingCostInput,
  EquipmentMonthlyCostInput,
  BreakEvenInput,
  SuggestedPriceInput,
  PricingModelInput,
} from "./model";

describe("Pricing Model Logic", () => {
  describe("calculateOperatingCost", () => {
    it("calculates correctly with normal values", () => {
      const input: OperatingCostInput = {
        fuel_price: 4.0,
        avg_mpg: 10,
        avg_distance_miles: 50,
        labor_cost: 200,
        overhead_per_day: 50,
      };
      // fuelCost = (50 / 10) * 4.0 = 20
      // total = 20 + 200 + 50 = 270
      expect(calculateOperatingCost(input)).toBe(270);
    });

    it("handles avg_mpg <= 0 by defaulting to 1", () => {
      const input: OperatingCostInput = {
        fuel_price: 4.0,
        avg_mpg: 0,
        avg_distance_miles: 50,
        labor_cost: 200,
        overhead_per_day: 50,
      };
      // fuelCost = (50 / 1) * 4.0 = 200
      // total = 200 + 200 + 50 = 450
      expect(calculateOperatingCost(input)).toBe(450);
    });
  });

  describe("calculateMonthlyEquipmentCost", () => {
    it("adds trailer payment and maintenance correctly", () => {
      const input: EquipmentMonthlyCostInput = {
        trailer_payment: 500,
        maintenance_per_month: 150,
      };
      expect(calculateMonthlyEquipmentCost(input)).toBe(650);
    });
  });

  describe("calculateBreakEvenRentals", () => {
    it("calculates correct break-even point", () => {
      const input: BreakEvenInput = {
        monthly_cost: 1000,
        profit_per_rental: 200,
      };
      // 1000 / 200 = 5
      expect(calculateBreakEvenRentals(input)).toBe(5);
    });

    it("returns 0 if profit per rental is 0", () => {
      const input: BreakEvenInput = {
        monthly_cost: 1000,
        profit_per_rental: 0,
      };
      expect(calculateBreakEvenRentals(input)).toBe(0);
    });

    it("returns 0 if profit per rental is negative", () => {
      const input: BreakEvenInput = {
        monthly_cost: 1000,
        profit_per_rental: -50,
      };
      expect(calculateBreakEvenRentals(input)).toBe(0);
    });
  });

  describe("calculateSuggestedPrice", () => {
    it("calculates suggested price based on operating cost, dump cost and margin", () => {
      const input: SuggestedPriceInput = {
        operating_cost: 300,
        dump_cost: 100,
        margin_percent: 25,
      };
      // baseCost = 400
      // 400 * (1 + 0.25) = 500
      expect(calculateSuggestedPrice(input)).toBe(500);
    });
  });

  describe("calculatePricingModel", () => {
    const baseInput: PricingModelInput = {
      fuel_price: 4.0,
      avg_mpg: 10,
      avg_distance_miles: 50,
      labor_cost: 200,
      overhead_per_day: 50,
      // operatingCost = 270

      trailer_payment: 500,
      maintenance_per_month: 150,
      // equipmentMonthlyCost = 650

      dump_cost: 100,
      dump_margin_percent: 25,
      // suggestedPrice = (270 + 100) * 1.25 = 370 * 1.25 = 462.5
      // profitPerRental = 462.5 - 270 - 100 = 92.5

      // breakEvenRentals = 650 / 92.5 ≈ 7.027

      trailer_term_months: 60,
      // equipmentCommitment = 500 * 60 = 30000
    };

    it("returns correctly integrated values with positive demand", () => {
      const input = {
        ...baseInput,
        monthly_demand: 10,
      };
      // monthlyProfitBeforeEquipment = 10 * 92.5 = 925
      // estimatedPaybackMonths = 30000 / 925 ≈ 32.43

      const result = calculatePricingModel(input);

      expect(result.operatingCost).toBe(270);
      expect(result.equipmentMonthlyCost).toBe(650);
      expect(result.suggestedPrice).toBe(462.5);
      expect(result.breakEvenRentals).toBeCloseTo(7.027, 3);
      expect(result.estimatedPaybackMonths).toBeCloseTo(32.432, 3);
    });

    it("returns 0 for payback months when demand is 0 or undefined", () => {
      const inputWithoutDemand = { ...baseInput };
      const resultWithoutDemand = calculatePricingModel(inputWithoutDemand);
      expect(resultWithoutDemand.estimatedPaybackMonths).toBe(0);

      const inputWithZeroDemand = { ...baseInput, monthly_demand: 0 };
      const resultWithZeroDemand = calculatePricingModel(inputWithZeroDemand);
      expect(resultWithZeroDemand.estimatedPaybackMonths).toBe(0);
    });

    it("returns 0 for payback months if profit per rental is <= 0", () => {
        const negativeProfitInput = {
            ...baseInput,
            dump_margin_percent: -10, // negative margin leads to negative profit
            monthly_demand: 10,
        };
        // baseCost = 370
        // suggestedPrice = 370 * (1 - 0.1) = 333
        // profitPerRental = 333 - 370 = -37
        // monthlyProfitBeforeEquipment = 10 * -37 = -370
        const result = calculatePricingModel(negativeProfitInput);
        expect(result.estimatedPaybackMonths).toBe(0);
    })
  });
});
