"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { OptimizationSection, OptimizationSuggestion } from "@/types/optimization";

type OptimizationResultListProps = {
  sections: OptimizationSection[];
  onApplySuggestion?: (suggestion: OptimizationSuggestion, sectionTitle: string) => void;
  sourceLabel?: string;
};

export function OptimizationResultList({
  sections,
  onApplySuggestion,
  sourceLabel
}: OptimizationResultListProps) {
  if (sections.length === 0) {
    return (
      <Card className="border-dashed bg-card/80">
        <CardContent className="p-8 text-center text-sm text-muted-foreground">
          Run optimization to generate AI rewrite suggestions.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {sections.map((section) => (
        <Card key={section.id} className="animate-enter">
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <CardTitle>{section.title}</CardTitle>
              {sourceLabel ? <Badge variant="secondary">{sourceLabel}</Badge> : null}
            </div>
            <CardDescription>
              Review each rewrite and apply only the suggestions you want.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {section.suggestions.map((suggestion) => (
              <div
                key={suggestion.id}
                className="space-y-3 rounded-lg border border-border/80 bg-background/80 p-4"
              >
                <div className="grid gap-3 md:grid-cols-2">
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
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  {suggestion.rationale ? <span>{suggestion.rationale}</span> : null}
                  {typeof suggestion.confidence === "number" ? (
                    <Badge variant="outline">
                      Confidence {Math.round(suggestion.confidence * 100)}%
                    </Badge>
                  ) : null}
                </div>
                {onApplySuggestion ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onApplySuggestion(suggestion, section.title)}
                  >
                    Apply Suggestion
                  </Button>
                ) : null}
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
