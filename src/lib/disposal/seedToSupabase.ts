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
};

export async function seedDisposalData(): Promise<{
  facilities: number;
  rates: number;
}> {
  const supabase = getSupabaseAdmin();
  const facilityIdByKey = new Map<string, string>();
  let facilitiesCount = 0;
  let ratesCount = 0;

  const markets = Array.from(new Set(facilitiesSeed.map((f) => f.market)));
  const { data: existingFacilitiesData, error: existingFacilitiesError } =
    await supabase
      .from("disposal_facilities")
      .select("id,market,name,address1")
      .in("market", markets);

  if (existingFacilitiesError) {
    throw new Error(
      `Failed to query existing facilities: ${existingFacilitiesError.message}`,
    );
  }

  const existingFacilityMap = new Map<string, FacilityRow>();
  for (const row of existingFacilitiesData || []) {
    existingFacilityMap.set(
      `${row.market}::${row.name}::${row.address1 || ""}`,
      row as FacilityRow,
    );
  }

  for (const facility of facilitiesSeed) {
    const address = facility.address1 || "";
    const existingData = existingFacilityMap.get(
      `${facility.market}::${facility.name}::${address}`,
    );

    let facilityId: string;
    if (existingData) {
      const existing = existingData as FacilityRow;
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
        .eq("id", existing.id)
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

  const facilityIds = Array.from(new Set(facilityIdByKey.values()));
  const { data: existingRatesData, error: existingRatesError } = await supabase
    .from("disposal_rates")
    .select("id,facility_id,material_category,unit,effective_date")
    .in("facility_id", facilityIds);

  if (existingRatesError) {
    throw new Error(
      `Failed to query existing rates: ${existingRatesError.message}`,
    );
  }

  const existingRateMap = new Map<string, RateRow>();
  for (const row of existingRatesData || []) {
    existingRateMap.set(
      `${row.facility_id}::${row.material_category}::${row.unit}::${row.effective_date || null}`,
      row as RateRow,
    );
  }

  for (const rate of ratesSeed) {
    const facilityId = facilityIdByKey.get(
      `${rate.market}::${rate.facility_name}`,
    );
    if (!facilityId) {
      continue;
    }

    const effectiveDate = rate.effective_date || null;
    const existingData = existingRateMap.get(
      `${facilityId}::${rate.material_category}::${rate.unit}::${effectiveDate}`,
    );

    if (existingData) {
      const existing = existingData as RateRow;
      const { error: updateError } = await supabase
        .from("disposal_rates")
        .update({
          price: rate.price,
          source_url: rate.source_url || null,
          source_notes: rate.source_notes || null,
        })
        .eq("id", existing.id);

      if (updateError) {
        throw new Error(
          `Failed to update rate "${rate.material_category}" for "${rate.facility_name}".`,
        );
      }
    } else {
      const { error: insertError } = await supabase
        .from("disposal_rates")
        .insert({
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
