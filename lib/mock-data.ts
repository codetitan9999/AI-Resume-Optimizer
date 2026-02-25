import { AnalysisResult } from "@/types/analysis";
import { OptimizationSection } from "@/types/optimization";
import { ResumeData } from "@/types/resume";

const keywordPool = [
  "TypeScript",
  "React",
  "Next.js",
  "Node.js",
  "REST APIs",
  "System Design",
  "CI/CD",
  "AWS",
  "Microservices",
  "Testing",
  "Performance",
  "Accessibility"
];

const strengthPool = [
  "Clear impact-driven bullet points with measurable outcomes",
  "Consistent role progression and ownership over core systems",
  "Strong technical breadth aligned with product engineering teams",
  "Good ATS readability with standard section naming"
];

const weaknessPool = [
  "Summary lacks role-specific positioning for this job",
  "Experience bullets underuse role-specific tooling keywords",
  "Several bullets focus on tasks rather than quantifiable impact",
  "Skills section can be grouped more strategically for ATS scans"
];

const seedRange = (seed: number, min: number, max: number) => {
  const normalized = Math.abs(Math.sin(seed)) % 1;
  return Math.floor(normalized * (max - min + 1)) + min;
};

const hashString = (value: string) => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return hash;
};

const rotate = <T,>(arr: T[], offset: number) => {
  const safeOffset = ((offset % arr.length) + arr.length) % arr.length;
  return [...arr.slice(safeOffset), ...arr.slice(0, safeOffset)];
};

export function generateMockAnalysis(jobInput: string): AnalysisResult {
  const seed = hashString(jobInput || "resume");
  const score = seedRange(seed, 62, 93);
  const probability = Math.min(
    98,
    Math.max(52, Math.round(score * 0.88 + seedRange(seed * 0.3, -8, 8)))
  );

  const rotatedKeywords = rotate(keywordPool, Math.abs(seed) % keywordPool.length);
  const matchedKeywords = rotatedKeywords.slice(0, 6);
  const missingKeywords = rotatedKeywords.slice(6, 10);

  const strengths = rotate(strengthPool, Math.abs(seed * 1.3) % strengthPool.length).slice(0, 3);
  const weaknesses = rotate(weaknessPool, Math.abs(seed * 0.7) % weaknessPool.length).slice(0, 3);

  return {
    score,
    probability,
    strengths,
    weaknesses,
    missingKeywords,
    matchedKeywords
  };
}

export const optimizationSections: OptimizationSection[] = [
  {
    id: "summary",
    title: "Summary Suggestions",
    suggestions: [
      {
        id: "summary-1",
        original:
          "Full-stack developer with 5 years of experience building web apps.",
        optimized:
          "Product-focused full-stack engineer with 5+ years delivering revenue-impacting SaaS features across React, Next.js, and cloud-native services."
      }
    ]
  },
  {
    id: "experience",
    title: "Experience Bullet Rewrite Suggestions",
    suggestions: [
      {
        id: "exp-1",
        original: "Worked on dashboard performance improvements.",
        optimized:
          "Improved dashboard load performance by 41% by introducing route-level code splitting and optimizing API response payloads."
      },
      {
        id: "exp-2",
        original: "Led a migration to newer frontend architecture.",
        optimized:
          "Led migration from legacy SPA to Next.js App Router, reducing release regression incidents by 32% and accelerating delivery cadence."
      }
    ]
  },
  {
    id: "skills",
    title: "Skills Improvement Suggestions",
    suggestions: [
      {
        id: "skills-1",
        original: "JavaScript, React, APIs",
        optimized:
          "TypeScript, React, Next.js, REST/GraphQL APIs, React Hook Form, Zod, Jest, Playwright"
      }
    ]
  },
  {
    id: "keywords",
    title: "Keyword Additions",
    suggestions: [
      {
        id: "kw-1",
        original: "Missing ATS terms: CI/CD, system design",
        optimized:
          "Add ATS-aligned terms: CI/CD pipelines, distributed system design, cloud cost optimization, incident response"
      }
    ]
  }
];

export const initialResumeData: ResumeData = {
  personalInfo: {
    fullName: "Alex Morgan",
    email: "alex.morgan@email.com",
    phone: "+1 (555) 000-1212",
    location: "San Francisco, CA",
    linkedin: "linkedin.com/in/alexmorgan",
    website: "alexmorgan.dev"
  },
  summary:
    "Results-driven software engineer with 5+ years of experience building customer-facing SaaS products and scalable internal platforms.",
  experience: [
    {
      id: "exp-1",
      role: "Senior Software Engineer",
      company: "North Peak Labs",
      location: "Remote",
      startDate: "Jan 2022",
      endDate: "Present",
      description: [
        "Led delivery of workflow automation features used by 45K+ active users.",
        "Reduced page load time by 38% through data-fetching and rendering optimizations.",
        "Partnered with product and design to define quarterly roadmap outcomes."
      ]
    }
  ],
  projects: [
    {
      id: "proj-1",
      name: "Hiring Analytics Platform",
      techStack: "Next.js, TypeScript, PostgreSQL",
      startDate: "2023",
      endDate: "2024",
      link: "https://example.com",
      description: [
        "Designed analytics workflows for recruiter funnel tracking.",
        "Implemented reusable chart components and role-based dashboard views."
      ]
    }
  ],
  skills: {
    technical: ["TypeScript", "React", "Next.js", "Node.js", "SQL"],
    tools: ["GitHub Actions", "Docker", "Figma"],
    soft: ["Mentorship", "Cross-functional collaboration", "Stakeholder communication"]
  },
  education: [
    {
      id: "edu-1",
      institution: "University of California",
      degree: "B.S.",
      field: "Computer Science",
      startDate: "2015",
      endDate: "2019",
      location: "California"
    }
  ],
  certifications: ["AWS Certified Cloud Practitioner"]
};
