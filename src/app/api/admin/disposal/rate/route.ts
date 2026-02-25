import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";

type RatePayload = {
  id?: string;
  facility_id?: string;
  material_category?: string;
  price?: number | string;
  unit?: string;
  effective_date?: string;
  source_url?: string;
  source_notes?: string;
};

export async function POST(request: NextRequest) {
  if (request.cookies.get("admin")?.value !== "1") {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }

  let payload: RatePayload;
  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    try {
      payload = (await request.json()) as RatePayload;
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
      facility_id: String(formData.get("facility_id") ?? ""),
      material_category: String(formData.get("material_category") ?? ""),
      price: String(formData.get("price") ?? ""),
      unit: String(formData.get("unit") ?? ""),
      effective_date: String(formData.get("effective_date") ?? ""),
      source_url: String(formData.get("source_url") ?? ""),
      source_notes: String(formData.get("source_notes") ?? ""),
    };
  }

  if (!payload.facility_id?.trim() || !payload.material_category?.trim()) {
    return NextResponse.json(
      { ok: false, error: "facility_id and material_category are required." },
      { status: 400 },
    );
  }

  const parsedPrice =
    payload.price === "" || payload.price === undefined
      ? null
      : Number(payload.price);
  if (parsedPrice !== null && !Number.isFinite(parsedPrice)) {
    return NextResponse.json(
      { ok: false, error: "price must be numeric." },
      { status: 400 },
    );
  }

  try {
    const supabase = getSupabaseAdmin();
    let rateId = payload.id?.trim() ?? "";

    if (!rateId) {
      const { data: existingData, error: existingError } = await supabase
        .from("disposal_rates")
        .select("id")
        .eq("facility_id", payload.facility_id.trim())
        .eq("material_category", payload.material_category.trim())
        .eq("unit", payload.unit?.trim() || "")
        .eq("effective_date", payload.effective_date?.trim() || null)
        .maybeSingle();

      if (existingError) {
        return NextResponse.json(
          { ok: false, error: "Failed to query rate." },
          { status: 500 },
        );
      }
      rateId = (existingData as { id: string } | null)?.id ?? "";
    }

    const rateValues = {
      facility_id: payload.facility_id.trim(),
      material_category: payload.material_category.trim(),
      price: parsedPrice,
      unit: payload.unit?.trim() || "",
      effective_date: payload.effective_date?.trim() || null,
      source_url: payload.source_url?.trim() || null,
      source_notes: payload.source_notes?.trim() || null,
    };

    if (rateId) {
      const { error } = await supabase
        .from("disposal_rates")
        .update(rateValues)
        .eq("id", rateId);

      if (error) {
        return NextResponse.json(
          { ok: false, error: "Failed to update rate." },
          { status: 500 },
        );
      }

      return NextResponse.json({ ok: true, rateId, mode: "updated" });
    }

    const { data, error } = await supabase
      .from("disposal_rates")
      .insert(rateValues)
      .select("id")
      .single();

    if (error || !data) {
      return NextResponse.json(
        { ok: false, error: "Failed to create rate." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      ok: true,
      rateId: (data as { id: string }).id,
      mode: "created",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to upsert rate.";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
