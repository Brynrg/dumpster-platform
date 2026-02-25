"use client";

import { useMemo, useState } from "react";
import {
  calculatePricingModel,
  type PricingModelInput,
} from "@/lib/pricing/model";

type PricingConfig = {
  region: string;
  fuel_price: number | null;
  avg_mpg: number | null;
  avg_distance_miles: number | null;
  labor_cost: number | null;
  overhead_per_day: number | null;
  dump_margin_percent: number | null;
  trailer_payment: number | null;
  trailer_term_months: number | null;
  maintenance_per_month: number | null;
  target_utilization: number | null;
  notes: string | null;
};

type DemandCounts = Record<string, { d30: number; d60: number; d90: number }>;

type Props = {
  initialConfigs: PricingConfig[];
  dumpCostByRegion: Record<string, number>;
  demandCounts: DemandCounts;
};

type RegionForm = {
  fuel_price: string;
  avg_mpg: string;
  avg_distance_miles: string;
  labor_cost: string;
  overhead_per_day: string;
  dump_margin_percent: string;
  trailer_payment: string;
  trailer_term_months: string;
  maintenance_per_month: string;
  target_utilization: string;
  notes: string;
  product: string;
  dump_cost: string;
};

function toInput(config: PricingConfig, dumpCost: number): RegionForm {
  return {
    fuel_price: String(config.fuel_price ?? 0),
    avg_mpg: String(config.avg_mpg ?? 10),
    avg_distance_miles: String(config.avg_distance_miles ?? 25),
    labor_cost: String(config.labor_cost ?? 0),
    overhead_per_day: String(config.overhead_per_day ?? 0),
    dump_margin_percent: String(config.dump_margin_percent ?? 0),
    trailer_payment: String(config.trailer_payment ?? 0),
    trailer_term_months: String(config.trailer_term_months ?? 60),
    maintenance_per_month: String(config.maintenance_per_month ?? 0),
    target_utilization: String(config.target_utilization ?? 0),
    notes: config.notes ?? "",
    product: "dump_trailer",
    dump_cost: String(dumpCost),
  };
}

