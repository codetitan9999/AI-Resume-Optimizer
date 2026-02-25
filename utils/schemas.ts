import { z } from "zod";

const optionalUrl = z
  .string()
  .trim()
  .optional()
  .or(z.literal(""));

const optionalPhone = z
  .string()
  .trim()
  .min(7, "Phone must be at least 7 characters")
  .optional()
  .or(z.literal(""));

const experienceItemSchema = z.object({
  role: z.string().trim().min(2, "Role is required"),
  company: z.string().trim().min(2, "Company is required"),
  location: z.string().trim().optional().or(z.literal("")),
  startDate: z.string().trim().min(2, "Start date is required"),
  endDate: z.string().trim().min(2, "End date is required"),
  bullets: z.string().trim().min(10, "Add at least one bullet")
});

const projectItemSchema = z.object({
  name: z.string().trim().min(2, "Project name is required"),
  techStack: z.string().trim().min(2, "Tech stack is required"),
  startDate: z.string().trim().min(2, "Start date is required"),
  endDate: z.string().trim().min(2, "End date is required"),
  link: optionalUrl,
  bullets: z.string().trim().min(10, "Add at least one bullet")
});

const educationItemSchema = z.object({
  institution: z.string().trim().min(2, "Institution is required"),
  degree: z.string().trim().min(2, "Degree is required"),
  field: z.string().trim().min(2, "Field is required"),
  startDate: z.string().trim().min(2, "Start date is required"),
  endDate: z.string().trim().min(2, "End date is required"),
  location: z.string().trim().optional().or(z.literal(""))
});

export const analyzeSchema = z.object({
  jobInput: z
    .string()
    .trim()
    .min(1, "Provide a job description or job URL")
    .refine(
      (value) => {
        const urlCandidate = value.toLowerCase();
        if (urlCandidate.startsWith("http://") || urlCandidate.startsWith("https://")) {
          return z.string().url().safeParse(value).success;
        }

        return value.length >= 20;
      },
      "Provide a detailed job description (20+ chars) or a valid job URL"
    )
});

export const resumeBuilderSchema = z.object({
  personalInfo: z.object({
    fullName: z.string().trim().min(2, "Full name is required"),
    email: z.string().trim().email("Enter a valid email"),
    phone: optionalPhone,
    location: z.string().trim().optional().or(z.literal("")),
    linkedin: optionalUrl,
    website: optionalUrl
  }),
  summary: z
    .string()
    .trim()
    .min(30, "Summary should be at least 30 characters"),
  experience: z.array(experienceItemSchema).min(1, "Add at least one role"),
  projects: z.array(projectItemSchema).min(1, "Add at least one project"),
  skills: z.object({
    technical: z.string().trim().min(2, "Add technical skills"),
    tools: z.string().trim().min(2, "Add tools"),
    soft: z.string().trim().min(2, "Add soft skills")
  }),
  education: z.array(educationItemSchema).min(1, "Add at least one education entry"),
  certifications: z.string().trim().optional().or(z.literal(""))
});

export type AnalyzeFormValues = z.infer<typeof analyzeSchema>;
export type ResumeBuilderFormValues = z.infer<typeof resumeBuilderSchema>;
