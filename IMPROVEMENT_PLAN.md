# Improvement Plan — dumpster-platform

Prioritized P0 → P3. P0 items are blockers for a revenue-generating site and must ship before any new feature work.

---

## P0 — Ship before any new feature

### P0-1. Add Vitest + tests for `POST /api/lead` (mission-critical, currently zero coverage)

**Setup:**
- Add devDeps: `vitest`, `@vitest/coverage-v8`, `vite-tsconfig-paths`
- Create `vitest.config.ts`:
  ```ts
  import { defineConfig } from "vitest/config";
  import tsconfigPaths from "vite-tsconfig-paths";
  export default defineConfig({
    plugins: [tsconfigPaths()],
    test: {
      environment: "node",
      include: ["src/**/*.test.ts"],
      setupFiles: ["./vitest.setup.ts"],
    },
  });
  ```
- Add npm scripts: `"test": "vitest run"`, `"test:watch": "vitest"`, `"test:coverage": "vitest run --coverage"`
- Add GitHub Actions workflow `.github/workflows/test.yml` running `npm ci && npm run lint && npm run test && npm run build` on push/PR.

**Required test cases for `src/app/api/lead/route.ts` (each is a branch in the handler):**

| # | Case | Expected |
|---|---|---|
| 1 | Body is not JSON (e.g. raw string) | `400 { ok: false, error: "Invalid JSON payload." }` |
| 2 | Missing `region` | `400` "region is required." |
| 3 | Empty-string `region` (`"   "`) | `400` "region is required." |
| 4 | Missing `product` | `400` "product is required." |
| 5 | Missing `phone` | `400` "phone is required." |
| 6 | `sms_opt_in` is `false` | `400` "sms_opt_in must be true." |
| 7 | `sms_opt_in` is omitted | `400` "sms_opt_in must be true." |
| 8 | `phone` has only 9 digits | `400` "phone format is invalid." |
| 9 | `phone = "(806) 270-0338"` (US 10 digits) | normalizes to `+18062700338`, inserts |
| 10 | `phone = "1-806-270-0338"` (11 digits, leading 1) | normalizes to `+18062700338`, inserts |
| 11 | `phone = "+1 806 270 0338"` (already E.164) | normalizes to `+18062700338`, inserts |
| 12 | Supabase insert returns error | `500` "Failed to create lead." |
| 13 | Happy path with all optional fields populated | `200 { ok: true, leadId: <uuid> }`, all fields trimmed, empty strings → `null` |
| 14 | Happy path with `SMS_ENABLED=true` | `sendSms` is called once with the normalized phone + opt-out copy |
| 15 | Happy path with `SMS_ENABLED=false` | `sendSms` is NOT called; insert still succeeds |
| 16 | `sendSms` throws | response is still `200` (SMS error is fire-and-forget per current code) |

**Mocking strategy:** mock `@/lib/supabase/server` and `@/lib/twilio/server` at module scope per test. Use `vi.mock("@/lib/supabase/server", ...)`. No real Supabase connection.

**Also test `src/lib/twilio/server.ts::normalizePhone`** as a pure-function unit test — 8 cases covering each branch in the function (10-digit, 11-with-leading-1, 11+-with-`+1`, 11+-without-`+1`, all-non-digits, empty string, whitespace-only, exactly-7 digits → returns `""`).

**Coverage target:** 100% line+branch on `src/app/api/lead/route.ts` and `src/lib/twilio/server.ts::normalizePhone`. CI fails if either drops below.

### P0-2. Audit `/api/admin/login` and admin mutation routes for CSRF + rate limiting

**Findings (verified against source):**

1. **No rate limiting** on `POST /api/admin/login`. The token is a single shared secret in `ADMIN_TOKEN`. An attacker can brute force from any IP. Even a 16-char hex token is brute-forceable if it's logged anywhere or guessable.
2. **No CSRF protection** on admin mutation routes (`/api/admin/notify`, `/api/admin/pricing`, `/api/admin/disposal/*`, `/api/admin/seo/*`). They check `request.cookies.get("admin")?.value === "1"` but:
   - Cookie is `sameSite: "lax"` (good — blocks most cross-site POSTs)
   - However, any same-origin XSS (or a compromised analytics script) can mutate freely
   - No `Origin`/`Referer` header check
   - The disposal/facility and disposal/rate routes also accept `multipart/form-data` — a classic CSRF vector because forms can be submitted cross-origin without preflight
3. **No audit log** of admin actions. If the token leaks, there's no way to know what was done.
4. **`/api/admin/login` returns the same 401 message** for "no token" vs "wrong token" — good (no enumeration), but it also never sets a `WWW-Authenticate` header, so the client treats it as a generic failure.

