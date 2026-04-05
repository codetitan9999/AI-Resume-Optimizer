import { AnalyzeWorkspace } from "@/components/resume/analyze-workspace";
import { requireActiveSubscription } from "@/lib/server/auth/guards";

export default async function AnalyzePage() {
  await requireActiveSubscription("/analyze");

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
          Analyze Resume
        </h1>
        <p className="text-sm text-muted-foreground">
          Mock ATS scoring pipeline with structured outputs for future AI integration.
        </p>
      </div>
      <AnalyzeWorkspace />
    </div>
  );
}
