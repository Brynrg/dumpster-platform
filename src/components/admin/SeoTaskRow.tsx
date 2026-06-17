import type { SeoTask } from "@/types/seo";
import { MARKETS, CATEGORIES, STATUSES, CADENCES } from "@/lib/seo-constants";

export type EditableTask = SeoTask & {
  saveState?: string;
};

type Props = {
  task: EditableTask;
  onPatch: (patch: Partial<EditableTask>) => void;
  onSave: () => void;
};

export default function SeoTaskRow({ task, onPatch, onSave }: Props) {
  return (
    <article className="rounded-lg border border-black/10 p-4 text-sm dark:border-white/15">
      <div className="grid gap-3 lg:grid-cols-5">
        <label className="block">
          <span className="mb-1 block font-medium">Market</span>
          <select
            value={task.market}
            onChange={(event) =>
              onPatch({
                market: event.target.value as SeoTask["market"],
              })
            }
            className="w-full rounded-md border border-black/20 bg-transparent px-3 py-2 dark:border-white/25"
          >
            {MARKETS.map((market) => (
              <option key={market} value={market}>
                {market}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block font-medium">Category</span>
          <select
            value={task.category}
            onChange={(event) =>
              onPatch({
                category: event.target.value as SeoTask["category"],
              })
            }
            className="w-full rounded-md border border-black/20 bg-transparent px-3 py-2 dark:border-white/25"
          >
            {CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block font-medium">Status</span>
          <select
            value={task.status}
            onChange={(event) =>
              onPatch({
                status: event.target.value as SeoTask["status"],
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
          <span className="mb-1 block font-medium">Cadence</span>
          <select
            value={task.cadence ?? ""}
            onChange={(event) =>
              onPatch({
                cadence: event.target.value
                  ? (event.target.value as SeoTask["cadence"])
                  : null,
              })
            }
            className="w-full rounded-md border border-black/20 bg-transparent px-3 py-2 dark:border-white/25"
          >
            <option value="">none</option>
            {CADENCES.map((cadence) => (
              <option key={cadence} value={cadence}>
                {cadence}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block font-medium">Due Date</span>
          <input
            type="date"
            value={task.due_date ?? ""}
            onChange={(event) =>
              onPatch({
                due_date: event.target.value || null,
              })
            }
            className="w-full rounded-md border border-black/20 bg-transparent px-3 py-2 dark:border-white/25"
          />
        </label>
        <label className="block lg:col-span-4">
          <span className="mb-1 block font-medium">Title</span>
          <input
            value={task.title}
            onChange={(event) => onPatch({ title: event.target.value })}
            className="w-full rounded-md border border-black/20 bg-transparent px-3 py-2 dark:border-white/25"
          />
        </label>
        <label className="block lg:col-span-5">
          <span className="mb-1 block font-medium">Notes</span>
          <textarea
            value={task.notes ?? ""}
            onChange={(event) => onPatch({ notes: event.target.value || null })}
            className="min-h-20 w-full rounded-md border border-black/20 bg-transparent px-3 py-2 dark:border-white/25"
          />
        </label>
      </div>
      <div className="mt-3 flex items-center gap-3">
        <button
          type="button"
          onClick={() => void onSave()}
          className="inline-flex items-center justify-center rounded-md border border-foreground bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90"
        >
          Save
        </button>
        {task.saveState ? (
          <span className="text-sm text-black/70 dark:text-white/70">
            {task.saveState}
          </span>
        ) : null}
      </div>
    </article>
  );
}
