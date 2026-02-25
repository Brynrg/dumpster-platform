export type OperatingCostInput = {
  fuel_price: number;
  avg_mpg: number;
  avg_distance_miles: number;
  labor_cost: number;
  overhead_per_day: number;
};

export type EquipmentMonthlyCostInput = {
  trailer_payment: number;
  maintenance_per_month: number;
};

export type BreakEvenInput = {
  monthly_cost: number;
  profit_per_rental: number;
};

export type SuggestedPriceInput = {
  operating_cost: number;
  dump_cost: number;
  margin_percent: number;
};

export type PricingModelInput = OperatingCostInput &
  EquipmentMonthlyCostInput & {
    dump_cost: number;
    dump_margin_percent: number;
  } & {
    trailer_term_months: number;
    monthly_demand?: number;
  };

export function calculateOperatingCost(input: OperatingCostInput): number {
  const mpg = input.avg_mpg > 0 ? input.avg_mpg : 1;
  const fuelCost = (input.avg_distance_miles / mpg) * input.fuel_price;
  return fuelCost + input.labor_cost + input.overhead_per_day;
}

export function calculateMonthlyEquipmentCost(
  input: EquipmentMonthlyCostInput,
): number {
  return input.trailer_payment + input.maintenance_per_month;
}

export function calculateBreakEvenRentals(input: BreakEvenInput): number {
  if (input.profit_per_rental <= 0) return 0;
  return input.monthly_cost / input.profit_per_rental;
}

export function calculateSuggestedPrice(input: SuggestedPriceInput): number {
  const baseCost = input.operating_cost + input.dump_cost;
  return baseCost * (1 + input.margin_percent / 100);
}

export function calculatePricingModel(input: PricingModelInput): {
  operatingCost: number;
  equipmentMonthlyCost: number;
  breakEvenRentals: number;
  suggestedPrice: number;
  estimatedPaybackMonths: number;
} {
  const operatingCost = calculateOperatingCost(input);
  const equipmentMonthlyCost = calculateMonthlyEquipmentCost(input);
  const suggestedPrice = calculateSuggestedPrice({
    operating_cost: operatingCost,
    dump_cost: input.dump_cost,
    margin_percent: input.dump_margin_percent,
  });
  const profitPerRental = suggestedPrice - operatingCost - input.dump_cost;
  const breakEvenRentals = calculateBreakEvenRentals({
    monthly_cost: equipmentMonthlyCost,
    profit_per_rental: profitPerRental,
  });

  const monthlyDemand = input.monthly_demand ?? 0;
  const equipmentCommitment = input.trailer_payment * input.trailer_term_months;
  const monthlyProfitBeforeEquipment = monthlyDemand * profitPerRental;
  const estimatedPaybackMonths =
    monthlyProfitBeforeEquipment > 0
      ? equipmentCommitment / monthlyProfitBeforeEquipment
      : 0;

  return {
    operatingCost,
    equipmentMonthlyCost,
    breakEvenRentals,
    suggestedPrice,
    estimatedPaybackMonths,
  };
}
