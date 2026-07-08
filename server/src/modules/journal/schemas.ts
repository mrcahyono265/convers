import { z } from 'zod';

export const submitSchema = z.object({
  content: z.string().min(1, 'Content is required'),
  prompt: z.string().min(1, 'Prompt is required'),
});
