# NCC Platform — Redis & Multi-Tier Caching Specification

**Client Layer**: `redis.server.ts` & `cache.server.ts`  
**Supported Modes**:

1. Upstash Redis REST API (`UPSTASH_REDIS_REST_URL`)
2. Container / Local TCP (`REDIS_URL`)
3. Self-Pruning Bounded In-Memory Fallback (`Map<string, Item>` with LRU eviction)

---

## 1. Key Namespace Specification

All Redis and cache keys are strictly namespaced to prevent collisions and ensure zero cross-tenant leakage:

```text
ncc:{subsystem}:{identifier_or_query}
```

---

## 2. Key Inventory & Expiration Rules

| Key Pattern                         | Purpose                                  | TTL                         | Owner Module               |
| :---------------------------------- | :--------------------------------------- | :-------------------------- | :------------------------- |
| `ncc:session:{token}`               | Authenticated user session cache         | 5 minutes (300s)            | `cadet-registry.server.ts` |
| `ncc:calendar:{filters}`            | Public & officer calendar events list    | 1 minute (60s)              | `calendar.ts`              |
| `ncc:annual_plans:{year}`           | Institutional annual training plan       | 2 minutes (120s)            | `annual-plans.ts`          |
| `ncc:activities:{filters}`          | Battalion activity catalog               | 1 minute (60s)              | `activities.ts`            |
| `ncc:notifications:feed`            | Global bulletin & notification feed      | 30 seconds (30s)            | `notifications.ts`         |
| `ncc:enrollment:status:{query}`     | Sanitized public application status      | 30 seconds (30s)            | `enrollments.status.ts`    |
| `ncc:otp:password_reset:{hash}`     | Hashed OTP code for password reset       | 10 minutes                  | `auth-otp.server.ts`       |
| `ncc:otp:account_activation:{hash}` | Hashed activation token                  | 30 minutes                  | `auth-otp.server.ts`       |
| `ratelimit:{key}`                   | Distributed rate limiter attempt counter | Sliding Window (60s - 300s) | `rate-limiter.server.ts`   |
| `forgot_pass:{ip}`                  | Recovery request throttle                | 5 minutes (max 5 requests)  | `forgot-password.ts`       |
| `login_fail:{identifier}`           | Login attempt lockout counter            | 15 minutes                  | `login.ts`                 |

---

## 3. Resilience & In-Memory Fallback

When neither `UPSTASH_REDIS_REST_URL` nor `REDIS_URL` is configured (e.g. standalone test environment), `redis.server.ts` and `cache.server.ts` seamlessly fall back to an in-memory `Map` instance with LRU eviction and automatic background key pruning (`pruneMemoryStore` and `pruneL1`). The store enforces a strict `MAX_MEMORY_ITEMS = 5000` ceiling to prevent memory leakage under continuous heavy load.
