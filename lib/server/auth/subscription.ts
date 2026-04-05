import { UserSubscription } from "@/types/auth";
import { isSubscriptionActive } from "@/utils/subscription";

export function createDefaultSubscription(): UserSubscription {
  return {
    planId: null,
    status: "inactive",
    amountInr: 0,
    currency: "INR",
    startedAt: null,
    expiresAt: null,
    updatedAt: new Date().toISOString(),
    paymentProvider: null,
    paymentId: null,
    orderId: null
  };
}

export function normalizeSubscription(
  value?: Partial<UserSubscription> | null
): UserSubscription {
  if (!value) {
    return createDefaultSubscription();
  }

  return {
    ...createDefaultSubscription(),
    ...value,
    currency: "INR",
    planId: value.planId ?? null,
    startedAt: value.startedAt ?? null,
    expiresAt: value.expiresAt ?? null,
    paymentProvider: value.paymentProvider ?? null,
    paymentId: value.paymentId ?? null,
    orderId: value.orderId ?? null
  };
}

export { isSubscriptionActive };
