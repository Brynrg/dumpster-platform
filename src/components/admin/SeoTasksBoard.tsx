"use client";

import { useMemo, useState } from "react";

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

type EditableTask = SeoTask & {
  saveState?: string;
};

type Props = {
  tasks: SeoTask[];
  initialMarket: string;
};

const MARKETS = ["tx-spring", "tx-north-houston", "fl-brevard"] as const;
const CATEGORIES = ["gbp", "reviews", "citations", "content", "maps"] as const;
const CADENCES = ["weekly", "monthly", "quarterly", "one_time"] as const;
const STATUSES = ["todo", "doing", "done", "skipped"] as const;

export default function SeoTasksBoard({ tasks, initialMarket }: Props) {
  const [taskRows, setTaskRows] = useState<EditableTask[]>(tasks);
  const [filterMarket, setFilterMarket] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterCadence, setFilterCadence] = useState<string>("all");
  const [newTask, setNewTask] = useState({
    market: initialMarket,
    category: "gbp",
    title: "",
    cadence: "weekly",
    due_date: "",
    notes: "",
  });
  const [createMessage, setCreateMessage] = useState("");

  const filteredTasks = useMemo(() => {
    return taskRows.filter((row) => {
      if (filterMarket !== "all" && row.market !== filterMarket) return false;
      if (filterCategory !== "all" && row.category !== filterCategory) return false;
      if (filterStatus !== "all" && row.status !== filterStatus) return false;
      if (filterCadence !== "all" && (row.cadence ?? "") !== filterCadence) return false;
      return true;
    });
  }, [filterCadence, filterCategory, filterMarket, filterStatus, taskRows]);

  function patchTask(taskId: string, patch: Partial<EditableTask>) {
    setTaskRows((prev) =>
      prev.map((row) => (row.id === taskId ? { ...row, ...patch } : row)),
    );
  }

  async function saveTask(task: EditableTask) {
    patchTask(task.id, { saveState: "Saving..." });
    try {
      const response = await fetch("/api/admin/seo/task", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: task.id,
          market: task.market,
          category: task.category,
          title: task.title,
          cadence: task.cadence,
          due_date: task.due_date,
          status: task.status,
          notes: task.notes,
        }),
      });
      const data = (await response.json()) as {
        ok?: boolean;
        error?: string;
        task?: SeoTask;
      };
      if (!response.ok || !data.ok || !data.task) {
        patchTask(task.id, { saveState: data.error ?? "Failed to save." });
        return;
      }
      patchTask(task.id, { ...data.task, saveState: "Saved" });
    } catch {
      patchTask(task.id, { saveState: "Failed to save." });
    }
  }

  async function createTask() {
    setCreateMessage("Saving...");
    if (!newTask.title.trim()) {
      setCreateMessage("Title is required.");
      return;
    }
    try {
      const response = await fetch("/api/admin/seo/task", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          market: newTask.market,
          category: newTask.category,
          title: newTask.title,
          cadence: newTask.cadence,
          due_date: newTask.due_date || null,
          status: "todo",
          notes: newTask.notes,
        }),
      });
      const data = (await response.json()) as {
        ok?: boolean;
        error?: string;
        task?: SeoTask;
      };
      if (!response.ok || !data.ok || !data.task) {
        setCreateMessage(data.error ?? "Failed to save.");
        return;
      }
      const createdTask = data.task as SeoTask;
      setTaskRows((prev) => [{ ...createdTask, saveState: "Saved" }, ...prev]);
      setNewTask({
        market: initialMarket,
        category: "gbp",
        title: "",
        cadence: "weekly",
        due_date: "",
        notes: "",
      });
      setCreateMessage("Saved");
    } catch {
      setCreateMessage("Failed to save.");
    }
  }

  return (
    <section className="space-y-6">
      <div className="rounded-xl border border-black/10 p-4 dark:border-white/15">
        <h2 className="text-xl font-semibold">Create Task</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <label className="block text-sm">
            <span className="mb-1 block">Market</span>
            <select
              value={newTask.market}
              onChange={(event) =>
                setNewTask((prev) => ({ ...prev, market: event.target.value }))
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
          <label className="block text-sm">
            <span className="mb-1 block">Category</span>
            <select
              value={newTask.category}
              onChange={(event) =>
                setNewTask((prev) => ({ ...prev, category: event.target.value }))
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
          <label className="block text-sm">
            <span className="mb-1 block">Cadence</span>
            <select
              value={newTask.cadence}
              onChange={(event) =>
                setNewTask((prev) => ({ ...prev, cadence: event.target.value }))
              }
              className="w-full rounded-md border border-black/20 bg-transparent px-3 py-2 dark:border-white/25"
            >
              {CADENCES.map((cadence) => (
                <option key={cadence} value={cadence}>
                  {cadence}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm sm:col-span-2 lg:col-span-3">
            <span className="mb-1 block">Title</span>
            <input
              value={newTask.title}
              onChange={(event) =>
                setNewTask((prev) => ({ ...prev, title: event.target.value }))
              }
              className="w-full rounded-md border border-black/20 bg-transparent px-3 py-2 dark:border-white/25"
              placeholder="Update GBP photos and categories"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block">Due Date</span>
            <input
              type="date"
              value={newTask.due_date}
              onChange={(event) =>
                setNewTask((prev) => ({ ...prev, due_date: event.target.value }))
              }
              className="w-full rounded-md border border-black/20 bg-transparent px-3 py-2 dark:border-white/25"
            />
          </label>
          <label className="block text-sm sm:col-span-2">
            <span className="mb-1 block">Notes</span>
            <input
              value={newTask.notes}
              onChange={(event) =>
                setNewTask((prev) => ({ ...prev, notes: event.target.value }))
              }
              className="w-full rounded-md border border-black/20 bg-transparent px-3 py-2 dark:border-white/25"
            />
          </label>
        </div>
        <div className="mt-3 flex items-center gap-3">
          <button
            type="button"
            onClick={createTask}
            className="inline-flex items-center justify-center rounded-md border border-foreground bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90"
          >
            Save Task
          </button>
          {createMessage ? (
            <span className="text-sm text-black/70 dark:text-white/70">{createMessage}</span>
          ) : null}
        </div>
      </div>

      <div className="rounded-xl border border-black/10 p-4 dark:border-white/15">
        <h2 className="text-xl font-semibold">Task Board</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <select
            value={filterMarket}
            onChange={(event) => setFilterMarket(event.target.value)}
            className="rounded-md border border-black/20 bg-transparent px-3 py-2 text-sm dark:border-white/25"
          >
            <option value="all">market: all</option>
            {MARKETS.map((market) => (
              <option key={market} value={market}>
                {market}
              </option>
            ))}
          </select>
          <select
            value={filterCategory}
            onChange={(event) => setFilterCategory(event.target.value)}
            className="rounded-md border border-black/20 bg-transparent px-3 py-2 text-sm dark:border-white/25"
          >
            <option value="all">category: all</option>
            {CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(event) => setFilterStatus(event.target.value)}
            className="rounded-md border border-black/20 bg-transparent px-3 py-2 text-sm dark:border-white/25"
          >
            <option value="all">status: all</option>
            {STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <select
            value={filterCadence}
            onChange={(event) => setFilterCadence(event.target.value)}
            className="rounded-md border border-black/20 bg-transparent px-3 py-2 text-sm dark:border-white/25"
          >
            <option value="all">cadence: all</option>
            {CADENCES.map((cadence) => (
              <option key={cadence} value={cadence}>
                {cadence}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-4 space-y-3">
          {filteredTasks.map((task) => (
            <article
              key={task.id}
              className="rounded-lg border border-black/10 p-4 text-sm dark:border-white/15"
            >
              <div className="grid gap-3 lg:grid-cols-5">
                <label className="block">
                  <span className="mb-1 block font-medium">Market</span>
                  <select
                    value={task.market}
                    onChange={(event) =>
                      patchTask(task.id, { market: event.target.value as SeoTask["market"] })
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
                      patchTask(task.id, { category: event.target.value as SeoTask["category"] })
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
                      patchTask(task.id, { status: event.target.value as SeoTask["status"] })
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
                      patchTask(task.id, {
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
                      patchTask(task.id, { due_date: event.target.value || null })
                    }
                    className="w-full rounded-md border border-black/20 bg-transparent px-3 py-2 dark:border-white/25"
                  />
                </label>
                <label className="block lg:col-span-4">
                  <span className="mb-1 block font-medium">Title</span>
                  <input
                    value={task.title}
                    onChange={(event) =>
                      patchTask(task.id, { title: event.target.value })
                    }
                    className="w-full rounded-md border border-black/20 bg-transparent px-3 py-2 dark:border-white/25"
                  />
                </label>
                <label className="block lg:col-span-5">
                  <span className="mb-1 block font-medium">Notes</span>
                  <textarea
                    value={task.notes ?? ""}
                    onChange={(event) =>
                      patchTask(task.id, { notes: event.target.value || null })
                    }
                    className="min-h-20 w-full rounded-md border border-black/20 bg-transparent px-3 py-2 dark:border-white/25"
                  />
                </label>
              </div>
              <div className="mt-3 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => void saveTask(task)}
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
          ))}

          {filteredTasks.length === 0 ? (
            <p className="rounded-md border border-black/10 px-3 py-2 text-sm text-black/70 dark:border-white/15 dark:text-white/70">
              No tasks match current filters.
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
