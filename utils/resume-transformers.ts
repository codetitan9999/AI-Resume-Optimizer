import { ResumeBuilderFormValues } from "@/utils/schemas";
import { ResumeData } from "@/types/resume";

const splitLines = (value: string) =>
  value
    .split(/\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);

const joinLines = (values: string[]) => values.join("\n");

const createId = (prefix: string, index: number) => `${prefix}-${index + 1}`;

export function resumeDataToFormValues(data: ResumeData): ResumeBuilderFormValues {
  return {
    personalInfo: data.personalInfo,
    summary: data.summary,
    experience: data.experience.map((item) => ({
      role: item.role,
      company: item.company,
      location: item.location,
      startDate: item.startDate,
      endDate: item.endDate,
      bullets: joinLines(item.description)
    })),
    projects: data.projects.map((item) => ({
      name: item.name,
      techStack: item.techStack,
      startDate: item.startDate,
      endDate: item.endDate,
      link: item.link,
      bullets: joinLines(item.description)
    })),
    skills: {
      technical: data.skills.technical.join(", "),
      tools: data.skills.tools.join(", "),
      soft: data.skills.soft.join(", ")
    },
    education: data.education.map((item) => ({
      institution: item.institution,
      degree: item.degree,
      field: item.field,
      startDate: item.startDate,
      endDate: item.endDate,
      location: item.location
    })),
    certifications: joinLines(data.certifications)
  };
}

export function formValuesToResumeData(values: ResumeBuilderFormValues): ResumeData {
  return {
    personalInfo: {
      fullName: values.personalInfo.fullName,
      email: values.personalInfo.email,
      phone: values.personalInfo.phone ?? "",
      location: values.personalInfo.location ?? "",
      linkedin: values.personalInfo.linkedin ?? "",
      website: values.personalInfo.website ?? ""
    },
    summary: values.summary,
    experience: values.experience.map((item, index) => ({
      id: createId("exp", index),
      role: item.role,
      company: item.company,
      location: item.location ?? "",
      startDate: item.startDate,
      endDate: item.endDate,
      description: splitLines(item.bullets)
    })),
    projects: values.projects.map((item, index) => ({
      id: createId("proj", index),
      name: item.name,
      techStack: item.techStack,
      startDate: item.startDate,
      endDate: item.endDate,
      link: item.link ?? "",
      description: splitLines(item.bullets)
    })),
    skills: {
      technical: splitLines(values.skills.technical),
      tools: splitLines(values.skills.tools),
      soft: splitLines(values.skills.soft)
    },
    education: values.education.map((item, index) => ({
      id: createId("edu", index),
      institution: item.institution,
      degree: item.degree,
      field: item.field,
      startDate: item.startDate,
      endDate: item.endDate,
      location: item.location ?? ""
    })),
    certifications: splitLines(values.certifications ?? "")
  };
}
