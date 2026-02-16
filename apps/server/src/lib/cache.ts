import Redis from "ioredis";
import type { ICacheService } from "@/types/cache";

const DEFAULT_TTL = 60; // 60 seconds

export class CacheService implements ICacheService {
  private redis: Redis;

  constructor(connectionString: string) {
    this.redis = new Redis(connectionString, {
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        return Math.min(times * 200, 2000);
      },
    });

    this.redis.on("error", (err) => {
      console.error("[Redis] Connection error:", err.message);
    });

    this.redis.on("connect", () => {
      console.log("[Redis] Connected");
    });
  }

  async get<T>(key: string): Promise<T | null> {
    const raw = await this.redis.get(key);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }

  async set(
    key: string,
    value: unknown,
    ttlSeconds = DEFAULT_TTL,
  ): Promise<void> {
    await this.redis.set(key, JSON.stringify(value), "EX", ttlSeconds);
  }

  async del(key: string): Promise<void> {
    await this.redis.del(key);
  }

  /** Delete all keys matching a glob pattern (e.g. "posts:user:abc:*") */
  async delPattern(pattern: string): Promise<void> {
    let cursor = "0";
    do {
      const [nextCursor, keys] = await this.redis.scan(
        cursor,
        "MATCH",
        pattern,
        "COUNT",
        100,
      );
      cursor = nextCursor;
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
    } while (cursor !== "0");
  }

  async disconnect(): Promise<void> {
    await this.redis.quit();
  }
}

let cacheInstance: CacheService | null = null;

export function getCache(): CacheService {
  if (!cacheInstance) {
    const url = process.env.REDIS_URL;
    if (!url) throw new Error("REDIS_URL environment variable is not set");
    cacheInstance = new CacheService(url);
  }
  return cacheInstance;
}
