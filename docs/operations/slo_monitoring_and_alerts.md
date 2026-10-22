# Operations: SLOs, Telemetry Monitoring & Alerting

**Platform:** 19 Jharkhand Battalion NCC Command Centre  
**SRE Operations Guide:** Metrics, Alert Thresholds, SLOs & Cost Governance  

---

## 1. Service Level Objectives (SLOs) & SLAs

| Service Dimension | Target SLO | Measurement Window | Error Budget |
|---|---|---|---|
| **Portal Availability** | 99.9% Uptime | 30-day Rolling | 43.2 minutes downtime / month |
| **API Latency (p95)** | < 150 ms | 1-hour Rolling | Requests exceeding 150ms < 5% |
| **L1 Cache Hit Latency** | < 1.0 ms | Real-Time | Target 100% sub-millisecond |
| **Cache Hit Ratio** | > 85% | 24-hour Rolling | Cache misses > 15% triggers alert |
| **Form 1 Submission Success** | 99.95% | 7-day Rolling | Failed submissions < 0.05% |
| **OTP Delivery Latency (p90)** | < 15 seconds | 1-hour Rolling | SMS/Email dispatch latency |

---

## 2. Telemetry Scraping & Metrics Schema

The application exposes structured telemetry at `/api/v1/metrics` scrapeable by Prometheus / Grafana / Datadog:

```json
{
  "system": {
    "nodeVersion": "v22.x",
    "uptimeSeconds": 128490,
    "memoryUsageBytes": {
      "rss": 142868480,
      "heapTotal": 98455552,
      "heapUsed": 64328192
    }
  },
  "cache": {
    "l1Hits": 84920,
    "l1Misses": 2341,
    "l2Hits": 1820,
    "l2Misses": 521,
    "l1Size": 842,
    "l1Evictions": 14,
    "hitRatio": 97.35
  },
  "rateLimiter": {
    "activeTrackedKeys": 124,
    "capacityCeiling": 5000
  },
  "queue": {
    "pendingJobs": 3,
    "processedJobs": 2490,
    "failedJobs": 0
  }
}
```

---

## 3. Production Alerting Rules & Thresholds

### 3.1 Severity 1 Alerts (Immediate Page)
- **High 5xx Error Rate**: `rate(http_requests_total{status=~"5.."}[5m]) / rate(http_requests_total[5m]) > 0.01` (Error rate > 1% over 5m).
- **Service Liveness Failure**: Consecutive failed liveness probes on `/api/v1/health?type=liveness` for > 60 seconds.
- **Database Connection Failure**: Readiness probe reports `checks.database != "pass"`.

### 3.2 Severity 2 Alerts (Notification to Ops Channel)
- **Queue Backlog Spike**: `email_jobs_pending > 500` for more than 10 minutes.
- **Cache Hit Ratio Drop**: `cache_hit_ratio < 75%` over 30 minutes (potential cache thrashing or key prefix bug).
- **Node Memory Pressure**: Container memory usage exceeds 85% of allocated cgroup limit (512MB limit -> >435MB).

---

## 4. Resource & Cost Optimization Controls

1. **In-Memory Cache Capacity Bound**: Strict ceiling of 5,000 items in L1 cache prevents uncontrolled memory growth, enabling predictable resource footprint on low-cost single-core 512MB VMs.
2. **Rate Limiter LRU Bounding**: 5,000-item LRU map bounds prevent memory denial-of-service without requiring dedicated Redis instances for small deployments.
3. **Optimized Nitro SSR Bundling**: Single-bundle Node-server output runs with minimal dependency footprint (<100MB RAM steady-state).
