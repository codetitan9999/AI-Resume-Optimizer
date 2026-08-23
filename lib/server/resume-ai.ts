import { z } from "zod";

import {
  generateMockAnalysis,
  generateMockOptimizationSections
} from "@/lib/mock-data";
import { AnalysisResult } from "@/types/analysis";
import { OptimizationSection } from "@/types/optimization";
import { ResumeData } from "@/types/resume";
import { generateStructuredJson } from "@/lib/server/ai-json";

const analysisResultSchema: z.ZodType<AnalysisResult> = z.object({
  score: z.number().min(0).max(100),
  probability: z.number().min(0).max(100),
  strengths: z.array(z.string().min(3)).min(2).max(6),
  weaknesses: z.array(z.string().min(3)).min(2).max(6),
  missingKeywords: z.array(z.string().min(2)).min(1).max(12),
  matchedKeywords: z.array(z.string().min(2)).min(1).max(12)
});

const analysisResultJsonSchema = {
  type: "object",
  properties: {
    score: {
      type: "number",
      description: "Overall ATS fit score from 0 to 100."
    },
    probability: {
      type: "number",
      description: "Shortlisting probability from 0 to 100."
    },
    strengths: {
      type: "array",
      items: { type: "string" },
      description: "2 to 6 concise strength points."
    },
    weaknesses: {
      type: "array",
      items: { type: "string" },
      description: "2 to 6 concise weakness points."
    },
    missingKeywords: {
      type: "array",
      items: { type: "string" },
      description: "3 to 12 missing ATS keywords."
    },
    matchedKeywords: {
      type: "array",
      items: { type: "string" },
      description: "3 to 12 matched ATS keywords."
    }
  },
  required: [
    "score",
    "probability",
    "strengths",
    "weaknesses",
    "missingKeywords",
    "matchedKeywords"
  ]
} as const;

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

const optimizationOutputJsonSchema = {
  type: "object",
  properties: {
    sections: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string" },
          title: { type: "string" },
          suggestions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "string" },
                original: { type: "string" },
                optimized: { type: "string" },
                rationale: { type: "string" },
                confidence: { type: "number" },
                target: {
                  type: "object",
                  properties: {
                    kind: { type: "string" },
                    experienceIndex: { type: "integer" },
                    bulletIndex: { type: "integer" },
                    projectIndex: { type: "integer" },
                    category: { type: "string" }
                  }
                }
              },
              required: ["id", "original", "optimized"]
            }
          }
        },
        required: ["id", "title", "suggestions"]
      }
    }
  },
  required: ["sections"]
} as const;

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

function normalizeStringArray(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean);
}

function normalizePercentage(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value >= 0 && value <= 1 ? value * 100 : value;
  }

  if (typeof value === "string") {
    const parsed = Number.parseFloat(value.replace("%", "").trim());

    if (Number.isFinite(parsed)) {
      return parsed >= 0 && parsed <= 1 ? parsed * 100 : parsed;
    }
  }

  return value;
}

function normalizeAnalysisResult(value: unknown) {
  if (!value || typeof value !== "object") {
    return value;
  }

  const result = value as Record<string, unknown>;

  return {
    ...result,
    score: normalizePercentage(result.score),
    probability: normalizePercentage(result.probability),
    strengths: normalizeStringArray(result.strengths),
    weaknesses: normalizeStringArray(result.weaknesses),
    missingKeywords: normalizeStringArray(result.missingKeywords),
    matchedKeywords: normalizeStringArray(result.matchedKeywords)
  };
}

function normalizeOptionalString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeConfidence(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    if (value >= 0 && value <= 1) {
      return value;
    }

    if (value > 1 && value <= 100) {
      return value / 100;
    }
  }

  if (typeof value === "string") {
    const parsed = Number.parseFloat(value.replace("%", "").trim());

    if (Number.isFinite(parsed)) {
      if (parsed >= 0 && parsed <= 1) {
        return parsed;
      }

      if (parsed > 1 && parsed <= 100) {
        return parsed / 100;
      }
    }
  }

  return undefined;
}

