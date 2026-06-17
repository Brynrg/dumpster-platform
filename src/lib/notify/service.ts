import { getSupabaseAdmin } from "@/lib/supabase/server";
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

export async function countMatchingLeads(params: {
  region: string;
  product: string;
  zip: string;
  onlyUnnotified: boolean;
}) {
  const supabase = getSupabaseAdmin();
  let countQuery = supabase
    .from("leads")
    .select("id", { count: "exact", head: true });

  if (params.region !== "all") countQuery = countQuery.eq("region", params.region);
  if (params.product !== "all") countQuery = countQuery.eq("product", params.product);
  if (params.zip) countQuery = countQuery.eq("zip", params.zip);
  if (params.onlyUnnotified) countQuery = countQuery.eq("notified", false);

  const { count, error } = await countQuery;
  if (error) throw new Error("Failed to count matching leads.");
  return count ?? 0;
}

export async function getMatchingLeads(params: {
  action: "preview" | "execute";
  region: string;
  product: string;
  zip: string;
  onlyUnnotified: boolean;
  maxSends: number;
}) {
  const supabase = getSupabaseAdmin();
  let leadQuery = supabase
    .from("leads")
    .select("id,region,product,zip,phone,sms_opt_in,notified")
    .order("created_at", { ascending: true })
    .limit(params.action === "preview" ? 10 : params.maxSends);

  if (params.region !== "all") leadQuery = leadQuery.eq("region", params.region);
  if (params.product !== "all") leadQuery = leadQuery.eq("product", params.product);
  if (params.zip) leadQuery = leadQuery.eq("zip", params.zip);
  if (params.onlyUnnotified) leadQuery = leadQuery.eq("notified", false);

  const { data, error } = await leadQuery;
  if (error) throw new Error("Failed to load matching leads.");
  return (data ?? []) as LeadCandidate[];
}

export async function createNotificationCampaign(params: {
  name: string;
  region: string;
  product: string;
  zip: string;
  message: string;
  dryRun: boolean;
}) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("notification_campaigns")
    .insert({
      name: params.name,
      region: params.region === "all" ? null : params.region,
      product: params.product === "all" ? null : params.product,
      zip: params.zip || null,
      message: params.message,
      dry_run: params.dryRun,
    })
    .select("id")
    .single();

  if (error || !data) throw new Error("Failed to create notification campaign.");
  return data.id;
}

export async function processNotifications(params: {
  campaignId: string;
  leads: LeadCandidate[];
  messageTemplate: string;
  dryRun: boolean;
}) {
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
  for (let i = 0; i < params.leads.length; i += BATCH_SIZE) {
    const batch = params.leads.slice(i, i + BATCH_SIZE);

    const promises = batch.map(async (lead) => {
      if (lead.sms_opt_in !== true) {
        return {
          lead_id: lead.id,
          status: "skipped" as const,
          error: "sms_opt_in is false",
          sms_sid: null,
        };
      }

      if (params.dryRun) {
        return {
          lead_id: lead.id,
          status: "skipped" as const,
          error: "dry_run",
          sms_sid: null,
        };
      }

      try {
        const sms = await sendSms(lead.phone, params.messageTemplate);
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
          campaign_id: params.campaignId,
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

  return { notificationRows, sentLeadIds, sentCount, skippedCount, failedCount };
}

export async function saveNotificationResults(params: {
  notificationRows: Array<{ lead_id: string; campaign_id: string; sms_sid: string | null; status: "sent" | "skipped" | "failed"; error: string | null; }>;
  sentLeadIds: string[];
}) {
  const supabase = getSupabaseAdmin();
  if (params.notificationRows.length > 0) {
    const { error } = await supabase
      .from("lead_notifications")
      .insert(params.notificationRows);
    if (error) throw new Error("Failed to record notification logs.");
  }

  if (params.sentLeadIds.length > 0) {
    const { error } = await supabase
      .from("leads")
      .update({ notified: true })
      .in("id", params.sentLeadIds);
    if (error) throw new Error("Failed to update lead notification status.");
  }
}
