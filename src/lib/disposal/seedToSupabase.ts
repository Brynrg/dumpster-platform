import "server-only";
import { facilitiesSeed, ratesSeed } from "@/lib/disposal/seed";
import { getSupabaseAdmin } from "@/lib/supabase/server";

type FacilityRow = {
  id: string;
  market: string;
  name: string;
  address1: string | null;
};

type RateRow = {
  id: string;
  facility_id: string;
  material_category: string;
  unit: string;
  effective_date: string | null;
};

export async function seedDisposalData(): Promise<{
  facilities: number;
  rates: number;
}> {
  const supabase = getSupabaseAdmin();
  const facilityIdByKey = new Map<string, string>();
  let facilitiesCount = 0;
  let ratesCount = 0;

  // 1. Batch fetch all existing facilities for the relevant markets
  const distinctMarkets = Array.from(new Set(facilitiesSeed.map((f) => f.market)));

  const { data: existingFacilitiesData, error: existingFacilitiesError } = await supabase
    .from("disposal_facilities")
    .select("id,market,name,address1")
    .in("market", distinctMarkets);

  if (existingFacilitiesError) {
    throw new Error(`Failed to query existing facilities: ${existingFacilitiesError.message}`);
  }

  const existingFacilitiesMap = new Map<string, FacilityRow>();
  if (existingFacilitiesData) {
    for (const row of existingFacilitiesData as FacilityRow[]) {
      const address = row.address1 || "";
      const key = `${row.market}::${row.name}::${address}`;
      existingFacilitiesMap.set(key, row);
    }
  }

  for (const facility of facilitiesSeed) {
    const address = facility.address1 || "";
    const key = `${facility.market}::${facility.name}::${address}`;
    const existingData = existingFacilitiesMap.get(key);

    let facilityId: string;
    if (existingData) {
      const { data: updatedData, error: updateError } = await supabase
        .from("disposal_facilities")
        .update({
          facility_type: facility.facility_type,
          city: facility.city,
          state: facility.state,
          zip: facility.zip || null,
          phone: facility.phone || null,
          website: facility.website || null,
          commercial_allowed: facility.commercial_allowed,
          notes: facility.notes,
          last_verified: facility.last_verified || null,
        })
        .eq("id", existingData.id)
        .select("id")
        .single();

      if (updateError || !updatedData) {
        throw new Error(`Failed to update facility "${facility.name}".`);
      }
      facilityId = (updatedData as { id: string }).id;
    } else {
      const { data: insertedData, error: insertError } = await supabase
        .from("disposal_facilities")
        .insert({
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
        })
        .select("id")
        .single();

      if (insertError || !insertedData) {
        throw new Error(`Failed to insert facility "${facility.name}".`);
      }
      facilityId = (insertedData as { id: string }).id;
      facilitiesCount += 1;
    }

    facilityIdByKey.set(`${facility.market}::${facility.name}`, facilityId);
  }

  // 2. Batch fetch all existing rates for the relevant facilities
  const facilityIds = Array.from(facilityIdByKey.values());

  const existingRatesMap = new Map<string, RateRow>();
  if (facilityIds.length > 0) {
    const { data: existingRatesData, error: existingRatesError } = await supabase
      .from("disposal_rates")
      .select("id,facility_id,material_category,unit,effective_date")
      .in("facility_id", facilityIds);

    if (existingRatesError) {
      throw new Error(`Failed to query existing rates: ${existingRatesError.message}`);
    }

    if (existingRatesData) {
      for (const row of existingRatesData as RateRow[]) {
        const dateKey = row.effective_date || "null";
        const key = `${row.facility_id}::${row.material_category}::${row.unit}::${dateKey}`;
        existingRatesMap.set(key, row);
      }
    }
  }

  for (const rate of ratesSeed) {
    const facilityId = facilityIdByKey.get(`${rate.market}::${rate.facility_name}`);
    if (!facilityId) {
      continue;
    }

    const effectiveDate = rate.effective_date || null;
    const dateKey = effectiveDate || "null";
    const key = `${facilityId}::${rate.material_category}::${rate.unit}::${dateKey}`;
    const existingData = existingRatesMap.get(key);

    if (existingData) {
      const { error: updateError } = await supabase
        .from("disposal_rates")
        .update({
          price: rate.price,
          source_url: rate.source_url || null,
          source_notes: rate.source_notes || null,
        })
        .eq("id", existingData.id);

      if (updateError) {
        throw new Error(
          `Failed to update rate "${rate.material_category}" for "${rate.facility_name}".`,
        );
      }
    } else {
      const { error: insertError } = await supabase.from("disposal_rates").insert({
        facility_id: facilityId,
        material_category: rate.material_category,
        price: rate.price,
        unit: rate.unit,
        effective_date: effectiveDate,
        source_url: rate.source_url || null,
        source_notes: rate.source_notes || null,
      });

      if (insertError) {
        throw new Error(
          `Failed to insert rate "${rate.material_category}" for "${rate.facility_name}".`,
        );
      }
      ratesCount += 1;
    }
  }

  return {
    facilities: facilitiesCount,
    rates: ratesCount,
  };
}
