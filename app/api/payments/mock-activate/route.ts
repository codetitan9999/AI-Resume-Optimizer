import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { getSessionFromCookieReader } from "@/lib/server/auth/session";
import { updateUserSubscription } from "@/lib/server/auth/user-store";
import { isPaymentBypassEnabled } from "@/lib/server/payments/config";
import { computeExpiry, getPlan } from "@/lib/server/payments/plans";
import { createOrderSchema } from "@/utils/payment-schemas";

export async function POST(request: Request) {
  try {
    if (!isPaymentBypassEnabled()) {
      return NextResponse.json(
        { message: "Payment bypass mode is disabled." },
        { status: 403 }
      );
    }

    const session = await getSessionFromCookieReader(cookies());
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const payload = createOrderSchema.parse(await request.json());
    const plan = getPlan(payload.planId);
    const { startedAt, expiresAt } = computeExpiry(plan.validityDays);

    const updatedUser = await updateUserSubscription(session.user.id, {
      planId: plan.id,
      status: "active",
      amountInr: plan.amountInr,
      currency: "INR",
      startedAt,
      expiresAt,
      updatedAt: new Date().toISOString(),
      paymentProvider: null,
      paymentId: null,
      orderId: null
    });

    if (!updatedUser) {
      return NextResponse.json(
        { message: "Unable to update user subscription." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      bypass: true,
      user: updatedUser,
      subscription: updatedUser.subscription
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to activate plan.";
    return NextResponse.json({ message }, { status: 400 });
  }
}
