import Input from "@/components/ui/Input";
import { StepProps } from "../types";

export default function AddressStep({ form, errors, setField }: StepProps) {
  return (
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
  );
}