function toNumber(value: string, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function advisoryText(demand: number, breakEven: number): string {
  if (breakEven <= 0) {
    return "Break-even unavailable with current inputs";
  }

  if (demand < breakEven * 0.9) {
    return "Demand below purchase threshold";
  }
  if (demand <= breakEven * 1.1) {
    return "Borderline — monitor demand";
  }
  return "Demand supports equipment purchase";
}

export default function PricingEditor({
  initialConfigs,
  dumpCostByRegion,
  demandCounts,
}: Props) {
  const regions = initialConfigs.map((config) => config.region);
  const [region, setRegion] = useState(regions[0] ?? "tx-spring");
  const [formByRegion, setFormByRegion] = useState<Record<string, RegionForm>>(
    () =>
      Object.fromEntries(
        initialConfigs.map((config) => [
          config.region,
          toInput(config, dumpCostByRegion[config.region] ?? 0),
        ]),
      ),
  );
  const [saveMessage, setSaveMessage] = useState("");
  const [calcRequested, setCalcRequested] = useState(false);

  const form = formByRegion[region] ?? toInput(
    {
      region,
      fuel_price: null,
      avg_mpg: null,
      avg_distance_miles: null,
      labor_cost: null,
      overhead_per_day: null,
      dump_margin_percent: null,
      trailer_payment: null,
      trailer_term_months: null,
      maintenance_per_month: null,
      target_utilization: null,
      notes: "",
    },
    dumpCostByRegion[region] ?? 0,
  );

  function setField<K extends keyof RegionForm>(key: K, value: RegionForm[K]) {
    setFormByRegion((prev) => ({
      ...prev,
      [region]: {
        ...form,
        [key]: value,
      },
    }));
  }

  const selectedDemand = demandCounts[`${region}:${form.product}`] ?? {
    d30: 0,
    d60: 0,
    d90: 0,
  };

  const outputs = useMemo(() => {
    const modelInput: PricingModelInput = {
      fuel_price: toNumber(form.fuel_price),
      avg_mpg: toNumber(form.avg_mpg, 1),
      avg_distance_miles: toNumber(form.avg_distance_miles),
      labor_cost: toNumber(form.labor_cost),
      overhead_per_day: toNumber(form.overhead_per_day),
      dump_cost: toNumber(form.dump_cost),
      dump_margin_percent: toNumber(form.dump_margin_percent),
      trailer_payment: toNumber(form.trailer_payment),
      trailer_term_months: toNumber(form.trailer_term_months),
      maintenance_per_month: toNumber(form.maintenance_per_month),
      monthly_demand: selectedDemand.d30,
    };
    return calculatePricingModel(modelInput);
  }, [form, selectedDemand.d30]);

  async function saveConfig() {
    setSaveMessage("Saving...");
    try {
      const response = await fetch("/api/admin/pricing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          region,
          fuel_price: toNumber(form.fuel_price),
          avg_mpg: toNumber(form.avg_mpg),
          avg_distance_miles: toNumber(form.avg_distance_miles),
          labor_cost: toNumber(form.labor_cost),
          overhead_per_day: toNumber(form.overhead_per_day),
          dump_margin_percent: toNumber(form.dump_margin_percent),
          trailer_payment: toNumber(form.trailer_payment),
          trailer_term_months: toNumber(form.trailer_term_months),
          maintenance_per_month: toNumber(form.maintenance_per_month),
          target_utilization: toNumber(form.target_utilization),
          notes: form.notes,
        }),
      });
      const data = (await response.json()) as { ok?: boolean; error?: string };
      if (!response.ok || !data.ok) {
        setSaveMessage(data.error ?? "Failed to save.");
        return;
      }
      setSaveMessage("Saved");
    } catch {
      setSaveMessage("Failed to save.");
    }
  }

  return (
    <section className="mt-6 rounded-xl border border-black/10 p-6 dark:border-white/15">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Region</span>
          <select
            value={region}
            onChange={(event) => {
              setRegion(event.target.value);
              setCalcRequested(false);
            }}
            className="w-full rounded-md border border-black/20 bg-transparent px-3 py-2 text-sm dark:border-white/25"
          >
            {regions.map((regionValue) => (
              <option key={regionValue} value={regionValue}>
                {regionValue}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-medium">
            Product for demand advisor
          </span>
          <select
            value={form.product}
            onChange={(event) => setField("product", event.target.value)}
            className="w-full rounded-md border border-black/20 bg-transparent px-3 py-2 text-sm dark:border-white/25"
          >
            <option value="dump_trailer">dump_trailer</option>
            <option value="dumpster_20">dumpster_20</option>
            <option value="dumpster_30">dumpster_30</option>
            <option value="not_sure">not_sure</option>
          </select>
        </label>

        {[
          "fuel_price",
          "avg_mpg",
          "avg_distance_miles",
          "labor_cost",
          "overhead_per_day",
          "dump_margin_percent",
          "trailer_payment",
          "trailer_term_months",
          "maintenance_per_month",
          "target_utilization",
          "dump_cost",
        ].map((field) => (
          <label key={field} className="block">
            <span className="mb-1 block text-sm font-medium">{field}</span>
            <input
              value={form[field as keyof RegionForm]}
              onChange={(event) =>
                setField(field as keyof RegionForm, event.target.value)
              }
              className="w-full rounded-md border border-black/20 bg-transparent px-3 py-2 text-sm dark:border-white/25"
            />
          </label>
        ))}
      </div>

      <label className="mt-4 block">
        <span className="mb-1 block text-sm font-medium">notes</span>
        <textarea
          value={form.notes}
          onChange={(event) => setField("notes", event.target.value)}
          className="min-h-20 w-full rounded-md border border-black/20 bg-transparent px-3 py-2 text-sm dark:border-white/25"
        />
      </label>

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={saveConfig}
          className="inline-flex items-center justify-center rounded-md border border-foreground bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90"
        >
          Save Config
        </button>
        <button
          type="button"
          onClick={() => setCalcRequested(true)}
          className="inline-flex items-center justify-center rounded-md border border-black/20 px-4 py-2 text-sm font-medium hover:bg-black/5 dark:border-white/20 dark:hover:bg-white/10"
        >
          Calculate
        </button>
        {saveMessage ? (
          <span className="self-center text-sm text-black/70 dark:text-white/70">
            {saveMessage}
          </span>
        ) : null}
      </div>

      {calcRequested ? (
        <div className="mt-6 grid gap-3 rounded-lg border border-black/10 p-4 text-sm dark:border-white/15">
          <p>
            Operating cost per job:{" "}
            <strong>${outputs.operatingCost.toFixed(2)}</strong>
          </p>
          <p>
            Suggested rental price:{" "}
            <strong>${outputs.suggestedPrice.toFixed(2)}</strong>
          </p>
          <p>
            Break-even rentals per month:{" "}
            <strong>{outputs.breakEvenRentals.toFixed(2)}</strong>
          </p>
          <p>
            Estimated payback period:{" "}
            <strong>
              {outputs.estimatedPaybackMonths > 0
                ? `${outputs.estimatedPaybackMonths.toFixed(1)} months`
                : "n/a"}
            </strong>
          </p>
          <p>
            Demand (30/60/90 days):{" "}
            <strong>
              {selectedDemand.d30} / {selectedDemand.d60} / {selectedDemand.d90}
            </strong>
          </p>
          <p className="font-medium">
            {advisoryText(selectedDemand.d30, outputs.breakEvenRentals)}
          </p>
        </div>
      ) : null}
    </section>
  );
}
