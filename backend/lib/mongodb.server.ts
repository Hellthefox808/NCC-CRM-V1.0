import { MongoClient, type Db } from "mongodb";

/**
 * Global MongoDB client cache to prevent multiple connections in serverless / hot-reloading dev environments.
 */
declare global {
  var __mongoClientPromise: Promise<MongoClient> | undefined;
}

const uri = process.env.MONGODB_URI || "";

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

export async function getMongoClient(): Promise<MongoClient> {
  if (!uri) {
    throw new Error(
      "MONGODB_URI is not set in environment variables. Please check your .env configuration.",
    );
  }

  if (process.env.NODE_ENV === "development") {
    if (!global.__mongoClientPromise) {
      client = new MongoClient(uri);
      global.__mongoClientPromise = client.connect();
    }
    return global.__mongoClientPromise;
  } else {
    if (!clientPromise) {
      client = new MongoClient(uri);
      clientPromise = client.connect();
    }
    return clientPromise;
  }
}

export const DEFAULT_MONGO_DB_NAME = "ncc_crm";

export async function getMongoDb(dbName?: string): Promise<Db> {
  const client = await getMongoClient();
  const targetDb = dbName || process.env.MONGODB_DB_NAME || DEFAULT_MONGO_DB_NAME;
  return client.db(targetDb);
}

export interface MongoInitResult {
  dbName: string;
  collections: string[];
  indexes: string[];
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
