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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function OptimizationSections() {
  const {
    resumeData,
    optimizationSections,
    optimizationContext,
    setOptimizationSections,
    applySuggestionToResume
  } = useResumeStore((state) => state);

  const [jobInput, setJobInput] = useState("");
  const [isOptimizing, setIsOptimizing] = useState(false);
  const toast = useAppToast();

  const runOptimization = async (mode: "general" | "jd-aligned") => {
    try {
      setIsOptimizing(true);

      if (mode === "jd-aligned" && !jobInput.trim()) {
        toast.error("Job description required", "Add JD text or URL for alignment mode.");
        return;
      }

      const result = await resumeOptimizerService.optimize({
        resumeData,
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

  const handleApplySuggestion = (
    suggestion: OptimizationSuggestion,
    sectionTitle: string
  ) => {
    if (!suggestion.target) {
      toast.info(
        "Manual suggestion",
        "This recommendation has no direct mapping and should be applied manually."
      );
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
          <div className="space-y-2">
            <Label htmlFor="opt-job-input">Job Description or Job URL (optional)</Label>
            <Input
              id="opt-job-input"
              placeholder="Paste job description text or URL for targeted alignment"
              value={jobInput}
              onChange={(event) => setJobInput(event.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => {
                void runOptimization("general");
              }}
              disabled={isOptimizing}
            >
              {isOptimizing ? "Optimizing..." : "Optimize Resume Content"}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                void runOptimization("jd-aligned");
              }}
              disabled={isOptimizing}
            >
              Align Resume to JD
            </Button>
          </div>
          {optimizationContext ? (
            <p className="text-xs text-muted-foreground">
              Last run: {optimizationContext.mode} mode using {optimizationContext.source.toUpperCase()} output
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
