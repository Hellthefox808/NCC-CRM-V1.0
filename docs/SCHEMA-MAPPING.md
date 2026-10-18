# NCC CRM — Semantic Schema Mapping Manifesto
## 19 Jharkhand Battalion NCC (Sarala Birla University Sub-Unit)

### Overview
This Mapping Manifesto defines the formal field-level transformations, join topologies, foreign key bindings, and semantic standards connecting the core operational data tiers:
1. **Source Schemas**: Multi-source operational inputs (Registration Web Form, Physical Exam Rosters, Attendance Sheets, Socket.IO Real-time Events, Direct/Group Messages).
2. **Target Operational Database**: Supabase PostgreSQL / MongoDB Enterprise Data Platform (`cadet_enrollments`, `cadet_users`, `conversations`, `conversation_members`, `messages`, `discipline_records`, `leave_records`, `class_schedules`, `annual_plans`, `notifications`, `audit_logs`).
3. **Execution Engine**: Nitro Server + Supabase PostgREST + Node.js ESM Backend Services.

---

## 1. Table Mapping: `cadet_enrollments`

- **Anchor Source Table**: SBU Form 1 Online Registration Form (`ApplicantRegistrationInput`)
- **Contributing / Lookup Tables**: `academic_rolls`, `medical_examinations`, `pet_records`
- **Join Paths**:
  - `applicant_registration` JOIN `academic_rolls` ON `applicant.sbuRollNo = academic_rolls.roll_no`
  - `applicant_registration` JOIN `pet_records` ON `applicant.id = pet_records.applicant_id`

### Field Mappings & Cleanliness Design

| Target Field | Source Field / Logic | Mapping Type | Rationale / Transformation Details |
| :--- | :--- | :--- | :--- |
| `id` | `applicant.id` | Direct | 18-digit normalized application ID (`APP2026...`) |
| `enrollmentNo` | `cadet.enrollmentNo` | Derived | Generated regimental format: `JHR/{YY}/{SD\|SW}/19/{ROLL}` |
| `fullName` | `applicant.fullName` | Direct | Trimmed, title-cased string |
| `mobile` | `applicant.mobile` | Direct | Normalized 10-digit Indian mobile number (`+91` stripped) |
| `email` | `applicant.email` | Direct | Lowercased, whitespace trimmed email |
| `gender` | `applicant.gender` | Derived | Standardized to `"SD"` (Senior Division) or `"SW"` (Senior Wing) |
| `dob` | `applicant.dob` | Derived | Standardized ISO-8601 (`YYYY-MM-DD`) |
| `bloodGroup` | `applicant.bloodGroup` | Direct | Normalized medical code (`A+`, `O+`, `B+`, `AB+`, etc.) |
| `aadhaarNo` | `applicant.aadhaar` | Derived | UIDAI Verhoeff Dihedral $D_5$ validated, 12-digit format stripped |
| `sbuCourse` | `applicant.sbuCourse` | Direct | Academic degree program (B.Tech, BCA, BBA, Diploma, etc.) |
| `sbuRollNo` | `applicant.sbuRollNo` | Direct | SBU Institutional Roll Number |
| `sbuYear` | `applicant.sbuYear` | Direct | 1st, 2nd, or 3rd year classification |
| `status` | `applicant.status` | Derived | Pipeline stage: `Submitted` → `Physical Scheduled` → `Medical Cleared` → `Selected` → `Enrolled` |
| `run1600mTime` | `pet.run_time` | Joined | 1600m Physical Efficiency Timing (`MM:SS`) |
| `pushupsCount` | `pet.pushups` | Joined | Integer count of verified repetitions |
| `createdAt` | `system.timestamp` | Direct | Canonical UTC ISO-8601 timestamp (`YYYY-MM-DDTHH:MM:SSZ`) |

---

## 2. Table Mapping: `conversations`

