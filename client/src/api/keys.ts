export const queryKeys = {
  dashboard: {
    metrics: ['dashboardMetrics'] as const,
  },
  vocabulary: {
    all: ['vocabulary'] as const,
  },
  journal: {
    prompt: ['journalPrompt'] as const,
  },
} as const;
