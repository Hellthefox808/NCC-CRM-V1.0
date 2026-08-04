import { Request, Response } from "express";
import { metricsTracker } from "../services/metrics.service";
import { serverCache } from "../repositories/cache";
import { prisma } from "../repositories/db";
import { getActiveWebSocketClientsCount } from "../services/websocket.service";

export const getHealth = (req: Request, res: Response): any => {
  return res.json({
    success: true,
    status: "HEALTHY",
    service: "19 JHR BN NCC SBU Data Engine",
    version: "3.0.0",
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor((Date.now() - metricsTracker.startTime) / 1000),
    activeWebSocketClients: getActiveWebSocketClientsCount(),
    memoryUsageMb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024)
  });
};

export const getMetrics = async (req: Request, res: Response): Promise<any> => {
  try {
    const [enrollmentsCount, sessionsCount] = await Promise.all([
      prisma.cadetProfile.count(),
      prisma.session.count()
    ]);

    return res.json({
      success: true,
      data: {
        uptimeSeconds: Math.floor((Date.now() - metricsTracker.startTime) / 1000),
        activeWebSocketClients: getActiveWebSocketClientsCount(),
        totalRequests: metricsTracker.totalRequests,
        cacheHitRatioPercent: serverCache.getHitRatioPercent(),
        averageLatencyMs: metricsTracker.getAverageLatencyMs(),
        activeEnrollmentsCount: enrollmentsCount,
        activeSessionsCount: sessionsCount,
        memoryUsageMb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024)
      }
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: "Database unavailable" });
  }
};
