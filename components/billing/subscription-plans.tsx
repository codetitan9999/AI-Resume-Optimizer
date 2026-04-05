"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Route } from "next";

import { useAuthSession } from "@/hooks/use-auth-session";
import { useAppToast } from "@/hooks/use-app-toast";
import { AUTH_SESSION_CHANGED_EVENT } from "@/lib/services/auth-service";
import { paymentService } from "@/lib/services/payment-service";
import { SubscriptionPlanId } from "@/types/auth";
import { PaymentPlan } from "@/types/payment";
import { PLAN_LABELS } from "@/utils/subscription";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type SubscriptionSnapshot = {
  active: boolean;
  paymentBypassEnabled: boolean;
  subscription: {
    planId: SubscriptionPlanId | null;
    status: "inactive" | "active" | "expired";
    amountInr: number;
    expiresAt: string | null;
  };
  plans: PaymentPlan[];
};

function loadRazorpayScript() {
  return new Promise<boolean>((resolve) => {
    if (typeof window === "undefined") {
      resolve(false);
      return;
    }

    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const existing = document.querySelector<HTMLScriptElement>(
      'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
    );

    if (existing) {
      existing.addEventListener("load", () => resolve(true));
      existing.addEventListener("error", () => resolve(false));
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

function formatDate(value: string | null) {
  if (!value) {
    return "-";
  }

  return new Date(value).toLocaleString();
}

export function SubscriptionPlans({ nextPath }: { nextPath?: string }) {
  const router = useRouter();
  const toast = useAppToast();
  const { user, refresh } = useAuthSession();
  const [snapshot, setSnapshot] = useState<SubscriptionSnapshot | null>(null);
  const [loadingPlanId, setLoadingPlanId] = useState<SubscriptionPlanId | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSubscription = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await paymentService.subscription();
      setSnapshot({
        active: response.active,
        paymentBypassEnabled: response.paymentBypassEnabled,
        subscription: {
          planId: response.subscription.planId,
          status: response.subscription.status,
          amountInr: response.subscription.amountInr,
          expiresAt: response.subscription.expiresAt
        },
        plans: response.plans
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to load subscription.";
      toast.error("Subscription error", message);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    void fetchSubscription();
  }, [fetchSubscription]);

  const currentSubscription = useMemo(() => snapshot?.subscription, [snapshot]);
  const paymentBypassEnabled = Boolean(snapshot?.paymentBypassEnabled);

  const openCheckout = async (planId: SubscriptionPlanId) => {
    try {
      setLoadingPlanId(planId);

      if (paymentBypassEnabled) {
        await paymentService.activateBypass(planId);
        window.dispatchEvent(new Event(AUTH_SESSION_CHANGED_EVENT));
        await refresh();
        await fetchSubscription();
        toast.success("Plan activated", "Bypass mode is enabled. No payment was charged.");

        if (nextPath && nextPath.startsWith("/")) {
          router.push(nextPath as Route);
        } else {
          router.push("/analyze" as Route);
        }
        return;
      }

      const scriptReady = await loadRazorpayScript();
      if (!scriptReady || !window.Razorpay) {
        throw new Error("Unable to load payment gateway script.");
      }

      const orderPayload = await paymentService.createOrder(planId);

      const checkout = new window.Razorpay({
        key: orderPayload.keyId,
        amount: orderPayload.order.amount,
        currency: orderPayload.order.currency,
        name: "AI Resume Optimizer",
        description: `${orderPayload.plan.label} Subscription`,
        order_id: orderPayload.order.id,
        prefill: {
          name: user?.name,
          email: user?.email
        },
        handler: async (response) => {
          try {
            await paymentService.verify(planId, response);
            window.dispatchEvent(new Event(AUTH_SESSION_CHANGED_EVENT));
            await refresh();
            await fetchSubscription();
            toast.success("Payment successful", "Your subscription is active.");

            if (nextPath && nextPath.startsWith("/")) {
              router.push(nextPath as Route);
            } else {
              router.push("/analyze" as Route);
            }
          } catch (error) {
            const message =
              error instanceof Error ? error.message : "Unable to verify payment.";
            toast.error("Verification failed", message);
          }
        },
        modal: {
          ondismiss: () => {
            toast.info("Payment cancelled", "You can retry anytime.");
          }
        },
        theme: {
          color: "#0f766e"
        }
      });

      checkout.open();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to start payment.";
      toast.error("Payment error", message);
    } finally {
      setLoadingPlanId(null);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Subscription Status</CardTitle>
          <CardDescription>
            Pay to unlock resume analysis, optimization, and builder workflows.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {paymentBypassEnabled ? (
            <p className="text-amber-600">
              Payment bypass mode is enabled for local testing.
            </p>
          ) : null}
          <p>
            Current status:{" "}
            <Badge variant={snapshot?.active ? "default" : "outline"}>
              {snapshot?.active ? "Active" : "Inactive"}
            </Badge>
          </p>
          <p>
            Plan:{" "}
            {currentSubscription?.planId
              ? PLAN_LABELS[currentSubscription.planId]
              : "No active plan"}
          </p>
          <p>Expires at: {formatDate(currentSubscription?.expiresAt ?? null)}</p>
          {snapshot?.active ? (
            <p className="text-emerald-600">You have access to premium features.</p>
          ) : null}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        {(snapshot?.plans ?? []).map((plan) => (
          <Card key={plan.id} className="relative overflow-hidden">
            <CardHeader>
              <CardTitle>{plan.label}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-3xl font-semibold">₹{plan.amountInr}</p>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Validity: {plan.validityDays} day{plan.validityDays > 1 ? "s" : ""}
              </p>
              <Button
                className="w-full"
                onClick={() => void openCheckout(plan.id)}
                disabled={Boolean(loadingPlanId) || isLoading}
              >
                {loadingPlanId === plan.id
                  ? "Processing..."
                  : paymentBypassEnabled
                    ? `Activate ${plan.label}`
                    : `Subscribe ${plan.label}`}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
