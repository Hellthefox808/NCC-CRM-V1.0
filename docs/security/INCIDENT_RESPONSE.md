# INCIDENT RESPONSE & SECURITY ALERTING PROTOCOL

**Project**: 19 Jharkhand Battalion NCC Portal  
**Scope**: Production Incident Response, Security Event Alerting, and Forensic Auditing

---

## 1. Security Event Categorization

| Event Code             | Event Category                      | Severity | Alert Action                                                        |
| :--------------------- | :---------------------------------- | :------: | :------------------------------------------------------------------ |
| `AUTH_FAILURE`         | Failed Login / Invalid Password     |   Low    | Increments IP rate limit counter.                                   |
| `RATE_LIMIT_TRIGGERED` | Rate Limit Exceeded                 |  Medium  | Temporarily blocks IP for window duration; logs security alert.     |
| `IDOR_ATTEMPT`         | BOLA / Unauthorized Resource Access |   High   | Blocks request with 403; logs user ID & target ID for audit review. |
| `STORAGE_TOKEN_REPLAY` | Reused Single-Use Storage Token     |   High   | Invalidates token immediately; logs incident in `security_events`.  |
| `ACTIVATION_FAILURE`   | Invalid / Expired Activation Token  |  Medium  | Prevents account creation; logs token hash attempt.                 |
| `AI_ABUSE`             | Prompt Injection / Overflow Attempt |  Medium  | Rejects prompt with 400; logs client IP.                            |

---

## 2. Emergency Session & Token Revocation

In the event of a compromised session or token leak:

1. **Revoke User Sessions**: Run admin database query to update `revoked_at = now()` for target `user_id`.
2. **Invalidate Storage Tokens**: Update `status = 'REVOKED'` on active intents in `storage_upload_intents` and `storage_access_grants`.
3. **Rotate Secrets**: Update environment secrets (`SESSION_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`) and redeploy.
