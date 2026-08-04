import { Request, Response, NextFunction } from "express";

export function securityHeadersMiddleware(req: Request, res: Response, next: NextFunction) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  if (process.env.NODE_ENV === "production") {
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  }
  next();
}

const ipRequestCounts = new Map<string, { count: number; resetAt: number }>();

export function rateLimitMiddleware(req: Request, res: Response, next: NextFunction) {
  const ip = req.ip || req.socket.remoteAddress || "127.0.0.1";
  const now = Date.now();
  const windowMs = 60000;
  const maxRequests = 120;

  const current = ipRequestCounts.get(ip) || { count: 0, resetAt: now + windowMs };

  if (now > current.resetAt) {
    current.count = 1;
    current.resetAt = now + windowMs;
  } else {
    current.count++;
  }

  ipRequestCounts.set(ip, current);

  res.setHeader("X-RateLimit-Limit", String(maxRequests));
  res.setHeader("X-RateLimit-Remaining", String(Math.max(0, maxRequests - current.count)));
  res.setHeader("X-RateLimit-Reset", String(Math.ceil(current.resetAt / 1000)));

  if (current.count > maxRequests) {
    return res.status(429).json({
      success: false,
      error: "Rate limit exceeded. Please slow down requests to 19 JHR BN Server.",
      code: "RATE_LIMIT_EXCEEDED"
    });
  }

  next();
}
