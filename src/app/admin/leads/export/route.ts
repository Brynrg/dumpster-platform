import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";

function csvEscape(value: string | null | undefined) {
  const raw = value ?? "";
  const escaped = raw.replace(/"/g, '""');
  return `"${escaped}"`;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const region = url.searchParams.get("region") ?? "";
  const product = url.searchParams.get("product") ?? "";
  const zip = url.searchParams.get("zip") ?? "";
  const dateFrom = url.searchParams.get("date_from") ?? "";
  const dateTo = url.searchParams.get("date_to") ?? "";
  const notified = url.searchParams.get("notified") ?? "";

  try {
    const supabase = getSupabaseAdmin();
    let query = supabase
      .from("leads")
      .select(
        "created_at,region,product,zip,requested_date,urgency,duration,material_type,name,phone,email,notified",
      )
      .order("created_at", { ascending: false });

    if (region) query = query.eq("region", region);
    if (product) query = query.eq("product", product);
    if (zip) query = query.ilike("zip", `%${zip}%`);
    if (dateFrom) query = query.gte("requested_date", dateFrom);
    if (dateTo) query = query.lte("requested_date", dateTo);
    if (notified === "true") query = query.eq("notified", true);
    if (notified === "false") query = query.eq("notified", false);

    const { data, error } = await query.limit(5000);
    if (error) {
      return NextResponse.json(
        { ok: false, error: "Failed to export leads." },
        { status: 500 },
      );
    }

    const header = [
      "created_at",
      "region",
      "product",
      "zip",
      "requested_date",
      "urgency",
      "duration",
      "material_type",
      "name",
      "phone",
      "email",
      "notified",
    ];

    const rows = (data ?? []).map((lead) =>
      [
        csvEscape(String(lead.created_at ?? "")),
        csvEscape(String(lead.region ?? "")),
        csvEscape(String(lead.product ?? "")),
        csvEscape(String(lead.zip ?? "")),
        csvEscape(String(lead.requested_date ?? "")),
        csvEscape(String(lead.urgency ?? "")),
        csvEscape(String(lead.duration ?? "")),
        csvEscape(String(lead.material_type ?? "")),
        csvEscape(String(lead.name ?? "")),
        csvEscape(String(lead.phone ?? "")),
        csvEscape(String(lead.email ?? "")),
        csvEscape(String(lead.notified ?? "")),
      ].join(","),
    );

    const csv = [header.join(","), ...rows].join("\n");

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="leads.csv"',
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to export leads.";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
