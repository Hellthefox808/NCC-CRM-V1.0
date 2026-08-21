import { useEffect } from "react";
import { useSocket } from "./useSocket";

export interface CalendarRealtimeOptions {
  onEventCreated?: (event: Record<string, unknown>) => void;
  onEventUpdated?: (event: Record<string, unknown>) => void;
  onEventCancelled?: (payload: { id: string; reason?: string }) => void;
  onCalendarUpdate?: (payload: Record<string, unknown>) => void;
}

export function useCalendarRealtime(options?: CalendarRealtimeOptions) {
  const { socket, isConnected, latencyMs } = useSocket();

  useEffect(() => {
    if (!socket) return;

    function handleEventCreated(msg: Record<string, unknown>) {
      const payload = (msg?.payload || msg) as Record<string, unknown>;
      options?.onEventCreated?.(payload);
    }

    function handleEventUpdated(msg: Record<string, unknown>) {
      const payload = (msg?.payload || msg) as Record<string, unknown>;
      options?.onEventUpdated?.(payload);
    }

    function handleEventCancelled(msg: Record<string, unknown>) {
      const payload = (msg?.payload || msg) as { id: string; reason?: string };
      options?.onEventCancelled?.(payload);
    }

    function handleCalendarUpdate(msg: Record<string, unknown>) {
      const payload = (msg?.payload || msg) as Record<string, unknown>;
      options?.onCalendarUpdate?.(payload);
    }

    socket.on("CALENDAR_EVENT_CREATED", handleEventCreated);
    socket.on("CALENDAR_EVENT_UPDATED", handleEventUpdated);
    socket.on("CALENDAR_EVENT_CANCELLED", handleEventCancelled);
    socket.on("CALENDAR_UPDATE", handleCalendarUpdate);

    return () => {
      socket.off("CALENDAR_EVENT_CREATED", handleEventCreated);
      socket.off("CALENDAR_EVENT_UPDATED", handleEventUpdated);
      socket.off("CALENDAR_EVENT_CANCELLED", handleEventCancelled);
      socket.off("CALENDAR_UPDATE", handleCalendarUpdate);
    };
  }, [socket, options]);

  return {
    isConnected,
    latencyMs,
  };
}
