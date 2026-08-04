// System Metrics Tracker
export const metricsTracker = {
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
