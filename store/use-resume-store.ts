import { create } from "zustand";

import { initialResumeData } from "@/lib/mock-data";
import { AnalysisResult, UploadedFileMeta } from "@/types/analysis";
import {
  OptimizationContext,
  OptimizationSection,
  OptimizationSuggestion
} from "@/types/optimization";
import { ResumeData } from "@/types/resume";
import { applyOptimizationSuggestion } from "@/utils/apply-optimization-suggestion";

type ResumeStoreState = {
  uploadedFile: UploadedFileMeta | null;
  jobDescription: string;
  resumeText: string;
  analysisResult: AnalysisResult | null;
  resumeData: ResumeData;
  optimizationSections: OptimizationSection[];
  optimizationContext: OptimizationContext | null;
  isAnalyzing: boolean;
  setUploadedFile: (file: UploadedFileMeta | null) => void;
  setJobDescription: (value: string) => void;
  setResumeText: (value: string) => void;
  setAnalysisResult: (result: AnalysisResult | null) => void;
  setResumeData: (resumeData: ResumeData) => void;
  setOptimizationSections: (
    sections: OptimizationSection[],
    context: OptimizationContext
  ) => void;
  applySuggestionToResume: (suggestion: OptimizationSuggestion) => void;
  setIsAnalyzing: (value: boolean) => void;
  resetAnalysis: () => void;
};

export const useResumeStore = create<ResumeStoreState>((set) => ({
  uploadedFile: null,
  jobDescription: "",
  resumeText: "",
  analysisResult: null,
  resumeData: initialResumeData,
  optimizationSections: [],
  optimizationContext: null,
  isAnalyzing: false,
  setUploadedFile: (file) => set({ uploadedFile: file }),
  setJobDescription: (value) => set({ jobDescription: value }),
  setResumeText: (value) => set({ resumeText: value }),
  setAnalysisResult: (result) => set({ analysisResult: result }),
  setResumeData: (resumeData) => set({ resumeData }),
  setOptimizationSections: (sections, context) =>
    set({
      optimizationSections: sections,
      optimizationContext: context
    }),
  applySuggestionToResume: (suggestion) =>
    set((state) => ({
      resumeData: applyOptimizationSuggestion(state.resumeData, suggestion)
    })),
  setIsAnalyzing: (value) => set({ isAnalyzing: value }),
  resetAnalysis: () =>
    set({
      uploadedFile: null,
      jobDescription: "",
      resumeText: "",
      analysisResult: null,
      isAnalyzing: false
    })
}));
