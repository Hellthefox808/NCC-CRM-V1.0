# UI/UX Audit & Phased Redesign Plan — SBU NCC Cadet Portal

## What the product actually is (verified, not assumed)

A cadet enrollment and administration portal for **19 Jharkhand Battalion NCC, Sarala Birla University Company, Ranchi**.

- **Roles:** `cadet` and `admin` (Associate NCC Officer). Defined in `src/lib/app-shell.tsx:12`.
- **Public surface:** Home (hero, About NCC, activities, ranks & syllabus, FAQ), `/enroll` (5-step Form 1 under Rules 7 & 11, NCC Act 1948), `/notices`, status tracking by Application ID / Aadhaar / SBU roll no, AI Cadre Assistant ("Subedar Major") chat.
- **Cadet surface:** `/cadet` — 10 sections (overview, attendance, training, activities, certificates, leave, achievements, study material, profile, settings).
- **Officer surface:** `/admin` — 10 tabs (dashboard, batches, cadets, activities, broadcast, attendance, discipline, events, reports, settings), nominal-roll table with search + gender/status/batch filters, status editor with officer remarks and enrolment number, notice broadcast, Excel export.
- **Backend (preserve exactly):** 12 server routes under `src/routes/api/v1/*` — auth login/logout/me, enrollments GET/POST, enrollment status PATCH and lookup, notifications GET/POST, export-excel, ai-chat, health, metrics.
- **Database (preserve exactly):** `cadet_enrollments`, `notifications`, `app_sessions`. RLS on, no policies; all access via service role inside server routes. 6 seeded cadets, 4 seeded notices.
- **Design system already in place:** `src/styles.css` — oklch tokens, Zinc neutrals, primary `#2563EB`, accent `#7C3AED`, radius scale sm–4xl, shadow xs–xl, `.dark` overrides, `panel` / `brand-gradient` utilities, Inter + Inter Tight.

The token layer is good. **The product code barely uses it.** That is the core finding.

## Benchmark basis

Primary token specs read: GitHub Primer (4px size primitives, 3/6/12px radii, base→functional→component color layers, 2px focus outline), Atlassian (8px space scale with 2/4/6px sub-steps, 12/14/16px body ramp), Microsoft Fluent 2 (10→68px type ramp, focus by stroke thickness not colour, AA contrast in-spec), Material 3 (elevation as dp tokens with no baked shadow, semantic colour roles), Vercel Geist (10-step numeric colour ramp, tabular figures for dashboards). Linear / Stripe Dashboard / Notion patterns are inferred from product UI, not published tokens. WCAG 2.2 AA additions used as hard gates: **2.5.8 target size ≥24×24 px**, 2.4.11 focus not obscured, 2.4.13 focus appearance (≥2px, ≥3:1) as best practice.

---

## Findings

Each finding: problem → evidence → industry reference → solution → impact → risk → effort.

### A1 — `/notices` is in an infinite render loop (functional bug, not cosmetic)

- **Evidence:** Console on `/notices` repeats "Maximum update depth exceeded". Cause: `src/hooks/useRealtimeData.ts:44` builds `channels` as a fresh array literal each render and `:150` lists `[channels, options]` as `connect` deps; `:152-162` runs `connect()` on every `connect` identity change → `setState` → re-render → loop. Compounded by there being **no `/ws/v1` WebSocket server in this port**, so every connect attempt fails and retries.
- **Reference:** Linear/Stripe treat perceived latency and idle CPU as product quality, not polish.
- **Solution:** memoise channel list, depend on a stable primitive key, and make the hook degrade silently when no socket endpoint exists. No API/schema change.
- **Impact:** High — fixes battery/CPU drain and unblocks any redesign of the notices module. **Risk:** Low. **Effort:** S.

### A2 — Two visual languages collide on the same screen

