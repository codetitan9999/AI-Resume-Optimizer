import { z } from "zod";

export const planIdSchema = z.enum(["day", "monthly", "yearly"]);

export const createOrderSchema = z.object({
  planId: planIdSchema
});

export const verifyPaymentSchema = z.object({
  planId: planIdSchema,
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1)
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type VerifyPaymentInput = z.infer<typeof verifyPaymentSchema>;
