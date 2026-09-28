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

export async function getMongoDb(dbName?: string): Promise<Db> {
  const client = await getMongoClient();
  return client.db(dbName);
}
