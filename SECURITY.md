# SECURITY POLICY • 19 JHR BN NCC SBU COMPANY PORTAL

---

## 1. Security Architecture & Principles

The **19 JHR BN NCC • Sarala Birla University Company Portal** follows security practices designed to protect cadet personnel data, Aadhaar identity information, bank DBT records, and AI infrastructure credentials.

### Key Controls Implemented

1. **Server-Side Secret Isolation**: AI service keys (`GEMINI_API_KEY`) reside exclusively in server process environment variables (`process.env`) and are never bundled into client JavaScript.
2. **HTTP Security Headers Middleware**: Enforces `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `X-XSS-Protection: 1; mode=block`, `Referrer-Policy`, and `Strict-Transport-Security` (HSTS).
3. **Token Bucket Rate Limiting**: In-memory IP rate-limiting middleware (`maxRequests = 120` per minute) shields endpoints against automated brute-force or Denial of Service (DoS) attempts.
4. **Payload Sanitization & Limits**: Request body sizes are restricted to `10MB` via Express middleware to mitigate memory exhaustion payloads.
5. **Automated CI/CD Pipeline Security**: GitHub Actions pipeline (`.github/workflows/ci.yml`) runs on every pull request and push to validate build sanity, artifact integrity, and zero type errors.
6. **Correlation & Audit Tracing**: Every inbound request is assigned a unique `X-Request-ID` header (`req_${timestamp}_${rand}`) logged for auditability.
7. **Clean Repository Policy**: Secrets, `.env` files, build output folders, and temporary logs are excluded from version control via `.gitignore`.

---

## 2. Enterprise Production Operations & Security Matrix

| Feature | Purpose | Portal Implementation |
| :--- | :--- | :--- |
| **HTTPS + Auto Renewal** | Encrypts traffic and automatically renews TLS certificates | Nginx / Traefik Reverse Proxy + Let's Encrypt (Certbot ACME) |
| **Automatic Restart Policies** | Restarts containers after crashes or server reboot | `restart: always` in `docker-compose.yml` & PM2 process manager |
| **Rolling / Zero-Downtime Deployments** | Deploy new versions without interrupting active cadets/officers | Blue/Green & Docker Compose rolling container swaps |
| **Database Migrations** | Keeps database schema synchronized across versions | Prisma Migrate (`prisma/schema.prisma` & `npx prisma migrate dev`) |
| **Health & Readiness Endpoints** | Allows orchestrators and load balancers to verify system health | `GET /api/v1/health` & `/api/v1/ready` endpoints |
| **Structured Logging** | Produces machine-readable logs for analysis and audit tracing | JSON structured logging with request correlation IDs (`X-Request-ID`) |
| **Metrics Collection** | Measures CPU, memory, latency, and request counts | `GET /api/v1/metrics` Prometheus-compatible metric exporter |
| **Error Tracking** | Captures exceptions, stack traces, and performance bottlenecks | Sentry / Express error handling middleware |
| **Backup & Restore** | Enables disaster recovery after hardware or data failures | Automated snapshot backups to Cloud Storage with tested restore scripts |
| **Rate Limiting** | Mitigates abuse, brute force, and DoS attempts | Express Rate Limit & Token Bucket IP rate limiter (120 req/min) |
| **Firewall** | Restricts exposed ports and unauthorized network access | Cloud Security Groups & UFW restricting open ports to 80/443 |
| **CORS Configuration** | Controls which origins may access backend API endpoints | Explicit allowlist (`APP_URL=https://ncc.sbu.ac.in`) |
| **Security Headers** | Protects against browser-based attacks (XSS, Clickjacking) | Helmet middleware enforcing HSTS, CSP, X-Frame-Options DENY |
| **Dependency Updates** | Keeps dependencies current with automated security patches | Dependabot & GitHub Advanced Security vulnerability alerts |
| **Vulnerability Scanning** | Detects known vulnerabilities in code and containers | Trivy, Docker Scan, npm audit in CI/CD pipeline |

---

## 3. Reporting a Vulnerability

If you discover a potential security vulnerability, please do **NOT** open a public GitHub issue.

Please report security concerns directly to:
- **Author & Repository Owner**: **Ravi Ranjan Singh**
- **GitHub Repository**: [https://github.com/Hellthefox808/NCC-CRM-V1.0](https://github.com/Hellthefox808/NCC-CRM-V1.0)
- **Institution**: Associate NCC Officer (ANO), Sarala Birla University, Ranchi.

Reports will be acknowledged within 24 hours and addressed promptly.

---

## 4. License & Authorship

- **Author & Architect**: **Ravi Ranjan Singh**
- **Role**: Software Engineer • Software Architect • Full Stack Developer • AI SaaS Developer
- **Repository Owner**: **Ravi Ranjan Singh**
