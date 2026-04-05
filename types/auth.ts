export type SubscriptionPlanId = "day" | "monthly" | "yearly";
export type SubscriptionStatus = "inactive" | "active" | "expired";

export type UserSubscription = {
  planId: SubscriptionPlanId | null;
  status: SubscriptionStatus;
  amountInr: number;
  currency: "INR";
  startedAt: string | null;
  expiresAt: string | null;
  updatedAt: string;
  paymentProvider: "razorpay" | null;
  paymentId: string | null;
  orderId: string | null;
};

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  subscription: UserSubscription;
};

export type AuthUserRecord = AuthUser & {
  passwordHash: string;
};

export type AuthSession = {
  user: AuthUser;
  issuedAt: number;
  expiresAt: number;
};
