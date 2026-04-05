import { AnalysisResult } from "@/types/analysis";

export type AnalyzeResumeInput = {
  jobInput: string;
  resumeText?: string;
  resumeFileName?: string;
};

export type AnalyzeResumeOutput = {
  analysisResult: AnalysisResult;
  source: "ai" | "mock";
  warning?: string;
  jobDescriptionSource: "url" | "text";
  jobDescription: string;
  jobUrl?: string;
};

export interface ResumeAnalyzerService {
  analyze(input: AnalyzeResumeInput): Promise<AnalyzeResumeOutput>;
}

class ApiResumeAnalyzerService implements ResumeAnalyzerService {
  async analyze(input: AnalyzeResumeInput): Promise<AnalyzeResumeOutput> {
    const response = await fetch("/api/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(input)
    });

    if (!response.ok) {
      const payload = (await response.json()) as { message?: string };
      throw new Error(payload.message ?? "Failed to analyze resume.");
    }

    return (await response.json()) as AnalyzeResumeOutput;
  }
}

export const resumeAnalyzerService: ResumeAnalyzerService =
  new ApiResumeAnalyzerService();
