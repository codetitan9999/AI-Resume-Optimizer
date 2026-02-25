export type AnalysisResult = {
  score: number;
  probability: number;
  strengths: string[];
  weaknesses: string[];
  missingKeywords: string[];
  matchedKeywords: string[];
};

export type UploadedFileMeta = {
  name: string;
  size: number;
  type: string;
  lastModified: number;
};
