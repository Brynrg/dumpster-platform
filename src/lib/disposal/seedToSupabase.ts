import "server-only";
import { facilitiesSeed, ratesSeed } from "@/lib/disposal/seed";
import { getSupabaseAdmin } from "@/lib/supabase/server";

export async function seedDisposalData(): Promise<{
  facilities: number;
  rates: number;
}> {
  const supabase = getSupabaseAdmin();
  let facilitiesCount = 0;
  let ratesCount = 0;
  const facilityIdByKey = new Map<string, string>();

  if (facilitiesSeed.length === 0) {
    return { facilities: 0, rates: 0 };
  }

  const markets = [...new Set(facilitiesSeed.map((f) => f.market))];
  const { data: existingFacilities, error: fetchFacError } = await supabase
    .from("disposal_facilities")
    .select("id,market,name,address1")
    .in("market", markets);

  if (fetchFacError) {
    throw new Error(`Failed to fetch existing facilities: ${fetchFacError.message}`);
  }

  const existingFacMap = new Map<string, { id: string }>();
  for (const fac of existingFacilities || []) {
    existingFacMap.set(`${fac.market}::${fac.name}::${fac.address1 || ""}`, fac);
  }

  const facilitiesToUpsert = facilitiesSeed.map((facility) => {
    const address = facility.address1 || "";
    const key = `${facility.market}::${facility.name}::${address}`;
    const existing = existingFacMap.get(key);

    if (!existing) {
      facilitiesCount += 1;
    }

    return {
      ...(existing ? { id: existing.id } : {}),
      market: facility.market,
      name: facility.name,
      facility_type: facility.facility_type,
      address1: address,
      city: facility.city,
      state: facility.state,
      zip: facility.zip || null,
      phone: facility.phone || null,
      website: facility.website || null,
      commercial_allowed: facility.commercial_allowed,
      notes: facility.notes,
      last_verified: facility.last_verified || null,
    };
  });

  const { data: upsertedFacilities, error: facUpsertError } = await supabase
    .from("disposal_facilities")
    .upsert(facilitiesToUpsert, { onConflict: "id" })
    .select("id,market,name");

  if (facUpsertError || !upsertedFacilities) {
    throw new Error(`Failed to upsert facilities: ${facUpsertError?.message}`);
  }

  for (const row of upsertedFacilities) {
    facilityIdByKey.set(`${row.market}::${row.name}`, row.id);
  }

  if (ratesSeed.length === 0 || facilityIdByKey.size === 0) {
    return { facilities: facilitiesCount, rates: ratesCount };
  }

  const facilityIds = [...new Set(upsertedFacilities.map((f) => f.id))];
  const { data: existingRatesData, error: fetchRatesError } = await supabase
    .from("disposal_rates")
    .select("id,facility_id,material_category,unit,effective_date")
    .in("facility_id", facilityIds);

  if (fetchRatesError) {
    throw new Error(`Failed to fetch existing rates: ${fetchRatesError.message}`);
  }

  const existingRatesMap = new Map<string, { id: string }>();
  for (const rate of existingRatesData || []) {
    const ed = rate.effective_date || "null";
    existingRatesMap.set(`${rate.facility_id}::${rate.material_category}::${rate.unit}::${ed}`, rate);
  }

  const ratesToUpsert = [];
  for (const rate of ratesSeed) {
    const facilityId = facilityIdByKey.get(`${rate.market}::${rate.facility_name}`);
    if (!facilityId) continue;

    const effectiveDate = rate.effective_date || null;
    const edKey = effectiveDate || "null";
    const key = `${facilityId}::${rate.material_category}::${rate.unit}::${edKey}`;
    const existing = existingRatesMap.get(key);

    if (!existing) {
      ratesCount += 1;
    }

    ratesToUpsert.push({
      ...(existing ? { id: existing.id } : {}),
      facility_id: facilityId,
      material_category: rate.material_category,
      price: rate.price,
      unit: rate.unit,
      effective_date: effectiveDate,
      source_url: rate.source_url || null,
      source_notes: rate.source_notes || null,
    });
  }

  if (ratesToUpsert.length > 0) {
    const { error: ratesUpsertError } = await supabase
      .from("disposal_rates")
      .upsert(ratesToUpsert, { onConflict: "id" });

    if (ratesUpsertError) {
      throw new Error(`Failed to upsert rates: ${ratesUpsertError.message}`);
    }
  }

  return {
    facilities: facilitiesCount,
    rates: ratesCount,
  };
}
