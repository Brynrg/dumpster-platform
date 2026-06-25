import { StepProps, Product } from "../types";

export default function ProductStep({ form, errors, setField }: StepProps) {
  return (
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
  );
}
