import { Request, Response } from "express";
import { prisma } from "../repositories/db";
import { serverCache } from "../repositories/cache";
import { broadcastWebSocketEvent } from "../services/websocket.service";

export const getNotifications = async (req: Request, res: Response): Promise<any> => {
  try {
    const dbNotifications = await prisma.notification.findMany({
      orderBy: { createdAt: "desc" },
    });

    const notifications = dbNotifications.map(n => ({
      id: n.id,
      title: n.title,
      category: n.category,
      priority: n.priority,
      date: n.createdAt.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
      body: n.body,
      read: false, // In a real system, this would join a NotificationRead state table
      actionType: n.actionType,
      actionLabel: n.actionLabel
    }));

    // Mock unread count as 0 for now since it requires per-user tracking
    return res.json({
      success: true,
      data: { notifications, unreadCount: notifications.length }
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Database error fetching notifications" });
  }
};

export const broadcastNotification = async (req: Request, res: Response): Promise<any> => {
  const { title, category, priority, body, actionType, actionLabel } = req.body;
  if (!title || !body) {
    return res.status(400).json({ success: false, error: "Title and Body are required." });
  }

  try {
    const newDbNotice = await prisma.notification.create({
      data: {
        title,
        category: category || "Urgent Notice",
        priority: priority || "NORMAL",
        body,
        actionType: actionType || "general",
        actionLabel: actionLabel || "View Details",
      }
    });

    const newNotice = {
      id: newDbNotice.id,
      title: newDbNotice.title,
      category: newDbNotice.category,
      priority: newDbNotice.priority,
      date: newDbNotice.createdAt.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
      body: newDbNotice.body,
      read: false,
      actionType: newDbNotice.actionType || "general",
      actionLabel: newDbNotice.actionLabel || "View Details"
    };

    serverCache.invalidateTag("notifications");
    broadcastWebSocketEvent("cadre:notifications", "NOTIFICATION_BROADCAST", newNotice);

    return res.status(201).json({ success: true, data: { notification: newNotice } });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Database error broadcasting notification" });
  }
};
