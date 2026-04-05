import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { getSessionFromCookieReader } from "@/lib/server/auth/session";
import { updateUserSubscription } from "@/lib/server/auth/user-store";
import { computeExpiry, getPlan } from "@/lib/server/payments/plans";
import {
  hasPaymentId,
  insertPaymentRecord
} from "@/lib/server/payments/payment-store";
import { verifyRazorpaySignature } from "@/lib/server/payments/razorpay";
import { verifyPaymentSchema } from "@/utils/payment-schemas";

export async function POST(request: Request) {
  try {
    const session = await getSessionFromCookieReader(cookies());
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyPaymentSchema.parse(await request.json());
    const plan = getPlan(payload.planId);

    const signatureValid = verifyRazorpaySignature({
      orderId: payload.razorpay_order_id,
      paymentId: payload.razorpay_payment_id,
      signature: payload.razorpay_signature
    });

    if (!signatureValid) {
      return NextResponse.json(
        { message: "Invalid payment signature." },
        { status: 400 }
      );
    }

    const existingPayment = await hasPaymentId(payload.razorpay_payment_id);
    if (existingPayment) {
      return NextResponse.json(
        { message: "Payment already processed." },
        { status: 409 }
      );
    }

    const { startedAt, expiresAt } = computeExpiry(plan.validityDays);

    const updatedUser = await updateUserSubscription(session.user.id, {
      planId: plan.id,
      status: "active",
      amountInr: plan.amountInr,
      currency: "INR",
      startedAt,
      expiresAt,
      updatedAt: new Date().toISOString(),
      paymentProvider: "razorpay",
      paymentId: payload.razorpay_payment_id,
      orderId: payload.razorpay_order_id
    });
    if (!updatedUser) {
      return NextResponse.json(
        { message: "Unable to update user subscription." },
        { status: 500 }
      );
    }

    await insertPaymentRecord({
      userId: session.user.id,
      planId: plan.id,
      amountInr: plan.amountInr,
      amountPaise: plan.amountPaise,
      currency: "INR",
      provider: "razorpay",
      razorpayOrderId: payload.razorpay_order_id,
      razorpayPaymentId: payload.razorpay_payment_id,
      razorpaySignature: payload.razorpay_signature,
      createdAt: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      user: updatedUser,
      subscription: updatedUser.subscription
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to verify payment.";
    return NextResponse.json({ message }, { status: 400 });
  }
}
