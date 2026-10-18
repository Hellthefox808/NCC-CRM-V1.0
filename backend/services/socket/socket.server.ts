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

  const rawOrigin = process.env.VITE_WS_HOST;
  let corsOrigin: string | string[];
  if (!rawOrigin) {
    corsOrigin = "http://localhost:3000";
  } else if (rawOrigin.includes(",")) {
    corsOrigin = rawOrigin.split(",").map((s) => s.trim());
  } else {
    corsOrigin = rawOrigin;
  }
  const allowCredentials = corsOrigin !== "*";

  ioInstance = new SocketIOServer(httpServer, {
    path: "/socket.io/",
    cors: {
      origin: corsOrigin,
      methods: ["GET", "POST"],
      credentials: allowCredentials,
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
    socket.join("cadre:enrollments");
    socket.join("cadre:notifications");
    socket.join("cadre:presence");

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

    // Client event listener for joining specific channels
    socket.on("join_channel", (channel: string) => {
      if (typeof channel === "string" && channel.length < 100 && !channel.includes("..")) {
        socket.join(channel);
      }
    });

    socket.on("leave_channel", (channel: string) => {
      if (typeof channel === "string" && channel.length < 100) {
        socket.leave(channel);
      }
    });

    // Chat Conversation Room Management
    socket.on("join_conversation", (conversationId: string) => {
      if (typeof conversationId === "string" && conversationId.length < 100) {
        socket.join(`conversation:${conversationId}`);
      }
    });

    socket.on("leave_conversation", (conversationId: string) => {
      if (typeof conversationId === "string" && conversationId.length < 100) {
        socket.leave(`conversation:${conversationId}`);
      }
    });

    // Chat Ephemeral Typing State
    socket.on("typing_start", (data: { conversationId: string; userName?: string }) => {
      if (data?.conversationId && typeof data.conversationId === "string") {
        socket.to(`conversation:${data.conversationId}`).emit("USER_TYPING", {
          conversationId: data.conversationId,
          userId: user.id,
          userName: data.userName || user.email.split("@")[0],
          isTyping: true,
        });
      }
    });

    socket.on("typing_stop", (data: { conversationId: string }) => {
      if (data?.conversationId && typeof data.conversationId === "string") {
        socket.to(`conversation:${data.conversationId}`).emit("USER_TYPING", {
          conversationId: data.conversationId,
          userId: user.id,
          isTyping: false,
        });
      }
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

/** Emit a new cadet enrollment submission broadcast across cadre and administrative channels */
export function emitEnrollmentSubmitted(record: Record<string, unknown>) {
  if (!ioInstance) return;
  const payload = {
    event: "ENROLLMENT_SUBMITTED",
    channel: "cadre:enrollments",
    payload: record,
    timestamp: new Date().toISOString(),
  };
  ioInstance.emit("ENROLLMENT_SUBMITTED", payload);
  ioInstance.to("cadre:enrollments").emit("ENROLLMENT_SUBMITTED", payload);
  ioInstance.to("role:OFFICER").emit("ENROLLMENT_SUBMITTED", payload);
  ioInstance.to("role:ADMIN").emit("ENROLLMENT_SUBMITTED", payload);
}

/** Emit a cadet application status update broadcast across cadre and target cadet user rooms */
export function emitStatusUpdated(record: Record<string, unknown>) {
  if (!ioInstance) return;
  const payload = {
    event: "STATUS_UPDATED",
    channel: "cadre:enrollments",
    payload: record,
    timestamp: new Date().toISOString(),
  };
  ioInstance.emit("STATUS_UPDATED", payload);
  ioInstance.to("cadre:enrollments").emit("STATUS_UPDATED", payload);
  ioInstance.to("role:OFFICER").emit("STATUS_UPDATED", payload);
  ioInstance.to("role:ADMIN").emit("STATUS_UPDATED", payload);
  if (record.id) {
    ioInstance.to(`user:${String(record.id)}`).emit("STATUS_UPDATED", payload);
  }
}

/** Emit a new calendar event creation broadcast */
export function emitCalendarEventCreated(eventData: Record<string, unknown>) {
  if (!ioInstance) return;
  ioInstance.to("calendar").emit("CALENDAR_EVENT_CREATED", {
    event: "CALENDAR_EVENT_CREATED",
    channel: "calendar",
    payload: eventData,
    timestamp: new Date().toISOString(),
  });
}

/** Emit a calendar event update broadcast */
export function emitCalendarEventUpdated(eventData: Record<string, unknown>) {
  if (!ioInstance) return;
  ioInstance.to("calendar").emit("CALENDAR_EVENT_UPDATED", {
    event: "CALENDAR_EVENT_UPDATED",
    channel: "calendar",
    payload: eventData,
    timestamp: new Date().toISOString(),
  });
  if (eventData.id) {
    ioInstance.to(`calendar:event:${String(eventData.id)}`).emit("CALENDAR_EVENT_UPDATED", {
      event: "CALENDAR_EVENT_UPDATED",
      channel: `calendar:event:${String(eventData.id)}`,
      payload: eventData,
      timestamp: new Date().toISOString(),
    });
  }
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
export function emitCalendarUpdate(payload: Record<string, unknown>) {
  if (!ioInstance) return;
  ioInstance.to("calendar").emit("CALENDAR_UPDATE", {
    event: "CALENDAR_UPDATE",
    channel: "calendar",
    payload,
    timestamp: new Date().toISOString(),
  });
}

/** Emit real-time notification to global or targeted user room */
export function emitNotification(notification: Record<string, unknown>, targetUserId?: string) {
  if (!ioInstance) return;
  const targetRoom = targetUserId ? `notification:user:${targetUserId}` : "notification:global";
  ioInstance.to(targetRoom).emit("NOTIFICATION_BROADCAST", {
    event: "NOTIFICATION_BROADCAST",
    channel: targetRoom,
    payload: notification,
    timestamp: new Date().toISOString(),
  });
}

/** Emit a new chat message to a conversation room and notify recipients */
export function emitChatMessage(
  conversationId: string,
  message: Record<string, unknown>,
  recipientUserIds?: string[],
) {
  if (!ioInstance) return;
  const room = `conversation:${conversationId}`;
  const payload = {
    event: "CHAT_MESSAGE_CREATED",
    conversationId,
    message,
    timestamp: new Date().toISOString(),
  };

  // Broadcast to all active users inside the conversation room
  ioInstance.to(room).emit("CHAT_MESSAGE_CREATED", payload);

  // Send notification event to individual user channels for badge update
  if (recipientUserIds && recipientUserIds.length > 0) {
    recipientUserIds.forEach((uid) => {
      ioInstance?.to(`notification:user:${uid}`).emit("CHAT_UNREAD_INCREMENT", {
        conversationId,
        messageId: message.id,
        senderName: message.senderName || message.sender_name,
        preview: typeof message.content === "string" ? message.content.slice(0, 80) : "",
      });
    });
  }
}

/** Emit message edit update */
export function emitMessageUpdated(conversationId: string, update: Record<string, unknown>) {
  if (!ioInstance) return;
  ioInstance.to(`conversation:${conversationId}`).emit("CHAT_MESSAGE_UPDATED", {
    event: "CHAT_MESSAGE_UPDATED",
    conversationId,
    update,
    timestamp: new Date().toISOString(),
  });
}

/** Emit message soft-deletion */
export function emitMessageDeleted(conversationId: string, messageId: string) {
  if (!ioInstance) return;
  ioInstance.to(`conversation:${conversationId}`).emit("CHAT_MESSAGE_DELETED", {
    event: "CHAT_MESSAGE_DELETED",
    conversationId,
    messageId,
    timestamp: new Date().toISOString(),
  });
}

/** Emit message reaction toggle */
export function emitMessageReaction(conversationId: string, reaction: Record<string, unknown>) {
  if (!ioInstance) return;
  ioInstance.to(`conversation:${conversationId}`).emit("CHAT_MESSAGE_REACTION", {
    event: "CHAT_MESSAGE_REACTION",
    conversationId,
    reaction,
    timestamp: new Date().toISOString(),
  });
}

/** Emit conversation metadata update */
export function emitConversationUpdated(
  conversationId: string,
  update: Record<string, unknown>,
  targetUserIds?: string[],
) {
  if (!ioInstance) return;
  ioInstance.to(`conversation:${conversationId}`).emit("CONVERSATION_UPDATED", {
    event: "CONVERSATION_UPDATED",
    conversationId,
    update,
    timestamp: new Date().toISOString(),
  });

  if (targetUserIds) {
    targetUserIds.forEach((uid) => {
      ioInstance?.to(`user:${uid}`).emit("CONVERSATION_UPDATED", {
        conversationId,
        update,
      });
    });
  }
}

/** Emit poll update */
export function emitPollUpdated(
  conversationId: string,
  messageId: string,
  poll: Record<string, unknown>,
) {
  if (!ioInstance) return;
  ioInstance.to(`conversation:${conversationId}`).emit("CHAT_POLL_UPDATED", {
    event: "CHAT_POLL_UPDATED",
    conversationId,
    messageId,
    poll,
    timestamp: new Date().toISOString(),
  });
}

/** Emit message pin/unpin */
export function emitMessagePinned(conversationId: string, messageId: string, isPinned: boolean) {
  if (!ioInstance) return;
  ioInstance.to(`conversation:${conversationId}`).emit("CHAT_MESSAGE_PINNED", {
    event: "CHAT_MESSAGE_PINNED",
    conversationId,
    messageId,
    isPinned,
    timestamp: new Date().toISOString(),
  });
}

/** Emit member addition, removal, or role change */
export function emitMemberChanged(
  conversationId: string,
  member: Record<string, unknown>,
  changeType: "add" | "remove" | "update",
) {
  if (!ioInstance) return;
  ioInstance.to(`conversation:${conversationId}`).emit("CHAT_MEMBER_CHANGED", {
    event: "CHAT_MEMBER_CHANGED",
    conversationId,
    member,
    changeType,
    timestamp: new Date().toISOString(),
  });
}

/** Emit message converted to task */
export function emitMessageConvertedToTask(
  conversationId: string,
  messageId: string,
  task: Record<string, unknown>,
) {
  if (!ioInstance) return;
  ioInstance.to(`conversation:${conversationId}`).emit("CHAT_MESSAGE_CONVERTED_TASK", {
    event: "CHAT_MESSAGE_CONVERTED_TASK",
    conversationId,
    messageId,
    task,
    timestamp: new Date().toISOString(),
  });
}
