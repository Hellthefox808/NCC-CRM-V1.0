import express from "express";
import http from "http";
import path from "path";
import { WebSocketServer, WebSocket } from "ws";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import * as XLSX from "xlsx";

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Enterprise Data Platform Types & Interfaces
export interface CadetRecord {
  id: string;
  enrollmentNo?: string;
  applicationDate: string;
  fullName: string;
  gender: "SD" | "SW";
  dob: string;
  aadhaarNumber: string;
  mobile: string;
  email: string;
  fatherName: string;
  motherName: string;
  bloodGroup: string;
  heightCm: number;
  weightKg: number;
  identificationMark: string;
  sbuCourse: string;
  sbuDepartment: string;
  sbuRollNo: string;
  sbuYear: string;
  sbuSemester: string;
  marksPercentage10th: number;
  marksPercentage12th: number;
  run1600mTime: string;
  pushupsCount: number;
  hasJuniorCertificate: boolean;
  juniorCertificateNo?: string;
  sportsLevel: "None" | "College" | "District" | "State" | "National";
  sportsDetails?: string;
  presentAddress: string;
  permanentAddress: string;
  pinCode: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  guardianName: string;
  guardianRelation: string;
  guardianMobile: string;
  status: "Submitted" | "Physical Scheduled" | "Medical Cleared" | "Selected" | "Enrolled" | "Rejected";
  officerRemarks?: string;
  selectionRank?: number;
}

export interface OfficerNotification {
  id: string;
  title: string;
  category: "Parade Order" | "Exam Alert" | "Camp Broadcast" | "Urgent Notice";
  priority: "CRITICAL" | "HIGH" | "NORMAL";
  date: string;
  body: string;
  read: boolean;
  actionType?: "quiz" | "schedule" | "upload" | "syllabus" | "general";
  actionLabel?: string;
}

