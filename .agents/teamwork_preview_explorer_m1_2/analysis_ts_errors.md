# TypeScript Compilation Errors Deep-Dive & Remediation Analysis

**Explorer**: Explorer M1-2  
**Milestone**: M1 - Core Security, Identity & Verification Hardening  
**Target Verification**: `npx tsc --noEmit` -> 0 errors  
**Timestamp**: 2026-08-21T18:40:00Z

---

## 1. Executive Summary

A complete scan of the repository with `npx tsc --noEmit` identified TypeScript compilation errors spanning four primary categories:

1. **`AdminGate` & Session Role Contract Divergence**: Route handlers in `calendar.*.ts` and `ano/applications.*.ts` expect `gate.officerName` and `gate.officer`, but `AdminGate` in `backend/lib/cadet-registry.server.ts` only exposed `{ ok: boolean; status: number; error?: string }`.
2. **Supabase Typed Client Schema vs Dynamic Tables**: Tables created for services (e.g. `calendar_event_attendees`, `calendar_event_reminders`, `ids_events`, `ids_alerts`, `ids_actions`, `email_jobs`, `email_delivery_logs`, `cadet_users`, `account_activation_tokens`, `onboarding_progress`) and columns not generated in `Database["public"]["Tables"]` trigger TS overload failures and `RejectExcessProperties` errors. Additionally, gratuitous `as Record<string, unknown>` type casts on typed tables like `auth_otp_codes` and `app_credentials` break Supabase's strict insert/update overloads.
3. **UI Route `UserSessionProfile` Type Mismatch**: In `cadet-database.tsx`, `cadet.tsx`, `login.tsx`, and `admin.tsx`, `SbuNccSignupPortal`'s `onLoginSuccess` passes `(type, user?: UserSessionProfile | Record<string, unknown>)`, while `shell.signIn` expects `(type: UserType, user: Record<string, unknown> | null)`. The possible `undefined` violates strict null-checking.
4. **Service & Component Prop Mismatches**: Local type definitions and parameter types in `multichannel.service.ts`, `redis.server.ts`, `useSocket.ts`, `Home.tsx`, `NotificationsFeed.tsx`, `AdminDashboard.tsx`, `CadetDashboard.tsx`, `CadetDashboardOverview.tsx`, and `pipeline-e2e.test.ts`.

---

## 2. Root-Cause Category Breakdown

### Category 1: `AdminGate` Contract in `backend/lib/cadet-registry.server.ts`

#### Problem

In `backend/lib/cadet-registry.server.ts`:

```typescript
export interface AdminGate {
  ok: boolean;
  status: number;
  error?: string;
}
```

`requireOfficer(request)` only selected `"id, role, expires_at"` and returned `{ ok: true, status: 200 }`.
However, callers in `calendar.$id.ts`, `calendar.$id.publish.ts`, `calendar.$id.cancel.ts`, `ano/applications.$id.approve.ts`, `ano/applications.$id.reject.ts`, and `ano/applications.$id.request-correction.ts` access:

- `gate.officerName` (for `updated_by` and `actorId` audit logs)
- `gate.officer` (for `gate.officer?.email`, `gate.officer?.display_name`)
- `gate.user`

#### Remediation

1. Expand `AdminGate` interface to include `officerName?: string`, `officer?: { id?: string; email?: string; display_name?: string; role?: string }`, and `user?: { id?: string; email?: string; role?: string; name?: string }`.
2. Update `requireOfficer` to query `id, role, expires_at, display_name, email` from `app_sessions`, compute `officerName = session.display_name || session.email || "Officer"`, and populate the extended fields.

---

### Category 2: Supabase Query Typing & `RejectExcessProperties`

#### Problem 2A: Un-typed Dynamic Tables & Extended Columns

Supabase client `createClient<Database>` types only the tables in `types.ts`.

- `calendar_events` columns `status`, `timezone`, `created_by`, `updated_by`, `published_at`, `cancelled_at` are not in the generated TypeScript schema definitions.
- Auxiliary tables (`calendar_event_attendees`, `calendar_event_reminders`, `ids_events`, `ids_alerts`, `ids_actions`, `email_jobs`, `email_delivery_logs`, `cadet_users`, `account_activation_tokens`, `onboarding_progress`) are not declared in `Database["public"]["Tables"]`.

