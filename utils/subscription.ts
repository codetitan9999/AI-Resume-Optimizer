import { SubscriptionPlanId, UserSubscription } from "@/types/auth";

export const PLAN_LABELS: Record<SubscriptionPlanId, string> = {
  day: "Day",
  monthly: "Monthly",
  yearly: "Yearly"
};

export function isSubscriptionActive(subscription: UserSubscription): boolean {
  if (subscription.status !== "active") {
    return false;
  }

  if (!subscription.expiresAt) {
    return false;
  }

  return new Date(subscription.expiresAt).getTime() > Date.now();
}
