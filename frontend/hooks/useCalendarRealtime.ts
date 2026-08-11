import { useEffect } from "react";
import { useSocket } from "./useSocket";

export interface CalendarRealtimeOptions {
  onEventCreated?: (event: any) => void;
  onEventUpdated?: (event: any) => void;
  onEventCancelled?: (payload: { id: string; reason?: string }) => void;
  onCalendarUpdate?: (payload: any) => void;
}

export function useCalendarRealtime(options?: CalendarRealtimeOptions) {
  const { socket, isConnected, latencyMs } = useSocket();

  useEffect(() => {
    if (!socket) return;

    function handleEventCreated(msg: any) {
      options?.onEventCreated?.(msg?.payload || msg);
    }

    function handleEventUpdated(msg: any) {
      options?.onEventUpdated?.(msg?.payload || msg);
    }

    function handleEventCancelled(msg: any) {
      options?.onEventCancelled?.(msg?.payload || msg);
    }

    function handleCalendarUpdate(msg: any) {
      options?.onCalendarUpdate?.(msg?.payload || msg);
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
