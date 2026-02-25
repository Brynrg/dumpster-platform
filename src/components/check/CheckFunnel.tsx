"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Input from "@/components/ui/Input";
import { track } from "@/lib/analytics";

type Product = "dump_trailer" | "dumpster_20" | "dumpster_30" | "not_sure" | "";
type Duration = "1-3_days" | "4-7_days" | "8+_days" | "";
type Urgency = "asap" | "this_week" | "flexible" | "";
type MaterialType =
  | "household_junk"
  | "construction_debris"
  | "yard_waste"
  | "roofing"
  | "mixed"
  | "";

type FormState = {
  region: string;
  product: Product;
  street: string;
  city: string;
  state: string;
  zip: string;
  delivery_date: string;
  duration: Duration;
  urgency: Urgency;
  material_type: MaterialType;
  notes: string;
  name: string;
  phone: string;
  email: string;
  sms_opt_in: boolean;
};

const initialState: FormState = {
  region: "",
  product: "",
  street: "",
  city: "",
  state: "",
  zip: "",
  delivery_date: "",
  duration: "",
  urgency: "",
  material_type: "",
  notes: "",
  name: "",
  phone: "",
  email: "",
  sms_opt_in: false,
};

function isValidPhone(phone: string) {
  return /^\+?[0-9()\-\s]{10,20}$/.test(phone.trim());
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

type CheckFunnelProps = {
  initialRegion: string;
};

export default function CheckFunnel({ initialRegion }: CheckFunnelProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>(() => ({
    ...initialState,
    region: initialRegion,
  }));
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    track("start_check", { region: initialRegion || "unknown" });
  }, [initialRegion]);

  const progressLabel = useMemo(() => `Step ${step} of 6`, [step]);

  function setField<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function validateCurrentStep() {
    const nextErrors: Record<string, string> = {};

    if (step === 1 && !form.product) {
      nextErrors.product = "Select a product option.";
    }

    if (step === 2) {
      if (!form.street.trim()) nextErrors.street = "Street is required.";
      if (!form.city.trim()) nextErrors.city = "City is required.";
      if (!form.state.trim()) nextErrors.state = "State is required.";
      if (!form.zip.trim()) nextErrors.zip = "ZIP is required.";
    }

    if (step === 3) {
      if (!form.delivery_date) nextErrors.delivery_date = "Delivery date is required.";
      if (!form.duration) nextErrors.duration = "Duration is required.";
      if (!form.urgency) nextErrors.urgency = "Urgency is required.";
    }

    if (step === 4 && !form.material_type) {
      nextErrors.material_type = "Material type is required.";
    }

    if (step === 5) {
      if (!form.name.trim()) nextErrors.name = "Name is required.";
      if (!form.phone.trim()) nextErrors.phone = "Phone is required.";
      if (form.phone.trim() && !isValidPhone(form.phone)) {
        nextErrors.phone = "Enter a valid phone number.";
      }
      if (form.email.trim() && !isValidEmail(form.email)) {
        nextErrors.email = "Enter a valid email or leave blank.";
      }
      if (!form.sms_opt_in) {
        nextErrors.sms_opt_in = "SMS opt-in is required to proceed.";
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleNext() {
    if (!validateCurrentStep()) return;
    setStep((prev) => Math.min(prev + 1, 6));
  }

  function handleBack() {
    setErrors({});
    setStep((prev) => Math.max(prev - 1, 1));
  }

  function handleSubmit() {
    if (!validateCurrentStep()) return;

    track("submit_request", {
      region: form.region || "unknown",
      product: form.product,
      zip: form.zip,
    });

    sessionStorage.setItem("rental_request_v1", JSON.stringify(form));
    router.push("/unavailable");
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">Request a Rental</h1>
        <p className="mt-2 text-sm text-black/70 dark:text-white/70">{progressLabel}</p>
      </header>

      <section className="rounded-xl border border-black/10 p-6 dark:border-white/15">
        {step === 1 ? (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">1) Product Selection</h2>
            <label className="block">
              <span className="mb-1 block text-sm font-medium">Product</span>
              <select
                className="w-full rounded-md border border-black/20 bg-transparent px-3 py-2 text-sm outline-none focus:border-black dark:border-white/25 dark:focus:border-white"
                value={form.product}
                onChange={(e) => setField("product", e.target.value as Product)}
              >
                <option value="">Choose one</option>
                <option value="dump_trailer">Dump Trailer</option>
                <option value="dumpster_20">20-Yard Dumpster</option>
                <option value="dumpster_30">30-Yard Dumpster</option>
                <option value="not_sure">Not Sure Yet</option>
              </select>
              {errors.product ? (
                <span className="mt-1 block text-xs text-red-600">{errors.product}</span>
              ) : null}
            </label>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">2) Address</h2>
            <Input
              label="Street"
              value={form.street}
              onChange={(e) => setField("street", e.target.value)}
              error={errors.street}
            />
            <div className="grid gap-4 sm:grid-cols-3">
              <Input
                label="City"
                value={form.city}
                onChange={(e) => setField("city", e.target.value)}
                error={errors.city}
              />
              <Input
                label="State"
                value={form.state}
                onChange={(e) => setField("state", e.target.value.toUpperCase())}
                error={errors.state}
                maxLength={2}
              />
              <Input
                label="ZIP"
                value={form.zip}
                onChange={(e) => setField("zip", e.target.value)}
                error={errors.zip}
              />
            </div>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">3) Schedule</h2>
            <Input
              label="Delivery date"
              type="date"
              value={form.delivery_date}
              onChange={(e) => setField("delivery_date", e.target.value)}
              error={errors.delivery_date}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1 block text-sm font-medium">Duration</span>
                <select
                  className="w-full rounded-md border border-black/20 bg-transparent px-3 py-2 text-sm outline-none focus:border-black dark:border-white/25 dark:focus:border-white"
                  value={form.duration}
                  onChange={(e) => setField("duration", e.target.value as Duration)}
                >
                  <option value="">Choose duration</option>
                  <option value="1-3_days">1-3 days</option>
                  <option value="4-7_days">4-7 days</option>
                  <option value="8+_days">8+ days</option>
                </select>
                {errors.duration ? (
                  <span className="mt-1 block text-xs text-red-600">{errors.duration}</span>
                ) : null}
              </label>

              <label className="block">
                <span className="mb-1 block text-sm font-medium">Urgency</span>
                <select
                  className="w-full rounded-md border border-black/20 bg-transparent px-3 py-2 text-sm outline-none focus:border-black dark:border-white/25 dark:focus:border-white"
                  value={form.urgency}
                  onChange={(e) => setField("urgency", e.target.value as Urgency)}
                >
                  <option value="">Choose urgency</option>
                  <option value="asap">ASAP</option>
                  <option value="this_week">This week</option>
                  <option value="flexible">Flexible</option>
                </select>
                {errors.urgency ? (
                  <span className="mt-1 block text-xs text-red-600">{errors.urgency}</span>
                ) : null}
              </label>
            </div>
          </div>
        ) : null}

        {step === 4 ? (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">4) Job Details</h2>
            <label className="block">
              <span className="mb-1 block text-sm font-medium">Material type</span>
              <select
                className="w-full rounded-md border border-black/20 bg-transparent px-3 py-2 text-sm outline-none focus:border-black dark:border-white/25 dark:focus:border-white"
                value={form.material_type}
                onChange={(e) => setField("material_type", e.target.value as MaterialType)}
              >
                <option value="">Choose material type</option>
                <option value="household_junk">Household junk</option>
                <option value="construction_debris">Construction debris</option>
                <option value="yard_waste">Yard waste</option>
                <option value="roofing">Roofing</option>
                <option value="mixed">Mixed materials</option>
              </select>
              {errors.material_type ? (
                <span className="mt-1 block text-xs text-red-600">{errors.material_type}</span>
              ) : null}
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium">Notes (optional)</span>
              <textarea
                className="min-h-28 w-full rounded-md border border-black/20 bg-transparent px-3 py-2 text-sm outline-none focus:border-black dark:border-white/25 dark:focus:border-white"
                value={form.notes}
                onChange={(e) => setField("notes", e.target.value)}
              />
            </label>
          </div>
        ) : null}

        {step === 5 ? (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">5) Contact</h2>
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
                I agree to receive SMS updates regarding this request.
              </span>
            </label>
            {errors.sms_opt_in ? (
              <span className="block text-xs text-red-600">{errors.sms_opt_in}</span>
            ) : null}
          </div>
        ) : null}

        {step === 6 ? (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">6) Review + Submit</h2>
            <dl className="grid gap-2 text-sm">
              <div>
                <dt className="font-medium">Region</dt>
                <dd>{form.region || "Not specified"}</dd>
              </div>
              <div>
                <dt className="font-medium">Product</dt>
                <dd>{form.product || "-"}</dd>
              </div>
              <div>
                <dt className="font-medium">Address</dt>
                <dd>
                  {form.street}, {form.city}, {form.state} {form.zip}
                </dd>
              </div>
              <div>
                <dt className="font-medium">Schedule</dt>
                <dd>
                  {form.delivery_date} / {form.duration} / {form.urgency}
                </dd>
              </div>
              <div>
                <dt className="font-medium">Material</dt>
                <dd>{form.material_type}</dd>
              </div>
              <div>
                <dt className="font-medium">Contact</dt>
                <dd>
                  {form.name} - {form.phone}
                  {form.email ? ` - ${form.email}` : ""}
                </dd>
              </div>
            </dl>
          </div>
        ) : null}
      </section>

      <div className="mt-6 flex items-center justify-between">
        <button
          type="button"
          onClick={handleBack}
          disabled={step === 1}
          className="inline-flex items-center justify-center rounded-md border border-black/20 px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/20"
        >
          Back
        </button>
        {step < 6 ? (
          <button
            type="button"
            onClick={handleNext}
            className="inline-flex items-center justify-center rounded-md border border-foreground bg-foreground px-4 py-2 text-sm font-medium text-background transition-colors hover:opacity-90"
          >
            Next
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            className="inline-flex items-center justify-center rounded-md border border-foreground bg-foreground px-4 py-2 text-sm font-medium text-background transition-colors hover:opacity-90"
          >
            Submit Request
          </button>
        )}
      </div>
    </main>
  );
}