When executing `admin.from("calendar_event_reminders")`, TypeScript evaluates `relation` against the union of keys and errors with `TS2769: No overload matches this call` / `Argument of type '"calendar_event_reminders"' is not assignable to parameter of type ...`.

#### Remediation 2A

Type assertion on the table builder `(admin as any).from("<table_name>")` or `(admin as unknown as { from: ... })` allows dynamic and extension queries to compile cleanly under strict TypeScript.

#### Problem 2B: Incompatible Type Assertions on Schema-Typed Tables

In `auth-otp.server.ts`, queries to `auth_otp_codes` used `insert({ ... } as Record<string, unknown>)`.
Supabase's `insert` method uses conditional type mapping with `RejectExcessProperties`. An object with `[x: string]: unknown` is rejected because index signatures conflict with strict property exactness.

#### Remediation 2B

Remove unnecessary `as Record<string, unknown>` type assertions so object literals match `TablesInsert<"auth_otp_codes">` and `TablesInsert<"app_credentials">` exactly.

---

### Category 3: UI Routes & `UserSessionProfile` Null-Safety

#### Problem

In `src/routes/cadet-database.tsx`, `src/routes/cadet.tsx`, `src/routes/login.tsx`, and `src/routes/admin.tsx`:

```tsx
onLoginSuccess={(type, user) => shell.signIn(type, user)}
```

`onLoginSuccess` delivers `user?: UserSessionProfile | Record<string, unknown>`.
`shell.signIn` requires `user: Record<string, unknown> | null`.
Because `user` may be `undefined`, TypeScript throws `TS2345: Argument of type 'Record<string, unknown> | UserSessionProfile | undefined' is not assignable to parameter of type 'Record<string, unknown> | null'`.

#### Remediation

Pass `(user as Record<string, unknown>) ?? null`:

```tsx
onLoginSuccess={(type, user) => shell.signIn(type, (user as Record<string, unknown>) ?? null)}
```

---

### Category 4: Component, Service, and Hook Corrections

1. **`src/routes/api/v1/calendar.$id.reminders.ts`**:
   `prompterEngine.addCustomReminder` expects channel `"EMAIL" | "SOCKET_IO" | "IN_APP" | "BOTH"`. The route passed `"SOCKET"` instead of `"SOCKET_IO"`.
   _Fix_: Map `"SOCKET"` to `"SOCKET_IO"`.
2. **`src/routes/api/v1/notifications.$id.read.ts`**:
   `admin.from("notifications").update({ read: true, read_at: ... } as Record<string, unknown>)` triggers `RejectExcessProperties`.
   _Fix_: Call `(admin as any).from("notifications").update({ read: true, read_at: new Date().toISOString() })`.
3. **`backend/services/messaging/multichannel.service.ts`**:
   `emailResult` missing `messageId` field on error branch.
   _Fix_: Provide `messageId: undefined`.
4. **`backend/lib/ncc-db.ts`**:
   `new Date(row.created_at)` where `row.created_at` is `unknown`.
   _Fix_: `new Date(row.created_at as string | number | Date)`.
5. **`backend/lib/redis.server.ts`**:
   Dynamic imports of optional packages `@upstash/redis` and `ioredis` without declared module types, and possibly undefined `.connect()`.
   _Fix_: Safe typed dynamic imports `(await import(/* @vite-ignore */ "@upstash/redis" as string) as any)` and guard `if (ioredisInstance?.connect) await ioredisInstance.connect().catch(() => {});`.
6. **`frontend/hooks/useSocket.ts`**:
   `socket.connected` check where `socket` is `Socket | null`.
   _Fix_: `if (socket && socket.connected)`.
7. **`frontend/features/pages/Home.tsx`**:
   `HomeProps` declared `openStatusModal: () => void;` but `HeroSection` and `FaqSection` pass `(query?: string) => void`.
   _Fix_: Change `openStatusModal: (query?: string) => void;`.
