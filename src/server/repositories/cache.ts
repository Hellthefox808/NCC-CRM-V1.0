export class ServerCache {
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

export const serverCache = new ServerCache();
