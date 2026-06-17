import Input from "@/components/ui/Input";
import { StepProps } from "../types";

export default function Step5Contact({ form, setField, errors }: StepProps) {
  return (
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
  );
}
