import Link from "next/link";
import CitationsTable from "@/components/admin/CitationsTable";
import ReviewRequestBuilder from "@/components/admin/ReviewRequestBuilder";
import SeoTasksBoard from "@/components/admin/SeoTasksBoard";
import { cities } from "@/lib/cities";
import { getSupabaseAdmin } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type SearchParams = {
  market?: string | string[];
  tab?: string | string[];
  window?: string | string[];
};

type SeoTask = {
  id: string;
  created_at: string;
  market: string;
  category: "gbp" | "reviews" | "citations" | "content" | "maps";
  title: string;
  cadence: "weekly" | "monthly" | "quarterly" | "one_time" | null;
  due_date: string | null;
  status: "todo" | "doing" | "done" | "skipped";
  notes: string | null;
};

type ReviewRequest = {
  id: string;
  created_at: string;
  market: string;
  lead_id: string | null;
  contact_name: string | null;
  phone: string | null;
  email: string | null;
  channel: "sms" | "email" | null;
  message: string | null;
  status: "draft" | "sent" | "completed" | "failed" | null;
  completed_at: string | null;
  notes: string | null;
};

type CitationRow = {
  id: string;
  created_at: string;
  market: string;
  provider: string;
  listing_url: string | null;
  nap_name: string | null;
  nap_phone: string | null;
  nap_service_area: string | null;
  status: "todo" | "submitted" | "live" | "needs_fix" | null;
  last_verified: string | null;
  notes: string | null;
};

type LeadOption = {
  id: string;
  created_at: string;
  region: string;
  city: string | null;
  state: string | null;
  name: string | null;
  phone: string;
  email: string | null;
};

type ExpansionRow = {
  citySlug: string;
  cityName: string;
  state: string;
  d30: number;
  d60: number;
  d90: number;
  knownCityPage: boolean;
};

const MARKETS = ["tx-spring", "tx-north-houston", "fl-brevard"] as const;
const TABS = ["tasks", "reviews", "citations", "expansion"] as const;
const WINDOWS = ["30", "60", "90"] as const;
const DEFAULT_PROVIDERS = [
  "Yelp",
  "Bing Places",
  "Apple Business Connect",
  "Nextdoor",
  "Angi",
  "Thumbtack",
  "Chamber",
] as const;
const NOW_MS = Date.now();

