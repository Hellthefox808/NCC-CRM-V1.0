/**
 * Zod validation schemas for NCC portal authentication and data validation
 *
 * These schemas ensure type safety and input validation across all API endpoints,
 * preventing injection attacks and ensuring data integrity.
 */

import { z } from "zod";

// ── Common validation patterns ──────────────────────────────────────

/** Validates Indian mobile numbers (10 digits, starting with 6-9) */
const indianMobileSchema = z
  .string()
  .regex(/^[6-9]\d{9}$/, "Invalid mobile number format")
  .transform((val) => val.replace(/\s+/g, ""));

/** Validates email addresses with enhanced security */
const emailSchema = z
  .string()
  .email("Invalid email address")
  .min(5, "Email too short")
  .max(100, "Email too long")
  .toLowerCase()
  .refine((email) => !email.includes(".."), "Invalid email format")
  .refine((email) => !/[<>'"&]/.test(email), "Email contains invalid characters");

/** Enhanced password validation with security requirements */
const strongPasswordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters long")
  .max(128, "Password too long")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/\d/, "Password must contain at least one number")
  .regex(/[!@#$%^&*(),.?":{}|<>]/, "Password must contain at least one special character")
  .refine((pwd) => !/(.)\1{2,}/.test(pwd), "Password cannot have repeated characters")
  .refine((pwd) => !/^(password|123456|qwerty)/i.test(pwd), "Password is too common");

/** Legacy password schema for backward compatibility during transition */
const legacyPasswordSchema = z
  .string()
  .min(6, "Password must be at least 6 characters")
  .max(128, "Password too long");

/** SBU Roll Number validation */
const sbuRollSchema = z
  .string()
  .regex(/^SBU\d{7}$/i, "Invalid SBU Roll Number format (e.g., SBU2401211)")
  .transform((val) => val.toUpperCase());

/** NCC Enrollment ID validation */
const enrollmentIdSchema = z
  .string()
  .regex(/^[A-Z]{2}\d{2}[A-Z]{2}\d{4,6}$/i, "Invalid NCC Enrollment ID format")
  .transform((val) => val.toUpperCase());

/** Username validation (alphanumeric + underscore/dot) */
const usernameSchema = z
  .string()
  .min(3, "Username too short")
  .max(50, "Username too long")
  .regex(/^[a-zA-Z0-9_.]+$/, "Username can only contain letters, numbers, dots, and underscores")
  .toLowerCase();

/** OTP code validation (6 digits) */
const otpCodeSchema = z
  .string()
  .regex(/^\d{6}$/, "OTP must be exactly 6 digits")
  .transform((val) => val.trim());

/** IP address validation for audit logging */
const ipAddressSchema = z.string().ip("Invalid IP address").or(z.literal("unknown"));

// ── Authentication Schemas ──────────────────────────────────────────

const baseLoginObject = z.object({
  userType: z.enum(["cadet", "admin"], {
    errorMap: () => ({ message: "User type must be 'cadet' or 'admin'" }),
  }),
  username: z.string().optional(),
  email: emailSchema.optional(),
  password: z.string().min(8, "Password must be at least 8 characters").max(128, "Password too long"),
});

const validateLoginIdentifiers = (
  data: { userType: "cadet" | "admin"; username?: string; email?: string },
  ctx: z.RefinementCtx,
) => {
  // At least one identifier required
  if (!data.username && !data.email) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Either username or email is required",
      path: ["username"],
    });
  }

  // Validate identifier format based on userType
  if (data.userType === "cadet" && data.username) {
    const identifier = data.username.toLowerCase();
    const isSbuRoll = /^sbu\d{7}$/i.test(identifier);
    const isEnrollmentId = /^[A-Z]{2}\d{2}[A-Z]{2}\d{4,6}$/i.test(identifier);
    const isMobile = /^[6-9]\d{9}$/.test(identifier.replace(/\s+/g, ""));

    if (!isSbuRoll && !isEnrollmentId && !isMobile && !data.email) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Invalid cadet identifier format",
        path: ["username"],
      });
    }
  }
};

/** Login request validation */
export const loginRequestSchema = baseLoginObject.superRefine(validateLoginIdentifiers);

/** Enhanced login request with strong password (for new registrations) */
export const enhancedLoginRequestSchema = baseLoginObject
  .extend({
    password: strongPasswordSchema,
  })
  .superRefine(validateLoginIdentifiers);

/** OTP request validation */
export const otpRequestSchema = z.object({
  identifier: z
    .string()
    .min(1, "Identifier is required")
    .max(100, "Identifier too long")
    .transform((val) => val.trim().toLowerCase()),
  userType: z.enum(["cadet", "admin"]),
});

/** OTP verification validation */
export const otpVerifySchema = z
  .object({
    identifier: z
      .string()
      .min(1, "Identifier is required")
      .transform((val) => val.trim().toLowerCase()),
    code: otpCodeSchema,
    newPassword: strongPasswordSchema.optional(),
  })
  .superRefine((data, ctx) => {
    // If setting new password, it's required and must be strong
    if (data.newPassword !== undefined && data.newPassword.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "New password cannot be empty when provided",
        path: ["newPassword"],
      });
    }
  });

// ── Cadet Registration Schemas ──────────────────────────────────────

