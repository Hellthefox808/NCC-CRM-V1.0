import { useEffect, useState, useRef, useCallback } from "react";
import { CadetRecord } from "../types";
import { NotificationItem } from "../components/NotificationsFeed";

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

export function useRealtimeData(options?: {
  channels?: string[];
  onNotificationBroadcast?: (notification: NotificationItem) => void;
  onStatusUpdated?: (record: CadetRecord) => void;
  onEnrollmentSubmitted?: (record: CadetRecord) => void;
  onMetricsUpdate?: (metrics: any) => void;
}) {
  const [state, setState] = useState<RealtimeState>({
    isConnected: false,
    activePresenceCount: 1,
    lastEvent: null,
    connectionState: "CONNECTING",
    latencyMs: 12,
    reconnectAttempts: 0,
  });

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const pingStartTimeRef = useRef<number>(0);
  const reconnectAttemptsRef = useRef<number>(0);

  const channels = options?.channels || ["cadre:notifications", "cadre:enrollments", "cadre:presence"];

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN || wsRef.current?.readyState === WebSocket.CONNECTING) {
      return;
    }

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws/v1`;

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

        // Subscribe to specified channels
        channels.forEach((ch) => {
          ws.send(JSON.stringify({ action: "subscribe", channel: ch }));
        });

        // Start heartbeat ping
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

          // Handle heartbeat pong
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

          if (msg.event === "NOTIFICATION_BROADCAST" && options?.onNotificationBroadcast) {
            options.onNotificationBroadcast(msg.payload);
          }

          if (msg.event === "STATUS_UPDATED" && options?.onStatusUpdated) {
            options.onStatusUpdated(msg.payload);
          }

          if (msg.event === "ENROLLMENT_SUBMITTED" && options?.onEnrollmentSubmitted) {
            options.onEnrollmentSubmitted(msg.payload);
          }

          if (msg.event === "METRICS_TICK" && options?.onMetricsUpdate) {
            options.onMetricsUpdate(msg.payload);
          }

          setState((prev) => ({ ...prev, lastEvent: msg }));
        } catch (e) {
          console.warn("WebSocket parse error:", e);
        }
      };

      ws.onclose = () => {
        if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
        setState((prev) => ({
          ...prev,
          isConnected: false,
          connectionState: "DISCONNECTED",
        }));

        // Exponential backoff reconnect
        reconnectAttemptsRef.current += 1;
        const delay = Math.min(1000 * Math.pow(1.5, reconnectAttemptsRef.current), 10000);

        setState((prev) => ({ ...prev, reconnectAttempts: reconnectAttemptsRef.current }));
        reconnectTimerRef.current = setTimeout(connect, delay);
      };

      ws.onerror = () => {
        if (ws.readyState === WebSocket.OPEN) ws.close();
      };
    } catch (e) {
      console.warn("WebSocket initialization error:", e);
    }
  }, [channels, options]);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  // Send typed event through WebSocket
  const sendEvent = useCallback((action: string, payload: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          action,
          payload,
          timestamp: new Date().toISOString(),
          correlationId: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        })
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
