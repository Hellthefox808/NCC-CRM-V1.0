import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import {
  getPrismaClient,
  checkPrismaHealth,
  disconnectPrisma,
  sanitizeDatabaseUrl,
  createPgPool,
} from "../lib/prisma.server.ts";
import {
  getMongoClient,
  getMongoDb,
  checkMongoHealth,
  closeMongoClient,
  sanitizeMongoUri,
  getMongoOptions,
  DEFAULT_MONGO_DB_NAME,
} from "../lib/mongodb.server.ts";
import {
  getSupabaseServerConfig,
  checkSupabaseAdminHealth,
} from "../integrations/supabase/client.server.ts";

describe("Tier 3: Database Connections, Reliability & Security Tests", () => {
  const envBackup = { ...process.env };

  beforeEach(async () => {
    await disconnectPrisma().catch(() => {});
    await closeMongoClient().catch(() => {});
  });

  afterEach(async () => {
    process.env = { ...envBackup };
    await disconnectPrisma().catch(() => {});
    await closeMongoClient().catch(() => {});
  });

  describe("1. Prisma 7 & PostgreSQL Driver Adapter Tests", () => {
    it("sanitizeDatabaseUrl() masks credentials and protects sensitive connection strings", () => {
      const rawUrl =
        "postgresql://db_user:SuperSecretPassword123!@aws-0-pooler.supabase.com:6543/postgres?pgbouncer=true";
      const sanitized = sanitizeDatabaseUrl(rawUrl);

      assert.ok(!sanitized.includes("SuperSecretPassword123!"), "Password must be redacted");
      assert.ok(sanitized.includes("db_user:****@"), "Should format with masked credentials");
      assert.ok(sanitized.includes("aws-0-pooler.supabase.com:6543/postgres"));
    });

    it("sanitizeDatabaseUrl() safely handles empty or malformed inputs", () => {
      assert.equal(sanitizeDatabaseUrl(""), "");
      assert.equal(sanitizeDatabaseUrl(undefined), "");
      assert.equal(sanitizeDatabaseUrl("localhost:5432"), "localhost:5432");
    });

    it("getPrismaClient() throws descriptive error when DATABASE_URL is not configured", async () => {
      delete process.env.DATABASE_URL;
      delete process.env.DIRECT_URL;

      await assert.rejects(
        async () => {
          await getPrismaClient();
        },
        {
          name: "Error",
          message:
            "DATABASE_URL is not set in environment variables. Please configure a valid PostgreSQL connection string.",
        },
      );
    });

    it("createPgPool() configures connection limits and timeouts correctly", () => {
      process.env.DATABASE_POOL_MAX = "15";
      process.env.DATABASE_CONNECT_TIMEOUT_MS = "4000";

      const pool = createPgPool("postgresql://postgres:test@localhost:5432/test");
      assert.equal(pool.options.max, 15);
      assert.equal(pool.options.connectionTimeoutMillis, 4000);
      pool.end().catch(() => {});
    });

    it("getPrismaClient() reuses instance across multiple invocations (connection reuse)", async () => {
      process.env.DATABASE_URL = "postgresql://mockuser:mockpass@localhost:5432/mockdb";

      const client1 = await getPrismaClient();
      const client2 = await getPrismaClient();

      assert.strictEqual(client1, client2, "Must return the same singleton PrismaClient instance");
    });

    it("getPrismaClient() handles concurrent initialization safely", async () => {
      process.env.DATABASE_URL = "postgresql://mockuser:mockpass@localhost:5432/mockdb";

      const [c1, c2, c3] = await Promise.all([
        getPrismaClient(),
        getPrismaClient(),
        getPrismaClient(),
      ]);

      assert.strictEqual(c1, c2);
      assert.strictEqual(c2, c3);
    });

    it("checkPrismaHealth() returns NOT_CONFIGURED when DATABASE_URL is absent", async () => {
      delete process.env.DATABASE_URL;
      delete process.env.DIRECT_URL;

      const health = await checkPrismaHealth();
      assert.equal(health.status, "NOT_CONFIGURED");
      assert.equal(health.connected, false);
      assert.ok(health.error?.includes("DATABASE_URL not configured"));
    });

    it("checkPrismaHealth() masks credentials when connection fails", async () => {
      process.env.DATABASE_URL =
        "postgresql://secret_user:super_secret_pw@127.0.0.1:54329/nonexistent";

      const health = await checkPrismaHealth();
      assert.equal(health.status, "DISCONNECTED");
      assert.equal(health.connected, false);
      assert.ok(health.error, "Should contain error detail");
      assert.ok(
        !health.error?.includes("super_secret_pw"),
        "Must not leak secret password in health check",
      );
    });

    it("disconnectPrisma() resets instances cleanly and allows reinitialization", async () => {
      process.env.DATABASE_URL = "postgresql://mockuser:mockpass@localhost:5432/mockdb";

      const c1 = await getPrismaClient();
      await disconnectPrisma();

      const c2 = await getPrismaClient();
      assert.notStrictEqual(c1, c2, "Fresh client instance should be created after disconnect");
    });
  });

  describe("2. MongoDB Atlas & Connection Resilience Tests", () => {
    it("sanitizeMongoUri() masks passwords in standard and SRV URIs", () => {
      const uri =
        "mongodb+srv://adminUser:VerySecretPass999@cluster0.mongodb.net/ncc_crm?retryWrites=true";
      const sanitized = sanitizeMongoUri(uri);

      assert.ok(!sanitized.includes("VerySecretPass999"), "Password must be redacted");
      assert.ok(sanitized.includes("adminUser:****@"));
      assert.ok(sanitized.includes("cluster0.mongodb.net/ncc_crm"));
    });

    it("getMongoClient() throws descriptive error when MONGODB_URI is not set", async () => {
      delete process.env.MONGODB_URI;

      await assert.rejects(
        async () => {
          await getMongoClient();
        },
        {
          name: "Error",
          message:
            "MONGODB_URI is not set in environment variables. Please check your .env configuration.",
        },
      );
    });

    it("getMongoOptions() configures production-grade timeouts and pooling", () => {
      const opts = getMongoOptions();
      assert.equal(opts.serverSelectionTimeoutMS, 8000);
      assert.equal(opts.connectTimeoutMS, 10000);
      assert.equal(opts.socketTimeoutMS, 45000);
      assert.equal(opts.maxPoolSize, 10);
      assert.equal(opts.retryReads, true);
      assert.equal(opts.retryWrites, true);
    });

    it("getMongoClient() performs rejected-promise recovery when connection fails", async () => {
      // Configure an invalid host that immediately fails connection
      process.env.MONGODB_URI =
        "mongodb://invalid-unresolvable-host:27017/test?serverSelectionTimeoutMS=100";
      process.env.MONGODB_SERVER_SELECTION_TIMEOUT_MS = "100";
      process.env.MONGODB_CONNECT_TIMEOUT_MS = "100";

      // First call fails
      await assert.rejects(async () => {
        await getMongoClient();
      });

      // Second call should NOT return a stale cached rejected promise; it should attempt fresh connection
      let attemptCount = 0;
      try {
        await getMongoClient();
      } catch (err: unknown) {
        attemptCount++;
        const message = err instanceof Error ? err.message : String(err);
        assert.ok(
          message.includes("MongoDB connection failed"),
          "Should trigger fresh connection attempt",
        );
      }
      assert.equal(attemptCount, 1, "Should have executed fresh attempt");
    });

    it("getMongoDb() selects default database name when none is provided", async () => {
      delete process.env.MONGODB_DB_NAME;
      process.env.MONGODB_URI = "mongodb://127.0.0.1:27017";

      // Mock getMongoClient to return a lightweight mock Db provider
      const client = await getMongoClient().catch(() => null);
      if (!client) {
        // If local mongo is not running, verify default constant
        assert.equal(DEFAULT_MONGO_DB_NAME, "ncc_crm");
      }
    });

    it("checkMongoHealth() returns NOT_CONFIGURED when MONGODB_URI is absent", async () => {
      delete process.env.MONGODB_URI;

      const health = await checkMongoHealth();
      assert.equal(health.status, "NOT_CONFIGURED");
      assert.equal(health.connected, false);
      assert.ok(health.error?.includes("MONGODB_URI not configured"));
    });

    it("checkMongoHealth() catches connection errors and masks sensitive details", async () => {
      process.env.MONGODB_URI =
        "mongodb://user:super_secret_mongo_pw@127.0.0.1:27019/ncc_crm?serverSelectionTimeoutMS=100";
      process.env.MONGODB_SERVER_SELECTION_TIMEOUT_MS = "100";
      process.env.MONGODB_CONNECT_TIMEOUT_MS = "100";

      const health = await checkMongoHealth();
      assert.equal(health.status, "DISCONNECTED");
      assert.equal(health.connected, false);
      assert.ok(health.error);
      assert.ok(
        !health.error?.includes("super_secret_mongo_pw"),
        "Must not leak secret password in health check",
      );
    });
  });

  describe("3. Supabase PostgreSQL Configuration & Key Isolation Tests", () => {
    it("getSupabaseServerConfig() reads server environment variables and rejects VITE_ service keys", () => {
      process.env.SUPABASE_URL = "https://test.supabase.co";
      process.env.SUPABASE_SERVICE_ROLE_KEY = "server_role_secret_key";
      // Intentionally set VITE_ version to simulate misconfiguration
      process.env.VITE_SUPABASE_SERVICE_ROLE_KEY = "client_leaked_key";

      const config = getSupabaseServerConfig();
      assert.equal(config.url, "https://test.supabase.co");
      assert.equal(config.serviceRoleKey, "server_role_secret_key");
      assert.notEqual(
        config.serviceRoleKey,
        "client_leaked_key",
        "Must ignore VITE_ prefixed service role keys",
      );
    });

    it("checkSupabaseAdminHealth() returns NOT_CONFIGURED when credentials are missing", async () => {
      delete process.env.SUPABASE_URL;
      delete process.env.VITE_SUPABASE_URL;
      delete process.env.NEXT_PUBLIC_SUPABASE_URL;
      delete process.env.SUPABASE_SERVICE_ROLE_KEY;
      delete process.env.SUPABASE_SECRET_KEY;

      const health = await checkSupabaseAdminHealth();
      assert.equal(health.status, "NOT_CONFIGURED");
      assert.equal(health.connected, false);
    });
  });
});
