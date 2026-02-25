"use client";

import { useState } from "react";
import Input from "@/components/ui/Input";
import { track } from "@/lib/analytics";

type StoredRequest = {
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

type NotifyForm = {
  name: string;
  phone: string;
  email: string;
  sms_opt_in: boolean;
};

function isValidPhone(phone: string) {
  return /^\+?[0-9()\-\s]{10,20}$/.test(phone.trim());
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export default function UnavailablePage() {
  const [request] = useState<StoredRequest>(() => {
    if (typeof window === "undefined") return {};
    const raw = sessionStorage.getItem("rental_request_v1");
    if (!raw) return {};

    try {
      return JSON.parse(raw) as StoredRequest;
    } catch {
      return {};
    }
  });
  const [form, setForm] = useState<NotifyForm>(() => ({
    name: request.name ?? "",
    phone: request.phone ?? "",
    email: request.email ?? "",
    sms_opt_in: false,
  }));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  function setField<K extends keyof NotifyForm>(field: K, value: NotifyForm[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function validate() {
    const nextErrors: Record<string, string> = {};

    if (!form.name.trim()) nextErrors.name = "Name is required.";
    if (!form.phone.trim()) nextErrors.phone = "Phone is required.";
    if (form.phone.trim() && !isValidPhone(form.phone)) {
      nextErrors.phone = "Enter a valid phone number.";
    }
    if (form.email.trim() && !isValidEmail(form.email)) {
      nextErrors.email = "Enter a valid email or leave blank.";
    }
    if (!form.sms_opt_in) {
      nextErrors.sms_opt_in = "SMS opt-in is required.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;

    track("notify_opt_in", {
      region: request.region ?? "unknown",
      product: request.product ?? "unknown",
      zip: request.zip ?? "",
    });

    const leadPayload = {
      ...request,
      ...form,
      sms_opt_in: true,
    };

    try {
      const response = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(leadPayload),
      });

      const data = (await response.json()) as { ok?: boolean };
      if (!response.ok || !data.ok) {
        throw new Error("Lead API failed");
      }
      setSuccess(true);
    } catch {
      const rawQueue = localStorage.getItem("lead_queue_v1");
      let queue: unknown[] = [];

      if (rawQueue) {
        try {
          const parsed = JSON.parse(rawQueue);
          if (Array.isArray(parsed)) {
            queue = parsed;
          }
        } catch {
          queue = [];
        }
      }

      queue.push({
        ...leadPayload,
        created_at: new Date().toISOString(),
      });
      localStorage.setItem("lead_queue_v1", JSON.stringify(queue));
      console.info("Lead API failed; stored lead in localStorage queue.");
      setSuccess(true);
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-3xl font-semibold tracking-tight">Request Update</h1>
      <p className="mt-3 text-black/75 dark:text-white/75">
        No units available in your area for the selected dates.
      </p>

      {success ? (
        <section className="mt-6 rounded-xl border border-black/10 p-6 dark:border-white/15">
          <p className="font-medium">
            You&apos;re on the notification list. We&apos;ll text you when availability
            opens.
          </p>
        </section>
      ) : (
        <section className="mt-6 space-y-4 rounded-xl border border-black/10 p-6 dark:border-white/15">
          <h2 className="text-xl font-semibold">Notify Me</h2>
          <Input
            label="Name"
            value={form.name}
            onChange={(e) => setField("name", e.target.value)}
            error={errors.name}
          />
          <Input
            label="Phone"
            value={form.phone}
            onChange={(e) => setField("phone", e.target.value)}
            error={errors.phone}
          />
          <Input
            label="Email (optional)"
            type="email"
            value={form.email}
            onChange={(e) => setField("email", e.target.value)}
            error={errors.email}
          />
          <label className="flex items-start gap-2 rounded-md border border-black/10 p-3 dark:border-white/15">
            <input
              type="checkbox"
              checked={form.sms_opt_in}
              onChange={(e) => setField("sms_opt_in", e.target.checked)}
              className="mt-1"
            />
            <span className="text-sm">
              I agree to receive SMS updates about this request.
            </span>
          </label>
          {errors.sms_opt_in ? (
            <span className="block text-xs text-red-600">{errors.sms_opt_in}</span>
          ) : null}

          <button
            type="button"
            onClick={handleSubmit}
            className="inline-flex items-center justify-center rounded-md border border-foreground bg-foreground px-4 py-2 text-sm font-medium text-background transition-colors hover:opacity-90"
          >
            Join Notification List
          </button>
        </section>
      )}
    </main>
  );
}
