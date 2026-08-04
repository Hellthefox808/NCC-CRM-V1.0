import { Router, Request, Response } from "express";
import { getHealth, getMetrics } from "../controllers/system.controller";
import { login, logout, getMe } from "../controllers/auth.controller";
import { getEnrollments, getEnrollmentStatus, submitEnrollment, updateEnrollmentStatus, exportExcel } from "../controllers/enrollment.controller";
import { getNotifications, broadcastNotification } from "../controllers/notification.controller";
import { aiService } from "../services/ai.service";

const router = Router();

// System
router.get("/health", getHealth);
router.get("/metrics", getMetrics);

// Auth
router.post("/auth/login", login);
router.post("/auth/logout", logout);
router.get("/auth/me", getMe);

// Enrollments
router.get("/enrollments", getEnrollments);
router.get("/enrollments/status/:query", getEnrollmentStatus);
router.post("/enrollments", submitEnrollment);
router.patch("/enrollments/status", updateEnrollmentStatus);
router.get("/export-excel", exportExcel);

// Notifications
router.get("/notifications", getNotifications);
router.post("/notifications", broadcastNotification);

// AI
router.post("/ai-chat", async (req: Request, res: Response): Promise<any> => {
  try {
    const { message, sessionId = "default-session", lowLatency } = req.body;
    if (!message) {
      return res.status(400).json({ success: false, error: "Message prompt is required." });
    }
    const reply = await aiService.handleChat(sessionId, message, lowLatency);
    return res.json({ success: true, data: { reply } });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: "AI Assistant unavailable right now. Jai Hind!" });
  }
});

export default router;
