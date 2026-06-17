import { MaterialType, StepProps } from "../types";

export default function Step4JobDetails({ form, setField, errors }: StepProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">4) Job Details</h2>
      <label className="block">
        <span className="mb-1 block text-sm font-medium">Material type</span>
        <select
          className="w-full rounded-md border border-black/20 bg-transparent px-3 py-2 text-sm outline-none focus:border-black dark:border-white/25 dark:focus:border-white"
          value={form.material_type}
          onChange={(e) =>
            setField("material_type", e.target.value as MaterialType)
          }
        >
          <option value="">Choose material type</option>
          <option value="household_junk">Household junk</option>
          <option value="construction_debris">Construction debris</option>
          <option value="yard_waste">Yard waste</option>
          <option value="roofing">Roofing</option>
          <option value="mixed">Mixed materials</option>
        </select>
        {errors.material_type ? (
          <span className="mt-1 block text-xs text-red-600">
            {errors.material_type}
          </span>
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
  );
}
