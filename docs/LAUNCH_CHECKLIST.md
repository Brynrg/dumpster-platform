# Launch Checklist

## Pre-launch

- Configure Supabase env vars:
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`
- Configure Twilio env vars (optional):
  - `TWILIO_ACCOUNT_SID`
  - `TWILIO_AUTH_TOKEN`
  - `TWILIO_FROM_NUMBER`
  - `SMS_ENABLED=true` (only when ready)
- Set `NEXT_PUBLIC_GA_ID` for GA4 tracking.
- Add all production domains in Netlify site domain settings.
- Configure Cloudflare DNS records (CNAME to Netlify target).
- Run all database migrations in order.

## Google setup

- Create/verify Google Business Profile as a service-area business.
- Verify domain in Google Search Console.
- Submit sitemap URL: `/sitemap.xml`.

## Post-launch

- Test the request funnel end-to-end (`/check`).
- Test admin login and admin routes.
- Verify canonical URLs render correctly per host.
- Check mobile usability and sticky CTA behavior.

## Netlify and Cloudflare readiness notes

- Netlify:
  - Confirm production environment variables are set.
  - Confirm latest deploy is from `main`.
  - Validate redirect/proxy behavior for admin routes.
- Cloudflare:
  - Ensure SSL/TLS mode is compatible with Netlify.
  - Confirm DNS propagation for all domains.
  - Avoid conflicting page rules that rewrite app routes.
