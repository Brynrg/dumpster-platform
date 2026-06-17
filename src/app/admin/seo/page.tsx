import Link from "next/link";
import CityExpansionBoard from "@/components/admin/CityExpansionBoard";
import CitationsTable from "@/components/admin/CitationsTable";
import ReviewRequestBuilder from "@/components/admin/ReviewRequestBuilder";
import SeoTasksBoard from "@/components/admin/SeoTasksBoard";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import type {
  SeoTask,
  ReviewRequest,
  CitationRow,
  LeadOption,
} from "@/types/seo";

export const dynamic = "force-dynamic";

type SearchParams = {
  market?: string | string[];
  tab?: string | string[];
  window?: string | string[];
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
        .select(
          "id,created_at,market,category,title,cadence,due_date,status,notes",
        )
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
        .gte("created_at", getIsoDaysAgo(30))
        .order("created_at", { ascending: false })
        .limit(200),
      supabase
        .from("leads")
        .select("created_at,city,state")
        .eq("region", market)
        .gte("created_at", getIsoDaysAgo(90))
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
          <span className="mb-1 block font-medium">
            Expansion Window (days)
          </span>
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
        <CityExpansionBoard expansionLeads={expansionLeads} selectedWindow={selectedWindow} nowMs={NOW_MS} />
      ) : null}
    </main>
  );
}
