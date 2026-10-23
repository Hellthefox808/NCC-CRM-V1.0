import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const { Pool } = pg;

export interface PrismaHealthStatus {
  status: "CONNECTED" | "DISCONNECTED" | "NOT_CONFIGURED";
  connected: boolean;
  latencyMs?: number;
  error?: string;
}

let prismaInstance: PrismaClient | null = null;
let pgPoolInstance: pg.Pool | null = null;
let connectingPromise: Promise<PrismaClient> | null = null;

/**
 * Sanitizes a PostgreSQL connection URI by masking credentials.
 */
export function sanitizeDatabaseUrl(url?: string): string {
  if (!url) return "";
  try {
    return url.replace(/:([^@/:]+)@/, ":****@");
  } catch {
    return "[REDACTED_URL]";
  }
}

/**
 * Validates and extracts the database connection URL from environment variables.
 */
export function getDatabaseUrl(): string {
  const url = process.env.DATABASE_URL || process.env.DIRECT_URL || "";
  return url.trim();
}

/**
 * Creates and configures the PostgreSQL connection pool.
 */
export function createPgPool(connectionString: string): pg.Pool {
  const isProduction = process.env.NODE_ENV === "production";
  const sslConfig =
    process.env.DATABASE_SSL === "false"
      ? false
      : isProduction
        ? { rejectUnauthorized: false }
        : undefined;

  return new Pool({
    connectionString,
    max: Number(process.env.DATABASE_POOL_MAX || 10),
    min: Number(process.env.DATABASE_POOL_MIN || 0),
    connectionTimeoutMillis: Number(process.env.DATABASE_CONNECT_TIMEOUT_MS || 5000),
    idleTimeoutMillis: Number(process.env.DATABASE_IDLE_TIMEOUT_MS || 30000),
    ssl: sslConfig,
  });
}

/**
 * Retrieves or initializes the singleton PrismaClient with Prisma 7 driver adapter.
 * Reuses active connections and safely recovers from rejected initializations.
 */
export async function getPrismaClient(): Promise<PrismaClient> {
  if (prismaInstance) {
    return prismaInstance;
  }

  if (connectingPromise) {
    return connectingPromise;
  }

  const connectionString = getDatabaseUrl();
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set in environment variables. Please configure a valid PostgreSQL connection string.",
    );
  }

  connectingPromise = (async () => {
    try {
      pgPoolInstance = createPgPool(connectionString);
      const adapter = new PrismaPg(pgPoolInstance);
      const client = new PrismaClient({ adapter });

      prismaInstance = client;
      return client;
    } catch (err) {
      // Discard failed instances and reset promise so subsequent attempts can reconnect
      await disconnectPrisma().catch(() => {});
      const sanitized = sanitizeDatabaseUrl(err instanceof Error ? err.message : String(err));
      throw new Error(`Failed to initialize Prisma database client: ${sanitized}`);
    } finally {
      connectingPromise = null;
    }
  })();

  return connectingPromise;
}

/**
 * Checks connectivity and measures query latency to the PostgreSQL database.
 */
export async function checkPrismaHealth(): Promise<PrismaHealthStatus> {
  const connectionString = getDatabaseUrl();
  if (!connectionString) {
    return {
      status: "NOT_CONFIGURED",
      connected: false,
      error: "DATABASE_URL not configured",
    };
  }

  const start = Date.now();
  try {
    const prisma = await getPrismaClient();
    // Execute a fast non-destructive ping
    await prisma.$queryRawUnsafe("SELECT 1");
    const latencyMs = Date.now() - start;

    return {
      status: "CONNECTED",
      connected: true,
      latencyMs,
    };
  } catch (err) {
    const rawError = err instanceof Error ? err.message : String(err);
    return {
      status: "DISCONNECTED",
      connected: false,
      latencyMs: Date.now() - start,
      error: sanitizeDatabaseUrl(rawError),
    };
  }
}

/**
 * Gracefully shuts down Prisma client and connection pools.
 */
export async function disconnectPrisma(): Promise<void> {
  const client = prismaInstance;
  const pool = pgPoolInstance;

  prismaInstance = null;
  pgPoolInstance = null;
  connectingPromise = null;

  if (client) {
    try {
      await client.$disconnect();
    } catch {
      // Ignore disconnect errors during teardown
    }
  }

  if (pool) {
    try {
      await pool.end();
    } catch {
      // Ignore pool teardown errors
    }
  }
}
