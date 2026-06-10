import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { validateTaskPayload, type TaskPayload } from "./validation";
import { upsertTask } from "./db";

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

  const validationResult = validateTaskPayload(payload);
  if (!validationResult.ok) {
    return NextResponse.json(
      { ok: false, error: validationResult.error },
      { status: 400 },
    );
  }

  try {
    const dbResult = await upsertTask(validationResult.data!);

    if (!dbResult.ok) {
      return NextResponse.json(
        { ok: false, error: dbResult.error },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true, task: dbResult.task });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to save task.";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
