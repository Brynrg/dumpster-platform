"use client";

import { useState } from "react";
import Input from "@/components/ui/Input";

type PreviewRecipient = {
  leadId: string;
  region: string;
  product: string;
  zip: string;
  phone: string;
  smsOptIn: boolean;
};

type PreviewResponse = {
  ok: boolean;
  error?: string;
  totalMatches?: number;
  previewRecipients?: PreviewRecipient[];
};

type ExecuteResponse = {
  ok: boolean;
  error?: string;
  campaignId?: string;
  totalMatches?: number;
  processed?: number;
  sent?: number;
  skipped?: number;
  failed?: number;
  dryRun?: boolean;
  maxSends?: number;
};

type NotifyForm = {
  campaignName: string;
  region: string;
  product: string;
  zip: string;
  onlyUnnotified: boolean;
  messageTemplate: string;
  dryRun: boolean;
  maxSends: number;
};

const initialForm: NotifyForm = {
  campaignName: "",
  region: "all",
  product: "all",
  zip: "",
  onlyUnnotified: true,
  messageTemplate:
    "Availability update: units may now be open in your area. Reply STOP to opt out.",
  dryRun: true,
  maxSends: 25,
};

export default function AdminNotifyPage() {
  const [form, setForm] = useState<NotifyForm>(initialForm);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [preview, setPreview] = useState<PreviewResponse | null>(null);
  const [execution, setExecution] = useState<ExecuteResponse | null>(null);

  function setField<K extends keyof NotifyForm>(key: K, value: NotifyForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function submit(action: "preview" | "execute") {
    setError("");
    setIsSubmitting(true);
    if (action === "preview") setExecution(null);
    if (action === "execute") setPreview(null);

    try {
      const response = await fetch("/api/admin/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, action }),
      });
      const data = (await response.json()) as PreviewResponse & ExecuteResponse;
      if (!response.ok || !data.ok) {
        setError(data.error ?? "Request failed.");
        return;
      }

      if (action === "preview") {
        setPreview(data);
      } else {
        setExecution(data);
      }
    } catch {
      setError("Request failed.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="text-3xl font-semibold tracking-tight">Admin Notify</h1>

      <section className="mt-6 rounded-xl border border-black/10 p-6 dark:border-white/15">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Campaign Name"
            value={form.campaignName}
            onChange={(event) => setField("campaignName", event.target.value)}
          />
          <Input
            label="Zip (optional exact match)"
            value={form.zip}
            onChange={(event) => setField("zip", event.target.value)}
          />
          <label className="block">
            <span className="mb-1 block text-sm font-medium">Region</span>
            <select
              value={form.region}
              onChange={(event) => setField("region", event.target.value)}
              className="w-full rounded-md border border-black/20 bg-transparent px-3 py-2 text-sm dark:border-white/25"
            >
              <option value="all">all</option>
              <option value="tx-spring">tx-spring</option>
              <option value="tx-north-houston">tx-north-houston</option>
              <option value="fl-brevard">fl-brevard</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium">Product</span>
            <select
              value={form.product}
              onChange={(event) => setField("product", event.target.value)}
              className="w-full rounded-md border border-black/20 bg-transparent px-3 py-2 text-sm dark:border-white/25"
            >
              <option value="all">all</option>
              <option value="dump_trailer">dump_trailer</option>
              <option value="dumpster_20">dumpster_20</option>
              <option value="dumpster_30">dumpster_30</option>
              <option value="not_sure">not_sure</option>
            </select>
          </label>
          <Input
            label="Max Sends (hard cap 200)"
            type="number"
            min={1}
            max={200}
            value={String(form.maxSends)}
            onChange={(event) =>
              setField("maxSends", Number(event.target.value || "25"))
            }
          />
          <div className="flex flex-col gap-2 pt-6">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.onlyUnnotified}
                onChange={(event) =>
                  setField("onlyUnnotified", event.target.checked)
                }
              />
              <span className="text-sm">Only unnotified</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.dryRun}
                onChange={(event) => setField("dryRun", event.target.checked)}
              />
              <span className="text-sm">Dry Run</span>
            </label>
          </div>
        </div>

        <label className="mt-4 block">
          <span className="mb-1 block text-sm font-medium">Message Template</span>
          <textarea
            value={form.messageTemplate}
            onChange={(event) => setField("messageTemplate", event.target.value)}
            className="min-h-28 w-full rounded-md border border-black/20 bg-transparent px-3 py-2 text-sm dark:border-white/25"
          />
        </label>

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => submit("preview")}
            disabled={isSubmitting}
            className="inline-flex items-center justify-center rounded-md border border-black/20 px-4 py-2 text-sm font-medium hover:bg-black/5 disabled:opacity-60 dark:border-white/20 dark:hover:bg-white/10"
          >
            Preview
          </button>
          <button
            type="button"
            onClick={() => submit("execute")}
            disabled={isSubmitting}
            className="inline-flex items-center justify-center rounded-md border border-foreground bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90 disabled:opacity-60"
          >
            Execute Campaign
          </button>
        </div>

        {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
      </section>

      {preview?.ok ? (
        <section className="mt-6 rounded-xl border border-black/10 p-6 dark:border-white/15">
          <h2 className="text-xl font-semibold">Preview</h2>
          <p className="mt-2 text-sm">
            Matches: <strong>{preview.totalMatches ?? 0}</strong>
          </p>
          <div className="mt-4 space-y-2 text-sm">
            {(preview.previewRecipients ?? []).map((recipient) => (
              <div
                key={recipient.leadId}
                className="rounded-md border border-black/10 px-3 py-2 dark:border-white/15"
              >
                {recipient.region} / {recipient.product} / {recipient.zip || "-"} /{" "}
                {recipient.phone} / opt-in: {String(recipient.smsOptIn)}
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {execution?.ok ? (
        <section className="mt-6 rounded-xl border border-black/10 p-6 dark:border-white/15">
          <h2 className="text-xl font-semibold">Execution Result</h2>
          <p className="mt-2 text-sm">Campaign ID: {execution.campaignId}</p>
          <p className="mt-1 text-sm">
            Matched: {execution.totalMatches} / Processed: {execution.processed}
          </p>
          <p className="mt-1 text-sm">
            Sent: {execution.sent} / Skipped: {execution.skipped} / Failed:{" "}
            {execution.failed}
          </p>
          <p className="mt-1 text-sm">
            Dry run: {String(execution.dryRun)} / Max sends: {execution.maxSends}
          </p>
        </section>
      ) : null}
    </main>
  );
}
