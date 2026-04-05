import { SubscriptionPlans } from "@/components/billing/subscription-plans";
import { requireAuth } from "@/lib/server/auth/guards";

type BillingPageProps = {
  searchParams?: {
    next?: string | string[];
  };
};

export default async function BillingPage({ searchParams }: BillingPageProps) {
  await requireAuth("/billing");
  const nextPath = Array.isArray(searchParams?.next)
    ? searchParams?.next[0]
    : searchParams?.next;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
          Billing & Subscriptions
        </h1>
        <p className="text-sm text-muted-foreground">
          Choose a plan and pay securely via UPI, credit/debit cards, and more.
        </p>
      </div>
      <SubscriptionPlans nextPath={nextPath} />
    </div>
  );
}
