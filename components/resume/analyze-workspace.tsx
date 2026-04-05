"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Sparkles } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { resumeAnalyzerService } from "@/lib/services/resume-analyzer";
import { useResumeStore } from "@/store/use-resume-store";
import { AnalyzeFormValues, analyzeSchema } from "@/utils/schemas";
import { formatFileSize } from "@/utils/formatters";
import { extractTextFromPdfFile } from "@/utils/pdf-text";
import { useAppToast } from "@/hooks/use-app-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { AnalysisDashboard } from "@/components/resume/analysis-dashboard";
import { AnalysisSkeleton } from "@/components/resume/analysis-skeleton";

export function AnalyzeWorkspace() {
  const {
    uploadedFile,
    jobDescription,
    resumeText,
    analysisResult,
    isAnalyzing,
    setUploadedFile,
    setJobDescription,
    setResumeText,
    setAnalysisResult,
    setIsAnalyzing
  } = useResumeStore((state) => state);

  const toast = useAppToast();
  const [uploadedPdf, setUploadedPdf] = useState<File | null>(null);

  const form = useForm<AnalyzeFormValues>({
    resolver: zodResolver(analyzeSchema),
    defaultValues: {
      jobInput: jobDescription,
      resumeText
    }
  });

  const handleFileChange = (file: File | null) => {
    if (!file) {
      setUploadedFile(null);
      setUploadedPdf(null);
      return;
    }

    const isPdf =
      file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) {
      setUploadedFile(null);
      setUploadedPdf(null);
      toast.error("Only PDF files are supported", "Upload a valid .pdf resume file.");
      return;
    }

    setUploadedPdf(file);
    setUploadedFile({
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified
    });
  };

  const onSubmit = form.handleSubmit(async (values) => {
    if (!uploadedFile) {
      toast.error("Resume required", "Upload your resume PDF before analysis.");
      return;
    }

    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
      let effectiveResumeText = values.resumeText?.trim() || "";

      if (!effectiveResumeText && uploadedPdf) {
        const extractedText = await extractTextFromPdfFile(uploadedPdf);
        if (extractedText.length > 60) {
          effectiveResumeText = extractedText;
          form.setValue("resumeText", extractedText, {
            shouldDirty: true
          });
          toast.info(
            "Resume text extracted",
            "Basic PDF text extraction was used for AI analysis."
          );
        }
      }

      const result = await resumeAnalyzerService.analyze({
        jobInput: values.jobInput,
        resumeText: effectiveResumeText,
        resumeFileName: uploadedFile.name
      });

      setJobDescription(result.jobDescription);
      setResumeText(effectiveResumeText);
      setAnalysisResult(result.analysisResult);

      const modeLabel = result.source === "ai" ? "AI analysis completed" : "Fallback analysis completed";
      toast.success(modeLabel, "Resume and JD fit insights are ready.");

      if (result.warning) {
        toast.info("Optimization note", result.warning);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to analyze resume.";
      toast.error("Analysis failed", message);
    } finally {
      setIsAnalyzing(false);
    }
  });

  return (
    <section className="grid gap-6 lg:grid-cols-2">
      <Card className="animate-enter bg-card/95">
        <CardHeader>
          <CardTitle>Resume Score & Suggestions</CardTitle>
          <CardDescription>
            Upload your PDF and add a job description or job URL.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="resume-upload">Upload Resume (PDF only)</Label>
            <Input
              id="resume-upload"
              type="file"
              accept="application/pdf"
              onChange={(event) =>
                handleFileChange(event.target.files?.item(0) ?? null)
              }
            />
            {uploadedFile ? (
              <p className="text-xs text-muted-foreground">
                Selected: <span className="font-medium text-foreground">{uploadedFile.name}</span>{" "}
                ({formatFileSize(uploadedFile.size)})
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                Your resume file remains local for this UI-only MVP.
              </p>
            )}
          </div>

          <form className="space-y-2" onSubmit={onSubmit}>
            <Label htmlFor="jobInput">Job Description or Job URL</Label>
            <Textarea
              id="jobInput"
              placeholder="Paste job description or add a job URL with role requirements..."
              className="min-h-[160px]"
              {...form.register("jobInput")}
            />
            {form.formState.errors.jobInput ? (
              <p className="text-xs text-red-500">
                {form.formState.errors.jobInput.message}
              </p>
            ) : null}
            <Label htmlFor="resumeText" className="pt-2">
              Resume Text (optional, improves AI quality)
            </Label>
            <Textarea
              id="resumeText"
              placeholder="Paste your resume text here for more accurate AI analysis."
              className="min-h-[130px]"
              {...form.register("resumeText")}
            />
            <Button
              type="submit"
              className="mt-3 w-full gap-2"
              disabled={isAnalyzing}
            >
              {isAnalyzing ? (
                <>
                  <span className="relative inline-flex h-3 w-3">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary-foreground/90 opacity-75" />
                    <span className="relative inline-flex h-3 w-3 rounded-full bg-primary-foreground" />
                  </span>
                  Analyzing Resume...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Analyze Resume
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {isAnalyzing ? (
          <AnalysisSkeleton />
        ) : analysisResult ? (
          <AnalysisDashboard result={analysisResult} />
        ) : (
          <Card className="flex min-h-[420px] items-center justify-center border-dashed bg-card/80">
            <CardContent className="p-8 text-center">
              <p className="text-sm text-muted-foreground">
                Submit your resume and job details to generate a match score,
                strengths, gaps, and keyword recommendations.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </section>
  );
}
