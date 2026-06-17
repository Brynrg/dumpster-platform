import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { isSmsEnabled } from "@/lib/twilio/server";
import {
  NotifyPayload,
  maskPhone,
  toBoolean,
  getMatchingLeads,
  executeNotificationCampaign,
} from "./service";

export async function POST(request: NextRequest) {
  if (request.cookies.get("admin")?.value !== "1") {
    return NextResponse.json(
      { ok: false, error: "Unauthorized." },
      { status: 401 },
    );
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

    const { count, leads } = await getMatchingLeads(supabase, {
      action,
      region,
      product,
      zip,
      onlyUnnotified,
      maxSends,
    });

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

    const { campaign, sentCount, skippedCount, failedCount } =
      await executeNotificationCampaign(supabase, {
        campaignName,
        region,
        product,
        zip,
        messageTemplate,
        dryRun,
        leads,
      });

    return NextResponse.json({
      ok: true,
      campaignId: campaign.id,
      totalMatches: count,
      processed: leads.length,
      sent: sentCount,
      skipped: skippedCount,
      failed: failedCount,
      dryRun,
      maxSends,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to process notifications.";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
