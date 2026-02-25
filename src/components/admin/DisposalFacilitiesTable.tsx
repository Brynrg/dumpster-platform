"use client";

import type { FormEvent } from "react";
import { useState } from "react";

type RateRow = {
  id: string;
  facility_id: string;
  material_category: string | null;
  price: number | null;
  unit: string | null;
  effective_date: string | null;
  source_url: string | null;
  source_notes: string | null;
};

type FacilityRow = {
  id: string;
  market: string;
  name: string;
  facility_type: string | null;
  address1: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  phone: string | null;
  website: string | null;
  commercial_allowed: boolean | null;
  notes: string | null;
  last_verified: string | null;
  rates: RateRow[];
};

type Props = {
  facilities: FacilityRow[];
};

type SaveState = {
  [id: string]: string;
};

export default function DisposalFacilitiesTable({ facilities }: Props) {
  const [saveState, setSaveState] = useState<SaveState>({});

  async function saveFacility(
    facility: FacilityRow,
    formData: FormData,
  ): Promise<void> {
    setSaveState((prev) => ({ ...prev, [facility.id]: "Saving..." }));

    const payload = {
      id: facility.id,
      market: facility.market,
      name: facility.name,
      facility_type: facility.facility_type ?? "",
      address1: facility.address1 ?? "",
      city: facility.city ?? "",
      state: facility.state ?? "",
      zip: facility.zip ?? "",
      phone: String(formData.get("phone") ?? ""),
      website: String(formData.get("website") ?? ""),
      notes: String(formData.get("notes") ?? ""),
      last_verified: String(formData.get("last_verified") ?? ""),
      commercial_allowed: facility.commercial_allowed ?? false,
    };

    try {
      const response = await fetch("/api/admin/disposal/facility", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await response.json()) as { ok?: boolean; error?: string };
      if (!response.ok || !data.ok) {
        setSaveState((prev) => ({
          ...prev,
          [facility.id]: data.error ?? "Failed to save.",
        }));
        return;
      }

      setSaveState((prev) => ({ ...prev, [facility.id]: "Saved" }));
    } catch {
      setSaveState((prev) => ({ ...prev, [facility.id]: "Failed to save." }));
    }
  }

  return (
    <div className="space-y-4">
      {facilities.map((facility) => (
        <details
          key={facility.id}
          className="rounded-xl border border-black/10 p-4 dark:border-white/15"
        >
          <summary className="cursor-pointer list-none">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-lg font-semibold">{facility.name}</p>
                <p className="text-sm text-black/70 dark:text-white/70">
                  {facility.market} • {facility.facility_type ?? "Unknown"} •{" "}
                  {[facility.city, facility.state].filter(Boolean).join(", ")}
                </p>
              </div>
              <span className="text-sm text-black/60 dark:text-white/60">
                Rates: {facility.rates.length}
              </span>
            </div>
          </summary>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <form
              className="space-y-3 rounded-lg border border-black/10 p-3 dark:border-white/15"
              onSubmit={(event: FormEvent<HTMLFormElement>) => {
                event.preventDefault();
                const formData = new FormData(event.currentTarget);
                void saveFacility(facility, formData);
              }}
            >
              <h3 className="font-medium">Edit Facility</h3>
              <label className="block text-sm">
                <span className="mb-1 block">Phone</span>
                <input
                  name="phone"
                  defaultValue={facility.phone ?? ""}
                  className="w-full rounded-md border border-black/20 bg-transparent px-3 py-2 dark:border-white/25"
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block">Website</span>
                <input
                  name="website"
                  defaultValue={facility.website ?? ""}
                  className="w-full rounded-md border border-black/20 bg-transparent px-3 py-2 dark:border-white/25"
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block">Last Verified</span>
                <input
                  type="date"
                  name="last_verified"
                  defaultValue={facility.last_verified ?? ""}
                  className="w-full rounded-md border border-black/20 bg-transparent px-3 py-2 dark:border-white/25"
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block">Notes</span>
                <textarea
                  name="notes"
                  defaultValue={facility.notes ?? ""}
                  className="min-h-24 w-full rounded-md border border-black/20 bg-transparent px-3 py-2 dark:border-white/25"
                />
              </label>
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-md border border-foreground bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90"
              >
                Save Facility
              </button>
              {saveState[facility.id] ? (
                <p className="text-sm text-black/70 dark:text-white/70">
                  {saveState[facility.id]}
                </p>
              ) : null}
            </form>

            <section className="rounded-lg border border-black/10 p-3 dark:border-white/15">
              <h3 className="font-medium">Rates</h3>
              <div className="mt-2 space-y-2">
                {facility.rates.length === 0 ? (
                  <p className="text-sm text-black/70 dark:text-white/70">
                    No rates stored.
                  </p>
                ) : (
                  facility.rates.map((rate) => (
                    <article
                      key={rate.id}
                      className="rounded-md border border-black/10 p-3 text-sm dark:border-white/15"
                    >
                      <p className="font-medium">{rate.material_category ?? "Unknown"}</p>
                      <p>
                        {rate.price ?? "-"} {rate.unit ?? ""}
                        {rate.effective_date ? ` • ${rate.effective_date}` : ""}
                      </p>
                      <p className="text-black/70 dark:text-white/70">
                        {rate.source_notes ?? "Call to verify"}
                      </p>
                      {rate.source_url ? (
                        <a
                          href={rate.source_url}
                          target="_blank"
                          rel="noreferrer"
                          className="underline underline-offset-4"
                        >
                          Source
                        </a>
                      ) : null}
                    </article>
                  ))
                )}
              </div>
            </section>
          </div>
        </details>
      ))}
    </div>
  );
}
