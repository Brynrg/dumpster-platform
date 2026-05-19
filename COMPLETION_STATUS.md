# Completion Status

> Status doc for AI agents working on this repo. Updated 2026-05-19.

**Score:** 70 / 100 — Real commercial MVP, dormant 3+ months, zero tests
**State:** Live at springdumpsters.com. Last touched 2026-02-25.
**Stack:** Next.js 16 / React 19 / Tailwind 4, Supabase (Postgres), Twilio SMS, Netlify hosting, Cloudflare for three-domain redirects

## What works
- Three regions wired up: TX-Spring, TX-North-Houston, FL-Brevard
- `POST /api/lead`: validates region/product/phone/sms_opt_in, normalizes phone, inserts to Supabase, triggers SMS
- 4 SQL migrations under `supabase/migrations/`
- Full admin surface: `/admin/leads` (+ CSV export), `/admin/disposal`, `/admin/metrics`, `/admin/notify`, `/admin/pricing`, `/admin/seo` with matching API routes
- Quality docs: `DEPLOYMENT.md`, `LAUNCH_CHECKLIST.md`, `LOCAL_SEO_PLAYBOOK.md`, `PRICING_MODEL.md`, `DISPOSAL_INTEL.md`, `ADS_STARTER_KIT.md`

## Known gaps
- **Zero tests** on the mission-critical `/api/lead` path
- Admin auth is a single `/api/admin/login` route — no visible CSRF, rate limiting, or session hardening. Worth auditing the service-role Supabase key isn't reachable from any client bundle.
- Lead funnel **requires `sms_opt_in === true`** to submit — blocks legitimate email-only leads, shaky on TCPA-style consent UX
- No CI, no Dependabot
- 3 months stale on a revenue-generating site

## Priority improvements
1. **Vitest the `/api/lead` validation branches** + a smoke test against a Supabase test project
2. **Audit admin auth** — add CSRF + rate limiting + confirm service-role key boundary
3. **Decouple SMS opt-in from form submission** — accept email-only leads, make SMS optional
4. **Add Dependabot config** and a Lighthouse/SEO CI check given the local-SEO investment in docs

## Notes for AI agents
- This is a **revenue-generating commercial site**. Changes need a deploy preview before merging.
- **Live URL**: https://springdumpsters.com (Netlify)
- **Sensitive**: `SUPABASE_SERVICE_ROLE_KEY` must stay server-side only. Verify any new route doesn't accidentally bundle it.
- **Regional dispatch**: see `src/lib/regions.ts` — adding a new region means a new entry there + corresponding pages under `/tx/*` or `/fl/*`
- Lead notification flow is Twilio SMS — test with `TWILIO_TEST_MODE` if available
