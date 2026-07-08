import { z } from 'zod';

export const messageSchema = z.object({
  sessionId: z.string().nullable().default(null),
  content: z.string().min(1, 'Content is required'),
  history: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string(),
  })).default([]),
  modelId: z.string().optional(),
});
