import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { isSmsEnabled, sendSms } from "@/lib/twilio/server";

type NotifyPayload = {
  action?: "preview" | "execute";
  campaignName?: string;
  region?: string;
  product?: string;
  zip?: string;
  onlyUnnotified?: boolean;
  messageTemplate?: string;
  dryRun?: boolean;
  maxSends?: number;
};

type LeadCandidate = {
  id: string;
  region: string;
  product: string;
  zip: string | null;
  phone: string;
  sms_opt_in: boolean;
  notified: boolean | null;
};

function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 4) return "+1******";
  return `+1******${digits.slice(-4)}`;
}

function toBoolean(value: unknown, fallback: boolean) {
  if (typeof value === "boolean") return value;
  return fallback;
}

export async function POST(request: NextRequest) {
  if (request.cookies.get("admin")?.value !== "1") {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }

  let payload: NotifyPayload;
  try {
    payload = (await request.json()) as NotifyPayload;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON payload." },
      { status: 400 },
    );
  }

  const action = payload.action;
  if (action !== "preview" && action !== "execute") {
    return NextResponse.json(
      { ok: false, error: "Invalid action." },
      { status: 400 },
    );
  }

  const campaignName = payload.campaignName?.trim() ?? "";
  const region = payload.region?.trim() ?? "all";
  const product = payload.product?.trim() ?? "all";
  const zip = payload.zip?.trim() ?? "";
  const onlyUnnotified = toBoolean(payload.onlyUnnotified, true);
  const dryRun = toBoolean(payload.dryRun, true);
  const messageTemplate = payload.messageTemplate?.trim() ?? "";
  const maxSendsRaw = Number(payload.maxSends ?? 25);
  const maxSends = Number.isFinite(maxSendsRaw)
    ? Math.min(Math.max(Math.floor(maxSendsRaw), 1), 200)
    : 25;

  if (!messageTemplate) {
    return NextResponse.json(
      { ok: false, error: "Message template is required." },
      { status: 400 },
    );
  }

  if (!dryRun && !isSmsEnabled()) {
    return NextResponse.json(
      {
        ok: false,
        error: "SMS is disabled. Turn on SMS_ENABLED or use Dry Run.",
      },
      { status: 400 },
    );
  }

  if (action === "execute" && !campaignName) {
    return NextResponse.json(
      { ok: false, error: "Campaign name is required for execute." },
      { status: 400 },
    );
  }

  try {
    const supabase = getSupabaseAdmin();

    let countQuery = supabase
      .from("leads")
      .select("id", { count: "exact", head: true });
    if (region !== "all") countQuery = countQuery.eq("region", region);
    if (product !== "all") countQuery = countQuery.eq("product", product);
    if (zip) countQuery = countQuery.eq("zip", zip);
    if (onlyUnnotified) countQuery = countQuery.eq("notified", false);

    const { count, error: countError } = await countQuery;
    if (countError) {
      return NextResponse.json(
        { ok: false, error: "Failed to count matching leads." },
        { status: 500 },
      );
    }

    let leadQuery = supabase
      .from("leads")
      .select("id,region,product,zip,phone,sms_opt_in,notified")
      .order("created_at", { ascending: true })
      .limit(action === "preview" ? 10 : maxSends);
    if (region !== "all") leadQuery = leadQuery.eq("region", region);
    if (product !== "all") leadQuery = leadQuery.eq("product", product);
    if (zip) leadQuery = leadQuery.eq("zip", zip);
    if (onlyUnnotified) leadQuery = leadQuery.eq("notified", false);

    const { data: leadsData, error: leadsError } = await leadQuery;
    if (leadsError) {
      return NextResponse.json(
        { ok: false, error: "Failed to load matching leads." },
        { status: 500 },
      );
    }

    const leads = (leadsData ?? []) as LeadCandidate[];

    if (action === "preview") {
      return NextResponse.json({
        ok: true,
        totalMatches: count ?? 0,
        previewRecipients: leads.map((lead) => ({
          leadId: lead.id,
          region: lead.region,
          product: lead.product,
          zip: lead.zip ?? "",
          phone: maskPhone(lead.phone),
          smsOptIn: lead.sms_opt_in,
        })),
      });
    }

    const { data: campaign, error: campaignError } = await supabase
      .from("notification_campaigns")
      .insert({
        name: campaignName,
        region: region === "all" ? null : region,
        product: product === "all" ? null : product,
        zip: zip || null,
        message: messageTemplate,
        dry_run: dryRun,
      })
      .select("id")
      .single();

    if (campaignError || !campaign) {
      return NextResponse.json(
        { ok: false, error: "Failed to create notification campaign." },
        { status: 500 },
      );
    }

    const notificationRows: Array<{
      lead_id: string;
      campaign_id: string;
      sms_sid: string | null;
      status: "sent" | "skipped" | "failed";
      error: string | null;
    }> = [];
    const sentLeadIds: string[] = [];
    let sentCount = 0;
    let skippedCount = 0;
    let failedCount = 0;

    for (const lead of leads) {
      if (lead.sms_opt_in !== true) {
        skippedCount += 1;
        notificationRows.push({
          lead_id: lead.id,
          campaign_id: campaign.id,
          sms_sid: null,
          status: "skipped",
          error: "sms_opt_in is false",
        });
        continue;
      }

      if (dryRun) {
        skippedCount += 1;
        notificationRows.push({
          lead_id: lead.id,
          campaign_id: campaign.id,
          sms_sid: null,
          status: "skipped",
          error: "dry_run",
        });
        continue;
      }

      try {
        const sms = await sendSms(lead.phone, messageTemplate);
        sentCount += 1;
        sentLeadIds.push(lead.id);
        notificationRows.push({
          lead_id: lead.id,
          campaign_id: campaign.id,
          sms_sid: sms.sid,
          status: "sent",
          error: null,
        });
      } catch (error) {
        failedCount += 1;
        notificationRows.push({
          lead_id: lead.id,
          campaign_id: campaign.id,
          sms_sid: null,
          status: "failed",
          error: error instanceof Error ? error.message : "send failed",
        });
      }
    }

    if (notificationRows.length > 0) {
      const { error: notificationsError } = await supabase
        .from("lead_notifications")
        .insert(notificationRows);
      if (notificationsError) {
        return NextResponse.json(
          { ok: false, error: "Failed to record notification logs." },
          { status: 500 },
        );
      }
    }

    if (sentLeadIds.length > 0) {
      const { error: updateError } = await supabase
        .from("leads")
        .update({ notified: true })
        .in("id", sentLeadIds);
      if (updateError) {
        return NextResponse.json(
          { ok: false, error: "Failed to update lead notification status." },
          { status: 500 },
        );
      }
    }

    return NextResponse.json({
      ok: true,
      campaignId: campaign.id,
      totalMatches: count ?? 0,
      processed: leads.length,
      sent: sentCount,
      skipped: skippedCount,
      failed: failedCount,
      dryRun,
      maxSends,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to process notifications.";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
