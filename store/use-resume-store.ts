import { create } from "zustand";

import { initialResumeData } from "@/lib/mock-data";
import { AnalysisResult, UploadedFileMeta } from "@/types/analysis";
import { ResumeData } from "@/types/resume";

type ResumeStoreState = {
  uploadedFile: UploadedFileMeta | null;
  jobDescription: string;
  analysisResult: AnalysisResult | null;
  resumeData: ResumeData;
  isAnalyzing: boolean;
  setUploadedFile: (file: UploadedFileMeta | null) => void;
  setJobDescription: (value: string) => void;
  setAnalysisResult: (result: AnalysisResult | null) => void;
  setResumeData: (resumeData: ResumeData) => void;
  setIsAnalyzing: (value: boolean) => void;
  resetAnalysis: () => void;
};

export const useResumeStore = create<ResumeStoreState>((set) => ({
  uploadedFile: null,
  jobDescription: "",
  analysisResult: null,
  resumeData: initialResumeData,
  isAnalyzing: false,
  setUploadedFile: (file) => set({ uploadedFile: file }),
  setJobDescription: (value) => set({ jobDescription: value }),
  setAnalysisResult: (result) => set({ analysisResult: result }),
  setResumeData: (resumeData) => set({ resumeData }),
  setIsAnalyzing: (value) => set({ isAnalyzing: value }),
  resetAnalysis: () =>
    set({
      uploadedFile: null,
      jobDescription: "",
      analysisResult: null,
      isAnalyzing: false
    })
}));
