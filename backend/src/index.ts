import express from "express";
import http from "http";
import path from "path";
import fs from "fs";
import { securityHeadersMiddleware, rateLimitMiddleware } from "./middlewares/security";
import { correlationMiddleware } from "./middlewares/correlation";
import { initWebSocketServer } from "./services/websocket.service";
import v1Router from "./routes/v1";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: "10mb" }));

// Enable CORS for API pipeline communication
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Request-ID, X-Client-Version");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

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

// Root health check endpoint
app.get("/api", (req, res) => {
  res.json({
    name: "19 JHR BN NCC SBU Data Platform API",
    version: "3.0.0",
    status: "ACTIVE",
    endpoints: "/api/v1"
  });
});

// Optional Static Frontend Serving
const candidatePaths = [
  path.resolve(process.cwd(), "../frontend/dist"),
  path.resolve(process.cwd(), "dist"),
  process.cwd()
];
const distPath = candidatePaths.find((p) => fs.existsSync(path.join(p, "index.html")));

if (distPath) {
  console.log(`[PROD] Serving static frontend from: ${distPath}`);
  app.use(express.static(distPath));
  app.get("*", (req, res) => {
    const indexPath = path.join(distPath, "index.html");
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(404).json({ error: "not_found", path: req.path });
    }
  });
}

// Create HTTP Server to attach WebSockets
const server = http.createServer(app);

// Initialize WebSocket Server
initWebSocketServer(server);

// Start Server
server.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`[NCC] 19 JHR BN NCC Backend Server Engine v3000`);
  console.log(`[SYS] Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`[WEB] HTTP API running at http://localhost:${PORT}`);
  console.log(`[WSS] WebSocket active on ws://localhost:${PORT}/ws/v1`);
  console.log(`======================================================\n`);
});
