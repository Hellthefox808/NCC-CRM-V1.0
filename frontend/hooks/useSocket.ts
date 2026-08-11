import { useEffect, useState, useRef, useCallback } from "react";
import { Socket } from "socket.io-client";
import { getSocketClient } from "../lib/socket";

export interface SocketState {
  isConnected: boolean;
  connectionState: "CONNECTING" | "CONNECTED" | "DISCONNECTED" | "RECONNECTING";
  latencyMs: number;
  activePresenceCount: number;
  reconnectAttempts: number;
}

export function useSocket(token?: string) {
  const [state, setState] = useState<SocketState>({
    isConnected: false,
    connectionState: "CONNECTING",
    latencyMs: 0,
    activePresenceCount: 1,
    reconnectAttempts: 0,
  });

  const socketRef = useRef<Socket | null>(null);
  const pingStartRef = useRef<number>(0);
  const pingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const socket = getSocketClient(token);
    if (!socket) return;

    socketRef.current = socket;

    if (!socket.connected) {
      socket.connect();
    }

    function onConnect() {
      setState((prev) => ({
        ...prev,
        isConnected: true,
        connectionState: "CONNECTED",
        reconnectAttempts: 0,
      }));

      // Setup 15s ping timer for latency check
      if (pingTimerRef.current) clearInterval(pingTimerRef.current);
      pingTimerRef.current = setInterval(() => {
        if (socket.connected) {
          pingStartRef.current = Date.now();
          socket.emit("ping");
        }
      }, 15000);
    }

    function onDisconnect() {
      if (pingTimerRef.current) clearInterval(pingTimerRef.current);
      setState((prev) => ({
        ...prev,
        isConnected: false,
        connectionState: "DISCONNECTED",
      }));
    }

    function onPong() {
      const rtt = Date.now() - pingStartRef.current;
      setState((prev) => ({ ...prev, latencyMs: rtt > 0 ? rtt : 10 }));
    }

    function onPresenceUpdate(data: { activeCadetsCount: number }) {
      if (data?.activeCadetsCount !== undefined) {
        setState((prev) => ({ ...prev, activePresenceCount: data.activeCadetsCount }));
      }
    }

    function onReconnectAttempt(attempt: number) {
      setState((prev) => ({
        ...prev,
        connectionState: "RECONNECTING",
        reconnectAttempts: attempt,
      }));
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("pong", onPong);
    socket.on("PRESENCE_UPDATE", onPresenceUpdate);
    socket.io.on("reconnect_attempt", onReconnectAttempt);

    if (socket.connected) {
      onConnect();
    }

    return () => {
      if (pingTimerRef.current) clearInterval(pingTimerRef.current);
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("pong", onPong);
      socket.off("PRESENCE_UPDATE", onPresenceUpdate);
      socket.io.off("reconnect_attempt", onReconnectAttempt);
    };
  }, [token]);

  const joinEventRoom = useCallback((eventId: string) => {
    socketRef.current?.emit("join_event_room", eventId);
  }, []);

  const leaveEventRoom = useCallback((eventId: string) => {
    socketRef.current?.emit("leave_event_room", eventId);
  }, []);

  return {
    socket: socketRef.current,
    ...state,
    joinEventRoom,
    leaveEventRoom,
  };
}