- **Evidence:** `/enroll` renders a near-black page background with a light `zinc-50` form card and native OS `<select>` controls (screenshot `enroll-desk`). `/notices` renders a dark hero band above pink/blue/violet-tinted light cards (`notices-desk`). `src/styles.css` defines a full light theme in `:root` and dark overrides in `.dark`, but no theme is ever applied — components hardcode dark surfaces instead: **178 raw hex literals** across `src/features` (e.g. `AdminDashboard.tsx` 18×`#18181B`, 14×`#09090B`), plus raw palette classes in 30 files (`AdminDashboard.tsx` 66×`zinc-200`, 41×`blue-500`).
- **Reference:** Primer's functional-token layer and Fluent 2's neutral/brand split exist precisely so a surface never hardcodes its own colour; M3 pairs surface with on-surface automatically.
- **Solution:** commit to one theme (recommend: light default + working `.dark`), then replace hex/palette literals with the existing semantic tokens module by module. Zero logic change.
- **Impact:** High. **Risk:** Medium (large diff surface). **Effort:** L.

### A3 — 46 shadcn primitives shipped, essentially unused

- **Evidence:** In `src/features`: **1** file imports `Button`, **1** imports `Input`, **0** import `Card`, `Badge` or `Dialog`. Instead: **316+ raw `<button>`** across 27 files, **69 raw `<input>`**, 24 files hand-rolling a card div, 12 hand-rolling modals.
- **Reference:** Every system surveyed (Primer, Atlassian, Fluent, Geist) enforces component-level tokens; ad hoc markup is where state, focus and contrast rules get lost.
- **Solution:** migrate to shared primitives module by module, keeping markup structure and handlers identical.
- **Impact:** High (fixes A4, A5 and A9 simultaneously). **Risk:** Medium. **Effort:** L.

### A4 — Accessibility is below WCAG 2.2 AA in several checkable ways

- **Evidence:** `aria-label` appears in only 6 files, none of them `AdminDashboard`, `CadetDashboard`, `Enrollment` or `Navbar`. 69 raw inputs vs **5 `htmlFor`** associations. **12 custom `fixed inset-0` overlays** (`AdminDashboard.tsx:1493,1616,1692,1780`; `CadetDashboard.tsx:720,845,914`; `StatusTrackerModal.tsx:66`; `AiCadreAssistant.tsx:86`; others) with **zero** `role="dialog"`, `aria-modal`, focus trap or Escape handling. `focus-visible` styling exists only inside `src/components/ui`, which product code doesn't use. Heading order broken: `CadetDashboard` jumps h1→h3; `Enrollment` has no h1. Icon affordances at `h-6 w-6`/`h-7 w-7` = 24–28px, at or under the 2.5.8 floor.
- **Reference:** WCAG 2.2 AA 2.5.8 / 3.3.1; Primer's 2px focus outline tokens; Fluent 2's focus-by-stroke rule.
- **Solution:** replace hand-rolled overlays with `Dialog`, associate every input with `Label`, add accessible names to icon-only controls, enforce ≥24px (target 40px) hit areas, correct heading order.
- **Impact:** High — legal/institutional relevance for a government-adjacent portal. **Risk:** Low. **Effort:** M.

### A5 — Mobile layouts break below ~400px

- **Evidence:** Unconditional `grid-cols-2` (no `sm:` prefix) at `HeroSection.tsx:177`, `CadetDashboard.tsx:738,779,800,941`, `AdminDashboard.tsx:1551,1565,1576,1587,1726,1808`, `StatusTrackerModal.tsx:146`, `SbuNccSignupPortal.tsx:273,432,462,492,633`. ~100+ arbitrary `text-[10px]`/`[11px]` utilities (20× in `SbuNccSignupPortal`, 30× in `AdminDashboard`) — below legible mobile minimums. Mobile hero stacks **four equally weighted full-width CTAs** with no primary (`home-mob` screenshot). Tables are correctly wrapped in `overflow-x-auto` — that part is fine.
- **Reference:** Atlassian body-S floor of 12px; WCAG 2.2 reflow at 320px.
- **Solution:** mobile-first grid prefixes, retire sub-12px text, one primary CTA per view.
- **Impact:** High (cadets enrol on phones). **Risk:** Low. **Effort:** M.

### A6 — Auth screens waste the viewport and bury the task

- **Evidence:** `/admin` and `/cadet` (unauthenticated) push the sign-in card ~500px down behind empty black space, with the marketing footer below (`admin-desk`, `cadet-desk`). Mobile stacks a hero image, a crest, a tagline, a portal toggle and a mode toggle **above** the two fields (`admin-mob`).
- **Reference:** Stripe/Linear/Vercel sign-in: single centred card, credentials above the fold, no marketing chrome.
- **Solution:** centred viewport-height auth layout, chrome suppressed, role/mode toggles compacted. Keep `SbuNccSignupPortal` handlers and the `/auth/login` contract untouched.
- **Impact:** High. **Risk:** Low. **Effort:** M.

