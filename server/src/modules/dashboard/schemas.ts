import { z } from 'zod';

export const saveProgressSchema = z.object({
  minutes: z.coerce.number().int().min(0).default(0),
  averageConfidence: z.coerce.number().int().min(0).max(100).default(0),
  wpm: z.coerce.number().int().min(0).default(0),
});