function toNonNegativeInt(value: unknown) {
  if (typeof value === "number" && Number.isInteger(value) && value >= 0) {
    return value;
  }

  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number.parseInt(value, 10);
    if (Number.isInteger(parsed) && parsed >= 0) {
      return parsed;
    }
  }

  return undefined;
}

function normalizeCategory(value: unknown) {
  if (typeof value !== "string") {
    return undefined;
  }

  const normalized = value.trim().toLowerCase();

  if (
    normalized === "technical" ||
    normalized === "technologies" ||
    normalized === "tech" ||
    normalized === "hard-skills"
  ) {
    return "technical" as const;
  }

  if (
    normalized === "tools" ||
    normalized === "tooling" ||
    normalized === "methodologies" ||
    normalized === "platforms"
  ) {
    return "tools" as const;
  }

  if (
    normalized === "soft" ||
    normalized === "soft-skills" ||
    normalized === "interpersonal"
  ) {
    return "soft" as const;
  }

  return undefined;
}

function inferBulletIndex(
  bullets: string[],
  original: string,
  fallbackValue: unknown
) {
  const directIndex = toNonNegativeInt(fallbackValue);
  if (typeof directIndex === "number") {
    return directIndex;
  }

  const normalizedOriginal = original.trim().toLowerCase();
  if (!normalizedOriginal) {
    return undefined;
  }

  const matchIndex = bullets.findIndex(
    (bullet) => bullet.trim().toLowerCase() === normalizedOriginal
  );

  return matchIndex >= 0 ? matchIndex : undefined;
}

function normalizeOptimizationTarget(
  value: unknown,
  original: string,
  resumeData?: ResumeData
) {
  if (!resumeData) {
    return undefined;
  }

  if (!value || typeof value !== "object") {
    return undefined;
  }

  const target = value as Record<string, unknown>;
  const kind = normalizeOptionalString(target.kind).toLowerCase();

  if (kind === "summary") {
    return { kind: "summary" as const };
  }

  if (
    kind === "experience-bullet" ||
    kind === "experience_bullet" ||
    kind === "experience bullet"
  ) {
    const experienceIndex = toNonNegativeInt(target.experienceIndex);
    if (typeof experienceIndex !== "number") {
      return undefined;
    }

    const role = resumeData.experience[experienceIndex];
    if (!role) {
      return undefined;
    }

    const bulletIndex = inferBulletIndex(
      role.description,
      original,
      target.bulletIndex
    );

    if (typeof bulletIndex !== "number") {
      return undefined;
    }

    return {
      kind: "experience-bullet" as const,
      experienceIndex,
      bulletIndex
    };
  }

  if (
    kind === "project-bullet" ||
    kind === "project_bullet" ||
    kind === "project bullet"
  ) {
    const projectIndex = toNonNegativeInt(target.projectIndex);
    if (typeof projectIndex !== "number") {
      return undefined;
    }

    const project = resumeData.projects[projectIndex];
    if (!project) {
      return undefined;
    }

    const bulletIndex = inferBulletIndex(
      project.description,
      original,
      target.bulletIndex
    );

    if (typeof bulletIndex !== "number") {
      return undefined;
    }

    return {
      kind: "project-bullet" as const,
      projectIndex,
      bulletIndex
    };
  }

  if (kind === "skills" || kind === "keywords") {
    const category = normalizeCategory(target.category);
    if (!category) {
      return undefined;
    }

    return {
      kind: kind as "skills" | "keywords",
      category
    };
  }

  return undefined;
}