// Enterprise In-Memory Data Stores
let enrollments: CadetRecord[] = [
  {
    id: "19JHR-SBU-2026-001",
    enrollmentNo: "JHR/26/SD/19/204801",
    applicationDate: "2026-07-15",
    fullName: "Aman Kumar Sharma",
    gender: "SD",
    dob: "2005-04-12",
    aadhaarNumber: "8472-1928-4012",
    mobile: "9835123456",
    email: "aman.sbu2025@gmail.com",
    fatherName: "Rajesh Kumar Sharma",
    motherName: "Sunita Sharma",
    bloodGroup: "O+",
    heightCm: 178,
    weightKg: 68,
    identificationMark: "Mole on right cheek",
    sbuCourse: "B.Tech Computer Science",
    sbuDepartment: "Faculty of Engineering & Tech",
    sbuRollNo: "SBU25BTECH042",
    sbuYear: "1st Year",
    sbuSemester: "2nd Sem",
    marksPercentage10th: 88.5,
    marksPercentage12th: 86.0,
    run1600mTime: "5 min 45 sec",
    pushupsCount: 35,
    hasJuniorCertificate: true,
    juniorCertificateNo: "JHR/JD/22/1042",
    sportsLevel: "District",
    sportsDetails: "100m Athletics District Bronze medalist",
    presentAddress: "Ranchi Campus Hostel, Namkum, Ranchi, Jharkhand",
    permanentAddress: "H.No 45, Main Road, Hazaribagh, Jharkhand",
    pinCode: "834010",
    bankName: "State Bank of India",
    accountNumber: "38920194821",
    ifscCode: "SBIN0001234",
    guardianName: "Rajesh Kumar Sharma",
    guardianRelation: "Father",
    guardianMobile: "9431188221",
    status: "Enrolled",
    officerRemarks: "Excellent physical fitness and previous JD experience. Appointed L/Cpl.",
    selectionRank: 1
  },
  {
    id: "19JHR-SBU-2026-002",
    enrollmentNo: "JHR/26/SW/19/204802",
    applicationDate: "2026-07-18",
    fullName: "Priya Kumari Patel",
    gender: "SW",
    dob: "2006-01-20",
    aadhaarNumber: "7321-9048-1122",
    mobile: "9122334455",
    email: "priya.patel@sbu.ac.in",
    fatherName: "Suresh Patel",
    motherName: "Anita Patel",
    bloodGroup: "B+",
    heightCm: 165,
    weightKg: 54,
    identificationMark: "Scar on left wrist",
    sbuCourse: "BCA",
    sbuDepartment: "Department of Computer Applications",
    sbuRollNo: "SBU25BCA018",
    sbuYear: "1st Year",
    sbuSemester: "2nd Sem",
    marksPercentage10th: 91.0,
    marksPercentage12th: 89.2,
    run1600mTime: "6 min 50 sec",
    pushupsCount: 22,
    hasJuniorCertificate: false,
    sportsLevel: "State",
    sportsDetails: "Badminton State Semi-Finalist",
    presentAddress: "Kanke Road, Ranchi, Jharkhand",
    permanentAddress: "Kanke Road, Ranchi, Jharkhand",
    pinCode: "834008",
    bankName: "Punjab National Bank",
    accountNumber: "094810012001",
    ifscCode: "PUNB0094800",
    guardianName: "Suresh Patel",
    guardianRelation: "Father",
    guardianMobile: "9835012345",
    status: "Selected",
    officerRemarks: "High academic merit, clear medical test.",
    selectionRank: 2
  },
  {
    id: "19JHR-SBU-2026-003",
    applicationDate: "2026-07-22",
    fullName: "Rahul Singh Munda",
    gender: "SD",
    dob: "2005-09-15",
    aadhaarNumber: "9102-3344-5566",
    mobile: "7004123987",
    email: "rahul.munda@gmail.com",
    fatherName: "Birsa Munda",
    motherName: "Parwati Devi",
    bloodGroup: "A+",
    heightCm: 175,
    weightKg: 65,
    identificationMark: "Mole on neck",
    sbuCourse: "BBA",
    sbuDepartment: "Faculty of Management",
    sbuRollNo: "SBU25BBA102",
    sbuYear: "1st Year",
    sbuSemester: "1st Sem",
    marksPercentage10th: 82.0,
    marksPercentage12th: 84.0,
    run1600mTime: "5 min 30 sec",
    pushupsCount: 40,
    hasJuniorCertificate: false,
    sportsLevel: "National",
    sportsDetails: "Cross Country Athletics National Cadet Level",
    presentAddress: "Tatisilwai, Ranchi, Jharkhand",
    permanentAddress: "Khunti, Jharkhand",
    pinCode: "835103",
    bankName: "Bank of India",
    accountNumber: "4820101000214",
    ifscCode: "BKID0004820",
    guardianName: "Birsa Munda",
    guardianRelation: "Father",
    guardianMobile: "8210492810",
    status: "Medical Cleared",
    officerRemarks: "Top runner timing 5:30. Awaiting final enrolment list announcement.",
    selectionRank: 3
  }
];

let officerNotifications: OfficerNotification[] = [
  {
    id: "N1",
    title: "MANDATORY PARADE: Annual Inspection & Drill Review",
    category: "Parade Order",
    priority: "CRITICAL",
    date: "2026-08-05 06:00 AM",
    body: "All enrolled SD/SW Cadets must report to SBU Ground in Full Ceremonial Khaki Uniform with polished boots & beret. Battalion Commanding Officer inspection.",
    read: false,
    actionType: "schedule",
    actionLabel: "View Drill Schedule"
  },
  {
    id: "N2",
    title: "PREPARATION QUIZ: NCC 'B' & 'C' Mock Test Active",
    category: "Exam Alert",
    priority: "HIGH",
    date: "2026-08-04 10:00 AM",
    body: "Interactive Cadet Practice Quiz on Drill, Map Reading, Armament & Military History is live in Training Portal. Aim for Alpha grade in 'B'/'C' Cert exam.",
    read: false,
    actionType: "quiz",
    actionLabel: "Start Practice Quiz"
  },
  {
    id: "N3",
    title: "CAMP SELECTION: Combined Annual Training Camp (CATC-IX)",
    category: "Camp Broadcast",
    priority: "HIGH",
    date: "2026-08-02 02:00 PM",
    body: "Selection for CATC-IX Camp at Namkum Military Station is open. Interested cadets submit Camp Fitness Consent Form to SBU NCC Company Office.",
    read: true,
    actionType: "upload",
    actionLabel: "Submit Medical Form"
  },
  {
    id: "N4",
    title: "SYLLABUS UPDATE: Revised Handbooks & Weapon Manuals",
    category: "Urgent Notice",
    priority: "NORMAL",
    date: "2026-08-01 11:30 AM",
    body: "Updated PDF manuals for .22 Rifle Mark IV, LMG, Compass & Field Craft are uploaded in the Study Materials section for 2026-27 batch.",
    read: true,
    actionType: "syllabus",
    actionLabel: "Download Manuals"
  }
];

