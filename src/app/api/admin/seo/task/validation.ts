export type TaskPayload = {
  id?: string;
  market?: string;
  category?: "gbp" | "reviews" | "citations" | "content" | "maps";
  title?: string;
  cadence?: "weekly" | "monthly" | "quarterly" | "one_time" | null;
  due_date?: string | null;
  status?: "todo" | "doing" | "done" | "skipped";
  notes?: string | null;
};

export const ALLOWED_MARKETS = new Set(["tx-spring", "tx-north-houston", "fl-brevard"]);
export const ALLOWED_CATEGORIES = new Set([
  "gbp",
  "reviews",
  "citations",
  "content",
  "maps",
]);
export const ALLOWED_CADENCE = new Set(["weekly", "monthly", "quarterly", "one_time"]);
export const ALLOWED_STATUS = new Set(["todo", "doing", "done", "skipped"]);

export function validateTaskPayload(payload: TaskPayload) {
  const market = payload.market?.trim() ?? "";
  const category = payload.category ?? "";
  const title = payload.title?.trim() ?? "";
  const status = payload.status ?? "todo";
  const cadence =
    payload.cadence && payload.cadence.trim() ? payload.cadence.trim() : null;
  const dueDate = payload.due_date?.trim() ? payload.due_date.trim() : null;
  const notes = payload.notes?.trim() ? payload.notes.trim() : null;
  const id = payload.id?.trim() ? payload.id.trim() : null;

  if (!ALLOWED_MARKETS.has(market)) {
    return { ok: false, error: "Invalid market." };
  }
  if (!ALLOWED_CATEGORIES.has(category)) {
    return { ok: false, error: "Invalid category." };
  }
  if (!title) {
    return { ok: false, error: "title is required." };
  }
  if (!ALLOWED_STATUS.has(status)) {
    return { ok: false, error: "Invalid status." };
  }
  if (cadence && !ALLOWED_CADENCE.has(cadence)) {
    return { ok: false, error: "Invalid cadence." };
  }

  return {
    ok: true,
    data: {
      id,
      market,
      category,
      title,
      cadence,
      dueDate,
      status,
      notes,
    },
  };
}
