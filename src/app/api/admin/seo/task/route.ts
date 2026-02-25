import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";

type TaskPayload = {
  id?: string;
  market?: string;
  category?: "gbp" | "reviews" | "citations" | "content" | "maps";
  title?: string;
  cadence?: "weekly" | "monthly" | "quarterly" | "one_time" | null;
  due_date?: string | null;
  status?: "todo" | "doing" | "done" | "skipped";
  notes?: string | null;
};

const ALLOWED_MARKETS = new Set(["tx-spring", "tx-north-houston", "fl-brevard"]);
const ALLOWED_CATEGORIES = new Set([
  "gbp",
  "reviews",
  "citations",
  "content",
  "maps",
]);
const ALLOWED_CADENCE = new Set(["weekly", "monthly", "quarterly", "one_time"]);
const ALLOWED_STATUS = new Set(["todo", "doing", "done", "skipped"]);

export async function POST(request: NextRequest) {
  if (request.cookies.get("admin")?.value !== "1") {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }

  let payload: TaskPayload;
  try {
    payload = (await request.json()) as TaskPayload;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON payload." },
      { status: 400 },
    );
  }

  const market = payload.market?.trim() ?? "";
  const category = payload.category ?? "";
  const title = payload.title?.trim() ?? "";
  const status = payload.status ?? "todo";
  const cadence =
    payload.cadence && payload.cadence.trim() ? payload.cadence.trim() : null;
  const dueDate = payload.due_date?.trim() ? payload.due_date.trim() : null;
  const notes = payload.notes?.trim() ? payload.notes.trim() : null;

  if (!ALLOWED_MARKETS.has(market)) {
    return NextResponse.json(
      { ok: false, error: "Invalid market." },
      { status: 400 },
    );
  }
  if (!ALLOWED_CATEGORIES.has(category)) {
    return NextResponse.json(
      { ok: false, error: "Invalid category." },
      { status: 400 },
    );
  }
  if (!title) {
    return NextResponse.json(
      { ok: false, error: "title is required." },
      { status: 400 },
    );
  }
  if (!ALLOWED_STATUS.has(status)) {
    return NextResponse.json(
      { ok: false, error: "Invalid status." },
      { status: 400 },
    );
  }
  if (cadence && !ALLOWED_CADENCE.has(cadence)) {
    return NextResponse.json(
      { ok: false, error: "Invalid cadence." },
      { status: 400 },
    );
  }

  try {
    const supabase = getSupabaseAdmin();
    if (payload.id?.trim()) {
      const { data, error } = await supabase
        .from("seo_tasks")
        .update({
          market,
          category,
          title,
          cadence,
          due_date: dueDate,
          status,
          notes,
        })
        .eq("id", payload.id.trim())
        .select("id,created_at,market,category,title,cadence,due_date,status,notes")
        .single();

      if (error || !data) {
        return NextResponse.json(
          { ok: false, error: "Failed to update task." },
          { status: 500 },
        );
      }

      return NextResponse.json({ ok: true, task: data });
    }

    const { data, error } = await supabase
      .from("seo_tasks")
      .insert({
        market,
        category,
        title,
        cadence,
        due_date: dueDate,
        status,
        notes,
      })
      .select("id,created_at,market,category,title,cadence,due_date,status,notes")
      .single();

    if (error || !data) {
      return NextResponse.json(
        { ok: false, error: "Failed to create task." },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true, task: data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to save task.";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
