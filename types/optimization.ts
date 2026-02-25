export type OptimizationSuggestion = {
  id: string;
  original: string;
  optimized: string;
};

export type OptimizationSection = {
  id: string;
  title: string;
  suggestions: OptimizationSuggestion[];
};