// Server Caching Store with TTL
class ServerCache {
  private cache = new Map<string, { data: any; expiry: number }>();
  public hits = 0;
  public misses = 0;

  get(key: string) {
    const item = this.cache.get(key);
    if (!item) {
      this.misses++;
      return null;
    }
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      this.misses++;
      return null;
    }
    this.hits++;
    return item.data;
  }

  set(key: string, data: any, ttlMs = 15000) {
    this.cache.set(key, { data, expiry: Date.now() + ttlMs });
  }

  invalidateTag(tag: string) {
    for (const key of this.cache.keys()) {
      if (key.includes(tag)) {
        this.cache.delete(key);
      }
    }
  }

  getHitRatioPercent(): number {
    const total = this.hits + this.misses;
    return total === 0 ? 100 : Number(((this.hits / total) * 100).toFixed(1));
  }
}

const serverCache = new ServerCache();

// System Metrics Tracker
const metricsTracker = {
  startTime: Date.now(),
  totalRequests: 0,
  latencySumMs: 0,
  requestCountForLatency: 0,
  recordLatency(ms: number) {
    this.latencySumMs += ms;
    this.requestCountForLatency++;
  },
  getAverageLatencyMs(): number {
    return this.requestCountForLatency === 0 ? 8 : Math.round(this.latencySumMs / this.requestCountForLatency);
  }
};

// Enterprise Middleware Pipeline

// 1. Correlation & Request ID Middleware
app.use((req, res, next) => {
  metricsTracker.totalRequests++;
  const startTime = Date.now();
  const requestId = (req.headers["x-request-id"] as string) || `req_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  req.headers["x-request-id"] = requestId;
  res.setHeader("X-Request-ID", requestId);
  res.setHeader("X-Powered-By", "19 JHR BN Cadre Engine v3000");

  res.on("finish", () => {
    const duration = Date.now() - startTime;
    metricsTracker.recordLatency(duration);
  });

  next();
});

// 2. Token Bucket Rate Limiter
const ipRequestCounts = new Map<string, { count: number; resetAt: number }>();
app.use((req, res, next) => {
  const ip = req.ip || req.socket.remoteAddress || "127.0.0.1";
  const now = Date.now();
  const windowMs = 60000;
  const maxRequests = 120;

  const current = ipRequestCounts.get(ip) || { count: 0, resetAt: now + windowMs };

  if (now > current.resetAt) {
    current.count = 1;
    current.resetAt = now + windowMs;
  } else {
    current.count++;
  }

  ipRequestCounts.set(ip, current);

  res.setHeader("X-RateLimit-Limit", maxRequests);
  res.setHeader("X-RateLimit-Remaining", Math.max(0, maxRequests - current.count));
  res.setHeader("X-RateLimit-Reset", Math.ceil(current.resetAt / 1000));

  if (current.count > maxRequests) {
    return res.status(429).json({
      success: false,
      error: "Rate limit exceeded. Please slow down requests to 19 JHR BN Server.",
      code: "RATE_LIMIT_EXCEEDED"
    });
  }

  next();
});

// 3. Backward Compatibility Aliases for Legacy API Paths
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

// Create HTTP Server to attach WebSockets
const server = http.createServer(app);

// Initialize WebSocket Server on /ws/v1
const wss = new WebSocketServer({ server, path: "/ws/v1" });

interface ExtendedWebSocket extends WebSocket {
  isAlive: boolean;
  id: string;
  channels: Set<string>;
}

// Store connected WS Clients
const connectedClients = new Set<ExtendedWebSocket>();

// WebSocket Broadcasting Engine
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

wss.on("connection", (ws: ExtendedWebSocket, req) => {
  ws.isAlive = true;
  ws.id = `ws_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  ws.channels = new Set(["cadre:notifications", "cadre:enrollments", "cadre:presence"]);
  connectedClients.add(ws);

  // Send connection welcome message
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

  // Broadcast presence update
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

// Periodic Heartbeat check every 20s
const pingInterval = setInterval(() => {
  connectedClients.forEach((ws) => {
    if (ws.isAlive === false) {
      connectedClients.delete(ws);
      return ws.terminate();
    }
    ws.isAlive = false;
    ws.ping();
  });
}, 20000);

// Initialize Gemini AI Client
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
}

// REST API VERSION 1 (ENTERPRISE ENGINE)

// 1. Health & Readiness Endpoint
app.get("/api/v1/health", (req, res) => {
  return res.json({
    success: true,
    status: "HEALTHY",
    service: "19 JHR BN NCC SBU Data Engine",
    version: "3.0.0",
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor((Date.now() - metricsTracker.startTime) / 1000),
    activeWebSocketClients: connectedClients.size,
    memoryUsageMb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024)
  });
});