### A7 — Typography and spacing have no enforced scale

- **Evidence:** All nine `text-xs`…`text-5xl` steps in simultaneous use; `AdminDashboard.tsx` alone mixes **five** weights (77×`font-black`, 50×`font-bold`, 22×`font-extrabold`, 11× semibold, 11× medium) and **13+** distinct padding values (`px-2.5/3/3.5/4`, `py-1/1.5/2/2.5/3/3.5`, `p-4/5/6`). `Enrollment.tsx` uses `p-2.5` 26× as a de facto standard.
- **Reference:** Atlassian's 7-step heading ramp + 8px bands (0–8 compact, 12–24 component, 32–80 layout); Geist's Heading/Copy/Label split with tabular figures for metrics.
- **Solution:** fix a 6-step display ramp, 3 body sizes, 3 weights (medium/semibold/bold), and 8px spacing bands; tabular figures for all dashboard numerals.
- **Impact:** Medium-High. **Risk:** Low. **Effort:** M.

### A8 — No loading, empty or error vocabulary

- **Evidence:** `Skeleton` is imported **nowhere** in `src/features`; 7 files track `isLoading` but only 2 spinner occurrences exist app-wide. Empty states exist in only 4 places (`FaqSection.tsx:260`, `NotificationsFeed.tsx:738`, `RecentRegistrations.tsx:94`, `AdminDashboard.tsx:953`); `AttendanceSection.tsx:109` and `LeaveSection.tsx:115` render bare table shells when empty. Toast usage: **2 call sites total** despite `sonner` being available; errors are ad hoc local strings (`StatusTrackerModal.tsx:47`, `Enrollment.tsx:123`).
- **Reference:** Primer/Stripe — skeletons for structured data, spinners only for indeterminate button actions; empty state = icon + one line + one CTA.
- **Solution:** three shared state components (skeleton block, empty state, error state) plus toast on every mutation (enrol, status change, broadcast, export).
- **Impact:** High for perceived quality. **Risk:** Low. **Effort:** M.

### A9 — Information architecture: 10 flat admin tabs, several backed by nothing

- **Evidence:** `AdminDashboard.tsx` holds 10 tabs in one 1869-line component; `discipline`, `events` and `attendance` run on in-file mock interfaces (`:63-95`) while only enrollments and notifications are persisted. `CadetDashboard.tsx` (974) and `Enrollment.tsx` (956) likewise mix fetching, tables, modals and formatting.
- **Reference:** Linear/Stripe/GitHub — collapsible sidebar with grouped nav (not a flat 10-item list), ⌘K palette as the power layer.
- **Solution:** group admin nav into Overview / Cadets / Training / Communications / Reports / Settings; split the three giant files into per-section components; label demo-backed sections honestly instead of implying live data. **No route or tab removal.**
- **Impact:** High. **Risk:** Medium. **Effort:** L.

### A10 — Table usability below enterprise baseline

- **Evidence:** the nominal-roll table (`AdminDashboard.tsx:939`) has search + 3 filters but no sticky header, no density control, no column sort affordances in the header, no row selection or bulk actions, no visible pagination even though the API already returns `page`/`totalPages`/`total`.
- **Reference:** Stripe Dashboard / GitHub Projects — sticky header, bulk-select with sticky action bar, saved views, pagination for auditable records.
- **Solution:** sticky header, sortable columns wired to the **existing** `sortBy`/`order` params, pagination wired to the existing response fields, row selection driving the existing status-update and export endpoints. No new endpoints.
- **Impact:** High for officers. **Risk:** Medium. **Effort:** L.

### A11 — Form usability: 5 steps, no schema, no recovery

- **Evidence:** manual per-step checks only (`Enrollment.tsx:119-140`), no zod/yup; no error summary; no autosave, so a dropped connection loses ~40 fields; no inline blur validation; native `<select>` elements; step chips are not keyboard-navigable buttons.
- **Reference:** Atlassian/GitHub — blur-time inline validation, persistent error summary, back-navigable wizard with progress.
- **Solution:** keep the exact same 5 steps, fields and payload; add blur validation with messages, a step error summary, local draft persistence, and tokenised `Select`. Submission contract to `POST /api/v1/enrollments` unchanged.
- **Impact:** High — directly affects completed applications. **Risk:** Medium (form is the revenue path; needs careful validation). **Effort:** L.

