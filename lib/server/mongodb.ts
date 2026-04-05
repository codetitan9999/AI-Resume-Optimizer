import { Db, MongoClient } from "mongodb";

declare global {
  // eslint-disable-next-line no-var
  var __mongoClientPromise: Promise<MongoClient> | undefined;
}

function getMongoUri() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not configured.");
  }

  if (uri.includes("PASTE_YOUR_MONGODB_CONNECTION_STRING_HERE")) {
    throw new Error("MONGODB_URI placeholder detected. Add a real MongoDB URI.");
  }

  return uri;
}

function getMongoDbName() {
  return process.env.MONGODB_DB?.trim() || "ai_resume_optimizer";
}

function createClientPromise() {
  const uri = getMongoUri();
  const client = new MongoClient(uri);
  return client.connect();
}

export function getMongoClient() {
  if (!global.__mongoClientPromise) {
    global.__mongoClientPromise = createClientPromise();
  }

  return global.__mongoClientPromise;
}

export async function getMongoDb(): Promise<Db> {
  const client = await getMongoClient();
  return client.db(getMongoDbName());
}
