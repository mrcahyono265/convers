import { z } from 'zod';

export const practiceSchema = z.object({
  sentence: z.string().min(1, 'Sentence is required'),
});
