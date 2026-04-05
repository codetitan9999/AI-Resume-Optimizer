import { AuthUser, SubscriptionPlanId } from "@/types/auth";
import { PaymentOrder, PaymentPlan, RazorpayCheckoutResponse } from "@/types/payment";

type CreateOrderResponse = {
  keyId: string;
  order: PaymentOrder;
  plan: PaymentPlan;
};

type VerifyResponse = {
  success: boolean;
  user: AuthUser | null;
  subscription: AuthUser["subscription"] | null;
};

type SubscriptionResponse = {
  user: AuthUser;
  subscription: AuthUser["subscription"];
  active: boolean;
  plans: PaymentPlan[];
  paymentBypassEnabled: boolean;
};

async function parseJson<T>(response: Response): Promise<T> {
  const payload = (await response.json()) as T & { message?: string };

  if (!response.ok) {
    throw new Error(payload.message ?? "Payment request failed.");
  }

  return payload;
}

export const paymentService = {
  async createOrder(planId: SubscriptionPlanId) {
    const response = await fetch("/api/payments/create-order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ planId })
    });

    return parseJson<CreateOrderResponse>(response);
  },

  async verify(planId: SubscriptionPlanId, payload: RazorpayCheckoutResponse) {
    const response = await fetch("/api/payments/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        planId,
        ...payload
      })
    });

    return parseJson<VerifyResponse>(response);
  },

  async activateBypass(planId: SubscriptionPlanId) {
    const response = await fetch("/api/payments/mock-activate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ planId })
    });

    return parseJson<VerifyResponse>(response);
  },

  async subscription() {
    const response = await fetch("/api/payments/subscription", {
      method: "GET",
      cache: "no-store"
    });

    return parseJson<SubscriptionResponse>(response);
  }
};
