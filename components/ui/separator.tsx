import { cn } from "@/lib/utils";

export function Separator({
  className,
  orientation = "horizontal"
}: {
  className?: string;
  orientation?: "horizontal" | "vertical";
}) {
  return orientation === "horizontal" ? (
    <div className={cn("h-px w-full bg-border", className)} />
  ) : (
    <div className={cn("h-full w-px bg-border", className)} />
  );
}
