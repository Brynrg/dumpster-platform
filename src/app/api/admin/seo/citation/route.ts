import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";

type CitationPayload = {
  id?: string;
  market?: string;
  provider?: string;
  listing_url?: string | null;
  nap_name?: string | null;
  nap_phone?: string | null;
  nap_service_area?: string | null;
  status?: "todo" | "submitted" | "live" | "needs_fix";
  last_verified?: string | null;
  notes?: string | null;
};

const ALLOWED_MARKETS = new Set(["tx-spring", "tx-north-houston", "fl-brevard"]);
const ALLOWED_STATUS = new Set(["todo", "submitted", "live", "needs_fix"]);

export async function POST(request: NextRequest) {
  if (request.cookies.get("admin")?.value !== "1") {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }

  let payload: CitationPayload;
  try {
    payload = (await request.json()) as CitationPayload;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON payload." },
      { status: 400 },
    );
  }

  const market = payload.market?.trim() ?? "";
  const provider = payload.provider?.trim() ?? "";
  const status = payload.status ?? "todo";

  if (!ALLOWED_MARKETS.has(market)) {
    return NextResponse.json(
      { ok: false, error: "Invalid market." },
      { status: 400 },
    );
  }
  if (!provider) {
    return NextResponse.json(
      { ok: false, error: "provider is required." },
      { status: 400 },
    );
  }
  if (!ALLOWED_STATUS.has(status)) {
    return NextResponse.json(
      { ok: false, error: "Invalid status." },
      { status: 400 },
    );
  }

  try {
    const supabase = getSupabaseAdmin();
    const row = {
      market,
      provider,
      listing_url: payload.listing_url?.trim() || null,
      nap_name: payload.nap_name?.trim() || null,
      nap_phone: payload.nap_phone?.trim() || null,
      nap_service_area: payload.nap_service_area?.trim() || null,
      status,
      last_verified: payload.last_verified?.trim() || null,
      notes: payload.notes?.trim() || null,
    };

    if (payload.id?.trim()) {
      const { data, error } = await supabase
        .from("citations")
        .update(row)
        .eq("id", payload.id.trim())
        .select(
          "id,created_at,market,provider,listing_url,nap_name,nap_phone,nap_service_area,status,last_verified,notes",
        )
        .single();

      if (error || !data) {
        return NextResponse.json(
          { ok: false, error: "Failed to update citation." },
          { status: 500 },
        );
      }

      return NextResponse.json({ ok: true, citation: data });
    }

    const { data, error } = await supabase
      .from("citations")
      .upsert(row, { onConflict: "market,provider" })
      .select(
        "id,created_at,market,provider,listing_url,nap_name,nap_phone,nap_service_area,status,last_verified,notes",
      )
      .single();

    if (error || !data) {
      return NextResponse.json(
        { ok: false, error: "Failed to save citation." },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true, citation: data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to save citation.";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
