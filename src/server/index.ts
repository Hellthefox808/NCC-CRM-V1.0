import express from "express";
import http from "http";
import path from "path";
import { createServer as createViteServer } from "vite";
import { securityHeadersMiddleware, rateLimitMiddleware } from "./middlewares/security";
import { correlationMiddleware } from "./middlewares/correlation";
import { initWebSocketServer } from "./services/websocket.service";
import v1Router from "./routes/v1";

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Enterprise Middleware Pipeline
app.use(securityHeadersMiddleware);
app.use(correlationMiddleware);
app.use(rateLimitMiddleware);

// Backward Compatibility Aliases for Legacy API Paths
app.use((req, res, next) => {
  if (req.url === "/api/enrollment") {
    req.url = "/api/v1/enrollments";
  } else if (req.url.startsWith("/api/enrollment/status/")) {
    const q = req.url.replace("/api/enrollment/status/", "");
    req.url = `/api/v1/enrollments/status/${q}`;
  } else if (req.url === "/api/admin/enrollments") {
    req.url = "/api/v1/enrollments";
  } else if (req.url === "/api/admin/update-status") {
    req.url = "/api/v1/enrollments/status";
    req.method = "PATCH";
  } else if (req.url === "/api/export-excel") {
    req.url = "/api/v1/export-excel";
  } else if (req.url === "/api/ai-chat") {
    req.url = "/api/v1/ai-chat";
  }
  next();
});

// REST API VERSION 1 (ENTERPRISE ENGINE)
app.use("/api/v1", v1Router);

// Create HTTP Server to attach WebSockets
const server = http.createServer(app);

// Initialize WebSocket Server
initWebSocketServer(server);

// Start Server
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("[DEV] Initializing Vite Middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    console.log("[PROD] Serving static frontend files...");
    const distPath = path.resolve(process.cwd(), "dist/client");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`\n======================================================`);
    console.log(`[NCC] 19 JHR BN NCC Server Engine v3000`);
    console.log(`[SYS] Environment: ${process.env.NODE_ENV || "development"}`);
    console.log(`[WEB] HTTP API running at http://localhost:${PORT}`);
    console.log(`[WSS] WebSocket active on ws://localhost:${PORT}/ws/v1`);
    console.log(`======================================================\n`);
  });
}

startServer().catch((err) => {
  console.error("Critical Server Failure:", err);
  process.exit(1);
});
