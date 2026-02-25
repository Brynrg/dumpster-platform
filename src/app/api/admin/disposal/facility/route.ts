import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";

type FacilityPayload = {
  id?: string;
  market?: string;
  name?: string;
  facility_type?: string;
  address1?: string;
  city?: string;
  state?: string;
  zip?: string;
  phone?: string;
  website?: string;
  commercial_allowed?: boolean;
  notes?: string;
  last_verified?: string;
};

export async function POST(request: NextRequest) {
  if (request.cookies.get("admin")?.value !== "1") {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }

  let payload: FacilityPayload;

  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    try {
      payload = (await request.json()) as FacilityPayload;
    } catch {
      return NextResponse.json(
        { ok: false, error: "Invalid JSON payload." },
        { status: 400 },
      );
    }
  } else {
    const formData = await request.formData();
    payload = {
      id: String(formData.get("id") ?? ""),
      market: String(formData.get("market") ?? ""),
      name: String(formData.get("name") ?? ""),
      facility_type: String(formData.get("facility_type") ?? ""),
      address1: String(formData.get("address1") ?? ""),
      city: String(formData.get("city") ?? ""),
      state: String(formData.get("state") ?? ""),
      zip: String(formData.get("zip") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      website: String(formData.get("website") ?? ""),
      commercial_allowed:
        String(formData.get("commercial_allowed") ?? "").toLowerCase() === "true",
      notes: String(formData.get("notes") ?? ""),
      last_verified: String(formData.get("last_verified") ?? ""),
    };
  }

  if (!payload.market?.trim() || !payload.name?.trim()) {
    return NextResponse.json(
      { ok: false, error: "market and name are required." },
      { status: 400 },
    );
  }

  try {
    const supabase = getSupabaseAdmin();
    let facilityId = payload.id?.trim() ?? "";

    if (!facilityId) {
      const { data: existingData, error: existingError } = await supabase
        .from("disposal_facilities")
        .select("id")
        .eq("market", payload.market.trim())
        .eq("name", payload.name.trim())
        .eq("address1", payload.address1?.trim() || "")
        .maybeSingle();

      if (existingError) {
        return NextResponse.json(
          { ok: false, error: "Failed to query facility." },
          { status: 500 },
        );
      }
      facilityId = (existingData as { id: string } | null)?.id ?? "";
    }

    if (facilityId) {
      const { error } = await supabase
        .from("disposal_facilities")
        .update({
          market: payload.market.trim(),
          name: payload.name.trim(),
          facility_type: payload.facility_type?.trim() || null,
          address1: payload.address1?.trim() || "",
          city: payload.city?.trim() || null,
          state: payload.state?.trim() || null,
          zip: payload.zip?.trim() || null,
          phone: payload.phone?.trim() || null,
          website: payload.website?.trim() || null,
          commercial_allowed: payload.commercial_allowed ?? null,
          notes: payload.notes?.trim() || null,
          last_verified: payload.last_verified?.trim() || null,
        })
        .eq("id", facilityId);

      if (error) {
        return NextResponse.json(
          { ok: false, error: "Failed to update facility." },
          { status: 500 },
        );
      }

      return NextResponse.json({ ok: true, facilityId, mode: "updated" });
    }

    const { data, error } = await supabase
      .from("disposal_facilities")
      .insert({
        market: payload.market.trim(),
        name: payload.name.trim(),
        facility_type: payload.facility_type?.trim() || null,
        address1: payload.address1?.trim() || "",
        city: payload.city?.trim() || null,
        state: payload.state?.trim() || null,
        zip: payload.zip?.trim() || null,
        phone: payload.phone?.trim() || null,
        website: payload.website?.trim() || null,
        commercial_allowed: payload.commercial_allowed ?? null,
        notes: payload.notes?.trim() || null,
        last_verified: payload.last_verified?.trim() || null,
      })
      .select("id")
      .single();

    if (error || !data) {
      return NextResponse.json(
        { ok: false, error: "Failed to create facility." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      ok: true,
      facilityId: (data as { id: string }).id,
      mode: "created",
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to upsert facility.";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
