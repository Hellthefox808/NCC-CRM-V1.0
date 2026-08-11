import { io, Socket } from "socket.io-client";

let socketInstance: Socket | null = null;

export function getSocketClient(token?: string): Socket | null {
  if (typeof window === "undefined") return null;

  if (socketInstance) {
    if (token && socketInstance.auth) {
      socketInstance.auth = { ...socketInstance.auth, token };
    }
    return socketInstance;
  }

  const socketHost =
    (import.meta.env.VITE_WS_HOST as string | undefined) ||
    (typeof window !== "undefined" ? window.location.host : "localhost:8080");
  const protocol =
    typeof window !== "undefined" && window.location.protocol === "https:" ? "https:" : "http:";
  const socketUrl = `${protocol}//${socketHost}`;

  socketInstance = io(socketUrl, {
    path: "/socket.io/",
    autoConnect: false,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    auth: {
      token: token || "",
      role: "CADET",
    },
  });

  return socketInstance;
}

export function disconnectSocketClient() {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
}