8. **`frontend/features/pages/AdminDashboard.tsx` & `CadetDashboard.tsx`**:
   `setActiveTab` state dispatcher type cast to `(tab: string) => void`.
   _Fix_: Cast `setActiveTab as (tab: string) => void` or `(t) => setActiveTab(t as any)`.
9. **`frontend/features/Cadet/CadetDashboardOverview.tsx`**:
   `CadetNotificationItem` missing optional fields `priority?: string; body?: string; date?: string;`, and `CadetProfile` missing document verification flags.
   _Fix_: Add optional properties to `CadetNotificationItem` and `src/types.ts` `CadetProfile`.
10. **`frontend/features/NotificationsFeed.tsx`**:
    `handleRealtimeNotice` parameter type adjusted to `NotificationItem | Record<string, unknown>`.
11. **`backend/tests/pipeline-e2e.test.ts`**:
    `mapCadet` import from `../lib/ncc-db.ts` (re-export `mapCadet` from `ncc-db.ts` or import from `cadet-registry.server.ts`).
12. **`src/routes/api/v1/auth/forgot-password.ts`**:
    `checkRateLimitAsync` called with positional args `(key, 5, 300)` instead of `(key, { maxAttempts: 5, windowMs: 300 * 1000 })`.
13. **`src/routes/api/v1/auth/activate.ts` & `set-password.ts`**:
    `app_credentials` queried for non-existent columns `email, role`. Use `identifier` and fallback/metadata properly.

---

## 3. Exact Before / After Code Changes

### File 1: `backend/lib/cadet-registry.server.ts`

#### Before:

```typescript
export interface AdminGate {
  ok: boolean;
  status: number;
  error?: string;
}

...

export async function requireOfficer(request: Request): Promise<AdminGate> {
  const token = bearer(request);
  if (!token) return { ok: false, status: 401, error: "Officer sign-in required." };

  const { getOrSetCache } = await import("./cache.server.ts");
  const session = await getOrSetCache(`ncc:session:${token}`, 300, async () => {
    const admin = await getAdmin();
    const { data } = await admin
      .from("app_sessions")
      .select("id, role, expires_at")
      .eq("token", token)
      .maybeSingle();
    return data ?? null;
  });

  if (!session) return { ok: false, status: 401, error: "Session not found." };
  if (Date.now() > new Date(session.expires_at).getTime()) {
    return { ok: false, status: 401, error: "Session expired." };
  }
  if (session.role !== "admin") {
    return { ok: false, status: 403, error: "Officer privileges required." };
  }
  return { ok: true, status: 200 };
}
```

#### After:

```typescript
export interface AdminGate {
  ok: boolean;
  status: number;
  error?: string;
  officerName?: string;
  officer?: {
    id?: string;
    email?: string;
    display_name?: string;
    role?: string;
  };
  user?: {
    id?: string;
    email?: string;
    role?: string;
    name?: string;
  };
}

...

export async function requireOfficer(request: Request): Promise<AdminGate> {
  const token = bearer(request);
  if (!token) return { ok: false, status: 401, error: "Officer sign-in required." };

  const { getOrSetCache } = await import("./cache.server.ts");
  const session = await getOrSetCache(`ncc:session:${token}`, 300, async () => {
    const admin = await getAdmin();
    const { data } = await admin
      .from("app_sessions")
      .select("id, role, expires_at, display_name, email")
      .eq("token", token)
      .maybeSingle();
    return data ?? null;
  });

  if (!session) return { ok: false, status: 401, error: "Session not found." };
  if (Date.now() > new Date(session.expires_at).getTime()) {
    return { ok: false, status: 401, error: "Session expired." };
  }
  if (session.role !== "admin") {
    return { ok: false, status: 403, error: "Officer privileges required." };
  }

  const s = session as Record<string, unknown>;
  const officerName = (s.display_name as string) || (s.email as string) || "Officer";
  return {
    ok: true,
    status: 200,
    officerName,
    officer: {
      id: s.id as string,
      email: s.email as string,
      display_name: s.display_name as string,
      role: s.role as string,
    },
    user: {
      id: s.id as string,
      email: s.email as string,
      role: s.role as string,
      name: officerName,
    },
  };
}
```

---

