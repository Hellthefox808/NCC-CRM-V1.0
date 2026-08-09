import { useEffect, useState, useRef, useCallback } from "react";
import { CadetRecord } from "@/types";
import { NotificationItem } from "@frontend/features/NotificationsFeed";

export interface WebSocketEvent<T = any> {
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
  onMetricsUpdate?: (metrics: any) => void;
}

const DEFAULT_CHANNELS = ["cadre:notifications", "cadre:enrollments", "cadre:presence"];
const MAX_RECONNECT_ATTEMPTS = 5;

/**
 * Live channel subscription for cadre events.
 *
 * The socket gateway is optional in this deployment: it is only dialled when
 * VITE_WS_HOST is configured. Without it the hook stays quietly disconnected
 * instead of retrying a nonexistent endpoint forever.
 */
export function useRealtimeData(options?: RealtimeOptions) {
  const socketHost = (import.meta.env.VITE_WS_HOST as string | undefined) || "";
  const realtimeEnabled = Boolean(socketHost);

  const [state, setState] = useState<RealtimeState>({
    isConnected: false,
    activePresenceCount: 1,
    lastEvent: null,
    connectionState: realtimeEnabled ? "CONNECTING" : "DISCONNECTED",
    latencyMs: 0,
    reconnectAttempts: 0,
  });

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pingStartTimeRef = useRef<number>(0);
  const reconnectAttemptsRef = useRef<number>(0);
  const closedByUnmountRef = useRef<boolean>(false);

  // Handlers are read through a ref so a new inline options object on every
  // render cannot re-trigger the connection effect.
  const optionsRef = useRef<RealtimeOptions | undefined>(options);
  optionsRef.current = options;

  const channels = options?.channels ?? DEFAULT_CHANNELS;
  const channelKey = channels.join(",");
  const channelsRef = useRef<string[]>(channels);
  channelsRef.current = channels;

  const connect = useCallback(() => {
    if (!realtimeEnabled) return;
    if (
      wsRef.current?.readyState === WebSocket.OPEN ||
      wsRef.current?.readyState === WebSocket.CONNECTING
    ) {
      return;
    }

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${socketHost}/ws/v1`;

    setState((prev) => ({
      ...prev,
      connectionState: reconnectAttemptsRef.current > 0 ? "RECONNECTING" : "CONNECTING",
    }));

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        reconnectAttemptsRef.current = 0;
        setState((prev) => ({
          ...prev,
          isConnected: true,
          connectionState: "CONNECTED",
          reconnectAttempts: 0,
        }));

        channelsRef.current.forEach((ch) => {
          ws.send(JSON.stringify({ action: "subscribe", channel: ch }));
        });

        if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
        pingIntervalRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            pingStartTimeRef.current = Date.now();
            ws.send(JSON.stringify({ action: "ping", timestamp: new Date().toISOString() }));
          }
        }, 15000);
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          const handlers = optionsRef.current;

          if (msg.event === "pong") {
            const rtt = Date.now() - pingStartTimeRef.current;
            setState((prev) => ({ ...prev, latencyMs: rtt > 0 ? rtt : 10 }));
            return;
          }

          if (msg.event === "PRESENCE_UPDATE") {
            setState((prev) => ({
              ...prev,
              activePresenceCount: msg.payload?.activeCadetsCount || prev.activePresenceCount,
            }));
          }

          if (msg.event === "NOTIFICATION_BROADCAST")
            handlers?.onNotificationBroadcast?.(msg.payload);
          if (msg.event === "STATUS_UPDATED") handlers?.onStatusUpdated?.(msg.payload);
          if (msg.event === "ENROLLMENT_SUBMITTED") handlers?.onEnrollmentSubmitted?.(msg.payload);
          if (msg.event === "METRICS_TICK") handlers?.onMetricsUpdate?.(msg.payload);

          setState((prev) => ({ ...prev, lastEvent: msg }));
        } catch (e) {
          console.warn("Realtime channel parse error:", e);
        }
      };

      ws.onclose = () => {
        if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
        setState((prev) => ({
          ...prev,
          isConnected: false,
          connectionState: "DISCONNECTED",
        }));

        if (closedByUnmountRef.current) return;

        reconnectAttemptsRef.current += 1;
        setState((prev) => ({ ...prev, reconnectAttempts: reconnectAttemptsRef.current }));

        // Give up after a bounded number of tries so an unavailable gateway
        // never becomes a permanent reconnect loop.
        if (reconnectAttemptsRef.current > MAX_RECONNECT_ATTEMPTS) return;

        const delay = Math.min(1000 * Math.pow(1.5, reconnectAttemptsRef.current), 10000);
        reconnectTimerRef.current = setTimeout(connect, delay);
      };

      ws.onerror = () => {
        if (ws.readyState === WebSocket.OPEN) ws.close();
      };
    } catch (e) {
      console.warn("Realtime channel initialisation error:", e);
    }
  }, [realtimeEnabled, socketHost]);

  useEffect(() => {
    if (!realtimeEnabled) return;

    closedByUnmountRef.current = false;
    reconnectAttemptsRef.current = 0;
    connect();

    return () => {
      closedByUnmountRef.current = true;
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
      wsRef.current?.close();
      wsRef.current = null;
    };
    // channelKey is a stable primitive derived from the channel list, so
    // callers passing an inline array no longer re-open the socket each render.
  }, [connect, realtimeEnabled, channelKey]);

  const sendEvent = useCallback((action: string, payload: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          action,
          payload,
          timestamp: new Date().toISOString(),
          correlationId: `evt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        }),
      );
      return true;
    }
    return false;
  }, []);

  return {
    ...state,
    sendEvent,
  };
}
