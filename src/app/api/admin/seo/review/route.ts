import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";

type ReviewPayload = {
  id?: string;
  market?: string;
  lead_id?: string | null;
  contact_name?: string | null;
  phone?: string | null;
  email?: string | null;
  channel?: "sms" | "email";
  message?: string | null;
  status?: "draft" | "sent" | "completed" | "failed";
  completed_at?: string | null;
  notes?: string | null;
};

const ALLOWED_MARKETS = new Set(["tx-spring", "tx-north-houston", "fl-brevard"]);
const ALLOWED_CHANNELS = new Set(["sms", "email"]);
const ALLOWED_STATUS = new Set(["draft", "sent", "completed", "failed"]);

export async function POST(request: NextRequest) {
  if (request.cookies.get("admin")?.value !== "1") {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }

  let payload: ReviewPayload;
  try {
    payload = (await request.json()) as ReviewPayload;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON payload." },
      { status: 400 },
    );
  }

  const market = payload.market?.trim() ?? "";
  const channel = payload.channel ?? "sms";
  const status = payload.status ?? "draft";

  if (!ALLOWED_MARKETS.has(market)) {
    return NextResponse.json(
      { ok: false, error: "Invalid market." },
      { status: 400 },
    );
  }
  if (!ALLOWED_CHANNELS.has(channel)) {
    return NextResponse.json(
      { ok: false, error: "Invalid channel." },
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
    const baseRow = {
      market,
      lead_id: payload.lead_id?.trim() || null,
      contact_name: payload.contact_name?.trim() || null,
      phone: payload.phone?.trim() || null,
      email: payload.email?.trim() || null,
      channel,
      message: payload.message?.trim() || null,
      status,
      completed_at: payload.completed_at?.trim() || null,
      notes: payload.notes?.trim() || null,
    };

    if (payload.id?.trim()) {
      const { data, error } = await supabase
        .from("review_requests")
        .update(baseRow)
        .eq("id", payload.id.trim())
        .select(
          "id,created_at,market,lead_id,contact_name,phone,email,channel,message,status,completed_at,notes",
        )
        .single();
      if (error || !data) {
        return NextResponse.json(
          { ok: false, error: "Failed to update review request." },
          { status: 500 },
        );
      }
      return NextResponse.json({ ok: true, review: data });
    }

    const { data, error } = await supabase
      .from("review_requests")
      .insert(baseRow)
      .select(
        "id,created_at,market,lead_id,contact_name,phone,email,channel,message,status,completed_at,notes",
      )
      .single();

    if (error || !data) {
      return NextResponse.json(
        { ok: false, error: "Failed to create review request." },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true, review: data });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to save review request.";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
