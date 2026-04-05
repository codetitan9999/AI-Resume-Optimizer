function asEnabled(value: string | undefined) {
  if (!value) {
    return false;
  }

  return ["1", "true", "yes", "on"].includes(value.trim().toLowerCase());
}

export function isPaymentBypassEnabled() {
  return asEnabled(process.env.PAYMENT_BYPASS_MODE);
}
