import { SubscriptionPlanId } from "@/types/auth";
import { getMongoDb } from "@/lib/server/mongodb";

type PaymentDocument = {
  userId: string;
  planId: SubscriptionPlanId;
  amountInr: number;
  amountPaise: number;
  currency: "INR";
  provider: "razorpay";
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
  createdAt: string;
};

const PAYMENTS_COLLECTION = process.env.MONGODB_PAYMENTS_COLLECTION || "payments";

let ensuredIndexes = false;

async function getPaymentsCollection() {
  const db = await getMongoDb();
  const collection = db.collection<PaymentDocument>(PAYMENTS_COLLECTION);

  if (!ensuredIndexes) {
    await collection.createIndex({ userId: 1, createdAt: -1 }, { name: "idx_user_created" });
    await collection.createIndex(
      { razorpayPaymentId: 1 },
      { unique: true, name: "uniq_razorpay_payment" }
    );
    ensuredIndexes = true;
  }

  return collection;
}

export async function insertPaymentRecord(input: PaymentDocument) {
  const collection = await getPaymentsCollection();

  const result = await collection.insertOne(input);
  return result.insertedId.toString();
}

export async function hasPaymentId(paymentId: string) {
  const collection = await getPaymentsCollection();
  const existing = await collection.findOne({ razorpayPaymentId: paymentId });
  return Boolean(existing);
}