// 2. Observability Metrics Endpoint
app.get("/api/v1/metrics", (req, res) => {
  return res.json({
    success: true,
    data: {
      uptimeSeconds: Math.floor((Date.now() - metricsTracker.startTime) / 1000),
      activeWebSocketClients: connectedClients.size,
      totalRequests: metricsTracker.totalRequests,
      cacheHitRatioPercent: serverCache.getHitRatioPercent(),
      averageLatencyMs: metricsTracker.getAverageLatencyMs(),
      activeEnrollmentsCount: enrollments.length,
      memoryUsageMb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024)
    }
  });
});

// 3. Get All Enrollments with Pagination, Filtering, Search & Sorting
app.get("/api/v1/enrollments", (req, res) => {
  const cacheKey = `enrollments:${req.url}`;
  const cached = serverCache.get(cacheKey);
  if (cached) {
    res.setHeader("X-Cache", "HIT");
    return res.json(cached);
  }

  let result = [...enrollments];

  // Filtering
  const { status, gender, sbuCourse, search, sortBy, order, page = "1", limit = "50" } = req.query;

  if (status) {
    result = result.filter((e) => e.status === status);
  }
  if (gender) {
    result = result.filter((e) => e.gender === gender);
  }
  if (sbuCourse) {
    result = result.filter((e) => e.sbuCourse.toLowerCase().includes(String(sbuCourse).toLowerCase()));
  }

  // Search
  if (search) {
    const q = String(search).toLowerCase();
    result = result.filter(
      (e) =>
        e.fullName.toLowerCase().includes(q) ||
        e.id.toLowerCase().includes(q) ||
        e.sbuRollNo.toLowerCase().includes(q) ||
        e.mobile.includes(q) ||
        (e.enrollmentNo && e.enrollmentNo.toLowerCase().includes(q))
    );
  }

  // Sorting
  if (sortBy) {
    const field = String(sortBy) as keyof CadetRecord;
    const isDesc = order === "desc";
    result.sort((a, b) => {
      const valA = a[field] || "";
      const valB = b[field] || "";
      if (valA < valB) return isDesc ? 1 : -1;
      if (valA > valB) return isDesc ? -1 : 1;
      return 0;
    });
  }

  // Pagination
  const pageNum = Math.max(1, parseInt(String(page), 10));
  const limitNum = Math.max(1, parseInt(String(limit), 10));
  const total = result.length;
  const startIndex = (pageNum - 1) * limitNum;
  const paginated = result.slice(startIndex, startIndex + limitNum);

  const responseBody = {
    success: true,
    data: {
      enrollments: paginated,
      count: paginated.length,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum)
    },
    meta: {
      cacheHit: false,
      requestId: req.headers["x-request-id"]
    }
  };

  serverCache.set(cacheKey, responseBody, 10000);
  res.setHeader("X-Cache", "MISS");
  return res.json(responseBody);
});

// 4. Track Application Status
app.get("/api/v1/enrollments/status/:query", (req, res) => {
  const query = req.params.query.trim().toLowerCase();
  const record = enrollments.find(
    (e) =>
      e.id.toLowerCase() === query ||
      e.aadhaarNumber.replace(/[\s-]/g, "") === query.replace(/[\s-]/g, "") ||
      e.sbuRollNo.toLowerCase() === query ||
      e.mobile === query ||
      (e.enrollmentNo && e.enrollmentNo.toLowerCase() === query)
  );

  if (!record) {
    return res.status(404).json({
      success: false,
      error: "No NCC Enrollment record found matching query.",
      code: "RECORD_NOT_FOUND"
    });
  }

  return res.json({ success: true, data: { record } });
});

