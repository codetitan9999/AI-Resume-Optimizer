"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { useAuthSession } from "@/hooks/use-auth-session";
import { useAppToast } from "@/hooks/use-app-toast";
import { PLAN_LABELS } from "@/utils/subscription";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/analyze", label: "Analyze" },
  { href: "/optimize", label: "Optimize" },
  { href: "/builder", label: "Resume Builder" },
  { href: "/billing", label: "Billing" }
] as const;

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const toast = useAppToast();
  const { user, isLoading, logout } = useAuthSession();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out", "Your session has ended.");
      router.push("/");
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to log out.";
      toast.error("Logout failed", message);
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between gap-4">
        <Link href="/" className="font-semibold tracking-tight text-foreground">
          AI Resume Optimizer
        </Link>
        <div className="flex items-center gap-2">
          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => (
              <Button
                key={item.href}
                asChild
                size="sm"
                variant={pathname === item.href ? "secondary" : "ghost"}
                className={cn(
                  "font-medium",
                  pathname === item.href && "shadow-soft"
                )}
              >
                <Link href={item.href}>{item.label}</Link>
              </Button>
            ))}
          </nav>
          {isLoading ? (
            <span className="text-xs text-muted-foreground">
              Loading...
            </span>
          ) : user ? (
            <div className="flex items-center gap-2">
              <span className="hidden text-xs text-muted-foreground sm:inline">
                {user.name}
              </span>
              <span className="hidden text-[11px] text-muted-foreground sm:inline">
                {user.subscription.planId
                  ? `${PLAN_LABELS[user.subscription.planId]} plan`
                  : "No plan"}
              </span>
              <Button variant="outline" size="sm" onClick={() => void handleLogout()}>
                Logout
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button asChild size="sm" variant="ghost">
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/signup">Sign Up</Link>
              </Button>
            </div>
          )}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
