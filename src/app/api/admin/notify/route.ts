import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { isSmsEnabled, sendSms } from "@/lib/twilio/server";
import type { SupabaseClient } from "@supabase/supabase-js";

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
  const digits = phone.replace(/D/g, "");
  if (digits.length < 4) return "+1******";
  return `+1******${digits.slice(-4)}`;
}

function toBoolean(value: unknown, fallback: boolean) {
  if (typeof value === "boolean") return value;
  return fallback;
}

interface Filters {
  region: string;
  product: string;
  zip: string;
  onlyUnnotified: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function applyLeadFilters(query: any, filters: Filters) {
  let q = query;
  if (filters.region !== "all") q = q.eq("region", filters.region);
  if (filters.product !== "all") q = q.eq("product", filters.product);
  if (filters.zip) q = q.eq("zip", filters.zip);
  if (filters.onlyUnnotified) q = q.eq("notified", false);
  return q;
}

async function fetchTargetLeads(supabase: SupabaseClient, filters: Filters, limit: number) {
  const countQuery = applyLeadFilters(
    supabase.from("leads").select("id", { count: "exact", head: true }),
    filters
  );

  const { count, error: countError } = await countQuery;
  if (countError) throw new Error("Failed to count matching leads.");

  const leadQuery = applyLeadFilters(
    supabase.from("leads").select("id,region,product,zip,phone,sms_opt_in,notified").order("created_at", { ascending: true }).limit(limit),
    filters
  );

  const { data: leadsData, error: leadsError } = await leadQuery;
  if (leadsError) throw new Error("Failed to load matching leads.");

  return { count: count ?? 0, leads: (leadsData ?? []) as LeadCandidate[] };
}

async function executeCampaign(
  supabase: SupabaseClient,
  campaignConfig: { name: string; region: string; product: string; zip: string; message: string; dryRun: boolean },
  leads: LeadCandidate[],
  totalCount: number,
  maxSends: number
) {
  const { data: campaign, error: campaignError } = await supabase
    .from("notification_campaigns")
    .insert({
      name: campaignConfig.name,
      region: campaignConfig.region === "all" ? null : campaignConfig.region,
      product: campaignConfig.product === "all" ? null : campaignConfig.product,
      zip: campaignConfig.zip || null,
      message: campaignConfig.message,
      dry_run: campaignConfig.dryRun,
    })
    .select("id")
    .single();

  if (campaignError || !campaign) {
    throw new Error("Failed to create notification campaign.");
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

    if (campaignConfig.dryRun) {
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
      const sms = await sendSms(lead.phone, campaignConfig.message);
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
    if (notificationsError) throw new Error("Failed to record notification logs.");
  }

  if (sentLeadIds.length > 0) {
    const { error: updateError } = await supabase
      .from("leads")
      .update({ notified: true })
      .in("id", sentLeadIds);
    if (updateError) throw new Error("Failed to update lead notification status.");
  }

  return {
    campaignId: campaign.id,
    totalMatches: totalCount,
    processed: leads.length,
    sent: sentCount,
    skipped: skippedCount,
    failed: failedCount,
    dryRun: campaignConfig.dryRun,
    maxSends,
  };
}

export async function POST(request: NextRequest) {
  if (request.cookies.get("admin")?.value !== "1") {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }

  let payload: NotifyPayload;
  try {
    payload = (await request.json()) as NotifyPayload;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON payload." }, { status: 400 });
  }

  const action = payload.action;
  if (action !== "preview" && action !== "execute") {
    return NextResponse.json({ ok: false, error: "Invalid action." }, { status: 400 });
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
    return NextResponse.json({ ok: false, error: "Message template is required." }, { status: 400 });
  }

  if (!dryRun && !isSmsEnabled()) {
    return NextResponse.json(
      { ok: false, error: "SMS is disabled. Turn on SMS_ENABLED or use Dry Run." },
      { status: 400 }
    );
  }

  if (action === "execute" && !campaignName) {
    return NextResponse.json({ ok: false, error: "Campaign name is required for execute." }, { status: 400 });
  }

  try {
    const supabase = getSupabaseAdmin();
    const filters: Filters = { region, product, zip, onlyUnnotified };

    const { count, leads } = await fetchTargetLeads(
      supabase,
      filters,
      action === "preview" ? 10 : maxSends
    );

    if (action === "preview") {
      return NextResponse.json({
        ok: true,
        totalMatches: count,
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

    const result = await executeCampaign(
      supabase,
      { name: campaignName, region, product, zip, message: messageTemplate, dryRun },
      leads,
      count,
      maxSends
    );

    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to process notifications.";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
