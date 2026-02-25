"use client";

import { useMemo, useState } from "react";

type Citation = {
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

type EditableCitation = Citation & { saveState?: string };

type Props = {
  initialMarket: string;
  citations: Citation[];
};

const STATUSES = ["todo", "submitted", "live", "needs_fix"] as const;

export default function CitationsTable({ initialMarket, citations }: Props) {
  const [rows, setRows] = useState<EditableCitation[]>(
    citations.map((row) => ({ ...row })),
  );
  const [providerFilter, setProviderFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [market] = useState(initialMarket);

  function patchRow(id: string, patch: Partial<EditableCitation>) {
    setRows((prev) => prev.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  }

  const filteredRows = useMemo(() => {
    const query = providerFilter.trim().toLowerCase();
    return rows.filter((row) => {
      if (row.market !== market) return false;
      if (statusFilter !== "all" && row.status !== statusFilter) return false;
      if (query && !row.provider.toLowerCase().includes(query)) return false;
      return true;
    });
  }, [market, providerFilter, rows, statusFilter]);

  async function saveCitation(row: EditableCitation) {
    patchRow(row.id, { saveState: "Saving..." });
    try {
      const response = await fetch("/api/admin/seo/citation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: row.id,
          market: row.market,
          provider: row.provider,
          listing_url: row.listing_url,
          nap_name: row.nap_name,
          nap_phone: row.nap_phone,
          nap_service_area: row.nap_service_area,
          status: row.status,
          last_verified: row.last_verified,
          notes: row.notes,
        }),
      });
      const data = (await response.json()) as {
        ok?: boolean;
        error?: string;
        citation?: Citation;
      };
      if (!response.ok || !data.ok || !data.citation) {
        patchRow(row.id, { saveState: data.error ?? "Failed to save." });
        return;
      }
      patchRow(row.id, { ...data.citation, saveState: "Saved" });
    } catch {
      patchRow(row.id, { saveState: "Failed to save." });
    }
  }

  return (
    <section className="space-y-4">
      <div className="rounded-xl border border-black/10 p-4 dark:border-white/15">
        <h2 className="text-xl font-semibold">Citations Tracker</h2>
        <p className="mt-2 text-sm text-black/70 dark:text-white/70">
          Track listings and NAP consistency for priority local providers.
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <input
            value={providerFilter}
            onChange={(event) => setProviderFilter(event.target.value)}
            placeholder="Filter provider"
            className="rounded-md border border-black/20 bg-transparent px-3 py-2 text-sm dark:border-white/25"
          />
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="rounded-md border border-black/20 bg-transparent px-3 py-2 text-sm dark:border-white/25"
          >
            <option value="all">status: all</option>
            {STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-3">
        {filteredRows.map((row) => (
          <article
            key={row.id}
            className="rounded-xl border border-black/10 p-4 text-sm dark:border-white/15"
          >
            <div className="grid gap-3 lg:grid-cols-3">
              <label className="block">
                <span className="mb-1 block font-medium">Provider</span>
                <input
                  value={row.provider}
                  onChange={(event) =>
                    patchRow(row.id, { provider: event.target.value })
                  }
                  className="w-full rounded-md border border-black/20 bg-transparent px-3 py-2 dark:border-white/25"
                />
              </label>
              <label className="block">
                <span className="mb-1 block font-medium">Status</span>
                <select
                  value={row.status ?? "todo"}
                  onChange={(event) =>
                    patchRow(row.id, {
                      status: event.target.value as EditableCitation["status"],
                    })
                  }
                  className="w-full rounded-md border border-black/20 bg-transparent px-3 py-2 dark:border-white/25"
                >
                  {STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-1 block font-medium">Last Verified</span>
                <input
                  type="date"
                  value={row.last_verified ?? ""}
                  onChange={(event) =>
                    patchRow(row.id, { last_verified: event.target.value || null })
                  }
                  className="w-full rounded-md border border-black/20 bg-transparent px-3 py-2 dark:border-white/25"
                />
              </label>
              <label className="block lg:col-span-3">
                <span className="mb-1 block font-medium">Listing URL</span>
                <input
                  value={row.listing_url ?? ""}
                  onChange={(event) =>
                    patchRow(row.id, { listing_url: event.target.value || null })
                  }
                  className="w-full rounded-md border border-black/20 bg-transparent px-3 py-2 dark:border-white/25"
                />
              </label>
              <label className="block">
                <span className="mb-1 block font-medium">NAP Name</span>
                <input
                  value={row.nap_name ?? ""}
                  onChange={(event) =>
                    patchRow(row.id, { nap_name: event.target.value || null })
                  }
                  className="w-full rounded-md border border-black/20 bg-transparent px-3 py-2 dark:border-white/25"
                />
              </label>
              <label className="block">
                <span className="mb-1 block font-medium">NAP Phone</span>
                <input
                  value={row.nap_phone ?? ""}
                  onChange={(event) =>
                    patchRow(row.id, { nap_phone: event.target.value || null })
                  }
                  className="w-full rounded-md border border-black/20 bg-transparent px-3 py-2 dark:border-white/25"
                />
              </label>
              <label className="block">
                <span className="mb-1 block font-medium">NAP Service Area</span>
                <input
                  value={row.nap_service_area ?? ""}
                  onChange={(event) =>
                    patchRow(row.id, { nap_service_area: event.target.value || null })
                  }
                  className="w-full rounded-md border border-black/20 bg-transparent px-3 py-2 dark:border-white/25"
                />
              </label>
              <label className="block lg:col-span-3">
                <span className="mb-1 block font-medium">Notes</span>
                <textarea
                  value={row.notes ?? ""}
                  onChange={(event) =>
                    patchRow(row.id, { notes: event.target.value || null })
                  }
                  className="min-h-20 w-full rounded-md border border-black/20 bg-transparent px-3 py-2 dark:border-white/25"
                />
              </label>
            </div>
            <div className="mt-3 flex items-center gap-3">
              <button
                type="button"
                onClick={() => void saveCitation(row)}
                className="inline-flex items-center justify-center rounded-md border border-foreground bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90"
              >
                Save
              </button>
              {row.saveState ? (
                <span className="text-sm text-black/70 dark:text-white/70">
                  {row.saveState}
                </span>
              ) : null}
            </div>
          </article>
        ))}

        {filteredRows.length === 0 ? (
          <p className="rounded-md border border-black/10 px-3 py-2 text-sm text-black/70 dark:border-white/15 dark:text-white/70">
            No citations match current filters.
          </p>
        ) : null}
      </div>
    </section>
  );
}
