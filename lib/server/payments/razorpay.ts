import { createHmac } from "crypto";

import { PaymentOrder } from "@/types/payment";
import { PaymentPlan } from "@/types/payment";

function getRazorpayConfig() {
  const keyId = process.env.RAZORPAY_KEY_ID?.trim();
  const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim();

  if (!keyId || !keySecret) {
    throw new Error("Razorpay keys are not configured.");
  }

  if (
    keyId.startsWith("PASTE_") ||
    keySecret.startsWith("PASTE_")
  ) {
    throw new Error(
      "Razorpay keys are placeholders. Set real RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env.local."
    );
  }

  return {
    keyId,
    keySecret
  };
}

function buildAuthHeader(keyId: string, keySecret: string) {
  return `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`;
}

export async function createRazorpayOrder(input: {
  userId: string;
  userEmail: string;
  plan: PaymentPlan;
}): Promise<{ order: PaymentOrder; keyId: string }> {
  const { keyId, keySecret } = getRazorpayConfig();

  const payload = {
    amount: input.plan.amountPaise,
    currency: "INR",
    receipt: `airo_${input.userId}_${Date.now()}`,
    notes: {
      userId: input.userId,
      email: input.userEmail,
      planId: input.plan.id
    }
  };

  const response = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      Authorization: buildAuthHeader(keyId, keySecret),
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Unable to create Razorpay order: ${body}`);
  }

  const data = (await response.json()) as {
    id: string;
    amount: number;
    currency: "INR";
    receipt: string;
  };

  return {
    order: {
      id: data.id,
      amount: data.amount,
      currency: data.currency,
      receipt: data.receipt
    },
    keyId
  };
}

export function verifyRazorpaySignature(input: {
  orderId: string;
  paymentId: string;
  signature: string;
}) {
  const { keySecret } = getRazorpayConfig();
  const payload = `${input.orderId}|${input.paymentId}`;
  const expectedSignature = createHmac("sha256", keySecret)
    .update(payload)
    .digest("hex");

  return expectedSignature === input.signature;
}
