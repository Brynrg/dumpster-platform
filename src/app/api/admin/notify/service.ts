import type { SupabaseClient } from "@supabase/supabase-js";
import { sendSms } from "@/lib/twilio/server";

export type NotifyPayload = {
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

export type LeadCandidate = {
  id: string;
  region: string;
  product: string;
  zip: string | null;
  phone: string;
  sms_opt_in: boolean;
  notified: boolean | null;
};

export function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 4) return "+1******";
  return `+1******${digits.slice(-4)}`;
}

export function toBoolean(value: unknown, fallback: boolean) {
  if (typeof value === "boolean") return value;
  return fallback;
}

export async function getMatchingLeads(
  supabase: SupabaseClient,
  params: {
    action: string;
    region: string;
    product: string;
    zip: string;
    onlyUnnotified: boolean;
    maxSends: number;
  },
) {
  const { action, region, product, zip, onlyUnnotified, maxSends } = params;

  let countQuery = supabase
    .from("leads")
    .select("id", { count: "exact", head: true });

  if (region !== "all") countQuery = countQuery.eq("region", region);
  if (product !== "all") countQuery = countQuery.eq("product", product);
  if (zip) countQuery = countQuery.eq("zip", zip);
  if (onlyUnnotified) countQuery = countQuery.eq("notified", false);

  const { count, error: countError } = await countQuery;

  if (countError) {
    throw new Error("Failed to count matching leads.");
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
    throw new Error("Failed to load matching leads.");
  }

  return {
    count: count ?? 0,
    leads: (leadsData ?? []) as LeadCandidate[],
  };
}

export async function executeNotificationCampaign(
  supabase: SupabaseClient,
  params: {
    campaignName: string;
    region: string;
    product: string;
    zip: string;
    messageTemplate: string;
    dryRun: boolean;
    leads: LeadCandidate[];
  },
) {
  const { campaignName, region, product, zip, messageTemplate, dryRun, leads } = params;

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

  const BATCH_SIZE = 50;
  for (let i = 0; i < leads.length; i += BATCH_SIZE) {
    const batch = leads.slice(i, i + BATCH_SIZE);

    const promises = batch.map(async (lead) => {
      if (lead.sms_opt_in !== true) {
        return {
          lead_id: lead.id,
          status: "skipped" as const,
          error: "sms_opt_in is false",
          sms_sid: null,
        };
      }

      if (dryRun) {
        return {
          lead_id: lead.id,
          status: "skipped" as const,
          error: "dry_run",
          sms_sid: null,
        };
      }

      try {
        const sms = await sendSms(lead.phone, messageTemplate);
        return {
          lead_id: lead.id,
          status: "sent" as const,
          error: null,
          sms_sid: sms.sid,
        };
      } catch (error) {
        return {
          lead_id: lead.id,
          status: "failed" as const,
          error: error instanceof Error ? error.message : "send failed",
          sms_sid: null,
        };
      }
    });

    const results = await Promise.allSettled(promises);

    for (const result of results) {
      if (result.status === "fulfilled") {
        const row = result.value;
        notificationRows.push({
          lead_id: row.lead_id,
          campaign_id: campaign.id,
          sms_sid: row.sms_sid,
          status: row.status,
          error: row.error,
        });

        if (row.status === "sent") {
          sentCount += 1;
          sentLeadIds.push(row.lead_id);
        } else if (row.status === "skipped") {
          skippedCount += 1;
        } else if (row.status === "failed") {
          failedCount += 1;
        }
      } else {
        failedCount += 1;
      }
    }
  }

  if (notificationRows.length > 0) {
    const { error: notificationsError } = await supabase
      .from("lead_notifications")
      .insert(notificationRows);
    if (notificationsError) {
      throw new Error("Failed to record notification logs.");
    }
  }

  if (sentLeadIds.length > 0) {
    const { error: updateError } = await supabase
      .from("leads")
      .update({ notified: true })
      .in("id", sentLeadIds);
    if (updateError) {
      throw new Error("Failed to update lead notification status.");
    }
  }

  return {
    campaign,
    sentCount,
    skippedCount,
    failedCount,
  };
}
