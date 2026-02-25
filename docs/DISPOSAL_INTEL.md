# Disposal Intelligence Reference

This admin-only reference library stores disposal facilities and rates for operational planning and pricing support.

## Markets

- `fl-brevard`
- `tx-north-houston`
- `tx-spring`

## Updating Rates

1. Use official/public sources whenever possible (county or facility published pages/docs).
2. In admin, open `Admin -> Disposal Intel`.
3. Update facility details (phone, website, notes, `last_verified`).
4. Add or update rates through the admin rate upsert API (`/api/admin/disposal/rate`) or your internal tooling.
5. Include `source_url` and `source_notes` on each rate row.

If a published source is not available, do not invent a rate. Store a note:

- `source_notes = "Call to verify"`

## Verify By Phone Workflow

1. Call the facility directly to verify accepted material categories and pricing basis (ton, yd3, minimum, etc.).
2. Update facility `notes` with concise verification context.
3. Set `last_verified` to the verification date.
4. Keep published-source links when available; otherwise document phone verification clearly.

## Seeding

Seed data is defined in:

- `src/lib/disposal/seed.ts`

Manual seeding helper:

- `src/lib/disposal/seedToSupabase.ts` (`seedDisposalData()`)

Migrations:

- `supabase/migrations/001_init.sql`
- `supabase/migrations/002_notifications.sql`
