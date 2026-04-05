import { OptimizationContext, OptimizationSection } from "@/types/optimization";
import { ResumeData } from "@/types/resume";

export type OptimizeResumeInput = {
  resumeData: ResumeData;
  jobInput?: string;
  mode?: "general" | "jd-aligned";
};

export type OptimizeResumeOutput = {
  sections: OptimizationSection[];
  context: OptimizationContext;
  warning?: string;
};

export interface ResumeOptimizerService {
  optimize(input: OptimizeResumeInput): Promise<OptimizeResumeOutput>;
}

class ApiResumeOptimizerService implements ResumeOptimizerService {
  async optimize(input: OptimizeResumeInput): Promise<OptimizeResumeOutput> {
    const response = await fetch("/api/optimize", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(input)
    });

    if (!response.ok) {
      const payload = (await response.json()) as { message?: string };
      throw new Error(payload.message ?? "Failed to optimize resume.");
    }

    return (await response.json()) as OptimizeResumeOutput;
  }
}

export const resumeOptimizerService: ResumeOptimizerService =
  new ApiResumeOptimizerService();
