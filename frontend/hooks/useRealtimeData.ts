import { useEffect, useState, useRef, useCallback } from "react";
import { CadetRecord } from "@/types";
import { NotificationItem } from "@frontend/features/NotificationsFeed";
import { useSocket } from "./useSocket";

export interface WebSocketEvent<T = unknown> {
  event: string;
  channel: string;
  payload: T;
  timestamp: string;
  correlationId?: string;
}

export interface RealtimeState {
  isConnected: boolean;
  activePresenceCount: number;
  lastEvent: WebSocketEvent | null;
  connectionState: "CONNECTING" | "CONNECTED" | "DISCONNECTED" | "RECONNECTING";
  latencyMs: number;
  reconnectAttempts: number;
}

export interface RealtimeOptions {
  channels?: string[];
  onNotificationBroadcast?: (notification: NotificationItem) => void;
  onStatusUpdated?: (record: CadetRecord) => void;
  onEnrollmentSubmitted?: (record: CadetRecord) => void;
  onMetricsUpdate?: (metrics: Record<string, unknown>) => void;
}

/**
 * Socket.IO based live channel subscription for cadre events.
 * Refactored to seamlessly replace the legacy native WebSocket implementation.
 */
export function useRealtimeData(options?: RealtimeOptions) {
  const {
    socket,
    isConnected,
    connectionState,
    latencyMs,
    activePresenceCount,
    reconnectAttempts,
  } = useSocket();
  const [lastEvent, setLastEvent] = useState<WebSocketEvent | null>(null);

  const optionsRef = useRef<RealtimeOptions | undefined>(options);
  optionsRef.current = options;

  useEffect(() => {
    if (!socket) return;

    function handleEvent(eventName: string, data: Record<string, unknown>) {
      const payload = data?.payload !== undefined ? data.payload : data;
      const handlers = optionsRef.current;

      if (eventName === "NOTIFICATION_BROADCAST")
        handlers?.onNotificationBroadcast?.(payload as NotificationItem);
      if (eventName === "STATUS_UPDATED") handlers?.onStatusUpdated?.(payload as CadetRecord);
      if (eventName === "ENROLLMENT_SUBMITTED")
        handlers?.onEnrollmentSubmitted?.(payload as CadetRecord);
      if (eventName === "METRICS_TICK")
        handlers?.onMetricsUpdate?.(payload as Record<string, unknown>);

      setLastEvent({
        event: eventName,
        channel: (data?.channel as string) || "global",
        payload,
        timestamp: (data?.timestamp as string) || new Date().toISOString(),
      });
    }

    const eventsToListen = [
      "NOTIFICATION_BROADCAST",
      "STATUS_UPDATED",
      "ENROLLMENT_SUBMITTED",
      "METRICS_TICK",
      "CALENDAR_EVENT_CREATED",
      "CALENDAR_EVENT_UPDATED",
      "CALENDAR_EVENT_CANCELLED",
    ];

    eventsToListen.forEach((evt) => {
      socket.on(evt, (data: Record<string, unknown>) => handleEvent(evt, data));
    });

    return () => {
      eventsToListen.forEach((evt) => {
        socket.off(evt);
      });
    };
  }, [socket]);

  const sendEvent = useCallback(
    (action: string, payload: unknown) => {
      if (socket && isConnected) {
        socket.emit(action, {
          action,
          payload,
          timestamp: new Date().toISOString(),
          correlationId: `evt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        });
        return true;
      }
      return false;
    },
    [socket, isConnected],
  );

  return {
    isConnected,
    activePresenceCount,
    lastEvent,
    connectionState,
    latencyMs,
    reconnectAttempts,
    sendEvent,
  };
}
