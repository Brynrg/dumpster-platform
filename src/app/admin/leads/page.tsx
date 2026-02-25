import Link from "next/link";
import { getSupabaseAdmin } from "@/lib/supabase/server";

type SearchParams = {
  region?: string | string[];
  product?: string | string[];
  zip?: string | string[];
  date_from?: string | string[];
  date_to?: string | string[];
  notified?: string | string[];
};

type LeadRow = {
  id: string;
  created_at: string;
  region: string;
  product: string;
  zip: string | null;
  requested_date: string | null;
  urgency: string | null;
  duration: string | null;
  material_type: string | null;
  name: string | null;
  phone: string;
  email: string | null;
  notified: boolean | null;
};

function asSingle(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AdminLeadsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const region = asSingle(params.region) ?? "";
  const product = asSingle(params.product) ?? "";
  const zip = asSingle(params.zip) ?? "";
  const dateFrom = asSingle(params.date_from) ?? "";
  const dateTo = asSingle(params.date_to) ?? "";
  const notified = asSingle(params.notified) ?? "";

  let leads: LeadRow[] = [];
  let errorMessage = "";

  try {
    const supabase = getSupabaseAdmin();
    let query = supabase
      .from("leads")
      .select(
        "id,created_at,region,product,zip,requested_date,urgency,duration,material_type,name,phone,email,notified",
      )
      .order("created_at", { ascending: false });

    if (region) query = query.eq("region", region);
    if (product) query = query.eq("product", product);
    if (zip) query = query.ilike("zip", `%${zip}%`);
    if (dateFrom) query = query.gte("requested_date", dateFrom);
    if (dateTo) query = query.lte("requested_date", dateTo);
    if (notified === "true") query = query.eq("notified", true);
    if (notified === "false") query = query.eq("notified", false);

    const { data, error } = await query.limit(500);
    if (error) {
      errorMessage = "Failed to load leads.";
    } else {
      leads = (data ?? []) as LeadRow[];
    }
  } catch (error) {
    errorMessage =
      error instanceof Error ? error.message : "Failed to load leads.";
  }

  const exportParams = new URLSearchParams();
  if (region) exportParams.set("region", region);
  if (product) exportParams.set("product", product);
  if (zip) exportParams.set("zip", zip);
  if (dateFrom) exportParams.set("date_from", dateFrom);
  if (dateTo) exportParams.set("date_to", dateTo);
  if (notified) exportParams.set("notified", notified);
  const exportHref = `/admin/leads/export${exportParams.toString() ? `?${exportParams.toString()}` : ""}`;

  return (
    <main className="mx-auto max-w-7xl px-6 py-12">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-semibold tracking-tight">Admin Leads</h1>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/pricing"
            className="inline-flex items-center justify-center rounded-md border border-black/20 px-4 py-2 text-sm font-medium hover:bg-black/5 dark:border-white/20 dark:hover:bg-white/10"
          >
            Pricing Model
          </Link>
          <Link
            href="/admin/disposal"
            className="inline-flex items-center justify-center rounded-md border border-black/20 px-4 py-2 text-sm font-medium hover:bg-black/5 dark:border-white/20 dark:hover:bg-white/10"
          >
            Disposal Intel
          </Link>
          <Link
            href="/admin/notify"
            className="inline-flex items-center justify-center rounded-md border border-black/20 px-4 py-2 text-sm font-medium hover:bg-black/5 dark:border-white/20 dark:hover:bg-white/10"
          >
            Notify Leads
          </Link>
          <Link
            href={exportHref}
            className="inline-flex items-center justify-center rounded-md border border-black/20 px-4 py-2 text-sm font-medium hover:bg-black/5 dark:border-white/20 dark:hover:bg-white/10"
          >
            Export CSV
          </Link>
        </div>
      </header>

      <form method="get" className="mb-6 grid gap-3 rounded-xl border border-black/10 p-4 sm:grid-cols-3 dark:border-white/15">
        <input
          name="region"
          defaultValue={region}
          placeholder="region"
          className="rounded-md border border-black/20 bg-transparent px-3 py-2 text-sm dark:border-white/25"
        />
        <input
          name="product"
          defaultValue={product}
          placeholder="product"
          className="rounded-md border border-black/20 bg-transparent px-3 py-2 text-sm dark:border-white/25"
        />
        <input
          name="zip"
          defaultValue={zip}
          placeholder="zip"
          className="rounded-md border border-black/20 bg-transparent px-3 py-2 text-sm dark:border-white/25"
        />
        <input
          name="date_from"
          type="date"
          defaultValue={dateFrom}
          className="rounded-md border border-black/20 bg-transparent px-3 py-2 text-sm dark:border-white/25"
        />
        <input
          name="date_to"
          type="date"
          defaultValue={dateTo}
          className="rounded-md border border-black/20 bg-transparent px-3 py-2 text-sm dark:border-white/25"
        />
        <select
          name="notified"
          defaultValue={notified}
          className="rounded-md border border-black/20 bg-transparent px-3 py-2 text-sm dark:border-white/25"
        >
          <option value="">notified: any</option>
          <option value="true">notified: true</option>
          <option value="false">notified: false</option>
        </select>
        <button
          type="submit"
          className="inline-flex items-center justify-center rounded-md border border-foreground bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90 sm:col-span-3 sm:w-fit"
        >
          Apply Filters
        </button>
      </form>

      {errorMessage ? (
        <p className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
          {errorMessage}
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-black/10 dark:border-white/15">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-black/10 dark:border-white/15">
              <tr>
                <th className="px-3 py-2">created_at</th>
                <th className="px-3 py-2">region</th>
                <th className="px-3 py-2">product</th>
                <th className="px-3 py-2">zip</th>
                <th className="px-3 py-2">requested_date</th>
                <th className="px-3 py-2">urgency</th>
                <th className="px-3 py-2">duration</th>
                <th className="px-3 py-2">material_type</th>
                <th className="px-3 py-2">name</th>
                <th className="px-3 py-2">phone</th>
                <th className="px-3 py-2">email</th>
                <th className="px-3 py-2">notified</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id} className="border-b border-black/5 align-top dark:border-white/10">
                  <td className="px-3 py-2">{new Date(lead.created_at).toLocaleString()}</td>
                  <td className="px-3 py-2">{lead.region}</td>
                  <td className="px-3 py-2">{lead.product}</td>
                  <td className="px-3 py-2">{lead.zip ?? ""}</td>
                  <td className="px-3 py-2">{lead.requested_date ?? ""}</td>
                  <td className="px-3 py-2">{lead.urgency ?? ""}</td>
                  <td className="px-3 py-2">{lead.duration ?? ""}</td>
                  <td className="px-3 py-2">{lead.material_type ?? ""}</td>
                  <td className="px-3 py-2">{lead.name ?? ""}</td>
                  <td className="px-3 py-2">{lead.phone}</td>
                  <td className="px-3 py-2">{lead.email ?? ""}</td>
                  <td className="px-3 py-2">{String(Boolean(lead.notified))}</td>
                </tr>
              ))}
              {leads.length === 0 ? (
                <tr>
                  <td colSpan={12} className="px-3 py-4 text-center text-black/60 dark:text-white/60">
                    No leads found for current filters.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
