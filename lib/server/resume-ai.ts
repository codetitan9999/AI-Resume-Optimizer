import { z } from "zod";

import {
  generateMockAnalysis,
  generateMockOptimizationSections
} from "@/lib/mock-data";
import { AnalysisResult } from "@/types/analysis";
import { OptimizationSection } from "@/types/optimization";
import { ResumeData } from "@/types/resume";
import { generateStructuredJson } from "@/lib/server/openai-json";

const analysisResultSchema: z.ZodType<AnalysisResult> = z.object({
  score: z.number().min(0).max(100),
  probability: z.number().min(0).max(100),
  strengths: z.array(z.string().min(3)).min(2).max(6),
  weaknesses: z.array(z.string().min(3)).min(2).max(6),
  missingKeywords: z.array(z.string().min(2)).min(3).max(12),
  matchedKeywords: z.array(z.string().min(2)).min(3).max(12)
});

const targetSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("summary")
  }),
  z.object({
    kind: z.literal("experience-bullet"),
    experienceIndex: z.number().int().nonnegative(),
    bulletIndex: z.number().int().nonnegative()
  }),
  z.object({
    kind: z.literal("project-bullet"),
    projectIndex: z.number().int().nonnegative(),
    bulletIndex: z.number().int().nonnegative()
  }),
  z.object({
    kind: z.literal("skills"),
    category: z.enum(["technical", "tools", "soft"])
  }),
  z.object({
    kind: z.literal("keywords"),
    category: z.enum(["technical", "tools", "soft"])
  })
]);

const optimizationSectionSchema: z.ZodType<OptimizationSection> = z.object({
  id: z.string().min(1),
  title: z.string().min(3),
  suggestions: z
    .array(
      z.object({
        id: z.string().min(1),
        original: z.string().min(1),
        optimized: z.string().min(1),
        rationale: z.string().optional(),
        confidence: z.number().min(0).max(1).optional(),
        target: targetSchema.optional()
      })
    )
    .min(1)
});

const optimizationOutputSchema = z.object({
  sections: z.array(optimizationSectionSchema).min(1).max(8)
});

function serializeResumeForPrompt(resumeData: ResumeData) {
  return JSON.stringify(
    {
      summary: resumeData.summary,
      experience: resumeData.experience.map((item, experienceIndex) => ({
        experienceIndex,
        role: item.role,
        company: item.company,
        bullets: item.description.map((bullet, bulletIndex) => ({
          bulletIndex,
          text: bullet
        }))
      })),
      projects: resumeData.projects.map((item, projectIndex) => ({
        projectIndex,
        name: item.name,
        bullets: item.description.map((bullet, bulletIndex) => ({
          bulletIndex,
          text: bullet
        }))
      })),
      skills: resumeData.skills
    },
    null,
    2
  );
}

export async function analyzeResumeWithAI(input: {
  resumeText: string;
  resumeFileName?: string;
  jobDescription: string;
}) {
  const seedText = `${input.resumeFileName ?? "resume"}\n${input.resumeText}\n${input.jobDescription}`;
  const fallback = generateMockAnalysis(seedText);

  const result = await generateStructuredJson({
    schema: analysisResultSchema,
    fallback,
    systemPrompt:
      "You are an ATS resume analysis engine. Return strict JSON only with keys: score, probability, strengths, weaknesses, missingKeywords, matchedKeywords.",
    userPrompt: [
      "Analyze this resume against the job description and produce an ATS-focused fit report.",
      "Scoring guidance:",
      "- score: 0-100 overall fit",
      "- probability: 0-100 shortlist likelihood",
      "- strengths/weaknesses: concise, specific, no fluff",
      "- keywords arrays should be short ATS terms",
      "\nResume text:",
      input.resumeText || "Resume text not provided.",
      "\nJob description:",
      input.jobDescription
    ].join("\n")
  });

  return result;
}

export async function optimizeResumeWithAI(input: {
  resumeData: ResumeData;
  jobDescription?: string;
  mode: "general" | "jd-aligned";
}) {
  const fallbackSections = generateMockOptimizationSections(
    input.resumeData,
    input.jobDescription
  );

  const result = await generateStructuredJson({
    schema: optimizationOutputSchema,
    fallback: { sections: fallbackSections },
    systemPrompt:
      "You are a resume optimization engine. Return strict JSON only with key sections. Each section must contain suggestions with original, optimized, rationale, confidence(0-1), and optional target object.",
    userPrompt: [
      `Optimization mode: ${input.mode}`,
      "Generate ATS-safe improvements that preserve factual truth.",
      "Never invent companies, dates, metrics, technologies, or results.",
      "Focus on improving wording, structure, and JD alignment.",
      "Create sections with IDs: summary, experience, skills, keywords.",
      "Target mapping guidance:",
      "- summary -> { kind: 'summary' }",
      "- experience bullet -> { kind: 'experience-bullet', experienceIndex, bulletIndex }",
      "- project bullet -> { kind: 'project-bullet', projectIndex, bulletIndex }",
      "- skills -> { kind: 'skills', category }",
      "- keyword addition -> { kind: 'keywords', category }",
      "\nResume data:",
      serializeResumeForPrompt(input.resumeData),
      "\nJob description:",
      input.jobDescription ?? "Not provided. Perform general ATS optimization."
    ].join("\n")
  });

  return {
    ...result,
    data: result.data.sections
  };
}
