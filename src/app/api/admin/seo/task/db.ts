import { getSupabaseAdmin } from "@/lib/supabase/server";

export type UpsertTaskData = {
  id: string | null;
  market: string;
  category: string;
  title: string;
  cadence: string | null;
  dueDate: string | null;
  status: string;
  notes: string | null;
};

export async function upsertTask(data: UpsertTaskData) {
  const supabase = getSupabaseAdmin();
  const { id, market, category, title, cadence, dueDate, status, notes } = data;

  if (id) {
    const { data: resultData, error } = await supabase
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
      .eq("id", id)
      .select("id,created_at,market,category,title,cadence,due_date,status,notes")
      .single();

    if (error || !resultData) {
      return { ok: false, error: "Failed to update task." };
    }

    return { ok: true, task: resultData };
  }

  const { data: resultData, error } = await supabase
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

  if (error || !resultData) {
    return { ok: false, error: "Failed to create task." };
  }

  return { ok: true, task: resultData };
}
