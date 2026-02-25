import DisposalFacilitiesTable from "@/components/admin/DisposalFacilitiesTable";
import { getSupabaseAdmin } from "@/lib/supabase/server";

type SearchParams = {
  market?: string | string[];
  facility_type?: string | string[];
  q?: string | string[];
};

type RateRow = {
  id: string;
  facility_id: string;
  material_category: string | null;
  price: number | null;
  unit: string | null;
  effective_date: string | null;
  source_url: string | null;
  source_notes: string | null;
};

type FacilityRow = {
  id: string;
  market: string;
  name: string;
  facility_type: string | null;
  address1: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  phone: string | null;
  website: string | null;
  commercial_allowed: boolean | null;
  notes: string | null;
  last_verified: string | null;
};

function asSingle(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AdminDisposalPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const market = asSingle(params.market) ?? "";
  const facilityType = asSingle(params.facility_type) ?? "";
  const query = asSingle(params.q) ?? "";

  let facilities: (FacilityRow & { rates: RateRow[] })[] = [];
  let errorMessage = "";

  try {
    const supabase = getSupabaseAdmin();
    let facilitiesQuery = supabase
      .from("disposal_facilities")
      .select(
        "id,market,name,facility_type,address1,city,state,zip,phone,website,commercial_allowed,notes,last_verified",
      )
      .order("market", { ascending: true })
      .order("name", { ascending: true });

    if (market) facilitiesQuery = facilitiesQuery.eq("market", market);
    if (facilityType) facilitiesQuery = facilitiesQuery.eq("facility_type", facilityType);
    if (query) facilitiesQuery = facilitiesQuery.or(`name.ilike.%${query}%,city.ilike.%${query}%`);

    const { data: facilitiesData, error: facilitiesError } = await facilitiesQuery.limit(500);
    if (facilitiesError) {
      errorMessage = "Failed to load facilities.";
    } else {
      const facilityRows = (facilitiesData ?? []) as FacilityRow[];
      const facilityIds = facilityRows.map((row) => row.id);

      let ratesByFacility = new Map<string, RateRow[]>();
      if (facilityIds.length > 0) {
        const { data: ratesData, error: ratesError } = await supabase
          .from("disposal_rates")
          .select(
            "id,facility_id,material_category,price,unit,effective_date,source_url,source_notes",
          )
          .in("facility_id", facilityIds)
          .order("material_category", { ascending: true });

        if (ratesError) {
          errorMessage = "Failed to load rates.";
        } else {
          const rateRows = (ratesData ?? []) as RateRow[];
          ratesByFacility = rateRows.reduce((map, rate) => {
            const list = map.get(rate.facility_id) ?? [];
            list.push(rate);
            map.set(rate.facility_id, list);
            return map;
          }, new Map<string, RateRow[]>());
        }
      }

      facilities = facilityRows.map((facility) => ({
        ...facility,
        rates: ratesByFacility.get(facility.id) ?? [],
      }));
    }
  } catch (error) {
    errorMessage =
      error instanceof Error ? error.message : "Failed to load disposal data.";
  }

  return (
    <main className="mx-auto max-w-7xl px-6 py-12">
      <h1 className="text-3xl font-semibold tracking-tight">Admin Disposal Intel</h1>
      <p className="mt-2 text-black/70 dark:text-white/70">
        Reference library for facilities and disposal pricing sources.
      </p>

      <form
        method="get"
        className="mt-6 grid gap-3 rounded-xl border border-black/10 p-4 sm:grid-cols-4 dark:border-white/15"
      >
        <select
          name="market"
          defaultValue={market}
          className="rounded-md border border-black/20 bg-transparent px-3 py-2 text-sm dark:border-white/25"
        >
          <option value="">market: all</option>
          <option value="fl-brevard">fl-brevard</option>
          <option value="tx-north-houston">tx-north-houston</option>
          <option value="tx-spring">tx-spring</option>
        </select>
        <input
          name="facility_type"
          defaultValue={facilityType}
          placeholder="facility_type"
          className="rounded-md border border-black/20 bg-transparent px-3 py-2 text-sm dark:border-white/25"
        />
        <input
          name="q"
          defaultValue={query}
          placeholder="search name/city"
          className="rounded-md border border-black/20 bg-transparent px-3 py-2 text-sm dark:border-white/25"
        />
        <button
          type="submit"
          className="inline-flex items-center justify-center rounded-md border border-foreground bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90"
        >
          Apply
        </button>
      </form>

      {errorMessage ? (
        <p className="mt-6 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
          {errorMessage}
        </p>
      ) : facilities.length === 0 ? (
        <p className="mt-6 rounded-md border border-black/10 px-3 py-2 text-sm text-black/70 dark:border-white/15 dark:text-white/70">
          No disposal facilities found for current filters.
        </p>
      ) : (
        <section className="mt-6">
          <DisposalFacilitiesTable facilities={facilities} />
        </section>
      )}
    </main>
  );
}
