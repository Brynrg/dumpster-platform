import PricingEditor from "@/components/admin/PricingEditor";
import { getAllRegions } from "@/lib/regions";
import { getSupabaseAdmin } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type PricingConfigRow = {
  region: string;
  fuel_price: number | null;
  avg_mpg: number | null;
  avg_distance_miles: number | null;
  labor_cost: number | null;
  overhead_per_day: number | null;
  dump_margin_percent: number | null;
  trailer_payment: number | null;
  trailer_term_months: number | null;
  maintenance_per_month: number | null;
  target_utilization: number | null;
  notes: string | null;
};

type FacilityRow = {
  id: string;
  market: string;
};

type RateRow = {
  facility_id: string;
  price: number | null;
  unit: string | null;
};

async function countLeadsForDays(
  region: string,
  product: string,
  days: number,
): Promise<number> {
  const supabase = getSupabaseAdmin();
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
  const { count, error } = await supabase
    .from("leads")
    .select("id", { count: "exact", head: true })
    .eq("region", region)
    .eq("product", product)
    .gte("created_at", since);

  if (error) return 0;
  return count ?? 0;
}

export default async function AdminPricingPage() {
  const regions = getAllRegions().map((region) => region.id);
  const supabase = getSupabaseAdmin();

  const { data: configData } = await supabase
    .from("pricing_configs")
    .select(
      "region,fuel_price,avg_mpg,avg_distance_miles,labor_cost,overhead_per_day,dump_margin_percent,trailer_payment,trailer_term_months,maintenance_per_month,target_utilization,notes",
    );

  const configMap = new Map(
    ((configData ?? []) as PricingConfigRow[]).map((config) => [config.region, config]),
  );

  const configs: PricingConfigRow[] = regions.map((region) => {
    const existing = configMap.get(region);
    return (
      existing ?? {
        region,
        fuel_price: null,
        avg_mpg: null,
        avg_distance_miles: null,
        labor_cost: null,
        overhead_per_day: null,
        dump_margin_percent: null,
        trailer_payment: null,
        trailer_term_months: null,
        maintenance_per_month: null,
        target_utilization: null,
        notes: "",
      }
    );
  });

  const { data: facilitiesData } = await supabase
    .from("disposal_facilities")
    .select("id,market");
  const facilities = (facilitiesData ?? []) as FacilityRow[];

  const facilityIds = facilities.map((facility) => facility.id);
  let rates: RateRow[] = [];
  if (facilityIds.length > 0) {
    const { data: ratesData } = await supabase
      .from("disposal_rates")
      .select("facility_id,price,unit")
      .in("facility_id", facilityIds);
    rates = (ratesData ?? []) as RateRow[];
  }

  const marketByFacilityId = new Map(
    facilities.map((facility) => [facility.id, facility.market]),
  );
  const dumpCostAccumulator = new Map<string, { total: number; count: number }>();
  for (const rate of rates) {
    const market = marketByFacilityId.get(rate.facility_id);
    if (!market || rate.price === null) continue;
    if (rate.unit !== "ton") continue;

    const current = dumpCostAccumulator.get(market) ?? { total: 0, count: 0 };
    current.total += Number(rate.price);
    current.count += 1;
    dumpCostAccumulator.set(market, current);
  }

  const dumpCostByRegion = Object.fromEntries(
    regions.map((region) => {
      const aggregate = dumpCostAccumulator.get(region);
      const estimated =
        aggregate && aggregate.count > 0 ? aggregate.total / aggregate.count : 0;
      return [region, estimated];
    }),
  );

  const products = ["dump_trailer", "dumpster_20", "dumpster_30", "not_sure"];
  const demandEntries = await Promise.all(
    regions.flatMap((region) =>
      products.map(async (product) => {
        const [d30, d60, d90] = await Promise.all([
          countLeadsForDays(region, product, 30),
          countLeadsForDays(region, product, 60),
          countLeadsForDays(region, product, 90),
        ]);
        return [`${region}:${product}`, { d30, d60, d90 }] as const;
      }),
    ),
  );
  const demandCounts = Object.fromEntries(demandEntries);

  return (
    <main className="mx-auto max-w-7xl px-6 py-12">
      <h1 className="text-3xl font-semibold tracking-tight">Admin Pricing Model</h1>
      <p className="mt-2 text-black/70 dark:text-white/70">
        Configure regional cost assumptions and compare demand against break-even
        thresholds.
      </p>
      <PricingEditor
        initialConfigs={configs}
        dumpCostByRegion={dumpCostByRegion}
        demandCounts={demandCounts}
      />
    </main>
  );
}
