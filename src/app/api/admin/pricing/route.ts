import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";

type PricingPayload = {
  region?: string;
  fuel_price?: number | string;
  avg_mpg?: number | string;
  avg_distance_miles?: number | string;
  labor_cost?: number | string;
  overhead_per_day?: number | string;
  dump_margin_percent?: number | string;
  trailer_payment?: number | string;
  trailer_term_months?: number | string;
  maintenance_per_month?: number | string;
  target_utilization?: number | string;
  notes?: string;
};

function toNumber(value: number | string | undefined) {
  if (value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function toInteger(value: number | string | undefined) {
  if (value === undefined || value === "") return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return null;
  return Math.trunc(parsed);
}

export async function POST(request: NextRequest) {
  if (request.cookies.get("admin")?.value !== "1") {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }

  let payload: PricingPayload;
  try {
    payload = (await request.json()) as PricingPayload;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON payload." },
      { status: 400 },
    );
  }

  const region = payload.region?.trim();
  if (!region) {
    return NextResponse.json(
      { ok: false, error: "region is required." },
      { status: 400 },
    );
  }

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("pricing_configs")
      .upsert(
        {
          region,
          fuel_price: toNumber(payload.fuel_price),
          avg_mpg: toNumber(payload.avg_mpg),
          avg_distance_miles: toNumber(payload.avg_distance_miles),
          labor_cost: toNumber(payload.labor_cost),
          overhead_per_day: toNumber(payload.overhead_per_day),
          dump_margin_percent: toNumber(payload.dump_margin_percent),
          trailer_payment: toNumber(payload.trailer_payment),
          trailer_term_months: toInteger(payload.trailer_term_months),
          maintenance_per_month: toNumber(payload.maintenance_per_month),
          target_utilization: toNumber(payload.target_utilization),
          notes: payload.notes?.trim() || null,
        },
        { onConflict: "region" },
      )
      .select("id,region")
      .single();

    if (error || !data) {
      return NextResponse.json(
        { ok: false, error: "Failed to upsert pricing config." },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true, pricingId: data.id, region: data.region });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to save pricing config.";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
