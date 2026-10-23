import { MongoClient, type Db } from "mongodb";

/**
 * Global MongoDB client cache to prevent multiple connections in serverless / hot-reloading dev environments.
 */
declare global {
  var __mongoClientPromise: Promise<MongoClient> | undefined;
}

export const DEFAULT_MONGO_DB_NAME = "ncc_crm";

let clientInstance: MongoClient | null = null;
let clientPromise: Promise<MongoClient> | null = null;

export interface MongoHealthStatus {
  status: "CONNECTED" | "DISCONNECTED" | "NOT_CONFIGURED";
  connected: boolean;
  latencyMs?: number;
  dbName?: string;
  error?: string;
}

export interface MongoInitResult {
  dbName: string;
  collections: string[];
  indexes: string[];
}

/**
 * Sanitizes a MongoDB connection URI to protect credentials in logs and errors.
 */
export function sanitizeMongoUri(uri?: string): string {
  if (!uri) return "";
  try {
    return uri.replace(/:([^@/:]+)@/, ":****@");
  } catch {
    return "[REDACTED_URI]";
  }
}

/**
 * Retrieves the MongoDB connection options tailored for reliability and timeouts.
 */
export function getMongoOptions() {
  return {
    serverSelectionTimeoutMS: Number(process.env.MONGODB_SERVER_SELECTION_TIMEOUT_MS || 8000),
    connectTimeoutMS: Number(process.env.MONGODB_CONNECT_TIMEOUT_MS || 10000),
    socketTimeoutMS: Number(process.env.MONGODB_SOCKET_TIMEOUT_MS || 45000),
    maxPoolSize: Number(process.env.MONGODB_MAX_POOL_SIZE || 10),
    minPoolSize: Number(process.env.MONGODB_MIN_POOL_SIZE || 0),
    retryReads: true,
    retryWrites: true,
  };
}

/**
 * Helper to attempt connection with timeout and SRV fallback.
 */
async function createConnectedClient(
  primaryUri: string,
  fallbackUri?: string,
): Promise<MongoClient> {
  const options = getMongoOptions();
  let client = new MongoClient(primaryUri, options);

  try {
    await client.connect();
    return client;
  } catch (err: unknown) {
    const error = err as { code?: string; message?: string };
    const isSrvTimeout =
      error.code === "ETIMEOUT" ||
      (typeof error.message === "string" && error.message.includes("querySrv"));

    if (fallbackUri && isSrvTimeout) {
      // Common Windows DNS issue with SRV records; fallback to direct replica set URI
      try {
        await client.close().catch(() => {});
      } catch {
        // ignore close error
      }
      client = new MongoClient(fallbackUri, options);
      await client.connect();
      return client;
    }

    // Ensure client resources are released on failure
    await client.close().catch(() => {});
    throw err;
  }
}

/**
 * Retrieves or initializes the shared MongoClient singleton.
 * Features automatic rejected-promise recovery, connection reuse, and timeouts.
 */
export async function getMongoClient(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI;
  if (!uri || !uri.trim()) {
    throw new Error(
      "MONGODB_URI is not set in environment variables. Please check your .env configuration.",
    );
  }

  const directUri = process.env.MONGODB_DIRECT_URI;
  const isDev = process.env.NODE_ENV === "development";

  // Check cached promise (global in dev to survive hot reloads)
  const existingPromise = isDev ? global.__mongoClientPromise : clientPromise;
  if (existingPromise) {
    return existingPromise;
  }

  const newPromise = (async () => {
    try {
      const client = await createConnectedClient(uri, directUri);
      clientInstance = client;
      return client;
    } catch (err) {
      // REJECTED-PROMISE RECOVERY: Invalidate cached promises so future calls can reconnect
      clientPromise = null;
      if (isDev) {
        global.__mongoClientPromise = undefined;
      }
      const sanitized = sanitizeMongoUri(err instanceof Error ? err.message : String(err));
      throw new Error(`MongoDB connection failed: ${sanitized}`);
    }
  })();

  if (isDev) {
    global.__mongoClientPromise = newPromise;
  } else {
    clientPromise = newPromise;
  }

  return newPromise;
}

