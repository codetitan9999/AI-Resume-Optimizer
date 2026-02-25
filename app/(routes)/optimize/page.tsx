import { OptimizationSections } from "@/components/resume/optimization-sections";

export default function OptimizePage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
          Resume Optimization Suggestions
        </h1>
        <p className="text-sm text-muted-foreground">
          Compare original and optimized copy for each resume section.
        </p>
      </div>
      <OptimizationSections />
    </div>
  );
}
