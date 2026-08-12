# NCC Platform — Redis & Caching Specification

**Client Layer**: `redis.server.ts`  
**Supported Modes**:
1. Upstash Redis REST API (`UPSTASH_REDIS_REST_URL`)
2. Container / Local TCP (`REDIS_URL`)
3. Self-Pruning In-Memory Fallback (`Map<string, Item>`)

---

## 1. Key Namespace Specification

All Redis keys are strictly namespaced to prevent collisions and ensure zero cross-tenant leakage:

```text
ncc:otp:{purpose}:{identifierHash}
```

---

## 2. Key Inventory & Expiration Rules

| Key Pattern | Purpose | TTL | Owner Module |
| :--- | :--- | :--- | :--- |
| `ncc:otp:password_reset:{hash}` | Hashed OTP code for password reset | 10 minutes | `auth-otp.server.ts` |
| `ncc:otp:account_activation:{hash}` | Hashed activation token | 30 minutes | `auth-otp.server.ts` |
| `ratelimit:{key}` | Distributed rate limiter attempt counter | Sliding Window (60s - 300s) | `rate-limiter.server.ts` |
| `forgot_pass:{ip}` | Recovery request throttle | 5 minutes (max 5 requests) | `forgot-password.ts` |
| `login_fail:{identifier}` | Login attempt lockout counter | 15 minutes | `login.ts` |

---

## 3. Resilience & In-Memory Fallback

When neither `UPSTASH_REDIS_REST_URL` nor `REDIS_URL` is configured (e.g. standalone test environment), `redis.server.ts` seamlessly falls back to a thread-safe `Map` instance with automatic background key pruning (`pruneMemoryStore`). This guarantees 100% test suite execution without external service dependencies.