// 5. Submit New Cadet Enrollment
app.post("/api/v1/enrollments", (req, res) => {
  try {
    const data = req.body;
    if (!data.fullName || !data.aadhaarNumber || !data.sbuRollNo || !data.mobile) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: fullName, aadhaarNumber, sbuRollNo, mobile.",
        code: "VALIDATION_FAILED"
      });
    }

    const newId = `19JHR-SBU-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
    const newRecord: CadetRecord = {
      id: newId,
      applicationDate: new Date().toISOString().split("T")[0],
      fullName: data.fullName,
      gender: data.gender || "SD",
      dob: data.dob,
      aadhaarNumber: data.aadhaarNumber,
      mobile: data.mobile,
      email: data.email,
      fatherName: data.fatherName,
      motherName: data.motherName,
      bloodGroup: data.bloodGroup || "O+",
      heightCm: Number(data.heightCm) || 170,
      weightKg: Number(data.weightKg) || 60,
      identificationMark: data.identificationMark || "NIL",
      sbuCourse: data.sbuCourse,
      sbuDepartment: data.sbuDepartment || "Sarala Birla University",
      sbuRollNo: data.sbuRollNo,
      sbuYear: data.sbuYear || "1st Year",
      sbuSemester: data.sbuSemester || "1st Sem",
      marksPercentage10th: Number(data.marksPercentage10th) || 0,
      marksPercentage12th: Number(data.marksPercentage12th) || 0,
      run1600mTime: data.run1600mTime || "N/A",
      pushupsCount: Number(data.pushupsCount) || 0,
      hasJuniorCertificate: Boolean(data.hasJuniorCertificate),
      juniorCertificateNo: data.juniorCertificateNo || "",
      sportsLevel: data.sportsLevel || "None",
      sportsDetails: data.sportsDetails || "",
      presentAddress: data.presentAddress,
      permanentAddress: data.permanentAddress || data.presentAddress,
      pinCode: data.pinCode || "834010",
      bankName: data.bankName || "",
      accountNumber: data.accountNumber || "",
      ifscCode: data.ifscCode || "",
      guardianName: data.guardianName || data.fatherName,
      guardianRelation: data.guardianRelation || "Father",
      guardianMobile: data.guardianMobile || data.mobile,
      status: "Submitted",
      officerRemarks: "Online application submitted successfully. Pending document & physical test verification."
    };

    enrollments.unshift(newRecord);
    serverCache.invalidateTag("enrollments");

    // REAL-TIME BROADCAST TO ALL CONNECTED CADET / OFFICER DASHBOARDS
    broadcastWebSocketEvent("cadre:enrollments", "ENROLLMENT_SUBMITTED", newRecord);

    return res.status(201).json({
      success: true,
      message: "NCC Enrollment Application submitted successfully to 19 Jharkhand Battalion, Ranchi.",
      data: { enrollment: newRecord }
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || "Failed to submit enrollment." });
  }
});

// 6. Update Status & Officer Remarks
app.patch("/api/v1/enrollments/status", (req, res) => {
  const { id, status, remarks, enrollmentNo } = req.body;
  const idx = enrollments.findIndex((e) => e.id === id);
  if (idx === -1) {
    return res.status(404).json({ success: false, error: "Enrollment record not found.", code: "NOT_FOUND" });
  }

  enrollments[idx].status = status;
  if (remarks) enrollments[idx].officerRemarks = remarks;
  if (enrollmentNo) enrollments[idx].enrollmentNo = enrollmentNo;

  const updated = enrollments[idx];
  serverCache.invalidateTag("enrollments");

  // REAL-TIME WEBSOCKET BROADCAST TO ALL DASHBOARDS
  broadcastWebSocketEvent("cadre:enrollments", "STATUS_UPDATED", updated);

  return res.json({ success: true, data: { updated } });
});

// 7. Get All Officer Notifications
app.get("/api/v1/notifications", (req, res) => {
  const unreadCount = officerNotifications.filter((n) => !n.read).length;
  return res.json({
    success: true,
    data: { notifications: officerNotifications, unreadCount }
  });
});

// 8. Broadcast Official Notice
app.post("/api/v1/notifications", (req, res) => {
  const { title, category, priority, body, actionType, actionLabel } = req.body;
  if (!title || !body) {
    return res.status(400).json({ success: false, error: "Title and Body are required." });
  }

  const newNotice: OfficerNotification = {
    id: `N${officerNotifications.length + 1}_${Date.now().toString(36).substr(2, 4)}`,
    title,
    category: category || "Urgent Notice",
    priority: priority || "NORMAL",
    date: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
    body,
    read: false,
    actionType: actionType || "general",
    actionLabel: actionLabel || "View Details"
  };

  officerNotifications.unshift(newNotice);
  serverCache.invalidateTag("notifications");

  // REAL-TIME BROADCAST TO ALL CADET / OFFICER PORTALS
  broadcastWebSocketEvent("cadre:notifications", "NOTIFICATION_BROADCAST", newNotice);

  return res.status(201).json({ success: true, data: { notification: newNotice } });
});

// 9. Gemini AI Assistance for NCC Cadre Guide
app.post("/api/v1/ai-chat", async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ success: false, error: "Message prompt is required." });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.json({
        success: true,
        data: {
          reply: `[19 Jharkhand Battalion AI Guide]: Thank you for asking. NCC enrollment at Sarala Birla University is open for regular SD (Male) and SW (Female) students. Required documents include 10th/12th marksheets, Aadhaar card, SBU ID card, Bank passbook, and medical fitness certificate. Contact Associate NCC Officer (ANO) or visit SBU Ground during morning parades (6:00 AM - 8:00 AM).`
        }
      });
    }

    const systemPrompt = `You are "Subedar Major AI Assistant" for the 19 Jharkhand Battalion NCC (19 JHR BN NCC), Ranchi, under Bihar and Jharkhand Directorate, serving the Sarala Birla University (SBU) Ranchi NCC Company.
