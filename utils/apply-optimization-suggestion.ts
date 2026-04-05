import { OptimizationSuggestion } from "@/types/optimization";
import { ResumeData } from "@/types/resume";

const splitSkillList = (value: string) =>
  value
    .split(/\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);

export function applyOptimizationSuggestion(
  resumeData: ResumeData,
  suggestion: OptimizationSuggestion
): ResumeData {
  if (!suggestion.target) {
    return resumeData;
  }

  const next: ResumeData = {
    ...resumeData,
    experience: resumeData.experience.map((item) => ({
      ...item,
      description: [...item.description]
    })),
    projects: resumeData.projects.map((item) => ({
      ...item,
      description: [...item.description]
    })),
    skills: {
      technical: [...resumeData.skills.technical],
      tools: [...resumeData.skills.tools],
      soft: [...resumeData.skills.soft]
    },
    education: [...resumeData.education],
    certifications: [...resumeData.certifications]
  };

  switch (suggestion.target.kind) {
    case "summary": {
      next.summary = suggestion.optimized;
      return next;
    }

    case "experience-bullet": {
      const { experienceIndex, bulletIndex } = suggestion.target;
      const role = next.experience[experienceIndex];
      if (!role) {
        return resumeData;
      }

      if (bulletIndex >= role.description.length) {
        role.description.push(suggestion.optimized);
      } else {
        role.description[bulletIndex] = suggestion.optimized;
      }
      return next;
    }

    case "project-bullet": {
      const { projectIndex, bulletIndex } = suggestion.target;
      const project = next.projects[projectIndex];
      if (!project) {
        return resumeData;
      }

      if (bulletIndex >= project.description.length) {
        project.description.push(suggestion.optimized);
      } else {
        project.description[bulletIndex] = suggestion.optimized;
      }
      return next;
    }

    case "skills": {
      const values = splitSkillList(suggestion.optimized);
      next.skills[suggestion.target.category] = values;
      return next;
    }

    case "keywords": {
      const keywordValues = splitSkillList(suggestion.optimized);
      const category = suggestion.target.category;
      const deduped = new Set(next.skills[category]);
      for (const keyword of keywordValues) {
        deduped.add(keyword);
      }
      next.skills[category] = Array.from(deduped);
      return next;
    }

    default:
      return resumeData;
  }
}
