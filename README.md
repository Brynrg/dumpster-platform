# Dumpster Platform

Multi-region dumpsters and dump trailers demand platform serving Texas (TX) and Florida (FL).

**Primary domain:** SpringDumpsters.com  
**Additional domains:** NorthHoustonDumpsters.com, BrevardCountyDumpsters.com

---

## Project Overview

Demand platform for dumpster and dump trailer rentals across multiple regions. No "coming soon" language anywhere; availability is shown only after request submission.

---

## Local Development

```bash
npm i
npm run dev
```

- **Lint:** `npm run lint`
- **Build:** `npm run build`

Open [http://localhost:3000](http://localhost:3000) to view the app.

---

## Deployment

Deployment is via **Netlify** from GitHub. See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for full setup.

---

## Domain Routing

Domains are managed in **Cloudflare**. Root paths redirect to region-specific paths:

| Domain | Redirect target |
|--------|-----------------|
| SpringDumpsters.com | `/tx/spring/` |
| NorthHoustonDumpsters.com | `/tx/north-houston/` |
| BrevardCountyDumpsters.com | `/fl/brevard-county/` |

---

## Environment Variables

Variable names only. Copy `.env.local.example` to `.env.local` and fill in values.

See `.env.local.example` for the full list.
