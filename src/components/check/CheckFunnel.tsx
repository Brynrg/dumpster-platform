"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { track } from "@/lib/analytics";
import { isValidEmail, isValidPhone } from "@/lib/validation";

import { FormState } from "./types";
import ProductStep from "./steps/ProductStep";
import AddressStep from "./steps/AddressStep";
import ScheduleStep from "./steps/ScheduleStep";
import JobDetailsStep from "./steps/JobDetailsStep";
import ContactStep from "./steps/ContactStep";
import ReviewStep from "./steps/ReviewStep";

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

function getStepErrors(step: number, form: FormState) {
  const nextErrors: Record<string, string> = {};

  switch (step) {
    case 1:
      if (!form.product) {
        nextErrors.product = "Select a product option.";
      }
      return nextErrors;

    case 2:
      if (!form.street.trim()) nextErrors.street = "Street is required.";
      if (!form.city.trim()) nextErrors.city = "City is required.";
      if (!form.state.trim()) nextErrors.state = "State is required.";
      if (!form.zip.trim()) nextErrors.zip = "ZIP is required.";
      return nextErrors;

    case 3:
      if (!form.delivery_date)
        nextErrors.delivery_date = "Delivery date is required.";
      if (!form.duration) nextErrors.duration = "Duration is required.";
      if (!form.urgency) nextErrors.urgency = "Urgency is required.";
      return nextErrors;

    case 4:
      if (!form.material_type) {
        nextErrors.material_type = "Material type is required.";
      }
      return nextErrors;

    case 5:
      if (!form.name.trim()) nextErrors.name = "Name is required.";

      if (!form.phone.trim()) {
        nextErrors.phone = "Phone is required.";
      } else if (!isValidPhone(form.phone)) {
        nextErrors.phone = "Enter a valid phone number.";
      }

      if (form.email.trim() && !isValidEmail(form.email)) {
        nextErrors.email = "Enter a valid email or leave blank.";
      }

      if (!form.sms_opt_in) {
        nextErrors.sms_opt_in = "SMS opt-in is required to proceed.";
      }
      return nextErrors;

    default:
      return nextErrors;
  }
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
    const nextErrors = getStepErrors(step, form);

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
        <h1 className="text-3xl font-semibold tracking-tight">
          Request a Rental
        </h1>
        <p className="mt-2 text-sm text-black/70 dark:text-white/70">
          {progressLabel}
        </p>
      </header>

      <section className="rounded-xl border border-black/10 p-6 dark:border-white/15">
        {step === 1 ? (
          <ProductStep form={form} errors={errors} setField={setField} />
        ) : null}
        {step === 2 ? (
          <AddressStep form={form} errors={errors} setField={setField} />
        ) : null}
        {step === 3 ? (
          <ScheduleStep form={form} errors={errors} setField={setField} />
        ) : null}
        {step === 4 ? (
          <JobDetailsStep form={form} errors={errors} setField={setField} />
        ) : null}
        {step === 5 ? (
          <ContactStep form={form} errors={errors} setField={setField} />
        ) : null}
        {step === 6 ? <ReviewStep form={form} /> : null}
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
