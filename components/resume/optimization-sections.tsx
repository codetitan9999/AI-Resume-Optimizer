"use client";

import { optimizationSections } from "@/lib/mock-data";
import { useAppToast } from "@/hooks/use-app-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function OptimizationSections() {
  const toast = useAppToast();

  return (
    <div className="space-y-4">
      {optimizationSections.map((section) => (
        <Card key={section.id} className="animate-enter">
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <CardTitle>{section.title}</CardTitle>
              <Badge variant="secondary">Mock Data</Badge>
            </div>
            <CardDescription>
              Structured to support future AI-generated rewrite endpoints.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {section.suggestions.map((suggestion) => (
              <div
                key={suggestion.id}
                className="grid gap-3 rounded-lg border border-border/80 bg-background/80 p-4 md:grid-cols-2"
              >
                <div>
                  <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Original
                  </p>
                  <p className="text-sm text-foreground/90">{suggestion.original}</p>
                </div>
                <div>
                  <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Optimized
                  </p>
                  <p className="text-sm text-foreground">{suggestion.optimized}</p>
                </div>
              </div>
            ))}
            <Button
              variant="outline"
              onClick={() =>
                toast.success("Changes applied", `${section.title} updated in preview state.`)
              }
            >
              Apply Changes
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
