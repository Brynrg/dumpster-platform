import { cities } from "@/lib/cities";

export type ExpansionRow = {
  citySlug: string;
  cityName: string;
  state: string;
  d30: number;
  d60: number;
  d90: number;
  knownCityPage: boolean;
};

export function slugifyCity(city: string, state: string) {
  const base = `${city}-${state}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return base;
}

type Props = {
  expansionLeads: Array<{
    created_at: string;
    city: string | null;
    state: string | null;
  }>;
  selectedWindow: string;
  nowMs: number;
};

export default function CityExpansionBoard({ expansionLeads, selectedWindow, nowMs }: Props) {
  const knownCitySlugs = new Set(cities.map((city) => city.slug));
  const cityBuckets = new Map<string, ExpansionRow>();

  for (const lead of expansionLeads) {
    if (!lead.city || !lead.state) continue;
    const state = lead.state.toUpperCase();
    const citySlug = slugifyCity(lead.city, state);
    if (!citySlug) continue;

    const createdMs = new Date(lead.created_at).getTime();
    const ageDays = (nowMs - createdMs) / (1000 * 60 * 60 * 24);
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

  return (
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
                <td className="px-3 py-2 font-mono text-xs">
                  {row.citySlug}
                </td>
                <td className="px-3 py-2">{row.cityName}</td>
                <td className="px-3 py-2">{row.state}</td>
                <td className="px-3 py-2">{row.d30}</td>
                <td className="px-3 py-2">{row.d60}</td>
                <td className="px-3 py-2">{row.d90}</td>
                <td className="px-3 py-2">
                  {row.knownCityPage ? "yes" : "no"}
                </td>
              </tr>
            ))}
            {sortedExpansionRows.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-3 py-4 text-center text-black/60 dark:text-white/60"
                >
                  No lead volume available for this market in the last 90
                  days.
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
              {row.citySlug} ({row.cityName}, {row.state}) - d30: {row.d30},
              d60: {row.d60}, d90: {row.d90}
            </li>
          ))}
          {candidateRows.length === 0 ? (
            <li>No new candidates in current top 10 list.</li>
          ) : null}
        </ul>
      </section>

      <section className="rounded-xl border border-black/10 p-5 dark:border-white/15">
        <h2 className="text-xl font-semibold">
          Copy-Ready City Page Checklist
        </h2>
        <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm">
          <li>
            Add the city entry in <code>src/lib/cities.ts</code> with nearby
            city slugs.
          </li>
          <li>
            Confirm city-to-market mapping and state abbreviation accuracy.
          </li>
          <li>
            Verify city appears in top lead demand windows (30/60/90 days).
          </li>
          <li>
            Review related region page links and nearby service area cards.
          </li>
          <li>
            Run <code>npm run lint</code> and <code>npm run build</code>{" "}
            before launch.
          </li>
        </ol>
      </section>
    </section>
  );
}
