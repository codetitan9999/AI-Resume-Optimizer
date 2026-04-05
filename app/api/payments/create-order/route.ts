import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { getSessionFromCookieReader } from "@/lib/server/auth/session";
import { createRazorpayOrder } from "@/lib/server/payments/razorpay";
import { getPlan } from "@/lib/server/payments/plans";
import { createOrderSchema } from "@/utils/payment-schemas";

export async function POST(request: Request) {
  try {
    const session = await getSessionFromCookieReader(cookies());
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const payload = createOrderSchema.parse(await request.json());
    const plan = getPlan(payload.planId);

    const orderResult = await createRazorpayOrder({
      userId: session.user.id,
      userEmail: session.user.email,
      plan
    });

    return NextResponse.json({
      keyId: orderResult.keyId,
      order: orderResult.order,
      plan
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create order.";
    return NextResponse.json({ message }, { status: 400 });
  }
}