Your job is to assist prospective cadets, current enrolled cadets, and parents with accurate NCC information.
Key facts:
- Unit: 19 Jharkhand Battalion NCC, Ranchi
- Directorate: Bihar and Jharkhand Directorate (Patna / Ranchi HQ)
- Institution: Sarala Birla University (SBU), Mahilong, Purulia Road, Ranchi, Jharkhand
- Company Officer: Associate NCC Officer (ANO) SBU Coy
- Motto: "Unity and Discipline" (Ekta aur Anushasan)
- Divisions: Senior Division (SD - Male) & Senior Wing (SW - Female)
- Course Duration: 3 Years for B & C Certificates (2 Years for B, 3rd year for C Certificate)
- Benefits: Direct SSB interview entries for defense (CDS / Agniveer / NCC Special Entry scheme without written exam for C Cert Alpha/Beta grade), bonus marks in State Police exams, Railway, Defense, IT jobs.
- Physical Criteria: SD Height min ~170 cm, SW Height min ~152 cm. 1600m run, pushups, sit-ups, medical fitness.
- Camps: Annual Training Camp (ATC), Combined Annual Training Camp (CATC), Republic Day Camp (RDC New Delhi), Thal Sainik Camp (TSC), Ek Bharat Shreshtha Bharat (EBSB), Army Attachment Camp (AAC), Trekking & Mountaineering.