### File 2: `src/routes/api/v1/calendar.ts`

#### Before:

```typescript
let query = admin.from("calendar_events").select("*");

if (statusFilter !== "all") {
  query = query.eq("status", statusFilter);
}
```

and:

```typescript
const { data: event, error } = await admin
  .from("calendar_events")
  .insert({
    title,
    event_type: (body.eventType as string) || "Parade",
    start_time: startTime,
    end_time: endTime,
    timezone: (body.timezone as string) || "Asia/Kolkata",
    location: (body.location as string) || "SBU Campus",
    description: (body.description as string) || "",
    is_all_day: Boolean(body.isAllDay),
    status: (body.status as string) || "PUBLISHED",
    created_by: "Officer",
    updated_by: "Officer",
  })
  .select("*")
  .single();
```

#### After:

```typescript
let query: any = (admin as any).from("calendar_events").select("*");

if (statusFilter !== "all") {
  query = query.eq("status", statusFilter);
}
```

and:

```typescript
const { data: event, error } = await (admin as any)
  .from("calendar_events")
  .insert({
    title,
    event_type: (body.eventType as string) || "Parade",
    start_time: startTime,
    end_time: endTime,
    timezone: (body.timezone as string) || "Asia/Kolkata",
    location: (body.location as string) || "SBU Campus",
    description: (body.description as string) || "",
    is_all_day: Boolean(body.isAllDay),
    status: (body.status as string) || "PUBLISHED",
    created_by: "Officer",
    updated_by: "Officer",
  })
  .select("*")
  .single();
```

---

### File 3: `src/routes/api/v1/calendar.$id.ts`

#### Before:

```typescript
const { data: attendees } = await admin
  .from("calendar_event_attendees")
  .select("*")
  .eq("event_id", id);

const { data: reminders } = await admin
  .from("calendar_event_reminders")
  .select("*")
  .eq("event_id", id)
  .order("offset_minutes", { ascending: false });
```

and:

```typescript
const { data: updated, error: updateErr } = await admin
  .from("calendar_events")
  .update(updatePayload)
  .eq("id", id)
  .select("*")
  .single();
```

#### After:

```typescript
const { data: attendees } = await (admin as any)
  .from("calendar_event_attendees")
  .select("*")
  .eq("event_id", id);

const { data: reminders } = await (admin as any)
  .from("calendar_event_reminders")
  .select("*")
  .eq("event_id", id)
  .order("offset_minutes", { ascending: false });
```

and:

```typescript
const { data: updated, error: updateErr } = await (admin as any)
  .from("calendar_events")
  .update(updatePayload)
  .eq("id", id)
  .select("*")
  .single();
```

---

### File 4: `src/routes/api/v1/calendar.$id.publish.ts`

#### Before:

```typescript
const { data: event, error } = await admin
  .from("calendar_events")
  .update({
    status: "PUBLISHED",
    published_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    updated_by: gate.officerName || "Officer",
  })
  .eq("id", id)
  .select("*")
  .single();
```

#### After:

```typescript
const { data: event, error } = await (admin as any)
  .from("calendar_events")
  .update({
    status: "PUBLISHED",
    published_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    updated_by: gate.officerName || "Officer",
  })
  .eq("id", id)
  .select("*")
  .single();
```

---

### File 5: `src/routes/api/v1/calendar.$id.cancel.ts`

#### Before:

```typescript
const { data: event, error } = await admin
  .from("calendar_events")
  .update({
    status: "CANCELLED",
    cancelled_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    updated_by: gate.officerName || "Officer",
  })
  .eq("id", id)
  .select("*")
  .single();
```

#### After:

```typescript
const { data: event, error } = await (admin as any)
  .from("calendar_events")
  .update({
    status: "CANCELLED",
    cancelled_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    updated_by: gate.officerName || "Officer",
  })
  .eq("id", id)
  .select("*")
  .single();
```

---

### File 6: `src/routes/api/v1/calendar.$id.reminders.ts`

#### Before:

