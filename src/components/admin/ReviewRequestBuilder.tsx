"use client";

import { useMemo, useState } from "react";

type LeadOption = {
  id: string;
  created_at: string;
  region: string;
  city: string | null;
  state: string | null;
  name: string | null;
  phone: string;
  email: string | null;
};

type ReviewRequest = {
  id: string;
  created_at: string;
  market: string;
  lead_id: string | null;
  contact_name: string | null;
  phone: string | null;
  email: string | null;
  channel: "sms" | "email" | null;
  message: string | null;
  status: "draft" | "sent" | "completed" | "failed" | null;
  completed_at: string | null;
  notes: string | null;
};

type Props = {
  initialMarket: string;
  leads: LeadOption[];
  existingRequests: ReviewRequest[];
};

const MARKETS = ["tx-spring", "tx-north-houston", "fl-brevard"] as const;
const COMPLIANT_SMS_TEMPLATE =
  "Thanks for reaching out. If we were helpful, would you leave us a quick review? It helps local homeowners find us.";
const COMPLIANT_EMAIL_TEMPLATE =
  "Thanks again for reaching out to us. If we were helpful, would you leave us a quick review? It helps local homeowners find us.";

export default function ReviewRequestBuilder({
  initialMarket,
  leads,
  existingRequests,
}: Props) {
  const [market, setMarket] = useState(initialMarket);
  const [leadId, setLeadId] = useState("");
  const [channel, setChannel] = useState<"sms" | "email">("sms");
  const [contactName, setContactName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState(COMPLIANT_SMS_TEMPLATE);
  const [notes, setNotes] = useState("");
  const [saveMessage, setSaveMessage] = useState("");
  const [rows, setRows] = useState(existingRequests);

  const matchingLeads = useMemo(
    () => leads.filter((lead) => lead.region === market),
    [leads, market],
  );

  function applyLead(nextLeadId: string) {
    setLeadId(nextLeadId);
    const selectedLead = matchingLeads.find((lead) => lead.id === nextLeadId);
    if (!selectedLead) return;
    setContactName(selectedLead.name ?? "");
    setPhone(selectedLead.phone ?? "");
    setEmail(selectedLead.email ?? "");
  }

  function generateTemplate() {
    setMessage(channel === "sms" ? COMPLIANT_SMS_TEMPLATE : COMPLIANT_EMAIL_TEMPLATE);
  }

  async function saveDraft() {
    setSaveMessage("Saving...");
    try {
      const response = await fetch("/api/admin/seo/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          market,
          lead_id: leadId || null,
          contact_name: contactName || null,
          phone: phone || null,
          email: email || null,
          channel,
          message,
          status: "draft",
          notes: notes || null,
        }),
      });

      const data = (await response.json()) as {
        ok?: boolean;
        error?: string;
        review?: ReviewRequest;
      };
      if (!response.ok || !data.ok || !data.review) {
        setSaveMessage(data.error ?? "Failed to save.");
        return;
      }

      setRows((prev) => [data.review!, ...prev]);
      setSaveMessage("Saved");
    } catch {
      setSaveMessage("Failed to save.");
    }
  }

  return (
    <section className="space-y-6">
      <div className="rounded-xl border border-black/10 p-4 dark:border-white/15">
        <h2 className="text-xl font-semibold">Review Request Builder</h2>
        <p className="mt-2 text-sm text-black/70 dark:text-white/70">
          Creates compliant draft copy only. This module does not send SMS or email.
        </p>

        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <label className="block text-sm">
            <span className="mb-1 block font-medium">Market</span>
            <select
              value={market}
              onChange={(event) => setMarket(event.target.value)}
              className="w-full rounded-md border border-black/20 bg-transparent px-3 py-2 dark:border-white/25"
            >
              {MARKETS.map((marketOption) => (
                <option key={marketOption} value={marketOption}>
                  {marketOption}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm sm:col-span-2">
            <span className="mb-1 block font-medium">
              Lead (optional, last 30 days for selected market)
            </span>
            <select
              value={leadId}
              onChange={(event) => applyLead(event.target.value)}
              className="w-full rounded-md border border-black/20 bg-transparent px-3 py-2 dark:border-white/25"
            >
              <option value="">No lead selected</option>
              {matchingLeads.map((lead) => (
                <option key={lead.id} value={lead.id}>
                  {lead.name ?? "Unknown name"} - {lead.phone} - {lead.city ?? "Unknown city"}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium">Channel</span>
            <select
              value={channel}
              onChange={(event) => setChannel(event.target.value as "sms" | "email")}
              className="w-full rounded-md border border-black/20 bg-transparent px-3 py-2 dark:border-white/25"
            >
              <option value="sms">sms</option>
              <option value="email">email</option>
            </select>
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium">Contact Name</span>
            <input
              value={contactName}
              onChange={(event) => setContactName(event.target.value)}
              className="w-full rounded-md border border-black/20 bg-transparent px-3 py-2 dark:border-white/25"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium">Phone</span>
            <input
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              className="w-full rounded-md border border-black/20 bg-transparent px-3 py-2 dark:border-white/25"
            />
          </label>
          <label className="block text-sm sm:col-span-2">
            <span className="mb-1 block font-medium">Email</span>
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-md border border-black/20 bg-transparent px-3 py-2 dark:border-white/25"
            />
          </label>
          <label className="block text-sm sm:col-span-2 lg:col-span-3">
            <span className="mb-1 block font-medium">Message</span>
            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              className="min-h-24 w-full rounded-md border border-black/20 bg-transparent px-3 py-2 dark:border-white/25"
            />
          </label>
          <label className="block text-sm sm:col-span-2 lg:col-span-3">
            <span className="mb-1 block font-medium">Notes</span>
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              className="min-h-20 w-full rounded-md border border-black/20 bg-transparent px-3 py-2 dark:border-white/25"
            />
          </label>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={generateTemplate}
            className="inline-flex items-center justify-center rounded-md border border-black/20 px-4 py-2 text-sm font-medium hover:bg-black/5 dark:border-white/20 dark:hover:bg-white/10"
          >
            Generate Compliant Template
          </button>
          <button
            type="button"
            onClick={() => void saveDraft()}
            className="inline-flex items-center justify-center rounded-md border border-foreground bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90"
          >
            Save Draft
          </button>
          {saveMessage ? (
            <span className="text-sm text-black/70 dark:text-white/70">{saveMessage}</span>
          ) : null}
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-black/10 dark:border-white/15">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-black/10 dark:border-white/15">
            <tr>
              <th className="px-3 py-2">created_at</th>
              <th className="px-3 py-2">market</th>
              <th className="px-3 py-2">channel</th>
              <th className="px-3 py-2">contact</th>
              <th className="px-3 py-2">status</th>
              <th className="px-3 py-2">message</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-black/5 align-top dark:border-white/10">
                <td className="px-3 py-2">{new Date(row.created_at).toLocaleString()}</td>
                <td className="px-3 py-2">{row.market}</td>
                <td className="px-3 py-2">{row.channel ?? ""}</td>
                <td className="px-3 py-2">
                  {row.contact_name ?? ""} {row.phone ? `(${row.phone})` : ""}
                </td>
                <td className="px-3 py-2">{row.status ?? ""}</td>
                <td className="px-3 py-2">{row.message ?? ""}</td>
              </tr>
            ))}
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-3 py-4 text-center text-black/60 dark:text-white/60">
                  No review request drafts yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}
