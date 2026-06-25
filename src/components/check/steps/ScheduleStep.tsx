import Input from "@/components/ui/Input";
import { StepProps, Duration, Urgency } from "../types";

export default function ScheduleStep({ form, errors, setField }: StepProps) {
  return (
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
  );
}