- **Anchor Source Table**: Chat Room Request (`CreateConversationInput`)
- **Contributing / Lookup Tables**: `unit_rosters`, `cadet_enrollments`
- **Join Paths**:
  - `conversation` JOIN `conversation_members` ON `conversation.id = conversation_members.conversation_id`

### Field Mappings & Cleanliness Design

| Target Field | Source Field / Logic | Mapping Type | Rationale / Transformation Details |
| :--- | :--- | :--- | :--- |
| `id` | `uuidv4()` / deterministic hash | Derived | Canonical pair hash `conv_direct_${min}_${max}` for DMs, UUID for groups |
| `type` | `input.type` | Direct | Enum: `"direct"` \| `"group"` \| `"channel"` |
| `title` | `input.title` | Direct | Display room title or group name (sanitized, trimmed) |
| `description` | `input.description` | Direct | Optional operational description or platoon scope |
| `group_type` | `input.groupType` | Derived | Sub-category: `"unit"` \| `"camp"` \| `"training"` \| `"committee"` \| `"event"` \| `"general"` |
| `created_by` | `session.userId` | Direct | Authoritative user ID from verified authentication token |
| `is_official` | `input.isOfficial` | Derived | Server-enforced: only ANO/ADMIN can set `is_official: true` |
| `created_at` | `NOW()` | Direct | Canonical UTC timestamp |

---

## 3. Table Mapping: `messages`

- **Anchor Source Table**: Socket.IO / REST Message Payload (`SendMessageInput`)
- **Contributing / Lookup Tables**: `conversations`, `cadet_users`, `crm_records`
- **Join Paths**:
  - `messages.conversation_id` = `conversations.id`
  - `messages.sender_id` = `cadet_users.id`
  - `messages.reply_to_id` = `messages.id` (self-referential threading)

### Field Mappings & Cleanliness Design

| Target Field | Source Field / Logic | Mapping Type | Rationale / Transformation Details |
| :--- | :--- | :--- | :--- |
| `id` | `uuidv4()` | Direct | Unique 128-bit message identifier |
| `conversation_id` | `input.conversationId` | Direct | Foreign key referencing parent conversation |
| `sender_id` | `session.userId` | Direct | Authoritative sender identifier |
| `sender_name` | `session.userName` | Direct | Display name with rank suffix |
| `sender_role` | `session.role` | Direct | `"ADMIN"` \| `"OFFICER"` \| `"CADET"` |
| `content` | `input.content` | Direct | Trimmed message text (CWE-1236 spreadsheet injection sanitized) |
| `type` | `input.type` | Direct | Enum: `"text"` \| `"image"` \| `"document"` \| `"crm_card"` \| `"poll"` \| `"system"` |
| `poll` | `input.poll` | Derived | JSONB containing question, options (`id`, `text`, `votes`), `allowsMultiple` |
| `is_pinned` | `false` \| boolean | Derived | Defaults to false, toggled by authorized officers/admins |
| `pinned_at` | `NOW()` \| NULL | Derived | Timestamp when pinned status was activated |
| `converted_task_id`| `task.id` \| NULL | Joined | Cross-reference ID when converted into a CRM task |
| `is_deleted` | `false` | Direct | Soft-delete flag preserving auditability |
| `created_at` | `NOW()` | Direct | Canonical UTC timestamp |

---

## 4. Universal Data Cleanliness Rules

1. **Null Standardization**: Strings containing `"NULL"`, `"None"`, `"N/A"`, or empty whitespace strings are converted to canonical SQL `NULL`.
2. **Case & Trim Normalization**: All names, regimental designations, and email addresses are trimmed. Status and Wing codes (`SD`, `SW`) are converted to uppercase.
3. **Temporal Invariance**: All database timestamps are serialized and stored strictly in ISO-8601 UTC (`YYYY-MM-DDTHH:MM:SSZ`).
4. **Non-Nullable Constraint Defense**: No target column with `NOT NULL` constraint is ever mapped to `NULL`. Missing optional strings default to empty string `""` or canonical placeholders (`"Pending Allocation"`).
