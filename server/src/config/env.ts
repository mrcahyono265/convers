import { config } from 'dotenv';

config();

export const env = {
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  PORT: parseInt(process.env.PORT || '3000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  NVIDIA_API_KEY: process.env.NVIDIA_API_KEY,
  NVIDIA_BASE_URL: process.env.NVIDIA_BASE_URL || 'https://integrate.api.nvidia.com/v1',
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
};

const REQUIRED = ['DATABASE_URL', 'JWT_SECRET', 'NVIDIA_API_KEY'] as const;

export function validateEnv(): void {
  const missing: string[] = [];

  for (const key of REQUIRED) {
    if (!process.env[key]) {
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    console.error(`[FATAL] Missing required environment variables:\n  ${missing.join('\n  ')}\n\nCreate a .env file in server/ or set them in the environment.`);
    process.exit(1);
  }

  console.log(`[Config] Environment validated. Mode: ${env.NODE_ENV}`);
}
