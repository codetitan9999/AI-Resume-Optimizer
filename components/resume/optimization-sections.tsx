"use client";

import { useState } from "react";

import { resumeOptimizerService } from "@/lib/services/resume-optimizer";
import { useAppToast } from "@/hooks/use-app-toast";
import { useResumeStore } from "@/store/use-resume-store";
import { OptimizationSuggestion } from "@/types/optimization";
import { OptimizationResultList } from "@/components/resume/optimization-result-list";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { resumeDataSchema } from "@/utils/api-schemas";

export function OptimizationSections() {
  const {
    uploadedFile,
    jobDescription,
    resumeText,
    resumeData,
    optimizationSections,
    optimizationContext,
    setOptimizationSections,
    applySuggestionToResume
  } = useResumeStore((state) => state);

  const [jobInput, setJobInput] = useState(jobDescription);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const toast = useAppToast();
  const analyzedResumeText = resumeText.trim();
  const hasAnalyzedResume = analyzedResumeText.length >= 60;
  const hasBuilderResume = resumeDataSchema.safeParse(resumeData).success;
  const resumeSource = hasAnalyzedResume
    ? "analyzed"
    : hasBuilderResume
      ? "builder"
      : null;

  const runOptimization = async (mode: "general" | "jd-aligned") => {
    try {
      setIsOptimizing(true);

      if (!resumeSource) {
        toast.error(
          "Resume content required",
          "Analyze a resume PDF or add valid content in Resume Builder before running optimization."
        );
        return;
      }

      if (mode === "jd-aligned" && !jobInput.trim()) {
        toast.error("Job description required", "Add JD text or URL for alignment mode.");
        return;
      }

      const result = await resumeOptimizerService.optimize({
        resumeData: resumeSource === "builder" ? resumeData : undefined,
        resumeText: resumeSource === "analyzed" ? analyzedResumeText : undefined,
        mode,
        jobInput: mode === "jd-aligned" ? jobInput : ""
      });

      setOptimizationSections(result.sections, result.context);
      toast.success(
        result.context.source === "ai" ? "AI optimization ready" : "Fallback optimization ready",
        "Review and apply section-level suggestions."
      );

      if (result.warning) {
        toast.info("Optimization note", result.warning);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to optimize resume.";
      toast.error("Optimization failed", message);
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleApplySuggestion = async (
    suggestion: OptimizationSuggestion,
    sectionTitle: string
  ) => {
    if (!suggestion.target) {
      try {
        await navigator.clipboard.writeText(suggestion.optimized);
        toast.success(
          "Optimized text copied",
          `${sectionTitle} suggestion is ready to paste into your resume.`
        );
      } catch {
        toast.error("Copy failed", "Select and copy the optimized text manually.");
      }
      return;
    }

    applySuggestionToResume(suggestion);
    toast.success("Suggestion applied", `${sectionTitle} updated in your resume data.`);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>AI Resume Optimization</CardTitle>
          <CardDescription>
            Optimize your current resume content generally or align it to a target JD.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {resumeSource === "analyzed" ? (
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-foreground">
              Using extracted content from your analyzed resume
              {uploadedFile?.name ? ` (${uploadedFile.name})` : ""}. AI suggestions
              will be generated from this resume, not placeholder data.
            </div>
          ) : resumeSource === "builder" ? (
            <div className="rounded-lg border border-border/70 bg-muted/40 p-4 text-sm text-muted-foreground">
              Using your saved Resume Builder content for optimization.
            </div>
          ) : (
            <div className="rounded-lg border border-border/70 bg-muted/40 p-4 text-sm text-muted-foreground">
              Analyze a resume PDF or add your resume details in Resume Builder,
              then return here to run AI optimization.
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="opt-job-input">Job Description or Job URL (optional)</Label>
            <Textarea
              id="opt-job-input"
              placeholder="Paste job description text or URL for targeted alignment"
              className="min-h-[120px]"
              value={jobInput}
              onChange={(event) => setJobInput(event.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => {
                void runOptimization("general");
              }}
              disabled={isOptimizing || !resumeSource}
            >
              {isOptimizing ? "Optimizing..." : "Optimize Resume Content"}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                void runOptimization("jd-aligned");
              }}
              disabled={isOptimizing || !resumeSource}
            >
              Align Resume to JD
            </Button>
          </div>
          {optimizationContext ? (
            <p className="text-xs text-muted-foreground">
              Last run: {optimizationContext.mode} mode using {optimizationContext.source.toUpperCase()} output
              {optimizationContext.resumeSource
                ? ` from ${optimizationContext.resumeSource} resume content`
                : ""}
              {optimizationContext.jobSource ? ` (${optimizationContext.jobSource})` : ""}.
            </p>
          ) : null}
        </CardContent>
      </Card>

      <OptimizationResultList
        sections={optimizationSections}
        sourceLabel={optimizationContext?.source === "ai" ? "AI" : optimizationContext ? "Mock" : undefined}
        onApplySuggestion={handleApplySuggestion}
      />
    </div>
  );
}
