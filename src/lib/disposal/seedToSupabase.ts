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

  for (const facility of facilitiesSeed) {
    const address = facility.address1 || "";
    const { data: existingData, error: existingError } = await supabase
      .from("disposal_facilities")
      .select("id,market,name,address1")
      .eq("market", facility.market)
      .eq("name", facility.name)
      .eq("address1", address)
      .maybeSingle();

    if (existingError) {
      throw new Error(`Failed to query facility "${facility.name}": ${existingError.message}`);
    }

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

  for (const rate of ratesSeed) {
    const facilityId = facilityIdByKey.get(`${rate.market}::${rate.facility_name}`);
    if (!facilityId) {
      continue;
    }

    const effectiveDate = rate.effective_date || null;
    const { data: existingData, error: existingError } = await supabase
      .from("disposal_rates")
      .select("id")
      .eq("facility_id", facilityId)
      .eq("material_category", rate.material_category)
      .eq("unit", rate.unit)
      .eq("effective_date", effectiveDate)
      .maybeSingle();

    if (existingError) {
      throw new Error(
        `Failed to query rate "${rate.material_category}" for "${rate.facility_name}": ${existingError.message}`,
      );
    }

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