Provide respectful, motivating, patriotic, clear, and structured answers in English or Hindi (if requested or mixed Hinglish). Always uphold high military discipline and encouraging tone.`;

    const isLowLatency = req.body.lowLatency || false;
    const primaryModel = isLowLatency ? "gemini-3.1-flash-lite" : "gemini-3.6-flash";
    const secondaryModel = isLowLatency ? "gemini-3.6-flash" : "gemini-3.1-flash-lite";

    let reply = "";

    try {
      const response = await ai.models.generateContent({
        model: primaryModel,
        contents: [{ role: "user", parts: [{ text: `${systemPrompt}\n\nUser Question: ${message}` }] }]
      });
      reply = response.text || "";
    } catch (primaryErr: any) {
      try {
        const fallbackResponse = await ai.models.generateContent({
          model: secondaryModel,
          contents: [{ role: "user", parts: [{ text: `${systemPrompt}\n\nUser Question: ${message}` }] }]
        });
        reply = fallbackResponse.text || "";
      } catch (secondaryErr) {
        const lowerMsg = message.toLowerCase();
        if (lowerMsg.includes("document") || lowerMsg.includes("paper")) {
          reply = "Jai Hind! Required Documents for 19 JHR BN NCC Enrollment at SBU:\n1. 10th & 12th original & self-attested marksheets\n2. Aadhaar Card copy\n3. SBU Student Identity Card / Fee Receipt\n4. Bank Passbook front page (for DBT camp allowance)\n5. Medical Fitness Certificate\n6. Parent / Guardian Consent Form";
        } else if (lowerMsg.includes("physical") || lowerMsg.includes("run")) {
          reply = "Jai Hind! Physical Standards for Senior Division (SD) & Senior Wing (SW):\n• SD (Male): Min Height ~170 cm, 1.6 KM Run under 6 mins 30 secs, 30 Push-ups & Sit-ups.\n• SW (Female): Min Height ~152 cm, 800m / 1.6 KM Run, flexibility & stamina tests.";
        } else {
          reply = `Jai Hind! Thank you for contacting 19 Jharkhand Battalion NCC (SBU Ranchi Coy).\n\nFor enrollment guidance, parade schedules (06:00 AM - 08:00 AM at SBU Ground), or 'B' & 'C' certificate details, please contact Associate NCC Officer (ANO) Dr. Animesh Roy at Sarala Birla University campus.`;
        }
      }
    }

    return res.json({ success: true, data: { reply } });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: "AI Assistant unavailable right now. Jai Hind!" });
  }
});

// 10. Multi-Sheet Excel Export Endpoint
app.get("/api/v1/export-excel", (req, res) => {
  try {
    const nominalRollData = enrollments.map((e, idx) => ({
      "S.No": idx + 1,
      "Application ID": e.id,
      "NCC Regimental No": e.enrollmentNo || "Pending Allocation",
      "Cadet Full Name": e.fullName,
      "Wing/Gender": e.gender === "SD" ? "Senior Division (Male)" : "Senior Wing (Female)",
      "SBU Course": e.sbuCourse,
      "SBU Roll No": e.sbuRollNo,
      "Year/Sem": `${e.sbuYear} / ${e.sbuSemester}`,
      "DOB": e.dob,
      "Aadhaar Number": e.aadhaarNumber,
      "Mobile No": e.mobile,
      "Email ID": e.email,
      "Height (cm)": e.heightCm,
      "Weight (kg)": e.weightKg,
      "Blood Group": e.bloodGroup,
      "1600m Run Score": e.run1600mTime,
      "Pushups": e.pushupsCount,
      "10th %": e.marksPercentage10th,
      "12th %": e.marksPercentage12th,
      "Junior 'A' Cert": e.hasJuniorCertificate ? "Yes" : "No",
      "Sports Level": e.sportsLevel,
      "Application Status": e.status,
      "Officer Remarks": e.officerRemarks || ""
    }));

    const bankData = enrollments.map((e, idx) => ({
      "S.No": idx + 1,
      "Application ID": e.id,
      "Cadet Name": e.fullName,
      "SBU Roll No": e.sbuRollNo,
      "Bank Name": e.bankName,
      "Account Number": e.accountNumber,
      "IFSC Code": e.ifscCode,
      "Aadhaar Number": e.aadhaarNumber,
      "Mobile Number": e.mobile
    }));

    const workbook = XLSX.utils.book_new();
    const wsNominal = XLSX.utils.json_to_sheet(nominalRollData);
    const wsBank = XLSX.utils.json_to_sheet(bankData);

    XLSX.utils.book_append_sheet(workbook, wsNominal, "Nominal Roll 19 JHR BN");
    XLSX.utils.book_append_sheet(workbook, wsBank, "Bank DBT Details");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "buffer" });

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename=NCC_19JHR_SBU_Enrollment_Nominal_Roll_${new Date().toISOString().slice(0, 10)}.xlsx`);
    return res.send(excelBuffer);
  } catch (err: any) {
    return res.status(500).json({ success: false, error: "Failed to generate Excel file: " + err.message });
  }
});

// Vite & Static Server Attachment
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`19 JHR BN NCC SBU Enterprise Data Platform & WebSocket Server running on http://localhost:${PORT}`);
  });
}

startServer();
