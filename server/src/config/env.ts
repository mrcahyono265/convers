import { config } from 'dotenv';
import { z } from 'zod';
import { createModuleLogger } from '../utils/logger';

config();

const log = createModuleLogger('config');

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  PORT: z.coerce.number().int().positive().default(3000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  NVIDIA_API_KEY: z.string().min(1, 'NVIDIA_API_KEY is required'),
  NVIDIA_BASE_URL: z.string().url().default('https://integrate.api.nvidia.com/v1'),
  CORS_ORIGIN: z.string().default('*'),
});

export type Env = z.infer<typeof envSchema>;

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const errors = parsed.error.issues.map(
    issue => `  - ${issue.path.join('.')}: ${issue.message}`
  ).join('\n');

  console.error(`[FATAL] Environment validation failed:\n${errors}`);
  process.exit(1);
}

export const env = parsed.data;

export function validateEnv(): Env {
  log.info(`Environment validated. Mode: ${env.NODE_ENV}`);
  return env;
}
