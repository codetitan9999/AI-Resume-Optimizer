import { AnalyzeWorkspace } from "@/components/resume/analyze-workspace";

export default function AnalyzePage() {
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
