#!/usr/bin/env node
/**
 * NCC CRM - MongoDB Atlas Database & Schema Initializer
 *
 * Connects to MongoDB Atlas, verifies connectivity, creates the application
 * database ('ncc_crm'), establishes core collections, and configures production indexes.
 */

import { MongoClient } from "mongodb";
import fs from "node:fs";
import path from "node:path";

// Parse .env if available
const envPath = path.resolve(process.cwd(), ".env");
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, "utf-8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
      const idx = trimmed.indexOf("=");
      const key = trimmed.slice(0, idx).trim();
      let val = trimmed.slice(idx + 1).trim();
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  }
}

const rawUri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME || "ncc_crm";

if (!rawUri) {
  console.error("\n❌ ERROR: MONGODB_URI is not set in environment or .env file.");
  console.error("Please configure your MONGODB_URI in .env and try again.\n");
  process.exit(1);
}

// Fallback replica set URI for Windows systems where DNS SRV queries encounter querySrv ETIMEOUT
// Configured via MONGODB_DIRECT_URI environment variable if direct shard connection is required
const directReplicaUri = process.env.MONGODB_DIRECT_URI || null;

console.log("\n======================================================");
console.log("  NCC CRM — MongoDB Atlas Database Initialization");
console.log("======================================================");
console.log(`Target Database : ${dbName}`);
console.log(`Configured URI  : ${rawUri.replace(/:([^@]+)@/, ":****@")}`);
console.log("------------------------------------------------------\n");

async function tryConnect(connectionUri, label) {
  console.log(`[1/3] Attempting connection via ${label}...`);
  const client = new MongoClient(connectionUri, {
    serverSelectionTimeoutMS: 8000,
    connectTimeoutMS: 10000,
  });
  await client.connect();
  return client;
}

async function run() {
  let client;
  try {
    try {
      client = await tryConnect(rawUri, "Standard SRV Connection");
    } catch (srvErr) {
      if (
        directReplicaUri &&
        (srvErr.code === "ETIMEOUT" || (srvErr.message && srvErr.message.includes("querySrv")))
      ) {
        console.warn(
          "⚠️  Standard SRV DNS lookup timed out (common on Windows DNS). Falling back to direct replica set connection...",
        );
        client = await tryConnect(directReplicaUri, "Direct Shard ReplicaSet Connection");
      } else {
        throw srvErr;
      }
    }

    console.log("✅ Connection established successfully!\n");

    console.log(`[2/3] Provisioning database "${dbName}" and core collections...`);
    const db = client.db(dbName);
    const existingCollections = await db.listCollections().toArray();
    const existingNames = new Set(existingCollections.map((c) => c.name));

    const collectionsToCreate = [
      "cadets",
      "onboarding",
      "audit_logs",
      "otp_codes",
      "email_jobs",
      "prompter_reminders",
    ];

    for (const coll of collectionsToCreate) {
      if (!existingNames.has(coll)) {
        await db.createCollection(coll);
        console.log(`   + Created collection: ${coll}`);
        existingNames.add(coll);
      } else {
        console.log(`   ✓ Collection exists: ${coll}`);
      }
    }

    console.log("\n[3/3] Ensuring production indexes...");

    // 1. Cadets indexes
    await db
      .collection("cadets")
      .createIndex(
        { regimentalNumber: 1 },
        { unique: true, sparse: true, name: "idx_cadets_regimental_number" },
      );
    await db
      .collection("cadets")
      .createIndex({ email: 1 }, { unique: true, sparse: true, name: "idx_cadets_email" });
    console.log("   ✓ Cadets: regimentalNumber (unique), email (unique)");

    // 2. Onboarding indexes
    await db
      .collection("onboarding")
      .createIndex({ cadetId: 1 }, { unique: true, sparse: true, name: "idx_onboarding_cadet_id" });
    console.log("   ✓ Onboarding: cadetId (unique)");

    // 3. Audit logs time index
    await db
      .collection("audit_logs")
      .createIndex({ timestamp: -1 }, { name: "idx_audit_logs_timestamp" });
    console.log("   ✓ Audit Logs: timestamp (-1)");

    // 4. OTP codes TTL auto-expiry index
    await db
      .collection("otp_codes")
      .createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0, name: "idx_otp_codes_ttl" });
    console.log("   ✓ OTP Codes: expiresAt (TTL automatic expiration)");

    // 5. Email jobs queue indexing
    await db
      .collection("email_jobs")
      .createIndex({ status: 1, scheduledAt: 1 }, { name: "idx_email_jobs_status_schedule" });
    console.log("   ✓ Email Jobs: status + scheduledAt compound index");

    console.log("\n======================================================");
    console.log('🎉 MongoDB Atlas Database "ncc_crm" is ready!');
    console.log(`Collections: ${Array.from(existingNames).join(", ")}`);
    console.log("======================================================\n");
  } catch (err) {
    console.error("\n❌ MongoDB Initialization Failed:");
    console.error(`Message: ${err.message}`);

    if (err.code === 8000 || (err.message && err.message.includes("bad auth"))) {
      console.error("\n🔑 AUTHENTICATION FAILED TROUBLESHOOTING:");
      console.error("1. Log in to MongoDB Atlas: https://cloud.mongodb.com/");
      console.error('2. Navigate to "Security" -> "Database Access".');
      console.error('3. Verify that the user "Vercel-Admin-atlas-19-JH-BN-NCC_CRM" exists.');
      console.error('   If not, click "Add New Database User", choose Password authentication:');
      console.error(
        "   - Username: Vercel-Admin-atlas-19-JH-BN-NCC_CRM (or create one like ncc_admin)",
      );
      console.error("   - Password: [set secure password]");
      console.error(
        '   - Database User Privileges: "Read and write to any database" (or "Atlas admin")',
      );
      console.error(
        '4. Navigate to "Security" -> "Network Access" and verify your IP is whitelisted (or 0.0.0.0/0 for development).',
      );
      console.error(
        "5. Update your MONGODB_URI in .env with the verified username/password and rerun:",
      );
      console.error("   npm run db:init:mongo\n");
    }
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

run();