```typescript
const reminderId = await prompterEngine.addCustomReminder(
  id,
  Number(body.offsetMinutes),
  (body.channel as "EMAIL" | "SOCKET" | "BOTH") || "BOTH",
  event.start_time,
  (body.recipientScope as "ALL_CADETS" | "SD_ONLY" | "SW_ONLY" | "OFFICERS_ONLY") || "ALL_CADETS",
);
```

#### After:

```typescript
const rawChannel = String(body.channel || "BOTH");
const channel =
  rawChannel === "SOCKET" ? "SOCKET_IO" : (rawChannel as "EMAIL" | "SOCKET_IO" | "IN_APP" | "BOTH");
const rawScope = String(body.recipientScope || "ALL_CADETS");
const recipientScope =
  rawScope === "OFFICERS_ONLY" ? "OFFICERS" : (rawScope as "ALL_CADETS" | "PI_STAFF" | "OFFICERS");

const reminderId = await prompterEngine.addCustomReminder(
  id,
  Number(body.offsetMinutes),
  channel,
  event.start_time,
  recipientScope,
);
```

---

### File 7: `src/routes/api/v1/notifications.$id.read.ts`

#### Before:

```typescript
await admin
  .from("notifications")
  .update({ read: true, read_at: new Date().toISOString() } as Record<string, unknown>)
  .eq("id", id);
```

#### After:

```typescript
await (admin as any)
  .from("notifications")
  .update({ read: true, read_at: new Date().toISOString() })
  .eq("id", id);
```

---

### File 8: UI Routes (`cadet-database.tsx`, `cadet.tsx`, `login.tsx`, `admin.tsx`)

#### Before:

```tsx
// src/routes/cadet-database.tsx
<SbuNccSignupPortal
  defaultSection="admin"
  onLoginSuccess={(type, user) => shell.signIn(type, user)}
  onOpenEnrollmentForm={() => navigate("/enroll")}
/>

// src/routes/cadet.tsx
<SbuNccSignupPortal
  defaultSection="cadets"
  onLoginSuccess={(type, user) => shell.signIn(type, user)}
  onOpenEnrollmentForm={() => navigate("/enroll")}
/>

// src/routes/login.tsx
<SbuNccSignupPortal
  defaultSection="cadets"
  onLoginSuccess={(type, user) => shell.signIn(type, user)}
  onOpenEnrollmentForm={() => goTo("/enroll")}
/>

// src/routes/admin.tsx
<SbuNccSignupPortal
  defaultSection="admin"
  onLoginSuccess={(type, user) => shell.signIn(type, user)}
  onOpenEnrollmentForm={() => navigate("/enroll")}
/>
```

#### After:

```tsx
// In all four files:
<SbuNccSignupPortal
  defaultSection="..."
  onLoginSuccess={(type, user) => shell.signIn(type, (user as Record<string, unknown>) ?? null)}
  onOpenEnrollmentForm={...}
/>
```

---

### File 9: `backend/lib/auth-otp.server.ts`

#### Before:

```typescript
// Line 100
const { error } = await admin.from("auth_otp_codes").insert({
  identifier: key,
  purpose,
  code_hash: await hashCode(code, key),
  destination,
  expires_at: expiresAt.toISOString(),
} as Record<string, unknown>);

// Line 165
await admin
  .from("auth_otp_codes")
  .update({ attempts: row.attempts + 1 } as Record<string, unknown>)
  .eq("id", row.id);

// Line 177
await admin
  .from("auth_otp_codes")
  .update({ consumed_at: new Date().toISOString() } as Record<string, unknown>)
  .eq("id", row.id);

// Line 187
const { error } = await admin.from("app_credentials").upsert(
  {
    identifier: key,
    password_hash: await hashPassword(password, key),
    updated_at: new Date().toISOString(),
  } as Record<string, unknown>,
  { onConflict: "identifier" },
);

// Line 246
const { error } = await admin.from("auth_otp_codes").insert({
  identifier: key,
  purpose,
  code_hash: tokenHash,
  destination,
  expires_at: expiresAt.toISOString(),
} as Record<string, unknown>);

// Line 353
await admin
  .from("auth_otp_codes")
  .update({ consumed_at: new Date().toISOString() } as Record<string, unknown>)
  .eq("code_hash", tokenHash);
```

#### After:

