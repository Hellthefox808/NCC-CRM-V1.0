# AUTHORIZATION & PERMISSION MATRIX (RBAC / ABAC)

**Project**: 19 Jharkhand Battalion NCC Portal  
**Architecture**: Role-Based & Attribute-Based Access Control

---

## Permission Matrix Across System Roles

| Feature / Resource Domain                        | Anonymous  |    Cadet    | Instructor / PI Staff |   ANO (Officer)   |   Super Admin   |
| :----------------------------------------------- | :--------: | :---------: | :-------------------: | :---------------: | :-------------: |
| **Submit Online Enrollment Application**         |     ✅     |     ❌      |          ❌           |        ❌         |       ❌        |
| **Track Application Status (Challenge-Gated)**   |     ✅     |     ✅      |          ✅           |        ✅         |       ✅        |
| **Complete Account Activation & Password Setup** | Token Only |     ❌      |          ❌           |        ❌         |       ❌        |
| **View Personal Cadet Profile & Progress**       |     ❌     | Own Record  |      Own Company      |    All Cadets     |   All Cadets    |
| **Review & Approve/Reject Applications**         |     ❌     |     ❌      |      Review Only      | ✅ Approve/Reject | ✅ Full Control |
| **Clock-In / Clock-Out Attendance**              |     ❌     |     ❌      |   ✅ Self & Cadets    |  ✅ Full Control  | ✅ Full Control |
| **Create & Publish Training Calendar Events**    |     ❌     |  Read Only  |      Draft Only       | ✅ Publish / Edit | ✅ Full Control |
| **Request Storage Upload Intent Capability**     |     ❌     |   ✅ Self   |   ✅ Self & Company   |      ✅ All       |     ✅ All      |
| **Issue Storage Download Access Grant**          |     ❌     | Own Objects |      Own Objects      |  ✅ All Objects   | ✅ All Objects  |
| **Export Nominal Rolls & Attendance Reports**    |     ❌     |     ❌      |          ❌           |   ✅ Authorized   |  ✅ Authorized  |
| **Subedar Major AI Assistant Queries**           |     ✅     |     ✅      |          ✅           |        ✅         |       ✅        |

---

## Authorization Enforcement Rules

1. **Never Trust Client Claims**: All role checks (`userRole`) are resolved server-side from signed session tokens / DB records.
2. **Horizontal Isolation (BOLA Prevention)**: Cadets can only request access grants (`storage_access_grants`) for storage objects where `obj.owner_id === userId`.
3. **Vertical Isolation**: Cadets attempting to access officer API routes (`/api/v1/ano/*`) receive immediate `403 Forbidden` responses and generate a `PERMISSION_DENIED` audit event.
