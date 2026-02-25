# Deployment Guide

Deployment is via **Netlify** from GitHub. Domains are managed in **Cloudflare**.

---

## Netlify Setup

1. **Import from GitHub**
   - Connect your GitHub repo to Netlify
   - Select the repository

2. **Build settings**
   - **Build command:** `npm run build`
   - **Publish directory:** `.next` (Next.js auto-configures this)
   - **Base directory:** (leave empty unless using a monorepo)

3. **Next.js runtime**
   - Netlify auto-detects Next.js projects
   - If detection fails, add `netlify.toml` in the project root:

   ```toml
   [build]
     command = "npm run build"

   [[plugins]]
     package = "@netlify/plugin-nextjs"
   ```

   The `@netlify/plugin-nextjs` plugin handles Next.js routing, ISR, and serverless functions.

4. **Custom domains**
   - In Netlify: **Domain management** → **Add custom domain**
   - Add all three domains (apex + www for each):
     - `springdumpsters.com` and `www.springdumpsters.com`
     - `northhoustondumpsters.com` and `www.northhoustondumpsters.com`
     - `brevardcountydumpsters.com` and `www.brevardcountydumpsters.com`

---

## Cloudflare DNS

1. **CNAME records**
   - Point `@` (apex) and `www` to your Netlify target (e.g. `your-site.netlify.app`)
   - For apex: use CNAME flattening (Cloudflare Pro) or ALIAS if available
   - For `www`: standard CNAME to Netlify

2. **SSL**
   - Set SSL mode to **Full (strict)** in Cloudflare

---

## Cloudflare Redirect Rules

Configure Redirect Rules so root paths route to region-specific paths:

| Source URL | Redirect to |
|------------|-------------|
| `springdumpsters.com/` | `https://springdumpsters.com/tx/spring/` |
| `www.springdumpsters.com/` | `https://springdumpsters.com/tx/spring/` |
| `northhoustondumpsters.com/` | `https://northhoustondumpsters.com/tx/north-houston/` |
| `www.northhoustondumpsters.com/` | `https://northhoustondumpsters.com/tx/north-houston/` |
| `brevardcountydumpsters.com/` | `https://brevardcountydumpsters.com/fl/brevard-county/` |
| `www.brevardcountydumpsters.com/` | `https://brevardcountydumpsters.com/fl/brevard-county/` |

**Canonicalization:** Redirect `www` → apex for each domain so the canonical URL is the apex (e.g. `springdumpsters.com`).

---

## Environment Variables

Set all required variables in Netlify: **Site settings** → **Environment variables**. See `.env.local.example` for the list of variable names.

### Supabase Notes

- Configure Supabase env vars in Netlify, including:
  - `SUPABASE_URL`
  - `SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` must be set as a server-side environment variable in Netlify. Do not expose it to client-side code.
- Apply SQL migrations from `supabase/migrations/` in the Supabase SQL editor (or your migration workflow) before using lead capture and admin reporting routes.