function normalizeOptimizationOutput(value: unknown, resumeData?: ResumeData) {
  if (!value || typeof value !== "object") {
    return value;
  }

  const root = value as Record<string, unknown>;
  const sections = Array.isArray(root.sections) ? root.sections : [];

  return {
    sections: sections
      .map((section, sectionIndex) => {
        if (!section || typeof section !== "object") {
          return null;
        }

        const rawSection = section as Record<string, unknown>;
        const suggestions = Array.isArray(rawSection.suggestions)
          ? rawSection.suggestions
          : [];

        const normalizedSuggestions = suggestions
          .map((suggestion, suggestionIndex) => {
            if (!suggestion || typeof suggestion !== "object") {
              return null;
            }

            const rawSuggestion = suggestion as Record<string, unknown>;
            const original = normalizeOptionalString(rawSuggestion.original);
            const optimized = normalizeOptionalString(rawSuggestion.optimized);

            if (!original || !optimized) {
              return null;
            }

            return {
              id:
                normalizeOptionalString(rawSuggestion.id) ||
                `suggestion-${sectionIndex}-${suggestionIndex}`,
              original,
              optimized,
              rationale: normalizeOptionalString(rawSuggestion.rationale) || undefined,
              confidence: normalizeConfidence(rawSuggestion.confidence),
              target: normalizeOptimizationTarget(
                rawSuggestion.target,
                original,
                resumeData
              )
            };
          })
          .filter(Boolean);

        if (normalizedSuggestions.length === 0) {
          return null;
        }

        return {
          id: normalizeOptionalString(rawSection.id) || `section-${sectionIndex}`,
          title:
            normalizeOptionalString(rawSection.title) ||
            `Optimization Section ${sectionIndex + 1}`,
          suggestions: normalizedSuggestions
        };
      })
      .filter(Boolean)
  };
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
    geminiJsonSchema: analysisResultJsonSchema,
    normalize: normalizeAnalysisResult,
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
  resumeData?: ResumeData;
  resumeText?: string;
  jobDescription?: string;
  mode: "general" | "jd-aligned";
}) {
  const rawResumeText = input.resumeText?.trim();

  if (!input.resumeData && !rawResumeText) {
    throw new Error("Resume content is required for optimization.");
  }

  const fallbackSections = input.resumeData
    ? generateMockOptimizationSections(input.resumeData, input.jobDescription)
    : [];

  const resumeContent = input.resumeData
    ? serializeResumeForPrompt(input.resumeData)
    : rawResumeText;

  const targetGuidance = input.resumeData
    ? [
        "Target mapping guidance:",
        "- summary -> { kind: 'summary' }",
        "- experience bullet -> { kind: 'experience-bullet', experienceIndex, bulletIndex }",
        "- project bullet -> { kind: 'project-bullet', projectIndex, bulletIndex }",
        "- skills -> { kind: 'skills', category }",
        "- keyword addition -> { kind: 'keywords', category }"
      ].join("\n")
    : "The resume source is extracted PDF text. Omit target objects because builder field indexes are unavailable.";

  const result = await generateStructuredJson({
    schema: optimizationOutputSchema,
    geminiJsonSchema: optimizationOutputJsonSchema,
    normalize: (value) => normalizeOptimizationOutput(value, input.resumeData),
    fallback: { sections: fallbackSections },
    systemPrompt:
      "You are a resume optimization engine. Return strict JSON only with key sections. Each section must contain suggestions with original, optimized, rationale, confidence(0-1), and optional target object.",
    userPrompt: [
      `Optimization mode: ${input.mode}`,
      "Generate ATS-safe improvements that preserve factual truth.",
      "Never invent companies, dates, metrics, technologies, or results.",
      "Focus on improving wording, structure, and JD alignment.",
      "Create sections with IDs: summary, experience, skills, keywords.",
      targetGuidance,
      "\nResume content:",
      resumeContent,
      "\nJob description:",
      input.jobDescription ?? "Not provided. Perform general ATS optimization."
    ].join("\n")
  });

  if (result.source !== "ai") {
    throw new Error(
      result.error ??
        "Live AI optimization output is unavailable. Optimization suggestions were not generated."
    );
  }

  return {
    ...result,
    data: result.data.sections
  };
}
