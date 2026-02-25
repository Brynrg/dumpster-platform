# Pricing Model Guide

This document explains the admin pricing model used for regional rental assumptions.

## Core Calculations

Inputs are configured per region in `pricing_configs`.

### Operating Cost Per Job

- `fuel_cost = (avg_distance_miles / avg_mpg) * fuel_price`
- `operating_cost = fuel_cost + labor_cost + overhead_per_day`

### Monthly Equipment Cost

- `equipment_monthly_cost = trailer_payment + maintenance_per_month`

### Suggested Rental Price

- `base_cost = operating_cost + dump_cost`
- `suggested_price = base_cost * (1 + dump_margin_percent / 100)`

### Break-Even Rentals

- `profit_per_rental = suggested_price - operating_cost - dump_cost`
- `break_even_rentals = equipment_monthly_cost / profit_per_rental`

If `profit_per_rental <= 0`, break-even is treated as unavailable.

## Tuning Inputs

Recommended tuning sequence:

1. Update fuel assumptions (`fuel_price`, `avg_mpg`, `avg_distance_miles`).
2. Update labor and overhead (`labor_cost`, `overhead_per_day`).
3. Review disposal reference rates and adjust dump-cost assumption.
4. Set margin (`dump_margin_percent`) for target contribution per job.
5. Set equipment financing assumptions (`trailer_payment`, `trailer_term_months`, `maintenance_per_month`).
6. Record context in `notes` and maintain changes per region.

## Interpreting Results

The admin pricing page also compares demand (last 30/60/90 days by region/product) against break-even:

- Demand below break-even: **Demand below purchase threshold**
- Demand near break-even: **Borderline — monitor demand**
- Demand above break-even: **Demand supports equipment purchase**

Use this as decision support; always review operational constraints and disposal volatility before committing to equipment purchases.
