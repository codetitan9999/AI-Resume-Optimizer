import { ResumeBuilderWorkspace } from "@/components/resume/resume-builder-workspace";
import { requireActiveSubscription } from "@/lib/server/auth/guards";

export default async function BuilderPage() {
  await requireActiveSubscription("/builder");

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
          Create New Resume
        </h1>
        <p className="text-sm text-muted-foreground">
          Section-driven resume builder with ATS-friendly live preview and print export.
        </p>
      </div>
      <ResumeBuilderWorkspace />
    </div>
  );
}