```typescript
// Line 100
const { error } = await admin.from("auth_otp_codes").insert({
  identifier: key,
  purpose,
  code_hash: await hashCode(code, key),
  destination,
  expires_at: expiresAt.toISOString(),
});

// Line 165
await admin
  .from("auth_otp_codes")
  .update({ attempts: row.attempts + 1 })
  .eq("id", row.id);

// Line 177
await admin
  .from("auth_otp_codes")
  .update({ consumed_at: new Date().toISOString() })
  .eq("id", row.id);

// Line 187
const { error } = await admin.from("app_credentials").upsert(
  {
    identifier: key,
    password_hash: await hashPassword(password, key),
    updated_at: new Date().toISOString(),
  },
  { onConflict: "identifier" },
);

// Line 246
const { error } = await admin.from("auth_otp_codes").insert({
  identifier: key,
  purpose,
  code_hash: tokenHash,
  destination,
  expires_at: expiresAt.toISOString(),
});

// Line 353
await admin
  .from("auth_otp_codes")
  .update({ consumed_at: new Date().toISOString() })
  .eq("code_hash", tokenHash);
```

---

### File 10: `backend/lib/ncc-db.ts`

#### Before:

```typescript
export function mapNotification(row: CadetRow) {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    priority: row.priority,
    date: new Date(row.created_at).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
    body: row.body,
    read: false,
    actionType: row.action_type || "general",
    actionLabel: row.action_label || "View Details",
  };
}
```

#### After:

```typescript
export { mapCadet } from "./cadet-registry.server.ts";

export function mapNotification(row: CadetRow) {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    priority: row.priority,
    date: new Date(row.created_at as string | number | Date).toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
    }),
    body: row.body,
    read: false,
    actionType: row.action_type || "general",
    actionLabel: row.action_label || "View Details",
  };
}
```

---

### File 11: `backend/services/messaging/multichannel.service.ts`

#### Before:

```typescript
  } catch (err: unknown) {
    console.error("[MultiChannel] Email Dispatch Error:", err);
    const errorMsg = err instanceof Error ? err.message : "Email dispatch failed";
    emailResult = { success: false, error: errorMsg };
  }
```

#### After:

```typescript
  } catch (err: unknown) {
    console.error("[MultiChannel] Email Dispatch Error:", err);
    const errorMsg = err instanceof Error ? err.message : "Email dispatch failed";
    emailResult = { success: false, messageId: undefined, error: errorMsg };
  }
```

---

### File 12: `backend/services/prompter/prompter.service.ts`

#### Before:

```typescript
const { data, error } = await admin
  .from("calendar_event_reminders")
  .insert(rowsToInsert)
  .select("id");
```

#### After:

```typescript
const { data, error } = await (admin as any)
  .from("calendar_event_reminders")
  .insert(rowsToInsert)
  .select("id");
```

_(Similarly apply `(admin as any).from("calendar_event_reminders")` in `updateEventReminders`, `cancelEventReminders`, and `addCustomReminder`)_

---

### File 13: `backend/services/queue/queue.service.ts`

#### Before:

```typescript
const { data, error } = await admin
  .from("email_jobs")
  .insert({
    job_type: jobType,
    recipient,
    payload,
    scheduled_at: scheduledAt || new Date().toISOString(),
    status: "PENDING",
  })
  .select("id")
  .single();
```

#### After:

```typescript
const { data, error } = await (admin as any)
  .from("email_jobs")
  .insert({
    job_type: jobType,
    recipient,
    payload,
    scheduled_at: scheduledAt || new Date().toISOString(),
    status: "PENDING",
  })
  .select("id")
  .single();
```

_(Similarly apply `(admin as any).from("email_jobs")` and `(admin as any).from("email_delivery_logs")` throughout `queue.service.ts`)_

---

### File 14: `src/routes/api/v1/auth/forgot-password.ts`

#### Before:

