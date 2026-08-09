import { CadetRecord } from "@/types";
import { NotificationItem } from "@frontend/features/NotificationsFeed";

// Enterprise Data Platform Types & Schema Definitions
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  code?: string;
  requestId?: string;
  timestamp?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
    cacheHit?: boolean;
    latencyMs?: number;
  };
}

export interface EnrollmentFilters {
  status?: string;
  gender?: string;
  sbuCourse?: string;
  search?: string;
  sortBy?: string;
  order?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export interface SystemMetrics {
  uptimeSeconds: number;
  activeWebSocketClients: number;
  totalRequests: number;
  cacheHitRatioPercent: number;
  averageLatencyMs: number;
  activeEnrollmentsCount: number;
  memoryUsageMb: number;
}

// Typed Custom Error
export class DataPlatformError extends Error {
  code: string;
  status: number;
  requestId?: string;

  constructor(message: string, code = "UNKNOWN_ERROR", status = 500, requestId?: string) {
    super(message);
    this.name = "DataPlatformError";
    this.code = code;
    this.status = status;
    this.requestId = requestId;
  }
}

// Client-Side In-Memory Cache Store with TTL & Request Deduplication
class QueryCache {
  private cache = new Map<string, { data: unknown; expiry: number }>();
  private inFlight = new Map<string, Promise<unknown>>();

  set(key: string, data: unknown, ttlMs = 15000) {
    this.cache.set(key, { data, expiry: Date.now() + ttlMs });
  }

  get<T = unknown>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    return item.data as T;
  }

  invalidatePattern(pattern: string) {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }

  clear() {
    this.cache.clear();
    this.inFlight.clear();
  }

  async deduplicate<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
    if (this.inFlight.has(key)) {
      return this.inFlight.get(key) as Promise<T>;
    }
    const promise = fetcher().finally(() => {
      this.inFlight.delete(key);
    });
    this.inFlight.set(key, promise);
    return promise;
  }
}

export const dataCache = new QueryCache();

// Centralized Enterprise Data Platform API SDK
export class EnterpriseDataPlatform {
  private static BASE_URL = "/api/v1";
  private static authToken: string | null =
    typeof window !== "undefined" ? sessionStorage.getItem("ncc_auth_token") : null;

  public static setAuthToken(token: string | null) {
    this.authToken = token;
    if (typeof window !== "undefined") {
      if (token) sessionStorage.setItem("ncc_auth_token", token);
      else sessionStorage.removeItem("ncc_auth_token");
    }
  }

  public static getAuthToken(): string | null {
    return this.authToken;
  }

