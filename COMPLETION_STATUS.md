# Completion Status — dumpster-platform

> Refined status doc. Verified against source files on `main` 2026-05-19.

**Score:** 70 / 100 — Real commercial MVP, dormant ~3 months, zero tests
**Live URL:** https://springdumpsters.com (Netlify-hosted) + sister domains `northhoustondumpsters.com`, `brevardcountydumpsters.com` fronted by Cloudflare redirect rules
**Last touched:** 2026-02-25 (per existing COMPLETION_STATUS); repo last pushed 2026-05-19 (housekeeping only)
**Stack (verified from `package.json`):**
- Next.js **16.1.6** (App Router, Turbopack default)
- React **19.2.3** / react-dom 19.2.3
- Tailwind **v4** (`@tailwindcss/postcss`)
- `@supabase/supabase-js` ^2.97.0
- `twilio` ^5.12.2
- TypeScript 5, ESLint 9, `eslint-config-next` 16.1.6
- Hosting: Netlify via `@netlify/plugin-nextjs` (declared in `netlify.toml`)
- `next.config.ts` is empty (no custom config)

## Architecture (verified)

### Regions (`src/lib/regions.ts`)
Three regions hard-coded as a `Record<RegionId, Region>`:
| `id` | `pathPrefix` | Cities |
|---|---|---|
| `tx-spring` | `/tx/spring` | Spring, Klein, Tomball, The Woodlands, Porter |
| `tx-north-houston` | `/tx/north-houston` | North Houston, Aldine, Greenspoint, Cypress |
| `fl-brevard` | `/fl/brevard-county` | Melbourne, Palm Bay, Titusville, Cocoa, Merritt Island, Viera, Rockledge |

Adding a region requires: a new `RegionId` entry, a matching page under `src/app/tx/*` or `src/app/fl/*`, and updating the `seo_tasks` / `citations` / `review_requests` SQL `CHECK` constraints in `004_local_seo_ops.sql` (they currently enumerate the three markets).

### Route inventory

**Public pages** (`src/app/`):
- `/` — region hub (`page.tsx`)
- `/tx/spring` — region landing (LocalBusiness + Service JSON-LD)
- `/tx/north-houston` — region landing
- `/fl/brevard-county` — region landing
- `/dumpsters` — product page
- `/dump-trailers` — product page
- `/faq` — FAQ page
- `/service-areas` — index of city pages
- `/service-areas/[slug]` — per-city dynamic page (cities listed in `src/lib/cities.ts`)
- `/check` — multi-step funnel host (uses `<CheckFunnel>` client component)
- `/unavailable` — terminal page where the actual `POST /api/lead` call happens (NOT inside CheckFunnel — important finding, see below)
- `/sitemap.xml` (via `sitemap.ts`) — static paths + per-city entries
- `/robots.txt` (via `robots.ts`) — allow-all

**Admin pages** (cookie-gated via `middleware.ts` matcher `["/admin/:path*"]`, redirects to `/admin` if cookie `admin !== "1"`):
- `/admin` — login form
- `/admin/leads` — leads table with filters (region/product/zip/date range/notified)
- `/admin/leads/export` — CSV export (Route Handler GET, **does not check the admin cookie** — see Improvement Plan)
- `/admin/disposal` — facilities + rates table
- `/admin/metrics` — funnel + lead metrics
- `/admin/notify` — campaign builder (Twilio bulk-SMS)
- `/admin/pricing` — regional pricing-config editor
- `/admin/seo` — Local SEO Ops board (tasks, reviews, citations)

**API routes** (all under `src/app/api/`):

| Route | Method | Auth | Notes |
|---|---|---|---|
| `/api/lead` | POST | none (public) | Validates region/product/phone/`sms_opt_in === true`, normalizes phone, inserts to `leads`, fires Twilio if `SMS_ENABLED=true` |
| `/api/admin/login` | POST | env `ADMIN_TOKEN` shared-secret | Sets `admin=1` httpOnly cookie, 8h, `sameSite=lax`. No rate limit, no CSRF protection |
| `/api/admin/notify` | POST | cookie `admin=1` | Preview/execute bulk SMS campaign; respects `sms_opt_in` and dryRun |
| `/api/admin/pricing` | POST | cookie `admin=1` | Upserts `pricing_configs` keyed by region |
| `/api/admin/disposal/facility` | POST | cookie `admin=1` | Upsert disposal facility (JSON or formData) |
| `/api/admin/disposal/rate` | POST | cookie `admin=1` | Upsert disposal rate (JSON or formData) |
| `/api/admin/seo/task` | POST | cookie `admin=1` | Upsert seo_tasks row |
| `/api/admin/seo/review` | POST | cookie `admin=1` | Upsert review_requests draft |
| `/api/admin/seo/citation` | POST | cookie `admin=1` | Upsert citations row (unique on market+provider) |
| `/admin/leads/export` | GET | **NONE** | Reads `searchParams` and returns CSV — currently relies on middleware for the page to redirect, but middleware only matches `/admin/:path*` which DOES cover this. Confirmed protected via middleware. |

### Supabase schema (4 migrations)

| File | Tables |
|---|---|
| `001_init.sql` | `leads`, `disposal_facilities`, `disposal_rates` (+ `pgcrypto` extension) |
| `002_notifications.sql` | `notification_campaigns`, `lead_notifications` (unique on lead_id+campaign_id) |
| `003_pricing_model.sql` | `pricing_configs` (unique on `region`) |
| `004_local_seo_ops.sql` | `seo_tasks`, `review_requests`, `citations`. Markets hard-coded via CHECK constraints to the same three `RegionId`s. |

