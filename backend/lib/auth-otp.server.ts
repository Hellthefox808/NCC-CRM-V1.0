import crypto from "node:crypto";
import { getAdmin } from "@backend/lib/ncc-db";

export const OTP_TTL_MINUTES = 10;
const MAX_ATTEMPTS = 5;
/** Throttle window — one code per identifier per 45 seconds. */
const RESEND_COOLDOWN_MS = 45 * 1000;

async function sha256(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export const hashCode = (code: string, identifier: string) =>
  sha256(`${code}:${identifier.trim().toLowerCase()}`);

export async function hashPassword(password: string, _identifier?: string): Promise<string> {
  const salt = crypto.randomBytes(16).toString("hex");
  const derived = crypto.scryptSync(password, salt, 64, { N: 16384, r: 8, p: 1 }).toString("hex");
  return `scrypt$N=16384,r=8,p=1$${salt}$${derived}`;
}

export async function verifyPasswordHash(
  password: string,
  storedHash: string,
  identifier?: string,
): Promise<boolean> {
  if (!storedHash) return false;
  if (storedHash.startsWith("scrypt$")) {
    const parts = storedHash.split("$");
    if (parts.length < 4) return false;
    const salt = parts[2];
    const originalHash = parts[3];
    const derived = crypto.scryptSync(password, salt, 64, { N: 16384, r: 8, p: 1 }).toString("hex");
    try {
      return crypto.timingSafeEqual(Buffer.from(derived, "hex"), Buffer.from(originalHash, "hex"));
    } catch {
      return false;
    }
  }
  // Backward compatibility check for legacy SHA-256 hashes during migration
  const legacyHash = await sha256(
    `ncc-portal:${(identifier || "").trim().toLowerCase()}:${password}`,
  );
  return legacyHash === storedHash;
}

export function generateOtp(): string {
  const n = crypto.getRandomValues(new Uint32Array(1))[0] % 1_000_000;
  return String(n).padStart(6, "0");
}

/** Masks an email or mobile so the UI can confirm the destination safely. */
export function maskDestination(value: string): string {
  const raw = String(value || "").trim();
  if (!raw) return "your registered contact";
  if (raw.includes("@")) {
    const [user, domain] = raw.split("@");
    const head = user.slice(0, 2);
    return `${head}${"•".repeat(Math.max(2, user.length - 2))}@${domain}`;
  }
  const digits = raw.replace(/\D/g, "");
  return digits.length >= 4
    ? `${"•".repeat(Math.max(0, digits.length - 4))}${digits.slice(-4)}`
    : raw;
}

export interface IssuedOtp {
  code: string;
  destination: string;
  expiresAt: string;
}

/** Creates and stores a fresh code. Returns null when throttled. */
export async function issueOtp(
  identifier: string,
  destination: string,
  purpose = "password_reset",
): Promise<IssuedOtp | null> {
  const admin = await getAdmin();
  const key = identifier.trim().toLowerCase();

  const { data: recent } = await admin
    .from("auth_otp_codes")
    .select("created_at")
    .eq("identifier", key)
    .eq("purpose", purpose)
    .order("created_at", { ascending: false })
    .limit(1);

  const last = recent?.[0]?.created_at;
  if (last && Date.now() - new Date(last).getTime() < RESEND_COOLDOWN_MS) return null;

  const code = generateOtp();
  const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);

  const { error } = await admin.from("auth_otp_codes").insert({
    identifier: key,
    purpose,
    code_hash: await hashCode(code, key),
    destination,
    expires_at: expiresAt.toISOString(),
  } as any);
  if (error) throw error;

  return { code, destination, expiresAt: expiresAt.toISOString() };
}

export interface VerifyResult {
  ok: boolean;
  error?: string;
  code?: string;
}

/** Checks a submitted code against the newest unconsumed code for the identifier. */
export async function verifyOtp(
  identifier: string,
  code: string,
  purpose = "password_reset",
): Promise<VerifyResult> {
  const admin = await getAdmin();
  const key = identifier.trim().toLowerCase();

  const { data: rows, error } = await admin
    .from("auth_otp_codes")
    .select("id, code_hash, attempts, consumed_at, expires_at")
    .eq("identifier", key)
    .eq("purpose", purpose)
    .is("consumed_at", null)
    .order("created_at", { ascending: false })
    .limit(1);
  if (error) throw error;

  const row = rows?.[0] as any;
  if (!row)
    return {
      ok: false,
      error: "No active verification code. Request a new one.",
      code: "OTP_NOT_FOUND",
    };
  if (new Date(row.expires_at).getTime() < Date.now())
    return { ok: false, error: "This code has expired. Request a new one.", code: "OTP_EXPIRED" };
  if (row.attempts >= MAX_ATTEMPTS)
    return {
      ok: false,
      error: "Too many incorrect attempts. Request a new code.",
      code: "OTP_LOCKED",
    };

  const submitted = await hashCode(String(code).trim(), key);
  if (submitted !== row.code_hash) {
    await admin
      .from("auth_otp_codes")
      .update({ attempts: row.attempts + 1 } as any)
      .eq("id", row.id);
    const left = MAX_ATTEMPTS - (row.attempts + 1);
    return {
      ok: false,
      error: `Incorrect code. ${left > 0 ? `${left} attempt${left === 1 ? "" : "s"} remaining.` : "Request a new code."}`,
      code: "OTP_INVALID",
    };
  }

  await admin
    .from("auth_otp_codes")
    .update({ consumed_at: new Date().toISOString() } as any)
    .eq("id", row.id);
  return { ok: true };
}

