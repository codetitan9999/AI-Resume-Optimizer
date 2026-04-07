import { redirect } from "next/navigation";

import { isSubscriptionActive } from "@/lib/server/auth/subscription";
import { getServerSession } from "@/lib/server/auth/session";

export async function requireAuth(nextPath: string) {
  const session = await getServerSession();
  if (!session) {
    redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  }

  return session;
}

export async function redirectIfAuthenticated(defaultPath = "/analyze") {
  const session = await getServerSession();
  if (session) {
    const destination =
      defaultPath === "/analyze"
        ? isSubscriptionActive(session.user.subscription)
          ? "/analyze"
          : "/billing"
        : defaultPath;

    redirect(destination);
  }
}

export async function requireActiveSubscription(nextPath: string) {
  const session = await requireAuth(nextPath);

  if (!isSubscriptionActive(session.user.subscription)) {
    redirect(`/billing?next=${encodeURIComponent(nextPath)}`);
  }

  return session;
}
