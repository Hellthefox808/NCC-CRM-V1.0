# DEPLOYMENT SECURITY & HARDENING SPECIFICATION

**Environment**: Vite 8 SSR + Nitro Cloudflare Worker + Supabase PostgreSQL  
**Compliance**: CISA Secure by Design / NIST SSDF

---

## 1. Environment & Secret Isolation

- **Zero Secrets in Source Control**: Database passwords, service-role keys, and SMTP credentials must be loaded dynamically via environment variables (`.env`).
- **Production Headers**: Nitro server configuration sets:
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `X-XSS-Protection: 1; mode=block`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Strict-Transport-Security: max-age=31536000; includeSubDomains`

---

## 2. CI/CD Release Gates

Before any production deployment to Cloudflare / Vercel / Docker:

1. `npm test` must run and pass **100% of unit & security tests** (30/30).
2. `npm run build` must compile client and SSR bundles with **0 errors**.
3. Zero P0 or P1 security vulnerabilities unresolved in `SECURITY_REMEDIATION_REPORT.md`.