function asSingle(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

function slugifyCity(city: string, state: string) {
  const base = `${city}-${state}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return base;
}

function getIsoDaysAgo(days: number) {
  return new Date(NOW_MS - days * 24 * 60 * 60 * 1000).toISOString();
}

export default async function AdminSeoPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const marketRaw = asSingle(params.market);
  const tabRaw = asSingle(params.tab);
  const windowRaw = asSingle(params.window);
  const market = MARKETS.includes(marketRaw as (typeof MARKETS)[number])
    ? (marketRaw as (typeof MARKETS)[number])
    : "tx-spring";
  const tab = TABS.includes(tabRaw as (typeof TABS)[number])
    ? (tabRaw as (typeof TABS)[number])
    : "tasks";
  const selectedWindow = WINDOWS.includes(windowRaw as (typeof WINDOWS)[number])
    ? (windowRaw as (typeof WINDOWS)[number])
    : "30";

  const supabase = getSupabaseAdmin();

  // Keep common citation rows present for each market/provider.
  await supabase.from("citations").upsert(
    DEFAULT_PROVIDERS.map((provider) => ({ market, provider })),
    { onConflict: "market,provider" },
  );

  const [tasksRes, reviewsRes, citationsRes, leadOptionsRes, expansionRes] =
    await Promise.all([
      supabase
        .from("seo_tasks")
        .select("id,created_at,market,category,title,cadence,due_date,status,notes")
        .eq("market", market)
        .order("created_at", { ascending: false })
        .limit(500),
      supabase
        .from("review_requests")
        .select(
          "id,created_at,market,lead_id,contact_name,phone,email,channel,message,status,completed_at,notes",
        )
        .eq("market", market)
        .order("created_at", { ascending: false })
        .limit(500),
      supabase
        .from("citations")
        .select(
          "id,created_at,market,provider,listing_url,nap_name,nap_phone,nap_service_area,status,last_verified,notes",
        )
        .eq("market", market)
        .order("provider", { ascending: true }),
      supabase
        .from("leads")
        .select("id,created_at,region,city,state,name,phone,email")
        .eq("region", market)
        .gte(
          "created_at",
          getIsoDaysAgo(30),
        )
        .order("created_at", { ascending: false })
        .limit(200),
      supabase
        .from("leads")
        .select("created_at,city,state")
        .eq("region", market)
        .gte(
          "created_at",
          getIsoDaysAgo(90),
        )
        .order("created_at", { ascending: false })
        .limit(2000),
    ]);

  const tasks = (tasksRes.data ?? []) as SeoTask[];
  const reviewRequests = (reviewsRes.data ?? []) as ReviewRequest[];
  const citations = (citationsRes.data ?? []) as CitationRow[];
  const leadOptions = (leadOptionsRes.data ?? []) as LeadOption[];
  const expansionLeads = (expansionRes.data ?? []) as Array<{
    created_at: string;
    city: string | null;
    state: string | null;
  }>;

  const knownCitySlugs = new Set(cities.map((city) => city.slug));
  const cityBuckets = new Map<string, ExpansionRow>();

  for (const lead of expansionLeads) {
    if (!lead.city || !lead.state) continue;
    const state = lead.state.toUpperCase();
    const citySlug = slugifyCity(lead.city, state);
    if (!citySlug) continue;

    const createdMs = new Date(lead.created_at).getTime();
    const ageDays = (NOW_MS - createdMs) / (1000 * 60 * 60 * 24);
    const existing = cityBuckets.get(citySlug) ?? {
      citySlug,
      cityName: lead.city,
      state,
      d30: 0,
      d60: 0,
      d90: 0,
      knownCityPage: knownCitySlugs.has(citySlug),
    };
    if (ageDays <= 90) existing.d90 += 1;
    if (ageDays <= 60) existing.d60 += 1;
    if (ageDays <= 30) existing.d30 += 1;
    cityBuckets.set(citySlug, existing);
  }

  const sortedExpansionRows = [...cityBuckets.values()]
    .sort((a, b) => {
      if (selectedWindow === "90") return b.d90 - a.d90;
      if (selectedWindow === "60") return b.d60 - a.d60;
      return b.d30 - a.d30;
    })
    .slice(0, 10);

  const candidateRows = sortedExpansionRows.filter((row) => !row.knownCityPage);

  function tabHref(nextTab: (typeof TABS)[number]) {
    const query = new URLSearchParams({
      market,
      tab: nextTab,
      window: selectedWindow,
    });
    return `/admin/seo?${query.toString()}`;
  }

  return (
    <main className="mx-auto max-w-7xl px-6 py-12">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Admin Local SEO Operations
          </h1>
          <p className="mt-2 text-black/70 dark:text-white/70">
            Track local SEO execution and plan city expansion from lead demand.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/leads"
            className="inline-flex items-center justify-center rounded-md border border-black/20 px-4 py-2 text-sm font-medium hover:bg-black/5 dark:border-white/20 dark:hover:bg-white/10"
          >
            Back to Leads
          </Link>
        </div>
      </header>

      <form
        method="get"
        className="mb-4 grid gap-3 rounded-xl border border-black/10 p-4 sm:grid-cols-3 dark:border-white/15"
      >
        <input type="hidden" name="tab" value={tab} />
        <label className="block text-sm">
          <span className="mb-1 block font-medium">Market</span>
          <select
            name="market"
            defaultValue={market}
            className="w-full rounded-md border border-black/20 bg-transparent px-3 py-2 dark:border-white/25"
          >
            {MARKETS.map((marketOption) => (
              <option key={marketOption} value={marketOption}>
                {marketOption}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium">Expansion Window (days)</span>
          <select
            name="window"
            defaultValue={selectedWindow}
            className="w-full rounded-md border border-black/20 bg-transparent px-3 py-2 dark:border-white/25"
          >
            <option value="30">30</option>
            <option value="60">60</option>
            <option value="90">90</option>
          </select>
        </label>
        <div className="flex items-end">
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-md border border-foreground bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90"
          >
            Apply
          </button>
        </div>
      </form>

      <nav className="mb-6 flex flex-wrap gap-2">
        {TABS.map((tabName) => {
          const active = tabName === tab;
          return (
            <Link
              key={tabName}
              href={tabHref(tabName)}
              className={`inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-medium ${
                active
                  ? "border-foreground bg-foreground text-background"
                  : "border-black/20 hover:bg-black/5 dark:border-white/20 dark:hover:bg-white/10"
              }`}
            >
              {tabName === "tasks"
                ? "Tasks"
                : tabName === "reviews"
                  ? "Reviews"
                  : tabName === "citations"
                    ? "Citations"
                    : "Expansion"}
            </Link>
          );
        })}
      </nav>

      {tab === "tasks" ? (
        <SeoTasksBoard tasks={tasks} initialMarket={market} />
      ) : null}
      {tab === "reviews" ? (
        <ReviewRequestBuilder
          initialMarket={market}
          leads={leadOptions}
          existingRequests={reviewRequests}
        />
      ) : null}
      {tab === "citations" ? (
        <CitationsTable initialMarket={market} citations={citations} />
      ) : null}
      {tab === "expansion" ? (
        <section className="space-y-6">
          <div className="overflow-x-auto rounded-xl border border-black/10 dark:border-white/15">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-black/10 dark:border-white/15">
                <tr>
                  <th className="px-3 py-2">city_slug</th>
                  <th className="px-3 py-2">city</th>
                  <th className="px-3 py-2">state</th>
                  <th className="px-3 py-2">d30</th>
                  <th className="px-3 py-2">d60</th>
                  <th className="px-3 py-2">d90</th>
                  <th className="px-3 py-2">city_page_exists</th>
                </tr>
              </thead>
              <tbody>
                {sortedExpansionRows.map((row) => (
                  <tr
                    key={row.citySlug}
                    className="border-b border-black/5 align-top dark:border-white/10"
                  >
                    <td className="px-3 py-2 font-mono text-xs">{row.citySlug}</td>
                    <td className="px-3 py-2">{row.cityName}</td>
                    <td className="px-3 py-2">{row.state}</td>
                    <td className="px-3 py-2">{row.d30}</td>
                    <td className="px-3 py-2">{row.d60}</td>
                    <td className="px-3 py-2">{row.d90}</td>
                    <td className="px-3 py-2">{row.knownCityPage ? "yes" : "no"}</td>
                  </tr>
                ))}
                {sortedExpansionRows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-3 py-4 text-center text-black/60 dark:text-white/60"
                    >
                      No lead volume available for this market in the last 90 days.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>

          <section className="rounded-xl border border-black/10 p-5 dark:border-white/15">
            <h2 className="text-xl font-semibold">Candidate city pages</h2>
            <p className="mt-2 text-sm text-black/70 dark:text-white/70">
              Cities with demand that are not currently represented in{" "}
              <code>src/lib/cities.ts</code>.
            </p>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm">
              {candidateRows.map((row) => (
                <li key={row.citySlug}>
                  {row.citySlug} ({row.cityName}, {row.state}) - d30: {row.d30}, d60:{" "}
                  {row.d60}, d90: {row.d90}
                </li>
              ))}
              {candidateRows.length === 0 ? (
                <li>No new candidates in current top 10 list.</li>
              ) : null}
            </ul>
          </section>

          <section className="rounded-xl border border-black/10 p-5 dark:border-white/15">
            <h2 className="text-xl font-semibold">Copy-Ready City Page Checklist</h2>
            <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm">
              <li>Add the city entry in <code>src/lib/cities.ts</code> with nearby city slugs.</li>
              <li>Confirm city-to-market mapping and state abbreviation accuracy.</li>
              <li>Verify city appears in top lead demand windows (30/60/90 days).</li>
              <li>Review related region page links and nearby service area cards.</li>
              <li>Run <code>npm run lint</code> and <code>npm run build</code> before launch.</li>
            </ol>
          </section>
        </section>
      ) : null}
    </main>
  );
}