### A12 — Dashboard clarity

- **Evidence:** stat tiles (`Admin/StatsOverview.tsx`) show bare counts with no comparison, trend or period; `metrics.ts` returns zeroed placeholder uptime/latency/cache figures presented as real; notice cards use four competing accent colours at equal weight (`notices-desk`), so nothing reads as urgent.
- **Reference:** Geist/Stripe metric card — big tabular number + delta + period + optional sparkline; one accent, severity carried by a single badge.
- **Solution:** restructure metric cards, derive real deltas from existing enrollment timestamps, drop or clearly label placeholder metrics, reduce notice cards to neutral surfaces with one severity badge.
- **Impact:** Medium-High. **Risk:** Low. **Effort:** M.

---

## Phased plan

Guardrails for every phase: no change to `src/routes/api/**`, `supabase/migrations/**`, `src/lib/ncc-db.ts`, `src/services/dataPlatform.ts` request contracts, auth flow, or route paths. Real unit content only (19 JHR BN, SBU Ranchi, ATC/CATC, B & C certificates, SD/SW) — no lorem, no invented statistics.

**Phase 0 — Stabilise (A1)**
Fix the `/notices` render loop and make the realtime hook fail quietly. _Verify:_ zero console errors on all six routes.

**Phase 1 — Design-system enforcement (A2, A7)**
Pick the theme, add tokenised primitives usage rules, define the type ramp and 8px spacing bands, retire hex literals in shared chrome (`Navbar`, `Footer`, `AppChrome`). _Verify:_ no raw hex in migrated files; every route screenshots on one consistent surface.

**Phase 2 — Navigation & shell (A9 nav, A6 chrome suppression)**
Grouped admin sidebar, ⌘K palette over existing actions, correct heading order, auth-route chrome suppression. _Verify:_ keyboard-only traversal of all nav; all six routes still resolve.

**Phase 3 — Authentication (A6)**
Rebuild the sign-in/register presentation around the untouched `SbuNccSignupPortal` handlers. _Verify:_ admin and cadet login still return a session and land on the right dashboard.

**Phase 4 — Admin dashboard & metrics (A12, plus A9 file split)**
Metric cards with real deltas, split `AdminDashboard` into per-section components. _Verify:_ every one of the 10 tabs renders with identical data as today.

**Phase 5 — Tables (A10)**
Sticky header, sort, pagination, selection, bulk actions — all on existing API params. _Verify:_ filter/sort/page combinations return the same rows the API returns; Excel export unchanged.

**Phase 6 — Enrollment form (A11)**
Blur validation, error summary, draft persistence, tokenised controls. _Verify:_ a full 5-step submission creates the same DB row shape and returns a tracking ID; status tracker finds it.

**Phase 7 — States & a11y sweep (A4, A5, A8)**
Skeletons, empty states, error states, toasts on all mutations, `Dialog` migration for all 12 overlays, ≥24px targets, responsive grid prefixes, sub-12px text retired. _Verify:_ axe-style pass on each route at 390px and 1280px.

**Phase 8 — Remaining public pages**
Home, About NCC, Activities, Ranks & Syllabus, FAQ, Footer, notices feed visual pass. _Verify:_ full-route screenshot review, desktop + mobile.

Each phase ends with: build clean, console clean, screenshots at 390/768/1280, and an API smoke check. Nothing proceeds until the previous phase passes.

## Technical notes

- Do not delete `useRealtimeData`; there is no `/ws/v1` endpoint in this port, so it must degrade gracefully rather than be ripped out (`/admin` and `/cadet` both call it).
- `GET /api/v1/auth/me` exists but is never called; session restore is sessionStorage-only. Leave the endpoint in place — wiring it is a behaviour change, out of scope for a redesign.
- Sections backed by in-file mocks (`discipline`, `events`, `attendance`, most of `Cadet/*`) stay mock-backed; only their presentation changes.
- Effort key: S ≈ under an hour of build, M ≈ one module pass, L ≈ multi-file module pass with verification.