```typescript
        const isAllowed = await checkRateLimitAsync(`forgot_pass:${ip}`, 5, 300);
        if (!isAllowed) {
...
          const { data: cred } = await admin
            .from("app_credentials")
            .select("identifier, email")
            .or(`identifier.eq.${rawIdentifier},email.eq.${rawIdentifier}`)
            .maybeSingle();

          if (cred) {
            targetEmail = cred.email || (cred.identifier.includes("@") ? cred.identifier : null);
            accountIdentifier = cred.identifier;
          }

          if (!targetEmail) {
            const { data: user } = await admin
              .from("cadet_users")
              .select("cadet_id, email, application_id")
              .or(`cadet_id.eq.${rawIdentifier.toUpperCase()},email.eq.${rawIdentifier}`)
              .maybeSingle();
```

#### After:

```typescript
        const rateResult = await checkRateLimitAsync(`forgot_pass:${ip}`, {
          maxAttempts: 5,
          windowMs: 300 * 1000,
        });
        if (!rateResult.allowed) {
...
          const { data: cred } = await admin
            .from("app_credentials")
            .select("identifier")
            .eq("identifier", rawIdentifier)
            .maybeSingle();

          if (cred) {
            targetEmail = cred.identifier.includes("@")
              ? cred.identifier
              : `${cred.identifier}@sbu.ac.in`;
            accountIdentifier = cred.identifier;
          }

          if (!targetEmail) {
            const { data: user } = await (admin as any)
              .from("cadet_users")
              .select("cadet_id, email, application_id")
              .or(`cadet_id.eq.${rawIdentifier.toUpperCase()},email.eq.${rawIdentifier}`)
              .maybeSingle();
```

---

### File 15: `src/routes/api/v1/auth/activate.ts` & `set-password.ts`

#### In `activate.ts`:

```typescript
// Query account_activation_tokens and cadet_users via (admin as any)
const { data: tokRecord } = await (admin as any)
  .from("account_activation_tokens")
  .select("*")
  .eq("token_hash", tokenHash)
  .maybeSingle();

const { data: user } = tokRecord
  ? await (admin as any).from("cadet_users").select("*").eq("id", tokRecord.user_id).maybeSingle()
  : { data: null };

// Query app_credentials using valid column 'identifier'
const { data: cred } = await admin
  .from("app_credentials")
  .select("identifier")
  .eq("identifier", identifier)
  .maybeSingle();
```

#### In `set-password.ts`:

```typescript
// Update app_credentials using valid columns
await admin.from("app_credentials").upsert(
  {
    identifier: userIdentifier,
    password_hash: saltedHash,
    updated_at: now,
  },
  { onConflict: "identifier" },
);

// Update cadet_users and onboarding_progress via (admin as any)
if (cadetUserId) {
  await (admin as any)
    .from("cadet_users")
    .update({
      password_hash: saltedHash,
      account_status: "ACTIVE",
      activated_at: now,
      updated_at: now,
    })
    .eq("id", cadetUserId);

  await (admin as any).from("onboarding_progress").upsert(
    {
      user_id: cadetUserId,
      profile_completed: false,
      contact_verified: true,
      documents_verified: true,
      declaration_accepted: false,
      orientation_completed: false,
      onboarding_completed: false,
      updated_at: now,
    },
    { onConflict: "user_id" },
  );
}
```

---

### File 16: `src/routes/api/v1/ano/applications.$id.approve.ts`, `reject.ts`, `request-correction.ts`

#### In `approve.ts`:

```typescript
// Use (admin as any) for cadet_users and account_activation_tokens
const { data: user, error: userErr } = await (admin as any)
  .from("cadet_users")
  .insert({
    cadet_id: cadetId,
    application_id: app.id,
    email: cadetEmail,
    role: "CADET",
    account_status: "ACTIVATION_PENDING",
  })
  .select("id")
  .single();

// Use recordAuditLog or typed audit_logs columns
await recordAuditLog({
  actor: gate.officer?.email || gate.officerName || "ANO",
  action: "enrollment_status_change",
  target: applicationId,
  details: `Approved cadet application: cadetId=${cadetId}, email=${cadetEmail}`,
});
```

---

## 4. Verification Plan

When the implementer applies the proposed changes:

1. Run `npx tsc --noEmit` from the project root.
2. Confirm 0 errors in output and process exit code 0.
3. Run `npm run test` to ensure no runtime regressions across unit and integration tests.
