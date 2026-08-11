/**
 * Input sanitization utilities for the NCC portal
 *
 * Provides comprehensive sanitization functions to prevent XSS, injection attacks,
 * and ensure data integrity across all user inputs.
 */

/**
 * Sanitizes string input to prevent XSS and injection attacks
 */
export function sanitizeString(
  input: string,
  options: {
    maxLength?: number;
    allowHtml?: boolean;
    preserveLineBreaks?: boolean;
  } = {},
): string {
  const { maxLength = 1000, allowHtml = false, preserveLineBreaks = false } = options;

  if (typeof input !== "string") {
    return "";
  }

  let sanitized = input.trim();

  // Remove or escape HTML/XML characters
  if (!allowHtml) {
    sanitized = sanitized
      .replace(/[<>]/g, "") // Remove < and >
      .replace(/&(?!(amp|lt|gt|quot|apos);)/g, "&amp;") // Escape unescaped &
      .replace(/["']/g, (match) => (match === '"' ? "&quot;" : "&#x27;")); // Escape quotes
  }

  // Handle line breaks
  if (!preserveLineBreaks) {
    sanitized = sanitized.replace(/[\r\n]/g, " ");
  }

  // Remove control characters except allowed ones
  // eslint-disable-next-line no-control-regex
  sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");

  // Limit length
  return sanitized.slice(0, maxLength);
}

/**
 * Sanitizes names (person names, place names, etc.)
 */
export function sanitizeName(input: string): string {
  return sanitizeString(input, { maxLength: 100 })
    .replace(/[^a-zA-Z\s.''-]/g, "") // Only allow letters, spaces, apostrophes, hyphens, dots
    .replace(/\s{2,}/g, " ") // Replace multiple spaces with single space
    .replace(/^[^a-zA-Z]+|[^a-zA-Z]+$/g, ""); // Remove non-letters from start/end
}

/**
 * Sanitizes email addresses
 */
export function sanitizeEmail(input: string): string {
  return sanitizeString(input, { maxLength: 254 })
    .toLowerCase()
    .replace(/[^a-z0-9@._+-]/g, "") // Only allow valid email characters
    .replace(/\.{2,}/g, "."); // Replace multiple dots with single dot
}

/**
 * Sanitizes phone numbers (Indian format)
 */
export function sanitizePhone(input: string): string {
  return input
    .replace(/\D/g, "") // Remove all non-digits
    .replace(/^(\+91|91|0)?/, "") // Remove country code and leading 0
    .slice(0, 10); // Limit to 10 digits
}

/**
 * Sanitizes academic identifiers (SBU Roll No, Enrollment ID, etc.)
 */
export function sanitizeAcademicId(input: string): string {
  return sanitizeString(input, { maxLength: 20 })
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, ""); // Only alphanumeric
}

/**
 * Sanitizes search queries to prevent injection while preserving functionality
 */
export function sanitizeSearchQuery(input: string): string {
  return sanitizeString(input, { maxLength: 200 })
    .replace(/[%,.()\\]/g, "") // Remove PostgREST special characters
    .replace(/[;'"]/g, "") // Remove SQL injection characters
    .replace(/\s{2,}/g, " "); // Normalize spaces
}

/**
 * Sanitizes file names for safe storage
 */
export function sanitizeFileName(input: string): string {
  return sanitizeString(input, { maxLength: 255 })
    .replace(/[<>:"/\\|?*]/g, "") // Remove Windows/Unix forbidden characters
    .replace(/\s+/g, "_") // Replace spaces with underscores
    .replace(/[^a-zA-Z0-9._-]/g, "") // Only allow safe characters
    .replace(/^\.+|\.+$/g, "") // Remove leading/trailing dots
    .slice(0, 100); // Reasonable length limit
}

/**
 * Validates and sanitizes Aadhaar numbers
 */
export function sanitizeAadhaar(input: string): string {
  const cleaned = input.replace(/\D/g, ""); // Remove non-digits

  if (cleaned.length !== 12) {
    throw new Error("Aadhaar number must be exactly 12 digits");
  }

  // Basic Luhn-like validation for Aadhaar
  const digits = cleaned.split("").map(Number);
  const multipliers = [2, 3, 4, 5, 6, 7, 8, 9, 2, 3, 4];
  const sum = digits.slice(0, 11).reduce((acc, digit, index) => {
    return acc + digit * multipliers[index];
  }, 0);

  const checksum = sum % 11;
  const expectedCheckDigit = checksum < 2 ? checksum : 11 - checksum;

  if (digits[11] !== expectedCheckDigit) {
    throw new Error("Invalid Aadhaar number checksum");
  }

  return cleaned;
}

/**
 * Sanitizes database column/table names to prevent injection
 */
export function sanitizeDbIdentifier(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "") // Only allow safe database identifier characters
    .slice(0, 63); // PostgreSQL identifier limit
}

/**
 * Comprehensive input sanitizer that determines type and applies appropriate sanitization
 */
export function sanitizeInput(
  input: unknown,
  type: "string" | "name" | "email" | "phone" | "search" | "filename" | "academic",
): string {
  if (typeof input !== "string") {
    return "";
  }

  switch (type) {
    case "name":
      return sanitizeName(input);
    case "email":
      return sanitizeEmail(input);
    case "phone":
      return sanitizePhone(input);
    case "search":
      return sanitizeSearchQuery(input);
    case "filename":
      return sanitizeFileName(input);
    case "academic":
      return sanitizeAcademicId(input);
    default:
      return sanitizeString(input);
  }
}

/**
 * Creates a sanitization function for specific field types
 */
export function createSanitizer(type: Parameters<typeof sanitizeInput>[1]) {
  return (input: unknown) => sanitizeInput(input, type);
}

/**
 * Batch sanitization for multiple fields
 */
export function sanitizeFields(
  data: Record<string, unknown>,
  fieldTypes: Record<string, Parameters<typeof sanitizeInput>[1]>,
): Record<string, string> {
  const sanitized: Record<string, string> = {};

  for (const [field, type] of Object.entries(fieldTypes)) {
    if (field in data) {
      sanitized[field] = sanitizeInput(data[field], type);
    }
  }

  return sanitized;
}

/**
 * Validates input against common attack patterns
 */
export function detectSuspiciousPatterns(input: string): {
  isSuspicious: boolean;
  reasons: string[];
} {
  const reasons: string[] = [];

  // SQL injection patterns
  if (
    /('|\bselect|\binsert|\bupdate|\bdelete|\bdrop|\bcreate|\balter|\bexec|\bexecute)\s/i.test(
      input,
    )
  ) {
    reasons.push("SQL injection attempt detected");
  }

  // XSS patterns
  if (/<script|javascript:|on\w+\s*=/i.test(input)) {
    reasons.push("XSS attempt detected");
  }

  // Path traversal
  if (/\.\.|\/\.\.|\\\.\./.test(input)) {
    reasons.push("Path traversal attempt detected");
  }

  // Command injection
  if (/[;&|`$(){}[\]\\]/.test(input)) {
    reasons.push("Command injection characters detected");
  }

  // Excessive length (potential buffer overflow)
  if (input.length > 10000) {
    reasons.push("Excessive input length");
  }

  return {
    isSuspicious: reasons.length > 0,
    reasons,
  };
}
