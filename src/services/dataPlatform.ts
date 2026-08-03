import { CadetRecord } from "../types";
import { NotificationItem } from "../components/NotificationsFeed";

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
  private cache = new Map<string, { data: any; expiry: number }>();
  private inFlight = new Map<string, Promise<any>>();

  set(key: string, data: any, ttlMs = 15000) {
    this.cache.set(key, { data, expiry: Date.now() + ttlMs });
  }

  get(key: string): any | null {
    const item = this.cache.get(key);
    if (!item) return null;
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    return item.data;
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

  /**
   * Helper request handler with validation, correlation ID, retries, and errors
   */
  private static async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retries = 2,
    backoffMs = 300
  ): Promise<ApiResponse<T>> {
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "X-Request-ID": requestId,
      "X-Client-Version": "v3000",
      ...(options.headers as Record<string, string> || {})
    };

    let lastError: any;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await fetch(`${this.BASE_URL}${endpoint}`, {
          ...options,
          headers
        });

        const json = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new DataPlatformError(
            json.error || json.message || `Request failed with status ${response.status}`,
            json.code || `HTTP_${response.status}`,
            response.status,
            json.requestId || requestId
          );
        }

        return json as ApiResponse<T>;
      } catch (err: any) {
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

    throw lastError || new DataPlatformError("Network request timeout", "NETWORK_ERROR", 504, requestId);
  }

  /**
   * Submit New Cadet Enrollment
   */
  static async submitEnrollment(enrollmentData: Partial<CadetRecord>): Promise<ApiResponse<{ enrollment: CadetRecord }>> {
    dataCache.invalidatePattern("enrollments");
    return this.request<{ enrollment: CadetRecord }>("/enrollments", {
      method: "POST",
      body: JSON.stringify(enrollmentData)
    });
  }

  /**
   * Track Cadet Application Status
   */
  static async trackStatus(query: string): Promise<ApiResponse<{ record: CadetRecord }>> {
    const cacheKey = `status:${query.trim().toLowerCase()}`;
    const cached = dataCache.get(cacheKey);
    if (cached) return { success: true, data: { record: cached }, meta: { cacheHit: true } };

    const res = await dataCache.deduplicate(cacheKey, () =>
      this.request<{ record: CadetRecord }>(`/enrollments/status/${encodeURIComponent(query)}`)
    );

    if (res.success && res.data?.record) {
      dataCache.set(cacheKey, res.data.record, 30000);
    }
    return res;
  }

  /**
   * Get All Enrollments (Officer / Admin)
   */
  static async getEnrollments(filters: EnrollmentFilters = {}): Promise<ApiResponse<{ enrollments: CadetRecord[]; count: number }>> {
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
    const cached = dataCache.get(cacheKey);
    if (cached) return { success: true, data: cached, meta: { cacheHit: true } };

    const res = await dataCache.deduplicate(cacheKey, () =>
      this.request<{ enrollments: CadetRecord[]; count: number }>(`/enrollments${queryString}`)
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
      body: JSON.stringify(payload)
    });
  }

  /**
   * Fetch All Cadet Notifications Feed
   */
  static async getNotifications(): Promise<ApiResponse<{ notifications: NotificationItem[]; unreadCount: number }>> {
    const cacheKey = "notifications_feed";
    const cached = dataCache.get(cacheKey);
    if (cached) return { success: true, data: cached, meta: { cacheHit: true } };

    const res = await dataCache.deduplicate(cacheKey, () =>
      this.request<{ notifications: NotificationItem[]; unreadCount: number }>("/notifications")
    );

    if (res.success && res.data) {
      dataCache.set(cacheKey, res.data, 10000);
    }
    return res;
  }

  /**
   * Broadcast Official Officer Notice / Alert
   */
  static async broadcastNotice(notice: Partial<NotificationItem>): Promise<ApiResponse<{ notification: NotificationItem }>> {
    dataCache.invalidatePattern("notifications_feed");
    return this.request<{ notification: NotificationItem }>("/notifications", {
      method: "POST",
      body: JSON.stringify(notice)
    });
  }

  /**
   * Send Query to Gemini AI Cadre Guide
   */
  static async sendAiMessage(message: string, isLowLatency = false): Promise<ApiResponse<{ reply: string }>> {
    return this.request<{ reply: string }>("/ai-chat", {
      method: "POST",
      body: JSON.stringify({ message, lowLatency: isLowLatency })
    });
  }

  /**
   * Fetch Platform Health Status
   */
  static async getHealth(): Promise<ApiResponse<{ status: string; uptime: number; wsClients: number }>> {
    return this.request<{ status: string; uptime: number; wsClients: number }>("/health");
  }

  /**
   * Fetch System Observability Metrics
   */
  static async getMetrics(): Promise<ApiResponse<SystemMetrics>> {
    return this.request<SystemMetrics>("/metrics");
  }

  /**
   * Download Nominal Roll Excel File
   */
  static getExportExcelUrl(): string {
    return `${this.BASE_URL}/export-excel`;
  }
}