/** Cadet enrollment form validation */
export const cadetEnrollmentSchema = z
  .object({
    // Personal Information
    fullName: z
      .string()
      .min(2, "Full name too short")
      .max(100, "Full name too long")
      .regex(/^[a-zA-Z\s.]+$/, "Name can only contain letters, spaces, and dots"),

    gender: z.enum(["Male", "Female", "Other"]),

    dob: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
      .refine((date) => {
        const birthDate = new Date(date);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        return age >= 16 && age <= 25;
      }, "Age must be between 16-25 years"),

    mobile: indianMobileSchema,
    email: emailSchema,

    // Academic Information
    sbuRollNo: sbuRollSchema,
    course: z.string().min(1, "Course is required").max(50, "Course name too long"),
    branch: z.string().min(1, "Branch is required").max(50, "Branch name too long"),
    semester: z.number().min(1).max(8),

    // Identity Information
    aadhaarNumber: z
      .string()
      .regex(/^\d{12}$/, "Aadhaar number must be 12 digits")
      .refine((num) => {
        // Basic Aadhaar validation algorithm
        const digits = num.split("").map(Number);
        const checksum = digits.reduce((sum, digit, index) => {
          if (index < 11) {
            const multiplier = [2, 3, 4, 5, 6, 7, 8, 9, 2, 3, 4][index];
            return sum + digit * multiplier;
          }
          return sum;
        }, 0);
        return checksum % 11 === digits[11];
      }, "Invalid Aadhaar number"),

    // Optional password for new accounts
    password: strongPasswordSchema.optional(),
    confirmPassword: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.password && data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Passwords do not match",
        path: ["confirmPassword"],
      });
    }
  });

// ── Session & Security Schemas ──────────────────────────────────────

/** Session token validation */
export const sessionTokenSchema = z
  .string()
  .regex(/^sess_[a-f0-9]{64}$/, "Invalid session token format");

/** Audit log event validation */
export const auditEventSchema = z.object({
  actor: z.string().min(1, "Actor is required").max(100, "Actor too long"),
  action: z.enum([
    "login_success",
    "login_failure",
    "logout",
    "session_expired",
    "password_reset",
    "otp_issued",
    "otp_verified",
    "otp_failed",
    "enrollment_submit",
    "enrollment_status_change",
    "cadet_modified",
    "notification_broadcast",
    "roster_sync",
    "export_data",
  ]),
  target: z.string().min(1, "Target is required").max(100, "Target too long"),
  ip: ipAddressSchema.optional(),
  metadata: z.record(z.unknown()).optional(),
});

// ── File Upload Schemas ─────────────────────────────────────────────

/** File upload validation */
export const fileUploadSchema = z.object({
  activity_id: z.string().uuid("Invalid activity ID"),
  file_name: z
    .string()
    .min(1, "Filename is required")
    .max(255, "Filename too long")
    .regex(/^[^<>:"/\\|?*]+\.(jpg|jpeg|png|webp)$/i, "Invalid filename or extension"),
  content_type: z.enum(["image/jpeg", "image/png", "image/webp"], {
    errorMap: () => ({ message: "Only JPEG, PNG, and WebP images are allowed" }),
  }),
  file_size_bytes: z
    .number()
    .min(1, "File cannot be empty")
    .max(10 * 1024 * 1024, "File size exceeds 10MB limit")
    .optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
});

// ── API Response Schemas ────────────────────────────────────────────

/** Standard API response validation */
export const apiResponseSchema = <T>(dataSchema: z.ZodSchema<T>) =>
  z.object({
    success: z.boolean(),
    message: z.string().optional(),
    error: z.string().optional(),
    code: z.string().optional(),
    data: dataSchema.optional(),
  });

// ── Validation Helpers ──────────────────────────────────────────────

/** Validates and sanitizes request body with detailed error reporting */
export function validateRequestBody<T>(
  schema: z.ZodSchema<T>,
  body: unknown,
  context = "request",
): { success: true; data: T } | { success: false; error: string; issues: z.ZodIssue[] } {
  try {
    const result = schema.safeParse(body);

    if (result.success) {
      return { success: true, data: result.data };
    }

    const issues = result.error.issues;
    const primaryError = issues[0];
    const errorMessage = primaryError.message || `Invalid ${context} format`;

    return {
      success: false,
      error: errorMessage,
      issues: issues,
    };
  } catch (err) {
    return {
      success: false,
      error: `Validation failed: ${err instanceof Error ? err.message : "Unknown error"}`,
      issues: [],
    };
  }
}

/** Sanitizes string input to prevent XSS */
export function sanitizeString(input: string): string {
  return input
    .replace(/[<>'"&]/g, "") // Remove potential XSS characters
    .trim()
    .slice(0, 1000); // Limit length
}

/** Validates IP address from request headers */
export function extractClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const remoteAddr = request.headers.get("remote-addr");

  let ip = "unknown";

  if (forwardedFor) {
    ip = forwardedFor.split(",")[0]?.trim() || "unknown";
  } else if (realIp) {
    ip = realIp.trim();
  } else if (remoteAddr) {
    ip = remoteAddr.trim();
  }

  // Validate IP format
  const ipResult = ipAddressSchema.safeParse(ip);
  return ipResult.success ? ipResult.data : "unknown";
}

// ── Export all schemas for use across the application ───────────────

export {
  indianMobileSchema,
  emailSchema,
  strongPasswordSchema,
  legacyPasswordSchema,
  sbuRollSchema,
  enrollmentIdSchema,
  usernameSchema,
  otpCodeSchema,
};
