import { SubscriptionPlanId } from "@/types/auth";

export type PaymentPlan = {
  id: SubscriptionPlanId;
  label: string;
  amountInr: number;
  amountPaise: number;
  validityDays: number;
  description: string;
};

export type PaymentOrder = {
  id: string;
  amount: number;
  currency: "INR";
  receipt: string;
};

export type RazorpayCheckoutResponse = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};
