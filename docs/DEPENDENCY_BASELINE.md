# Dependency Baseline Report (Phase 00)

**Document Standard**: Package Inventory, Security Vulnerability Audit, and Dependency Lockfile Validation  
**Last Audit Date**: August 11, 2026

---

## 1. Production Package Inventory

| Package                  | Version  | License | Purpose / Scope                                  |
| ------------------------ | -------- | ------- | ------------------------------------------------ |
| `@supabase/supabase-js`  | ^2.49.1  | MIT     | PostgreSQL client and authentication integration |
| `@tanstack/react-query`  | ^5.66.0  | MIT     | Asynchronous state management & server caching   |
| `@tanstack/react-router` | ^1.109.2 | MIT     | File-based routing & SSR hydration               |
| `@tanstack/react-start`  | ^1.109.2 | MIT     | SSR framework engine                             |
| `lucide-react`           | ^0.475.0 | ISC     | UI Icon set                                      |
| `nodemailer`             | ^6.10.0  | MIT-0   | Singleton email transporter                      |
| `react` / `react-dom`    | ^18.3.1  | MIT     | Core UI rendering framework                      |
| `socket.io`              | ^4.8.1   | MIT     | Real-time WebSocket server engine                |
| `socket.io-client`       | ^4.8.1   | MIT     | Real-time WebSocket client hook engine           |
| `zod`                    | ^3.24.2  | MIT     | Type-safe schema validation engine               |

---

## 2. Development Tooling & Compilers

| Package             | Version | Purpose                                          |
| ------------------- | ------- | ------------------------------------------------ |
| `typescript`        | ^5.7.3  | Static type checking                             |
| `vite`              | ^8.2.1  | Frontend build engine & dev server               |
| `tailwindcss`       | ^3.4.17 | Utility-first CSS styling framework              |
| `tsx`               | ^4.19.2 | TypeScript execution runtime for Node test suite |
| `@types/nodemailer` | ^6.4.17 | TypeScript definitions for Nodemailer            |

---

## 3. Dependency Security Verification

1. **Lockfile Integrity**: `package-lock.json` is checked into git and matches specified `package.json` semver requirements.
2. **Module System**: Package runtime is native ES Modules (`"type": "module"`). CJS bundlers (`lucide-react`) are transformed safely in Vite SSR using `ssr.noExternal: ["lucide-react"]`.
3. **No Unused Native Binaries**: Local environment binaries, machine caches, and `.env` secrets are excluded via `.gitignore`.