/**
 * Returns the target MongoDB database instance.
 */
export async function getMongoDb(dbName?: string): Promise<Db> {
  const client = await getMongoClient();
  const targetDb = dbName || process.env.MONGODB_DB_NAME || DEFAULT_MONGO_DB_NAME;
  return client.db(targetDb);
}

/**
 * Checks connectivity and measures query latency to MongoDB.
 */
export async function checkMongoHealth(): Promise<MongoHealthStatus> {
  const uri = process.env.MONGODB_URI;
  if (!uri || !uri.trim()) {
    return {
      status: "NOT_CONFIGURED",
      connected: false,
      error: "MONGODB_URI not configured",
    };
  }

  const targetDb = process.env.MONGODB_DB_NAME || DEFAULT_MONGO_DB_NAME;
  const start = Date.now();

  try {
    const db = await getMongoDb(targetDb);
    await db.command({ ping: 1 });
    const latencyMs = Date.now() - start;

    return {
      status: "CONNECTED",
      connected: true,
      latencyMs,
      dbName: targetDb,
    };
  } catch (err) {
    return {
      status: "DISCONNECTED",
      connected: false,
      latencyMs: Date.now() - start,
      dbName: targetDb,
      error: sanitizeMongoUri(err instanceof Error ? err.message : String(err)),
    };
  }
}

/**
 * Closes the active MongoDB connection and resets cached promises.
 */
export async function closeMongoClient(): Promise<void> {
  const client = clientInstance;
  clientInstance = null;
  clientPromise = null;
  global.__mongoClientPromise = undefined;

  if (client) {
    try {
      await client.close();
    } catch {
      // Ignore teardown errors
    }
  }
}

/**
 * Ensures that the NCC CRM MongoDB database, core collections, and performance/TTL
 * indexes exist. Idempotent and safe to run on startup or via CLI.
 */
export async function initMongoDatabase(dbName?: string): Promise<MongoInitResult> {
  const db = await getMongoDb(dbName);
  const existingCollections = await db.listCollections().toArray();
  const existingNames = new Set(existingCollections.map((c) => c.name));

  const targetCollections = [
    "cadets",
    "onboarding",
    "audit_logs",
    "otp_codes",
    "email_jobs",
    "prompter_reminders",
  ];

  for (const name of targetCollections) {
    if (!existingNames.has(name)) {
      await db.createCollection(name);
      existingNames.add(name);
    }
  }

  const indexesCreated: string[] = [];

  // 1. Cadets collection indexes
  await db
    .collection("cadets")
    .createIndex(
      { regimentalNumber: 1 },
      { unique: true, sparse: true, name: "idx_cadets_regimental_number" },
    );
  indexesCreated.push("cadets:idx_cadets_regimental_number");

  await db
    .collection("cadets")
    .createIndex({ email: 1 }, { unique: true, sparse: true, name: "idx_cadets_email" });
  indexesCreated.push("cadets:idx_cadets_email");

  // 2. Onboarding collection indexes
  await db
    .collection("onboarding")
    .createIndex({ cadetId: 1 }, { unique: true, sparse: true, name: "idx_onboarding_cadet_id" });
  indexesCreated.push("onboarding:idx_onboarding_cadet_id");

  // 3. Audit logs time-series index
  await db
    .collection("audit_logs")
    .createIndex({ timestamp: -1 }, { name: "idx_audit_logs_timestamp" });
  indexesCreated.push("audit_logs:idx_audit_logs_timestamp");

  // 4. OTP verification TTL auto-expiry index
  await db
    .collection("otp_codes")
    .createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0, name: "idx_otp_codes_ttl" });
  indexesCreated.push("otp_codes:idx_otp_codes_ttl");

  // 5. Email jobs queue indexing
  await db
    .collection("email_jobs")
    .createIndex({ status: 1, scheduledAt: 1 }, { name: "idx_email_jobs_status_schedule" });
  indexesCreated.push("email_jobs:idx_email_jobs_status_schedule");

  return {
    dbName: db.databaseName,
    collections: Array.from(existingNames),
    indexes: indexesCreated,
  };
}
