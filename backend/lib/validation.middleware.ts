/**
 * Validation middleware for consistent request validation across all endpoints
 */

import { z } from "zod";
import { json } from "@backend/lib/ncc-db";
import { validateRequestBody, extractClientIp } from "@backend/lib/validation.schemas";

export interface ValidationContext {
  request: Request;
  clientIp: string;
}

/**
 * Creates a validation middleware that validates request body and provides context
 */
export function createValidationMiddleware<T>(schema: z.ZodSchema<T>) {
  return async (
    request: Request,
  ): Promise<
    | {
        success: true;
        data: T;
        context: ValidationContext;
      }
    | {
        success: false;
        response: Response;
      }
  > => {
    const clientIp = extractClientIp(request);
    const context: ValidationContext = { request, clientIp };

    try {
      const rawBody = await request.json().catch(() => ({}));
      const validation = validateRequestBody(schema, rawBody);

      if (!validation.success) {
        return {
          success: false,
          response: json(
            {
              success: false,
              error: validation.error,
              code: "VALIDATION_FAILED",
              details: validation.issues.map((issue) => ({
                field: issue.path.join("."),
                message: issue.message,
              })),
            },
            400,
          ),
        };
      }

      return {
        success: true,
        data: validation.data,
        context,
      };
    } catch (err) {
      return {
        success: false,
        response: json(
          {
            success: false,
            error: "Invalid request format",
            code: "PARSE_ERROR",
          },
          400,
        ),
      };
    }
  };
}

/**
 * Rate limiting helper with enhanced error reporting
 */
export async function checkRateLimitWithLogging(
  key: string,
  options: { maxAttempts: number; windowMs: number },
  context: ValidationContext,
  actor: string,
  action: string,
  target: string,
): Promise<{ allowed: true } | { allowed: false; response: Response }> {
  const { checkRateLimit } = await import("@backend/lib/rate-limiter.server");

  const rl = checkRateLimit(key, options);

  if (!rl.allowed) {
    // Log rate limit violation
    const { logAuditEvent } = await import("@backend/lib/audit-log.server");
    logAuditEvent({
      actor,
      action: "login_failure", // or other appropriate action
      target,
      ip: context.clientIp,
      metadata: {
        reason: "rate_limit_exceeded",
        retryAfter: Math.ceil(rl.retryAfterMs / 1000),
        remaining: rl.remaining,
      },
    });

    return {
      allowed: false,
      response: json(
        {
          success: false,
          error: "Too many requests. Please try again later.",
          code: "RATE_LIMIT_EXCEEDED",
          retryAfter: Math.ceil(rl.retryAfterMs / 1000),
        },
        429,
        {
          "Retry-After": Math.ceil(rl.retryAfterMs / 1000).toString(),
        },
      ),
    };
  }

  return { allowed: true };
}

/**
 * Enhanced error response helper with security considerations
 */
export function createErrorResponse(
  error: string,
  code: string,
  status = 400,
  details?: Array<{ field: string; message: string }>,
): Response {
  // Sanitize error messages to prevent information leakage
  const sanitizedError = error
    .replace(/database/gi, "system")
    .replace(/sql/gi, "data")
    .replace(/internal/gi, "system");

  return json(
    {
      success: false,
      error: sanitizedError,
      code,
      ...(details && { details }),
    },
    status,
  );
}

/**
 * Success response helper with consistent format
 */
export function createSuccessResponse<T>(data?: T, message?: string, status = 200): Response {
  return json(
    {
      success: true,
      ...(message && { message }),
      ...(data && { data }),
    },
    status,
  );
}
