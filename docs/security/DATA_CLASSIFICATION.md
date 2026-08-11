# Data Classification Matrix (Phase 00 Baseline)

**Standard**: NIST SP 800-122 / OWASP ASVS Data Classification Standard  
**Owner**: 19 Jharkhand Battalion NCC (SBU Sub-Unit)

---

## Data Classification Levels

```text
┌─────────────────────────────────────────────────────────────────────────┐
│ LEVEL 1: PUBLIC        (General Notices, Calendar Events, Unit Info)   │
├─────────────────────────────────────────────────────────────────────────┤
│ LEVEL 2: INTERNAL      (Parade Nominal Rolls, Aggregated Metrics)      │
├─────────────────────────────────────────────────────────────────────────┤
│ LEVEL 3: CONFIDENTIAL  (Cadet Contact Details, Academic Transcripts)   │
├─────────────────────────────────────────────────────────────────────────┤
│ LEVEL 4: HIGHLY SENSITIVE (Aadhaar Numbers, Bank Accounts, Passwords)  │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Comprehensive Classification Matrix

| Data Entity                 | Classification Level | Encryption Standard            | Public Endpoint Behavior                    | Storage Location                   |
| --------------------------- | -------------------- | ------------------------------ | ------------------------------------------- | ---------------------------------- |
| **Password Hashes**         | `HIGHLY_SENSITIVE`   | Salted `scryptSync` (16B salt) | **NEVER** returned in any API response      | `cadet_users`, `app_credentials`   |
| **Activation Tokens**       | `HIGHLY_SENSITIVE`   | SHA-256 Hash                   | **NEVER** stored in plain text              | `account_activation_tokens`        |
| **Aadhaar Number**          | `HIGHLY_SENSITIVE`   | Masked / Restricted            | Stripped (`undefined`) from public tracking | `cadet_enrollments`                |
| **Bank Account / IFSC**     | `HIGHLY_SENSITIVE`   | Masked / Restricted            | Stripped (`undefined`) from public tracking | `cadet_enrollments`                |
| **Date of Birth**           | `CONFIDENTIAL`       | Plaintext (Restricted)         | Stripped (`undefined`) from public tracking | `cadet_enrollments`                |
| **Mobile / Email**          | `CONFIDENTIAL`       | Plaintext (Restricted)         | Stripped (`undefined`) from public tracking | `cadet_enrollments`, `cadet_users` |
| **Guardian Details**        | `CONFIDENTIAL`       | Plaintext (Restricted)         | Stripped (`undefined`) from public tracking | `cadet_enrollments`                |
| **Medical / Blood Group**   | `CONFIDENTIAL`       | Plaintext (Restricted)         | Stripped (`undefined`) from public tracking | `cadet_enrollments`                |
| **Application ID / Status** | `PUBLIC`             | Plaintext                      | Returned in public tracking responses       | `cadet_enrollments`                |
| **Cadet Full Name**         | `PUBLIC`             | Plaintext                      | Returned in public tracking responses       | `cadet_enrollments`                |
| **Calendar Event Details**  | `PUBLIC`             | Plaintext                      | Accessible on public/cadet calendar         | `calendar_events`                  |
| **Audit Logs**              | `INTERNAL`           | Plaintext (Restricted)         | Accessible only to authorized Officers      | `audit_logs`                       |
