import { ObjectId, WithId } from "mongodb";

import { AuthUser, AuthUserRecord } from "@/types/auth";
import {
  createDefaultSubscription,
  normalizeSubscription
} from "@/lib/server/auth/subscription";
import { getMongoDb } from "@/lib/server/mongodb";

type AuthUserDocument = {
  name: string;
  email: string;
  passwordHash: string;
  createdAt: string;
  subscription?: AuthUser["subscription"];
};

const USERS_COLLECTION = process.env.MONGODB_USERS_COLLECTION || "users";

let ensuredIndexes = false;

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function mapDocument(record: WithId<AuthUserDocument>): AuthUserRecord {
  return {
    id: record._id.toString(),
    name: record.name,
    email: record.email,
    passwordHash: record.passwordHash,
    createdAt: record.createdAt,
    subscription: normalizeSubscription(record.subscription)
  };
}

function sanitizeUser(user: AuthUserRecord): AuthUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
    subscription: normalizeSubscription(user.subscription)
  };
}

async function getUsersCollection() {
  const db = await getMongoDb();
  const collection = db.collection<AuthUserDocument>(USERS_COLLECTION);

  if (!ensuredIndexes) {
    await collection.createIndex({ email: 1 }, { unique: true, name: "uniq_email" });
    ensuredIndexes = true;
  }

  return collection;
}

export async function findUserByEmail(email: string): Promise<AuthUserRecord | null> {
  const collection = await getUsersCollection();
  const record = await collection.findOne({ email: normalizeEmail(email) });

  if (!record) {
    return null;
  }

  return mapDocument(record);
}

export async function findUserById(id: string): Promise<AuthUserRecord | null> {
  if (!ObjectId.isValid(id)) {
    return null;
  }

  const collection = await getUsersCollection();
  const record = await collection.findOne({ _id: new ObjectId(id) });

  if (!record) {
    return null;
  }

  return mapDocument(record);
}

export async function createUser(input: {
  name: string;
  email: string;
  passwordHash: string;
}): Promise<AuthUser> {
  const collection = await getUsersCollection();

  const record: AuthUserDocument = {
    name: input.name.trim(),
    email: normalizeEmail(input.email),
    passwordHash: input.passwordHash,
    createdAt: new Date().toISOString(),
    subscription: createDefaultSubscription()
  };

  const result = await collection.insertOne(record);

  const savedRecord: AuthUserRecord = {
    id: result.insertedId.toString(),
    name: record.name,
    email: record.email,
    passwordHash: record.passwordHash,
    createdAt: record.createdAt,
    subscription: normalizeSubscription(record.subscription)
  };

  return sanitizeUser(savedRecord);
}

export function toPublicUser(user: AuthUserRecord): AuthUser {
  return sanitizeUser(user);
}

export async function updateUserSubscription(
  userId: string,
  subscription: AuthUser["subscription"]
): Promise<AuthUser | null> {
  if (!ObjectId.isValid(userId)) {
    return null;
  }

  const collection = await getUsersCollection();
  await collection.updateOne(
    { _id: new ObjectId(userId) },
    {
      $set: {
        subscription: normalizeSubscription(subscription)
      }
    }
  );

  const updated = await collection.findOne({ _id: new ObjectId(userId) });
  if (!updated) {
    return null;
  }

  return sanitizeUser(mapDocument(updated));
}
