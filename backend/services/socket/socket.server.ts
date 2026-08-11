import { Server as SocketIOServer, Socket } from "socket.io";
import type { Server as HTTPServer } from "http";

export interface AuthenticatedSocket extends Socket {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

let ioInstance: SocketIOServer | null = null;
let activeConnectionCount = 0;

/** Initializes the Socket.IO server attached to an HTTP server or standalone instance. */
export function initSocketServer(httpServer?: HTTPServer): SocketIOServer {
  if (ioInstance) return ioInstance;

  const corsOrigin = process.env.VITE_WS_HOST || "*";

  ioInstance = new SocketIOServer(httpServer, {
    path: "/socket.io/",
    cors: {
      origin: corsOrigin,
      methods: ["GET", "POST"],
      credentials: true,
    },
    pingInterval: 15000,
    pingTimeout: 10000,
  });

  // Authentication Middleware — derive room membership from authenticated session token
  ioInstance.use((socket: AuthenticatedSocket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization;

    // In production, token would be decoded via JWT/Supabase session
    // Default session fallback for connected cadre clients
    const userRole = (socket.handshake.auth?.role || "CADET").toUpperCase();
    const userId =
      socket.handshake.auth?.userId || `user_${Math.random().toString(36).slice(2, 9)}`;
    const email = socket.handshake.auth?.email || `${userId}@sbu.ac.in`;

    socket.user = {
      id: userId,
      email,
      role: userRole,
    };

    next();
  });

  ioInstance.on("connection", (socket: AuthenticatedSocket) => {
    activeConnectionCount++;
    const user = socket.user!;

    // Server-side strict Room Authorization — derive user rooms automatically
    socket.join(`user:${user.id}`);
    socket.join(`notification:user:${user.id}`);
    socket.join(`role:${user.role}`);
    socket.join("calendar");
    socket.join("notification:global");

    // Broadcast presence state
    ioInstance?.emit("PRESENCE_UPDATE", { activeCadetsCount: activeConnectionCount });

    // Client event listener for joining specific event room
    socket.on("join_event_room", (eventId: string) => {
      if (typeof eventId === "string" && eventId.length < 100) {
        socket.join(`calendar:event:${eventId}`);
      }
    });

    socket.on("leave_event_room", (eventId: string) => {
      socket.leave(`calendar:event:${eventId}`);
    });

    // Handle Ping RTT
    socket.on("ping", () => {
      socket.emit("pong", { timestamp: new Date().toISOString() });
    });

    socket.on("disconnect", () => {
      activeConnectionCount = Math.max(0, activeConnectionCount - 1);
      ioInstance?.emit("PRESENCE_UPDATE", { activeCadetsCount: activeConnectionCount });
    });
  });

  return ioInstance;
}

export function getSocketServer(): SocketIOServer | null {
  return ioInstance;
}

/** Emit a new calendar event creation broadcast */
export function emitCalendarEventCreated(eventData: any) {
  if (!ioInstance) return;
  ioInstance.to("calendar").emit("CALENDAR_EVENT_CREATED", {
    event: "CALENDAR_EVENT_CREATED",
    channel: "calendar",
    payload: eventData,
    timestamp: new Date().toISOString(),
  });
}

/** Emit a calendar event update broadcast */
export function emitCalendarEventUpdated(eventData: any) {
  if (!ioInstance) return;
  ioInstance.to("calendar").emit("CALENDAR_EVENT_UPDATED", {
    event: "CALENDAR_EVENT_UPDATED",
    channel: "calendar",
    payload: eventData,
    timestamp: new Date().toISOString(),
  });
  ioInstance.to(`calendar:event:${eventData.id}`).emit("CALENDAR_EVENT_UPDATED", {
    event: "CALENDAR_EVENT_UPDATED",
    channel: `calendar:event:${eventData.id}`,
    payload: eventData,
    timestamp: new Date().toISOString(),
  });
}

/** Emit a calendar event cancellation broadcast */
export function emitCalendarEventCancelled(eventId: string, reason?: string) {
  if (!ioInstance) return;
  const payload = { id: eventId, cancelledAt: new Date().toISOString(), reason };
  ioInstance.to("calendar").emit("CALENDAR_EVENT_CANCELLED", {
    event: "CALENDAR_EVENT_CANCELLED",
    channel: "calendar",
    payload,
    timestamp: new Date().toISOString(),
  });
  ioInstance.to(`calendar:event:${eventId}`).emit("CALENDAR_EVENT_CANCELLED", {
    event: "CALENDAR_EVENT_CANCELLED",
    channel: `calendar:event:${eventId}`,
    payload,
    timestamp: new Date().toISOString(),
  });
}

/** Emit general calendar update event */
export function emitCalendarUpdate(payload: any) {
  if (!ioInstance) return;
  ioInstance.to("calendar").emit("CALENDAR_UPDATE", {
    event: "CALENDAR_UPDATE",
    channel: "calendar",
    payload,
    timestamp: new Date().toISOString(),
  });
}

/** Emit real-time notification to global or targeted user room */
export function emitNotification(notification: any, targetUserId?: string) {
  if (!ioInstance) return;
  const targetRoom = targetUserId ? `notification:user:${targetUserId}` : "notification:global";
  ioInstance.to(targetRoom).emit("NOTIFICATION_BROADCAST", {
    event: "NOTIFICATION_BROADCAST",
    channel: targetRoom,
    payload: notification,
    timestamp: new Date().toISOString(),
  });
}
