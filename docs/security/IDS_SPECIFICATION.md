# INTRUSION DETECTION SYSTEM (IDS) & AUTOMATED CONTAINMENT SPECIFICATION

**Compliance Standard**: OWASP A09:2025 (Security Logging and Alerting Failures)  
**Engine**: `backend/services/ids/ids.service.ts` & `ids.rules.ts`  
**Database Schema**: `supabase/migrations/20260811130000_intrusion_detection_system.sql`

---

## 1. Executive Summary

The **Intrusion Detection System (IDS)** monitors, normalizes, correlates, scores, and responds to real-time security events across the 19 Jharkhand Battalion NCC Portal.

Unlike basic audit logging (which merely records historical actions), the IDS active engine evaluates threat patterns across sliding time windows and executes confidence-based **Automated Containment Actions** when cumulative threat scores reach critical thresholds.

---

## 2. Threat Detection Rules & Response Matrix

| Security Event             | Base Risk Score | Threshold Count | Time Window |      Alert Level      | Containment Action  |
| :------------------------- | :-------------: | :-------------: | :---------: | :-------------------: | :------------------ |
| **`AUTH_FAILURE`**         |       15        |   5 attempts    |  5 minutes  | **MEDIUM / CRITICAL** | `RATE_LIMIT_IP`     |
| **`IDOR_ATTEMPT`**         |       35        |   2 attempts    | 10 minutes  |  **HIGH / CRITICAL**  | `REVOKE_SESSION`    |
| **`STORAGE_TOKEN_REPLAY`** |       40        |    1 attempt    |  1 minute   |       **HIGH**        | `QUARANTINE_OBJECT` |
| **`RATE_LIMIT_TRIGGERED`** |       25        |   3 attempts    |  5 minutes  |      **MEDIUM**       | `RATE_LIMIT_IP`     |
| **`UNAUTHORIZED_EXPORT`**  |       50        |    1 attempt    |  1 minute   |     **CRITICAL**      | `REVOKE_SESSION`    |
| **`AI_ABUSE`**             |       20        |   3 attempts    |  5 minutes  |      **MEDIUM**       | `RATE_LIMIT_IP`     |

---

## 3. Threat Level Classification

- **`LOW` (0 - 24)**: Normal operations or single isolated events. Recorded in `ids_events`.
- **`MEDIUM` (25 - 49)**: Rate threshold warnings. Triggers staff alert notifications.
- **`HIGH` (50 - 74)**: Active attack indicator (e.g. IDOR/BOLA attempt or token replay). Triggers session revocation and quarantine.
- **`CRITICAL` (75 - 100)**: Multiple correlated attack vectors. Triggers instant automated containment and officer incident response.

---

## 4. Verification & Testing

- Automated Unit Tests: `backend/tests/ids.test.ts` (**4 / 4 PASS**).
- Full Test Suite: `npm test` (**35 / 35 PASS**).