**Fixes:**

- **Rate limit** `/api/admin/login`:
  - Add `@upstash/ratelimit` + `@upstash/redis` (Netlify-friendly), or a simple in-memory `Map<ip, { count, resetAt }>` keyed by `request.headers.get("x-forwarded-for")` if Netlify-only deployment is acceptable.
  - 5 attempts per 15 minutes per IP. Return 429 with `Retry-After`.
- **Reject form-data on disposal routes** (or require an explicit CSRF token for form submits). The simplest fix: drop the `formData()` branch and only accept JSON. Search the codebase — the admin pages submit JSON via fetch, the formData path appears to be unused; verify by checking `src/components/admin/DisposalFacilitiesTable.tsx`.
- **Add an `Origin` check** on all admin mutation routes:
  ```ts
  const origin = request.headers.get("origin");
  const allowed = new Set([
    "https://springdumpsters.com",
    "https://northhoustondumpsters.com",
    "https://brevardcountydumpsters.com",
  ]);
  if (origin && !allowed.has(origin)) {
    return NextResponse.json({ ok: false, error: "Forbidden." }, { status: 403 });
  }
  ```
- **Add double-submit cookie CSRF token** for state-changing routes. On admin login, set a second non-httpOnly cookie `admin_csrf=<random>`; client must echo it as `X-CSRF-Token` header; server compares. Cheaper than redis-backed tokens.
- **Strengthen `ADMIN_TOKEN`** — require min 32 random bytes hex (document in `LAUNCH_CHECKLIST.md`).
- **Add explicit cookie check in `/admin/leads/export/route.ts`** as defense in depth (middleware already covers it, but a future routing change could expose it).
- **Add an `admin_audit_log` table** + insert on every admin mutation route (route name, IP, timestamp, payload hash).

### P0-3. Decouple SMS opt-in from form submission

**Current behavior (verified):**

- `src/app/api/lead/route.ts` lines 53–58 hard-require `payload.sms_opt_in === true`, returning 400 otherwise.
- `src/components/check/CheckFunnel.tsx` line 119–121 blocks step 5 advancement if `!form.sms_opt_in`.
- `src/app/unavailable/page.tsx` line 76–78 blocks the notify form if `!form.sms_opt_in`.

This blocks legitimate email-only leads and may not satisfy TCPA "express written consent" best practice (which says opt-in must be separable from the underlying transaction).

**UI changes:**

1. **`CheckFunnel.tsx` step 5:**
   - Remove the `nextErrors.sms_opt_in = …` validation block.
   - Add a small "Preferred contact" radio above the SMS checkbox: `[ ] Email  [ ] Phone (we'll call)  [ ] Text (SMS)`.
   - If `Text (SMS)` is selected, surface a separate, plainly-worded TCPA disclosure: "By checking this box, you agree to receive SMS … from <brand>. Msg & data rates may apply. Reply STOP to opt out." with `sms_opt_in` as its own checkbox.
   - Validate: at least one contact method, and either a valid email or a valid phone must be present accordingly.

2. **`unavailable/page.tsx`:**
   - Same pattern — make the SMS opt-in optional. If unchecked, the lead is created without SMS contact attempts.

3. **Add a Privacy Policy + TCPA-language link** under the consent box on both pages.

**API changes (`src/app/api/lead/route.ts`):**

```ts
// Replace lines 47-58 with:
if (!payload.phone?.trim() && !payload.email?.trim()) {
  return NextResponse.json(
    { ok: false, error: "Either phone or email is required." },
    { status: 400 },
  );
}

// Phone normalization only applies if phone was provided
let normalizedPhone = "";
if (payload.phone?.trim()) {
  normalizedPhone = normalizePhone(payload.phone);
  if (normalizedPhone.replace(/\D/g, "").length < 10) {
    return NextResponse.json(
      { ok: false, error: "phone format is invalid." },
      { status: 400 },
    );
  }
}

// sms_opt_in is now optional and only meaningful when phone is provided
const smsOptIn = payload.sms_opt_in === true && !!normalizedPhone;
```

In the insert, write `sms_opt_in: smsOptIn` (not a hard-coded `true`). SMS confirmation should only fire when `smsOptIn && isSmsEnabled()`.

**Schema change:** `leads.phone` is currently `not null` in `001_init.sql`. Either:
- Add migration `005_optional_phone.sql` to drop NOT NULL on `leads.phone`, OR
- Keep phone required but allow `sms_opt_in=false` (email-only users still leave a phone for callbacks)

