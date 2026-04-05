export type OptimizationSuggestion = {
  id: string;
  original: string;
  optimized: string;
  rationale?: string;
  confidence?: number;
  target?: OptimizationTarget;
};

export type OptimizationSection = {
  id: string;
  title: string;
  suggestions: OptimizationSuggestion[];
};

export type OptimizationTarget =
  | {
      kind: "summary";
    }
  | {
      kind: "experience-bullet";
      experienceIndex: number;
      bulletIndex: number;
    }
  | {
      kind: "project-bullet";
      projectIndex: number;
      bulletIndex: number;
    }
  | {
      kind: "skills";
      category: "technical" | "tools" | "soft";
    }
  | {
      kind: "keywords";
      category: "technical" | "tools" | "soft";
    };

export type OptimizationContext = {
  source: "ai" | "mock";
  mode: "general" | "jd-aligned";
  jobDescription?: string;
  jobSource?: "url" | "text";
  jobUrl?: string;
};
