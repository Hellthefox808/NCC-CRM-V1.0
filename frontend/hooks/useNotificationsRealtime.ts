import { useEffect, useState, useCallback } from "react";
import { useSocket } from "./useSocket";

export interface NotificationItem {
  id: string;
  title: string;
  category: string;
  priority: string;
  date: string;
  body: string;
  read: boolean;
  actionType?: string;
  actionLabel?: string;
}

export interface NotificationsRealtimeOptions {
  onNotificationReceived?: (notification: NotificationItem) => void;
}

export function useNotificationsRealtime(options?: NotificationsRealtimeOptions) {
  const { socket, isConnected } = useSocket();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  useEffect(() => {
    if (!socket) return;

    function handleNotificationBroadcast(msg: any) {
      const item: NotificationItem = msg?.payload || msg;
      setNotifications((prev) => [item, ...prev]);
      setUnreadCount((prev) => prev + 1);
      options?.onNotificationReceived?.(item);
    }

    socket.on("NOTIFICATION_BROADCAST", handleNotificationBroadcast);

    return () => {
      socket.off("NOTIFICATION_BROADCAST", handleNotificationBroadcast);
    };
  }, [socket, options]);

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    setUnreadCount((prev) => Math.max(0, prev - 1));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  }, []);

  return {
    isConnected,
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
  };
}