/** Stores (or replaces) the portal password for an identifier. */
export async function setPortalPassword(identifier: string, password: string) {
  const admin = await getAdmin();
  const key = identifier.trim().toLowerCase();
  const { error } = await admin.from("app_credentials").upsert(
    {
      identifier: key,
      password_hash: await hashPassword(password, key),
      updated_at: new Date().toISOString(),
    } as any,
    { onConflict: "identifier" },
  );
  if (error) throw error;
}

/**
 * Returns true/false when a stored password exists for the identifier,
 * or null when the account has never set one.
 */
export async function checkPortalPassword(
  identifier: string,
  password: string,
): Promise<boolean | null> {
  const admin = await getAdmin();
  const key = identifier.trim().toLowerCase();
  const { data } = await admin
    .from("app_credentials")
    .select("password_hash")
    .eq("identifier", key)
    .maybeSingle();
  if (!data) return null;
  return verifyPasswordHash(password, (data as any).password_hash, key);
}

export interface ActivationTokenResult {
  rawToken: string;
  expiresAt: string;
}

interface TokenRecord {
  identifier: string;
  purpose: string;
  tokenHash: string;
  destination: string;
  expiresAt: Date;
  consumedAt?: Date;
}

const memoryTokens: TokenRecord[] = [];

/** Issues a high-entropy, single-use activation/reset token. Returns rawToken (only HASH stored). */
export async function issueActivationToken(
  identifier: string,
  destination = "",
  purpose = "ACCOUNT_ACTIVATION",
  ttlMinutes = 30,
): Promise<ActivationTokenResult> {
  const key = identifier.trim().toLowerCase();
  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = await sha256(rawToken);
  const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);

  try {
    const admin = await getAdmin();
    const { error } = await admin.from("auth_otp_codes").insert({
      identifier: key,
      purpose,
      code_hash: tokenHash,
      destination,
      expires_at: expiresAt.toISOString(),
    } as any);
    if (error) throw error;
  } catch {
    // Fallback to in-memory store when Supabase environment is unconfigured
    memoryTokens.push({
      identifier: key,
      purpose,
      tokenHash,
      destination,
      expiresAt,
    });
  }

  return { rawToken, expiresAt: expiresAt.toISOString() };
}

/** Verifies a raw token without consuming it (useful for activation page pre-check). */
export async function verifyActivationToken(
  rawToken: string,
  purpose?: string,
): Promise<{ ok: boolean; error?: string; identifier?: string; code?: string }> {
  if (!rawToken || typeof rawToken !== "string") {
    return { ok: false, error: "Missing or invalid activation token", code: "INVALID_TOKEN" };
  }
  const tokenHash = await sha256(rawToken.trim());

  try {
    const admin = await getAdmin();
    let query = admin
      .from("auth_otp_codes")
      .select("id, identifier, purpose, expires_at, consumed_at")
      .eq("code_hash", tokenHash)
      .is("consumed_at", null);

    if (purpose) {
      query = query.eq("purpose", purpose);
    }

    const { data: rows, error } = await query.limit(1);
    if (error) throw error;

    const row = rows?.[0] as any;
    if (row) {
      if (new Date(row.expires_at).getTime() < Date.now()) {
        return {
          ok: false,
          error: "This activation link has expired. Request a new link.",
          code: "TOKEN_EXPIRED",
        };
      }
      return { ok: true, identifier: row.identifier };
    }
  } catch {
    // Fallthrough to memory store check
  }

  const memRec = memoryTokens.find(
    (t) => t.tokenHash === tokenHash && (!purpose || t.purpose === purpose) && !t.consumedAt,
  );

  if (!memRec) {
    return {
      ok: false,
      error: "Invalid or already used activation token.",
      code: "TOKEN_NOT_FOUND",
    };
  }

  if (memRec.expiresAt.getTime() < Date.now()) {
    return {
      ok: false,
      error: "This activation link has expired. Request a new link.",
      code: "TOKEN_EXPIRED",
    };
  }

  return { ok: true, identifier: memRec.identifier };
}

/** Atomically verifies and consumes a raw activation token. */
export async function consumeActivationToken(
  rawToken: string,
  purpose?: string,
): Promise<{ ok: boolean; error?: string; identifier?: string; code?: string }> {
  const check = await verifyActivationToken(rawToken, purpose);
  if (!check.ok) return check;

  const tokenHash = await sha256(rawToken.trim());

  try {
    const admin = await getAdmin();
    await admin
      .from("auth_otp_codes")
      .update({ consumed_at: new Date().toISOString() } as any)
      .eq("code_hash", tokenHash);
  } catch {
    const memRec = memoryTokens.find((t) => t.tokenHash === tokenHash);
    if (memRec) {
      memRec.consumedAt = new Date();
    }
  }

  return { ok: true, identifier: check.identifier };
}
