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

const keywordFromText = (text: string) =>
  text
    .toLowerCase()
    .split(/[^a-z0-9+#.]+/g)
    .map((value) => value.trim())
    .filter((value) => value.length > 2);

const titleCase = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

const inferJobKeywords = (jobDescription?: string) => {
  if (!jobDescription) {
    return ["CI/CD", "System design", "Cloud platforms", "Testing"];
  }

  const rawTokens = keywordFromText(jobDescription);
  const prioritized = ["typescript", "react", "next.js", "node", "aws", "docker", "kubernetes"];
  const selected = prioritized.filter((token) => rawTokens.includes(token));
  const fallback = rawTokens.slice(0, 6).map(titleCase);
  const merged = [...selected.map(titleCase), ...fallback];
  return Array.from(new Set(merged)).slice(0, 6);
};

export function generateMockOptimizationSections(
  resumeData: ResumeData,
  jobDescription?: string
): OptimizationSection[] {
  const firstExperience = resumeData.experience[0];
  const firstBullet = firstExperience?.description[0] ?? "Contributed to team deliverables.";
  const project = resumeData.projects[0];
  const projectBullet = project?.description[0] ?? "Delivered project features.";
  const inferredKeywords = inferJobKeywords(jobDescription);

  return [
    {
      id: "summary",
      title: "Summary Suggestions",
      suggestions: [
        {
          id: "summary-1",
          original: resumeData.summary,
          optimized:
            `${resumeData.summary} Tailored for roles requiring ${inferredKeywords
              .slice(0, 3)
              .join(", ")} with clear focus on measurable outcomes and cross-functional delivery.`,
          rationale: "Aligns the summary with role-specific priorities and ATS keyword intent.",
          confidence: 0.78,
          target: {
            kind: "summary"
          }
        }
      ]
    },
    {
      id: "experience",
      title: "Experience Bullet Rewrite Suggestions",
      suggestions: [
        {
          id: "exp-1",
          original: firstBullet,
          optimized:
            `${firstBullet} Improved delivery outcomes by introducing structured execution and measurable KPI tracking.`,
          rationale: "Shifts task-oriented language into impact-oriented accomplishments.",
          confidence: 0.73,
          target: {
            kind: "experience-bullet",
            experienceIndex: 0,
            bulletIndex: 0
          }
        },
        {
          id: "proj-1",
          original: projectBullet,
          optimized:
            `${projectBullet} Increased stakeholder visibility through clear roadmap communication and release milestones.`,
          rationale: "Adds leadership and collaboration signal for ATS and recruiter screening.",
          confidence: 0.69,
          target: {
            kind: "project-bullet",
            projectIndex: 0,
            bulletIndex: 0
          }
        }
      ]
    },
    {
      id: "skills",
      title: "Skills Improvement Suggestions",
      suggestions: [
        {
          id: "skills-1",
          original: resumeData.skills.technical.join(", "),
          optimized: Array.from(
            new Set([...resumeData.skills.technical, ...inferredKeywords.slice(0, 4)])
          ).join(", "),
          rationale: "Boosts role alignment by blending existing skills with JD-relevant terms.",
          confidence: 0.75,
          target: {
            kind: "skills",
            category: "technical"
          }
        }
      ]
    },
    {
      id: "keywords",
      title: "Keyword Additions",
      suggestions: [
        {
          id: "kw-1",
          original: "Potentially missing ATS terms",
          optimized: inferredKeywords.join(", "),
          rationale: "Adds terms frequently used in matching job descriptions.",
          confidence: 0.72,
          target: {
            kind: "keywords",
            category: "technical"
          }
        }
      ]
    }
  ];
}

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

export const optimizationSections: OptimizationSection[] = generateMockOptimizationSections(
  initialResumeData
);