  /**
   * Helper request handler with validation, correlation ID, retries, and errors
   */
  private static async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retries = 2,
    backoffMs = 300,
  ): Promise<ApiResponse<T>> {
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "X-Request-ID": requestId,
      "X-Client-Version": "v3000",
      ...(this.authToken ? { Authorization: `Bearer ${this.authToken}` } : {}),
      ...((options.headers as Record<string, string>) || {}),
    };

    let lastError: unknown;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await fetch(`${this.BASE_URL}${endpoint}`, {
          ...options,
          headers,
        });

        const json = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new DataPlatformError(
            json.error || json.message || `Request failed with status ${response.status}`,
            json.code || `HTTP_${response.status}`,
            response.status,
            json.requestId || requestId,
          );
        }

        return json as ApiResponse<T>;
      } catch (err: unknown) {
        lastError = err;
        // Don't retry client 4xx errors
        if (err instanceof DataPlatformError && err.status >= 400 && err.status < 500) {
          throw err;
        }
        if (attempt < retries) {
          await new Promise((r) => setTimeout(r, backoffMs * Math.pow(2, attempt)));
        }
      }
    }

    throw (
      lastError || new DataPlatformError("Network request timeout", "NETWORK_ERROR", 504, requestId)
    );
  }

  /**
   * Secure User Authentication Login
   */
  static async login(payload: {
    userType: "cadet" | "admin";
    username?: string;
    email?: string;
    password?: string;
  }): Promise<
    ApiResponse<{
      token: string;
      userType: "cadet" | "admin";
      user: UserSessionProfile;
      expiresAt: string;
    }>
  > {
    const res = await this.request<{
      token: string;
      userType: "cadet" | "admin";
      user: UserSessionProfile;
      expiresAt: string;
    }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    if (res.success && res.data?.token) {
      this.setAuthToken(res.data.token);
    }
    return res;
  }

  /**
   * Requests a one-time verification code for the forgot-password flow.
   */
  static async requestPasswordOtp(payload: {
    identifier: string;
    userType: "cadet" | "admin";
  }): Promise<
    ApiResponse<{
      issued: boolean;
      destination: string;
      expiresAt: string | null;
      ttlMinutes: number;
      delivery: string;
      code: string | null;
    }>
  > {
    return this.request("/auth/otp/request", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  /**
   * Verifies a one-time code and optionally sets a new portal password.
   */
  static async verifyPasswordOtp(payload: {
    identifier: string;
    code: string;
    newPassword?: string;
  }): Promise<ApiResponse<{ verified: boolean; passwordUpdated: boolean }>> {
    return this.request("/auth/otp/verify", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  /**
   * Secure User Authentication Logout
   */
  static async logout(): Promise<ApiResponse<{ message: string }>> {
    try {
      const res = await this.request<{ message: string }>("/auth/logout", {
        method: "POST",
        body: JSON.stringify({ token: this.authToken }),
      });
      this.setAuthToken(null);
      dataCache.clear();
      return res;
    } catch {
      this.setAuthToken(null);
      dataCache.clear();
      return { success: true, message: "Logged out locally." };
    }
  }

  /**
   * Submit New Cadet Enrollment
   */
  static async submitEnrollment(
    enrollmentData: Partial<CadetRecord>,
  ): Promise<ApiResponse<{ enrollment: CadetRecord }>> {
    dataCache.invalidatePattern("enrollments");
    return this.request<{ enrollment: CadetRecord }>("/enrollments", {
      method: "POST",
      body: JSON.stringify(enrollmentData),
    });
  }

  /**
   * Track Cadet Application Status
   */
  static async trackStatus(query: string): Promise<ApiResponse<{ record: CadetRecord }>> {
    const cacheKey = `status:${query.trim().toLowerCase()}`;
    const cached = dataCache.get<CadetRecord>(cacheKey);
    if (cached) return { success: true, data: { record: cached }, meta: { cacheHit: true } };

    const res = await dataCache.deduplicate(cacheKey, () =>
      this.request<{ record: CadetRecord }>(`/enrollments/status/${encodeURIComponent(query)}`),
    );

    if (res.success && res.data?.record) {
      dataCache.set(cacheKey, res.data.record, 30000);
    }
    return res;
  }

  /**
   * Get All Enrollments (Officer / Admin)
   */
  static async getEnrollments(
    filters: EnrollmentFilters = {},
  ): Promise<ApiResponse<{ enrollments: CadetRecord[]; count: number }>> {
    const params = new URLSearchParams();
    if (filters.status) params.set("status", filters.status);
    if (filters.gender) params.set("gender", filters.gender);
    if (filters.sbuCourse) params.set("sbuCourse", filters.sbuCourse);
    if (filters.search) params.set("search", filters.search);
    if (filters.sortBy) params.set("sortBy", filters.sortBy);
    if (filters.order) params.set("order", filters.order);
    if (filters.page) params.set("page", String(filters.page));
    if (filters.limit) params.set("limit", String(filters.limit));

    const queryString = params.toString() ? `?${params.toString()}` : "";
    const cacheKey = `enrollments:${queryString}`;
    const cached = dataCache.get<{ enrollments: CadetRecord[]; count: number }>(cacheKey);
    if (cached) return { success: true, data: cached, meta: { cacheHit: true } };

    const res = await dataCache.deduplicate(cacheKey, () =>
      this.request<{ enrollments: CadetRecord[]; count: number }>(`/enrollments${queryString}`),
    );

    if (res.success && res.data) {
      dataCache.set(cacheKey, res.data, 10000);
    }
    return res;
  }

  /**
   * Update Cadet Status & Officer Remarks
   */
  static async updateStatus(payload: {
    id: string;
    status: string;
    remarks?: string;
    enrollmentNo?: string;
  }): Promise<ApiResponse<{ updated: CadetRecord }>> {
    dataCache.invalidatePattern("enrollments");
    dataCache.invalidatePattern("status");
    return this.request<{ updated: CadetRecord }>("/enrollments/status", {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  }

  /**
   * Fetch All Cadet Notifications Feed
   */
  static async getNotifications(): Promise<
    ApiResponse<{ notifications: NotificationItem[]; unreadCount: number }>
  > {
    const cacheKey = "notifications_feed";
    const cached = dataCache.get<{ notifications: NotificationItem[]; unreadCount: number }>(
      cacheKey,
    );
    if (cached) return { success: true, data: cached, meta: { cacheHit: true } };

    const res = await dataCache.deduplicate(cacheKey, () =>
      this.request<{ notifications: NotificationItem[]; unreadCount: number }>("/notifications"),
    );

    if (res.success && res.data) {
      dataCache.set(cacheKey, res.data, 10000);
    }
    return res;
  }

  /**
   * Broadcast Official Officer Notice / Alert
   */
  static async broadcastNotice(
    notice: Partial<NotificationItem>,
  ): Promise<ApiResponse<{ notification: NotificationItem }>> {
    dataCache.invalidatePattern("notifications_feed");
    return this.request<{ notification: NotificationItem }>("/notifications", {
      method: "POST",
      body: JSON.stringify(notice),
    });
  }

  /**
   * Send Query to Gemini AI Cadre Guide
   */
  static async sendAiMessage(
    message: string,
    history?: Array<{ role: "user" | "assistant"; content: string }>,
    isLowLatency = false,
    thinkingMode = true,
  ): Promise<ApiResponse<{ reply: string }>> {
    return this.request<{ reply: string }>("/ai-chat", {
      method: "POST",
      body: JSON.stringify({ message, history, lowLatency: isLowLatency, thinkingMode }),
    });
  }

  /**
   * Fetch Platform Health Status
   */
  static async getHealth(): Promise<
    ApiResponse<{ status: string; uptime: number; wsClients: number }>
  > {
    return this.request<{ status: string; uptime: number; wsClients: number }>("/health");
  }

  /**
   * Fetch System Observability Metrics
   */
  static async getMetrics(): Promise<ApiResponse<SystemMetrics>> {
    return this.request<SystemMetrics>("/metrics");
  }

  /**
   * Officer-only: query the unit cadet register (Batch-I / Batch-II nominal rolls)
   */
  static async getCadets(
    filters: {
      search?: string;
      batch?: string;
      wing?: string;
      course?: string;
      page?: number;
      limit?: number;
    } = {},
  ): Promise<
    ApiResponse<{
      cadets: CadetRegisterRecord[];
      count: number;
      total: number;
      page: number;
      totalPages: number;
    }>
  > {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") params.set(key, String(value));
    });
    const qs = params.toString();
    return this.request(`/cadets${qs ? `?${qs}` : ""}`);
  }

  /**
   * Cadet-only: fetch the signed-in cadet's own register record
   */
  static async getMyCadetRecord(): Promise<ApiResponse<{ cadet: CadetRegisterRecord }>> {
    return this.request("/cadets/me");
  }

  /**
   * Officer-only: sync the shipped nominal roll into the cadet register
   */
  static async syncCadetRegister(): Promise<ApiResponse<{ synced: number; total: number }>> {
    return this.request("/cadets", { method: "POST" });
  }

  /**
   * Download Nominal Roll Excel File
   */
  static getExportExcelUrl(): string {
    return `${this.BASE_URL}/export-excel`;
  }

  /**
   * Fetch Unit Activities
   */
  static async getActivities(
    category?: string,
    status?: string,
  ): Promise<ApiResponse<{ activities: ActivityRecord[] }>> {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (status) params.set("status", status);
    const qs = params.toString();
    return this.request(`/activities${qs ? `?${qs}` : ""}`);
  }

  /**
   * Create New Activity (Officer-only)
   */
  static async createActivity(
    payload: Partial<ActivityRecord>,
  ): Promise<ApiResponse<{ activity: ActivityRecord }>> {
    return this.request("/activities", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  /**
   * Fetch Calendar Events
   */
  static async getCalendarEvents(): Promise<ApiResponse<{ events: CalendarEventRecord[] }>> {
    return this.request("/calendar");
  }

  /**
   * Create Calendar Event (Officer-only)
   */
  static async createCalendarEvent(
    payload: Partial<CalendarEventRecord>,
  ): Promise<ApiResponse<{ event: CalendarEventRecord }>> {
    return this.request("/calendar", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  /**
   * Fetch Annual Training Plans
   */
  static async getAnnualPlans(year?: number): Promise<ApiResponse<{ plans: AnnualPlanRecord[] }>> {
    return this.request(`/annual-plans?year=${year || 2026}`);
  }

  /**
   * Create Annual Plan Entry (Officer-only)
   */
  static async createAnnualPlan(
    payload: Partial<AnnualPlanRecord>,
  ): Promise<ApiResponse<{ plan: AnnualPlanRecord }>> {
    return this.request("/annual-plans", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  /**
   * Fetch Staff Attendance for a Date (Officer-only)
   */
  static async getStaffAttendance(
    date?: string,
  ): Promise<ApiResponse<{ attendance: StaffAttendanceRecord[] }>> {
    const qs = date ? `?date=${encodeURIComponent(date)}` : "";
    return this.request(`/staff-attendance${qs}`);
  }

  /**
   * Clock-In / Clock-Out PI Staff (Officer-only)
   */
  static async clockStaff(payload: {
    staffName: string;
    staffRole?: string;
    action: "clock_in" | "clock_out";
    dutyLocation?: string;
    remarks?: string;
  }): Promise<ApiResponse<{ record: StaffAttendanceRecord }>> {
    return this.request("/staff-attendance", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  /**
   * Fetch Security Audit Logs (Officer-only)
   */
  static async getAuditLogs(
    limit = 50,
    action?: string,
  ): Promise<ApiResponse<{ logs: AuditLogRecord[] }>> {
    const params = new URLSearchParams();
    params.set("limit", String(limit));
    if (action) params.set("action", action);
    return this.request(`/audit?${params.toString()}`);
  }
}

export interface UserSessionProfile {
  id: string;
  email: string;
  role: string;
  name?: string;
}

export interface ActivityRecord {
  id: string;
  title: string;
  category: string;
  description: string;
  image_url?: string;
  location: string;
  start_time: string;
  end_time?: string;
  status: string;
  organizer?: string;
  created_at?: string;
}

export interface CalendarEventRecord {
  id: string;
  title: string;
  event_type: string;
  start_time: string;
  end_time: string;
  location: string;
  description?: string;
  is_all_day?: boolean;
}

export interface AnnualPlanRecord {
  id: string;
  plan_year: number;
  title: string;
  category: string;
  target_month: string;
  status: string;
  remarks?: string;
}

export interface StaffAttendanceRecord {
  id: string;
  staff_name: string;
  staff_role: string;
  date: string;
  clock_in: string;
  clock_out?: string | null;
  duty_location?: string;
  remarks?: string;
}

export interface AuditLogRecord {
  id: string;
  actor: string;
  action: string;
  target: string;
  ip: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export interface CadetRegisterRecord {
  id: string;
  enrollmentId: string;
  batch: string | null;
  rank: string | null;
  fullName: string | null;
  gender: string | null;
  wing: string | null;
  mobile: string | null;
  email: string | null;
  dob: string | null;
  fatherName: string | null;
  motherName: string | null;
  nationality: string | null;
  institute: string | null;
  anoName: string | null;
  wingType: string | null;
  groupHq: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  pinCode: string | null;
  nearestRailwayStation: string | null;
  identificationMark: string | null;
  bloodGroup: string | null;
  medicalComplaint: string | null;
  nokName: string | null;
  nokRelationship: string | null;
  nokContact: string | null;
  nokAddress: string | null;
  sportsGames: string | null;
  coCurricular: string | null;
  willingMilitaryTraining: string | null;
  willingServeNcc: string | null;
  previouslyApplied: string | null;
  sbuId: string | null;
  course: string | null;
  branch: string | null;
  semester: string | null;
  section: string | null;
  ifscCode: string | null;
  accountHolderName: string | null;
  bankAccountNumber: string | null;
  aadhaarNumber: string | null;
  stipendReceived: string | null;
  performance: string | null;
  behaviour: string | null;
  participation: string | null;
  distinction: string | null;
}
