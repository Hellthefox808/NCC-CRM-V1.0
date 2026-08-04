import { WebSocketServer, WebSocket } from "ws";
import http from "http";
import { metricsTracker } from "./metrics.service";

interface ExtendedWebSocket extends WebSocket {
  isAlive: boolean;
  id: string;
  channels: Set<string>;
}

const connectedClients = new Set<ExtendedWebSocket>();
let wss: WebSocketServer;

export function initWebSocketServer(server: http.Server) {
  wss = new WebSocketServer({ server, path: "/ws/v1" });

  wss.on("connection", (ws: ExtendedWebSocket) => {
    ws.isAlive = true;
    ws.id = `ws_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    ws.channels = new Set(["cadre:notifications", "cadre:enrollments", "cadre:presence"]);
    connectedClients.add(ws);

    ws.send(
      JSON.stringify({
        event: "CONNECTED",
        channel: "system",
        payload: {
          connectionId: ws.id,
          serverTime: new Date().toISOString(),
          message: "Connected to 19 JHR BN NCC Realtime Engine v3000",
          activeCadetsCount: connectedClients.size
        }
      })
    );

    broadcastWebSocketEvent("cadre:presence", "PRESENCE_UPDATE", {
      activeCadetsCount: connectedClients.size,
      serverUptimeSeconds: Math.floor((Date.now() - metricsTracker.startTime) / 1000)
    });

    ws.on("pong", () => {
      ws.isAlive = true;
    });

    ws.on("message", (raw) => {
      try {
        const data = JSON.parse(raw.toString());

        if (data.action === "ping") {
          ws.send(JSON.stringify({ event: "pong", timestamp: new Date().toISOString() }));
          return;
        }

        if (data.action === "subscribe" && data.channel) {
          ws.channels.add(data.channel);
          ws.send(
            JSON.stringify({
              event: "SUBSCRIBED",
              channel: data.channel,
              payload: { channel: data.channel }
            })
          );
        }
      } catch (e) {
        console.warn("WebSocket message parse error:", e);
      }
    });

    ws.on("close", () => {
      connectedClients.delete(ws);
      broadcastWebSocketEvent("cadre:presence", "PRESENCE_UPDATE", {
        activeCadetsCount: connectedClients.size
      });
    });
  });

  setInterval(() => {
    connectedClients.forEach((ws) => {
      if (ws.isAlive === false) {
        connectedClients.delete(ws);
        return ws.terminate();
      }
      ws.isAlive = false;
      ws.ping();
    });
  }, 20000);
}

export function broadcastWebSocketEvent(channel: string, eventName: string, payload: any) {
  const message = JSON.stringify({
    event: eventName,
    channel,
    payload,
    timestamp: new Date().toISOString(),
    correlationId: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`
  });

  connectedClients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN && (client.channels.has(channel) || client.channels.has("*"))) {
      client.send(message);
    }
  });
}

export function getActiveWebSocketClientsCount() {
  return connectedClients.size;
}
