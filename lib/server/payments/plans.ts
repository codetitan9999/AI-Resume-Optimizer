import { SubscriptionPlanId } from "@/types/auth";
import { PaymentPlan } from "@/types/payment";

export const PAYMENT_PLANS: Record<SubscriptionPlanId, PaymentPlan> = {
  day: {
    id: "day",
    label: "Day Pass",
    amountInr: 10,
    amountPaise: 1000,
    validityDays: 1,
    description: "Full access for 24 hours"
  },
  monthly: {
    id: "monthly",
    label: "Monthly",
    amountInr: 15,
    amountPaise: 1500,
    validityDays: 30,
    description: "Best for regular optimization"
  },
  yearly: {
    id: "yearly",
    label: "Yearly",
    amountInr: 100,
    amountPaise: 10000,
    validityDays: 365,
    description: "Best value for long-term use"
  }
};

export const PAYMENT_PLAN_LIST = Object.values(PAYMENT_PLANS);

export function getPlan(planId: SubscriptionPlanId) {
  return PAYMENT_PLANS[planId];
}

export function computeExpiry(validityDays: number) {
  const now = new Date();
  const expiresAt = new Date(now);
  expiresAt.setDate(expiresAt.getDate() + validityDays);
  return {
    startedAt: now.toISOString(),
    expiresAt: expiresAt.toISOString()
  };
}
