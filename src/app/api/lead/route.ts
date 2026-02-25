import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { isSmsEnabled, normalizePhone, sendSms } from "@/lib/twilio/server";

type LeadPayload = {
  region?: string;
  product?: string;
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  delivery_date?: string;
  duration?: string;
  urgency?: string;
  material_type?: string;
  notes?: string;
  name?: string;
  phone?: string;
  email?: string;
  sms_opt_in?: boolean;
};

export async function POST(request: Request) {
  let payload: LeadPayload;

  try {
    payload = (await request.json()) as LeadPayload;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON payload." },
      { status: 400 },
    );
  }

  if (!payload.region?.trim()) {
    return NextResponse.json(
      { ok: false, error: "region is required." },
      { status: 400 },
    );
  }
  if (!payload.product?.trim()) {
    return NextResponse.json(
      { ok: false, error: "product is required." },
      { status: 400 },
    );
  }
  if (!payload.phone?.trim()) {
    return NextResponse.json(
      { ok: false, error: "phone is required." },
      { status: 400 },
    );
  }
  if (payload.sms_opt_in !== true) {
    return NextResponse.json(
      { ok: false, error: "sms_opt_in must be true." },
      { status: 400 },
    );
  }

  const normalizedPhone = normalizePhone(payload.phone);
  if (normalizedPhone.replace(/\D/g, "").length < 10) {
    return NextResponse.json(
      { ok: false, error: "phone format is invalid." },
      { status: 400 },
    );
  }

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("leads")
      .insert({
        region: payload.region.trim(),
        product: payload.product.trim(),
        address1: payload.street?.trim() || null,
        city: payload.city?.trim() || null,
        state: payload.state?.trim() || null,
        zip: payload.zip?.trim() || null,
        requested_date: payload.delivery_date || null,
        duration: payload.duration?.trim() || null,
        urgency: payload.urgency?.trim() || null,
        material_type: payload.material_type?.trim() || null,
        notes: payload.notes?.trim() || null,
        name: payload.name?.trim() || null,
        phone: normalizedPhone,
        email: payload.email?.trim() || null,
        sms_opt_in: true,
      })
      .select("id")
      .single();

    if (error || !data) {
      return NextResponse.json(
        { ok: false, error: "Failed to create lead." },
        { status: 500 },
      );
    }

    if (payload.sms_opt_in === true && isSmsEnabled()) {
      sendSms(
        normalizedPhone,
        "Request received — we’ll text you when availability opens in your area. Reply STOP to opt out.",
      ).catch((smsError) => {
        console.error("Lead confirmation SMS failed", smsError);
      });
    }

    return NextResponse.json({ ok: true, leadId: data.id });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected server error.";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
