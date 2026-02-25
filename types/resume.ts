export type PersonalInfo = {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  website: string;
};

export type ExperienceItem = {
  id: string;
  role: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  description: string[];
};

export type ProjectItem = {
  id: string;
  name: string;
  techStack: string;
  startDate: string;
  endDate: string;
  link: string;
  description: string[];
};

export type EducationItem = {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  location: string;
};

export type SkillsData = {
  technical: string[];
  tools: string[];
  soft: string[];
};

export type ResumeData = {
  personalInfo: PersonalInfo;
  summary: string;
  experience: ExperienceItem[];
  projects: ProjectItem[];
  skills: SkillsData;
  education: EducationItem[];
  certifications: string[];
};