Recommend option B — phone stays required, SMS opt-in becomes optional. Less risky migration.

**Test:** add Vitest cases for the new branches (no phone, no email, both, phone but sms_opt_in=false, etc.).

### P0-4. Verify `SUPABASE_SERVICE_ROLE_KEY` boundary

**Status:** verified clean. `grep -rn 'SUPABASE_SERVICE_ROLE_KEY\|getSupabaseAdmin' src/` shows no client-component imports. The key is read only inside `src/lib/supabase/server.ts::getSupabaseAdmin()`, which is imported only by:
- Server-only route handlers under `src/app/api/`
- Server components under `src/app/admin/*/page.tsx` (no `"use client"`)
- The disposal seed helper (not bundled)

**Hardening (small, ship with P0):**
- Add `import "server-only";` as the first line of `src/lib/supabase/server.ts` (matches the pattern in `src/lib/twilio/server.ts`). This makes Next.js explicitly error if any client component ever imports it.
- Add a Vitest unit test that statically scans `src/components/**/*.tsx` for any `getSupabaseAdmin` or `SUPABASE_SERVICE_ROLE_KEY` reference and fails CI if found.
- Document in `docs/DEPLOYMENT.md` that `SUPABASE_SERVICE_ROLE_KEY` must be a **server-only** env in Netlify (no `NEXT_PUBLIC_` prefix). Already implied — make it explicit with a callout.

---

## P1 — Important hardening (do within a sprint of P0)

- **Enable Dependabot:** add `.github/dependabot.yml` for npm + GitHub Actions. Repo currently has `dependabot_security_updates: disabled` per GH API.
- **Flush the localStorage lead-fallback queue.** `src/app/unavailable/page.tsx:112-130` enqueues failed leads to `localStorage.lead_queue_v1` but nothing ever drains it. Either: (a) attempt to flush on every page mount, or (b) remove the fallback if you don't want eventual-consistency complexity.
- **Add security headers** via `next.config.ts` `headers()` or `netlify.toml`:
  - `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
  - `Content-Security-Policy` (start report-only; allow Google Fonts, GA4, supabase.co)
  - `X-Content-Type-Options: nosniff`
  - `Permissions-Policy: geolocation=(), microphone=(), camera=()`
  - `Referrer-Policy: strict-origin-when-cross-origin`
- **Add a Lighthouse CI** action — fails the build if mobile performance drops below 80 or accessibility below 95. Given the local-SEO investment in docs, this matters.
- **Add Sentry (or alternative)** server-side error reporting. Currently `console.error` is the only signal.
- **Wider input validation** with `zod`. Replace the hand-rolled `payload.region?.trim()` guards in every admin route with a `zod` schema per route; cuts code by ~30% and gives consistent error messages.

## P2 — Quality + DX

- **Adopt a single typed Supabase client** — generate types via `supabase gen types typescript` and check in `src/types/supabase.ts`. Today every route hand-codes column types.
- **Storybook** for `src/components/ui/*` and `src/components/admin/*` — speeds up future region additions.
- **Playwright smoke test** that exercises `/check` → `/unavailable` → POST `/api/lead` against a Supabase test project.
- **Refactor `regions.ts` + the SQL CHECK constraints** so adding a region is a single source of truth. Today markets are duplicated in 3 places (TS const, 3 SQL CHECK constraints).
- **Add `created_at`/`updated_at` triggers** on tables that currently only have `created_at` (`pricing_configs`, `disposal_facilities`, `seo_tasks`, `citations`) so admin edits are auditable.
- **Drop the `formData` branch** in disposal facility/rate routes if the admin UI only ever sends JSON. Verify by checking `DisposalFacilitiesTable.tsx`; less code = less attack surface.

## P3 — Stretch

- **i18n for Spanish-speaking customers** in TX (significant population in service areas). Just region pages + funnel, not admin.
- **A/B-test the check-funnel-to-lead conversion** — current flow forces users through 6 steps before asking for contact info; consider asking for phone first.
- **GBP review-request automation:** the `review_requests` table exists with `status='draft'`; build a job that fires via Twilio when `status='approved'` (already half-built in `/admin/seo`).
- **Pricing-model "decision support" surfacing on the homepage** as a logged-in operator view (e.g. "demand vs break-even" for fleet investment decisions). Pipeline exists in `pricing_configs` + `docs/PRICING_MODEL.md`.
- **Multi-tenant generalization** if the same platform is ever needed for a third region pair — currently region IDs are baked into SQL CHECK constraints.
