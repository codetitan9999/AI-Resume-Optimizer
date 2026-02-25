import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function HomePage() {
  return (
    <section className="mx-auto flex max-w-4xl flex-col items-center py-16 text-center md:py-24">
      <Card className="w-full overflow-hidden border-primary/20 bg-card/85 backdrop-blur-sm">
        <CardContent className="space-y-6 p-8 md:p-12">
          <p className="inline-flex rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-primary">
            AI Resume Optimizer
          </p>
          <h1 className="text-balance text-3xl font-semibold tracking-tight md:text-5xl">
            Build ATS-ready resumes with guided insights and optimization workflows.
          </h1>
          <p className="mx-auto max-w-2xl text-pretty text-base text-muted-foreground md:text-lg">
            UI-only MVP for analyzing resume-job fit, applying optimization suggestions,
            and creating a fresh ATS-friendly resume in one streamlined workspace.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg">
              <Link href="/analyze">Start Optimization</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/builder">Create New Resume</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
