import { NextResponse } from "next/server";
import { signAdminToken } from "@/lib/adminAuth";

export async function POST(request: Request) {
  const adminToken = process.env.ADMIN_TOKEN;

  if (!adminToken) {
    return NextResponse.json(
      { ok: false, error: "ADMIN_TOKEN is not configured." },
      { status: 500 },
    );
  }

  let body: { token?: string };
  try {
    body = (await request.json()) as { token?: string };
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON payload." },
      { status: 400 },
    );
  }

  if (!body.token || body.token !== adminToken) {
    return NextResponse.json(
      { ok: false, error: "Invalid admin token." },
      { status: 401 },
    );
  }

  const response = NextResponse.json({ ok: true });
  const token = await signAdminToken();
  response.cookies.set("admin", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });

  return response;
}
