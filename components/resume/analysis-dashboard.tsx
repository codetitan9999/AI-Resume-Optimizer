"use client";

import Link from "next/link";

import { AnalysisResult } from "@/types/analysis";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { formatPercentage } from "@/utils/formatters";

function ListSection({
  title,
  items,
  tone = "default"
}: {
  title: string;
  items: string[];
  tone?: "default" | "muted";
}) {
  return (
    <div>
      <p className="mb-2 text-sm font-semibold">{title}</p>
      <ul className="space-y-1.5 text-sm text-muted-foreground">
        {items.map((item) => (
          <li
            key={item}
            className={tone === "muted" ? "opacity-90" : undefined}
          >
            • {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function AnalysisDashboard({ result }: { result: AnalysisResult }) {
  return (
    <Card className="animate-enter border-primary/20">
      <CardHeader>
        <CardTitle>Resume Match Insights</CardTitle>
        <CardDescription>
          Mock analysis output structured for future API integration.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="border-border/70 bg-background/80 shadow-none">
            <CardContent className="space-y-3 p-4">
              <p className="text-sm text-muted-foreground">Resume Match Score</p>
              <p className="text-3xl font-semibold tracking-tight">{result.score}/100</p>
              <Progress value={result.score} />
            </CardContent>
          </Card>
          <Card className="border-border/70 bg-background/80 shadow-none">
            <CardContent className="space-y-3 p-4">
              <p className="text-sm text-muted-foreground">
                Estimated Shortlisting Probability
              </p>
              <p className="text-3xl font-semibold tracking-tight">
                {formatPercentage(result.probability)}
              </p>
              <Progress value={result.probability} />
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <ListSection title="Strength Areas" items={result.strengths} />
          <ListSection
            title="Weak Areas"
            items={result.weaknesses}
            tone="muted"
          />
        </div>

        <Separator />

        <div className="space-y-3">
          <p className="text-sm font-semibold">Keyword Match Analysis</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Matched Keywords
              </p>
              <div className="flex flex-wrap gap-2">
                {result.matchedKeywords.map((keyword) => (
                  <Badge key={keyword} variant="secondary" className="bg-emerald-500/15">
                    {keyword}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Missing Keywords
              </p>
              <div className="flex flex-wrap gap-2">
                {result.missingKeywords.map((keyword) => (
                  <Badge key={keyword} variant="outline" className="border-amber-500/40">
                    {keyword}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 pt-1">
          <Button asChild>
            <Link href="/optimize">Optimize Resume</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/builder">Create New Resume</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
