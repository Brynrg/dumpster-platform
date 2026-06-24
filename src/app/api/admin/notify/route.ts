import { isAuthedAdmin } from "@/lib/adminSession";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isSmsEnabled } from "@/lib/twilio/server";
import {
  type NotifyPayload,
  countMatchingLeads,
  getMatchingLeads,
  createNotificationCampaign,
  processNotifications,
  saveNotificationResults,
  maskPhone,
} from "@/lib/notify/service";

function toBoolean(value: unknown, fallback: boolean) {
  if (typeof value === "boolean") return value;
  return fallback;
}

export async function POST(request: NextRequest) {
  if (!(await isAuthedAdmin(request))) {
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
    const count = await countMatchingLeads({
      region,
      product,
      zip,
      onlyUnnotified,
    });

    const leads = await getMatchingLeads({
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

    const campaignId = await createNotificationCampaign({
      name: campaignName,
      region,
      product,
      zip,
      message: messageTemplate,
      dryRun,
    });

    const results = await processNotifications({
      campaignId,
      leads,
      messageTemplate,
      dryRun,
    });

    await saveNotificationResults({
      notificationRows: results.notificationRows,
      sentLeadIds: results.sentLeadIds,
    });

    return NextResponse.json({
      ok: true,
      campaignId,
      totalMatches: count,
      processed: leads.length,
      sent: results.sentCount,
      skipped: results.skippedCount,
      failed: results.failedCount,
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
