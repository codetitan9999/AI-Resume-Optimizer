import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { getSessionFromCookieReader } from "@/lib/server/auth/session";
import { isSubscriptionActive } from "@/lib/server/auth/subscription";
import { isPaymentBypassEnabled } from "@/lib/server/payments/config";
import { PAYMENT_PLAN_LIST } from "@/lib/server/payments/plans";

export async function GET() {
  const session = await getSessionFromCookieReader(cookies());
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    user: session.user,
    subscription: session.user.subscription,
    active: isSubscriptionActive(session.user.subscription),
    plans: PAYMENT_PLAN_LIST,
    paymentBypassEnabled: isPaymentBypassEnabled()
  });
}
