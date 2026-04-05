import { z } from "zod";

const nonEmptyString = z.string().trim().min(1);

export const resumeDataSchema = z.object({
  personalInfo: z.object({
    fullName: nonEmptyString,
    email: z.string().trim().email(),
    phone: z.string().trim(),
    location: z.string().trim(),
    linkedin: z.string().trim(),
    website: z.string().trim()
  }),
  summary: nonEmptyString,
  experience: z.array(
    z.object({
      id: nonEmptyString,
      role: nonEmptyString,
      company: nonEmptyString,
      location: z.string().trim(),
      startDate: z.string().trim(),
      endDate: z.string().trim(),
      description: z.array(nonEmptyString)
    })
  ),
  projects: z.array(
    z.object({
      id: nonEmptyString,
      name: nonEmptyString,
      techStack: z.string().trim(),
      startDate: z.string().trim(),
      endDate: z.string().trim(),
      link: z.string().trim(),
      description: z.array(nonEmptyString)
    })
  ),
  skills: z.object({
    technical: z.array(nonEmptyString),
    tools: z.array(nonEmptyString),
    soft: z.array(nonEmptyString)
  }),
  education: z.array(
    z.object({
      id: nonEmptyString,
      institution: nonEmptyString,
      degree: nonEmptyString,
      field: nonEmptyString,
      startDate: z.string().trim(),
      endDate: z.string().trim(),
      location: z.string().trim()
    })
  ),
  certifications: z.array(nonEmptyString)
});

export const jobInputSchema = z
  .string()
  .trim()
  .min(1, "Provide a job description or URL.");

export const analyzeApiRequestSchema = z.object({
  jobInput: jobInputSchema,
  resumeText: z.string().trim().optional().or(z.literal("")),
  resumeFileName: z.string().trim().optional().or(z.literal(""))
});

export const optimizeApiRequestSchema = z.object({
  resumeData: resumeDataSchema,
  jobInput: z.string().trim().optional().or(z.literal("")),
  mode: z.enum(["general", "jd-aligned"]).optional().default("general")
});

export const jdExtractApiRequestSchema = z.object({
  jobInput: jobInputSchema
});

export type AnalyzeApiRequest = z.infer<typeof analyzeApiRequestSchema>;
export type OptimizeApiRequest = z.infer<typeof optimizeApiRequestSchema>;
export type ResumeDataPayload = z.infer<typeof resumeDataSchema>;
