/**
 * Chat Authentication and Session Resolution Helper
 */
import { requireOfficer, requireCadetSession, bearer } from "@backend/lib/cadet-registry.server";

export interface ResolvedChatUser {
  id: string;
  name: string;
  role: string;
}

export async function resolveChatUser(request: Request): Promise<ResolvedChatUser | null> {
  // Check officer session
  const officerGate = await requireOfficer(request);
  if (officerGate.ok) {
    return {
      id: "officer_ano",
      name: officerGate.officerName || "Capt. Dr. Animesh Roy (ANO)",
      role: "ADMIN",
    };
  }

  // Check cadet session
  const cadetGate = await requireCadetSession(request);
  if (cadetGate.ok) {
    return {
      id: cadetGate.cadetId || "cadet_default",
      name: "NCC Cadet",
      role: "CADET",
    };
  }

  // Fallback for development / mock authorization header or test harness
  const token = bearer(request);
  const headerUserId = request.headers.get("x-user-id");
  const headerUserName = request.headers.get("x-user-name");
  const headerUserRole = request.headers.get("x-user-role");

  if (headerUserId) {
    return {
      id: headerUserId,
      name: headerUserName || headerUserId,
      role: (headerUserRole || "CADET").toUpperCase(),
    };
  }

  if (token === "dev-officer-token") {
    return {
      id: "officer_ano",
      name: "Capt. Dr. Animesh Roy (ANO)",
      role: "ADMIN",
    };
  }

  if (token === "dev-cadet-token") {
    return {
      id: "cadet_default",
      name: "Senior Under Officer (SUO) Cadet",
      role: "CADET",
    };
  }

  return null;
}