**No RLS policies declared.** All tables rely on the service-role key bypassing RLS — which works because no client-side code uses the anon key. Adding a future client-side Supabase usage would require RLS policies first.

## What works (verified)
- Three regions wired end-to-end (page, schema markup, sitemap entry, region-id in DB CHECKs)
- `POST /api/lead` validates region/product/phone, requires `sms_opt_in === true`, normalizes phone via `normalizePhone` (E.164 +1), inserts to Supabase, fires SMS if enabled
- Lead-submission flow is actually a **two-stage funnel**:
  1. `/check` → `<CheckFunnel>` collects 5 steps + review, validates client-side, calls `track("submit_request", …)`, stashes to `sessionStorage` as `rental_request_v1`, and pushes to `/unavailable`
  2. `/unavailable` shows "no units available", asks for SMS opt-in, then `fetch("/api/lead")` with a localStorage fallback queue (`lead_queue_v1`) if the API call fails
- Admin auth via shared secret `ADMIN_TOKEN` (server env), 8h httpOnly cookie
- `middleware.ts` redirects unauthenticated `/admin/*` (except `/admin`) to login
- Full admin surface with matching API routes
- GA4 + GSC verification wired in `layout.tsx` (env-gated)
- Per-region LocalBusiness + Service schema.org JSON-LD on region pages
- Quality docs at `docs/`: `DEPLOYMENT.md`, `LAUNCH_CHECKLIST.md`, `LOCAL_SEO_PLAYBOOK.md`, `LOCAL_SEO_OPS.md`, `PRICING_MODEL.md`, `DISPOSAL_INTEL.md`, `ADS_STARTER_KIT.md`

## Service-role-key boundary — verified

`SUPABASE_SERVICE_ROLE_KEY` is only read inside `src/lib/supabase/server.ts::getSupabaseAdmin()`. `grep -rn 'getSupabaseAdmin'` shows imports only in:
- All route handlers under `src/app/api/admin/*` and `src/app/api/lead/route.ts`
- `src/app/admin/*/page.tsx` server components (no `"use client"`)
- `src/app/admin/leads/export/route.ts`
- `src/lib/disposal/seedToSupabase.ts` (helper, not bundled client-side)

No `"use client"` file imports `getSupabaseAdmin`. The service-role key is not reachable from any client bundle. **However, the file lacks a `"server-only"` import guard** — easy to add as a hardening step.

## Known gaps (verified against source)
- **Zero tests.** No `vitest`/`jest`/`playwright` in `package.json`, no `__tests__` folders, no `*.test.ts`.
- **Admin auth weaknesses:**
  - No rate limiting on `/api/admin/login` (brute-force vulnerable; `ADMIN_TOKEN` is a single shared secret)
  - No CSRF protection on admin mutation routes — they accept JSON bodies with `sameSite=lax` cookies, so a same-origin attacker page on the prod domain can mutate. (Cross-site JSON CSRF is mitigated by browsers requiring CORS preflight, but a malicious sub-resource on the same eTLD+1 still could.)
  - No CSRF token, no double-submit cookie, no `Origin`/`Referer` check
  - `/api/admin/login` returns a generic 401 for both "missing token" and "wrong token" — good — but does not log attempts
- **`sms_opt_in === true` is required by `POST /api/lead`** (line 53–58 of `api/lead/route.ts`). The funnel never lets a user submit without checking the SMS box. This blocks legitimate email-only leads and, depending on TCPA review, conflates marketing opt-in with transactional contact.
- **`/admin/leads/export` route handler does not explicitly check the admin cookie**, but is protected because `middleware.ts` matches `/admin/:path*` and the export lives at `/admin/leads/export` → middleware catches it. Still worth adding an explicit cookie check (defense in depth).
- **No `"server-only"` import** in `src/lib/supabase/server.ts` (compare to `src/lib/twilio/server.ts` which does import `"server-only"`). Easy hardening.
- **No CI, no Dependabot.** Repo's GitHub `dependabot_security_updates` is `disabled`.
- **No `.env.local.example`** in the repo (README references it but it's not committed) — actually, gitignore allows `.env.local.example`. Verify and add.
- **3 months stale on a revenue-generating site.**
- `next.config.ts` is empty — no security headers (CSP, Permissions-Policy). Netlify adds nothing custom in `netlify.toml` either.
- `requested_date` filter in `/admin/leads/export` uses `gte`/`lte` against a possibly-null column without coalescing — could miss leads where `requested_date` is null and date filter is set.
- Lead-fallback queue (`localStorage.lead_queue_v1` in `unavailable/page.tsx`) is never flushed — silent data loss if the API is briefly down.

## Notes for AI agents
- This is a **revenue-generating commercial site.** Changes need a deploy preview before merging.
- The actual lead-creation call is in `/unavailable`, not `/check`. The check funnel pre-fills sessionStorage; the SMS-opt-in checkbox + final submit lives on `/unavailable`. Any test of the lead path must simulate that two-page flow.
- Regional dispatch: `src/lib/regions.ts`. Adding a region requires the page + an update to the SQL CHECK constraints in `004_local_seo_ops.sql`.
- Twilio is gated by `SMS_ENABLED=true`; in dev keep it off to avoid charges.
- `SUPABASE_SERVICE_ROLE_KEY` must stay server-side; add a `"server-only"` guard.
