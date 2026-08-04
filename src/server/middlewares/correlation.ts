import { Request, Response, NextFunction } from "express";
import { metricsTracker } from "../services/metrics.service";

export function correlationMiddleware(req: Request, res: Response, next: NextFunction) {
  metricsTracker.totalRequests++;
  const startTime = Date.now();
  const requestId = (req.headers["x-request-id"] as string) || `req_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  
  req.headers["x-request-id"] = requestId;
  res.setHeader("X-Request-ID", requestId);
  res.setHeader("X-Powered-By", "19 JHR BN Cadre Engine v3000");

  res.on("finish", () => {
    const duration = Date.now() - startTime;
    metricsTracker.recordLatency(duration);
  });

  next();
}
