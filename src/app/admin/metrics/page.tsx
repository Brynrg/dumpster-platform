import { getAllRegions } from "@/lib/regions";
import { getSupabaseAdmin } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const PRODUCTS = ["dump_trailer", "dumpster_20", "dumpster_30", "not_sure"] as const;
const NOW_MS = Date.now();

function isoDaysAgo(days: number) {
  return new Date(NOW_MS - days * 24 * 60 * 60 * 1000).toISOString();
}

export default async function AdminMetricsPage() {
  const supabase = getSupabaseAdmin();
  const regions = getAllRegions().map((region) => region.id);
  const since7 = isoDaysAgo(7);
  const since30 = isoDaysAgo(30);

  const [totalRes, last7Res, last30Res, regionCounts, productCounts] = await Promise.all([
    supabase.from("leads").select("id", { count: "exact", head: true }),
    supabase
      .from("leads")
      .select("id", { count: "exact", head: true })
      .gte("created_at", since7),
    supabase
      .from("leads")
      .select("id", { count: "exact", head: true })
      .gte("created_at", since30),
    Promise.all(
      regions.map(async (region) => {
        const { count } = await supabase
          .from("leads")
          .select("id", { count: "exact", head: true })
          .eq("region", region);
        return [region, count ?? 0] as const;
      }),
    ),
    Promise.all(
      PRODUCTS.map(async (product) => {
        const { count } = await supabase
          .from("leads")
          .select("id", { count: "exact", head: true })
          .eq("product", product);
        return [product, count ?? 0] as const;
      }),
    ),
  ]);

  return (
    <main className="mx-auto max-w-5xl space-y-8 px-6 py-12">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">Admin Metrics</h1>
        <p className="mt-2 text-black/70 dark:text-white/70">
          Lightweight lead volume snapshot for launch readiness.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-3">
        <article className="rounded-xl border border-black/10 p-4 dark:border-white/15">
          <h2 className="text-sm font-medium text-black/70 dark:text-white/70">Total Leads</h2>
          <p className="mt-2 text-2xl font-semibold">{totalRes.count ?? 0}</p>
        </article>
        <article className="rounded-xl border border-black/10 p-4 dark:border-white/15">
          <h2 className="text-sm font-medium text-black/70 dark:text-white/70">Leads Last 7 Days</h2>
          <p className="mt-2 text-2xl font-semibold">{last7Res.count ?? 0}</p>
        </article>
        <article className="rounded-xl border border-black/10 p-4 dark:border-white/15">
          <h2 className="text-sm font-medium text-black/70 dark:text-white/70">Leads Last 30 Days</h2>
          <p className="mt-2 text-2xl font-semibold">{last30Res.count ?? 0}</p>
        </article>
      </section>

      <section className="rounded-xl border border-black/10 p-4 dark:border-white/15">
        <h2 className="text-xl font-semibold">Breakdown by Region</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {regionCounts.map(([region, count]) => (
            <li key={region} className="flex items-center justify-between border-b border-black/5 pb-2 dark:border-white/10">
              <span>{region}</span>
              <strong>{count}</strong>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-xl border border-black/10 p-4 dark:border-white/15">
        <h2 className="text-xl font-semibold">Breakdown by Product</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {productCounts.map(([product, count]) => (
            <li key={product} className="flex items-center justify-between border-b border-black/5 pb-2 dark:border-white/10">
              <span>{product}</span>
              <strong>{count}</strong>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
