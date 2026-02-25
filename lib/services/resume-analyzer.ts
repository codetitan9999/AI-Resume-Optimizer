import { generateMockAnalysis } from "@/lib/mock-data";
import { AnalysisResult } from "@/types/analysis";

export type AnalyzeResumeInput = {
  fileName: string;
  jobDescription: string;
};

export interface ResumeAnalyzerService {
  analyze(input: AnalyzeResumeInput): Promise<AnalysisResult>;
}

class MockResumeAnalyzerService implements ResumeAnalyzerService {
  async analyze(input: AnalyzeResumeInput): Promise<AnalysisResult> {
    await new Promise((resolve) => {
      setTimeout(resolve, 2000);
    });

    return generateMockAnalysis(`${input.fileName}::${input.jobDescription}`);
  }
}

export const resumeAnalyzerService: ResumeAnalyzerService =
  new MockResumeAnalyzerService();
