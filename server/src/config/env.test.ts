import { describe, it, expect } from 'vitest';
import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(32),
  PORT: z.coerce.number().int().positive().default(3000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  NVIDIA_API_KEY: z.string().min(1),
  NVIDIA_BASE_URL: z.string().url().default('https://integrate.api.nvidia.com/v1'),
  CORS_ORIGIN: z.string().default('*'),
});

describe('Environment Schema', () => {
  it('validates a complete environment', () => {
    const result = envSchema.safeParse({
      DATABASE_URL: 'postgresql://localhost:5432/db',
      JWT_SECRET: 'a'.repeat(32),
      NVIDIA_API_KEY: 'nvapi-test',
    });
    expect(result.success).toBe(true);
  });

  it('requires DATABASE_URL', () => {
    const result = envSchema.safeParse({
      JWT_SECRET: 'a'.repeat(32),
      NVIDIA_API_KEY: 'nvapi-test',
    });
    expect(result.success).toBe(false);
  });

  it('requires JWT_SECRET to be at least 32 characters', () => {
    const result = envSchema.safeParse({
      DATABASE_URL: 'postgresql://localhost:5432/db',
      JWT_SECRET: 'short',
      NVIDIA_API_KEY: 'nvapi-test',
    });
    expect(result.success).toBe(false);
  });

  it('provides default values', () => {
    const result = envSchema.safeParse({
      DATABASE_URL: 'postgresql://localhost:5432/db',
      JWT_SECRET: 'a'.repeat(32),
      NVIDIA_API_KEY: 'nvapi-test',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.PORT).toBe(3000);
      expect(result.data.NODE_ENV).toBe('development');
      expect(result.data.NVIDIA_BASE_URL).toBe('https://integrate.api.nvidia.com/v1');
    }
  });

  it('rejects invalid NODE_ENV', () => {
    const result = envSchema.safeParse({
      DATABASE_URL: 'postgresql://localhost:5432/db',
      JWT_SECRET: 'a'.repeat(32),
      NVIDIA_API_KEY: 'nvapi-test',
      NODE_ENV: 'invalid',
    });
    expect(result.success).toBe(false);
  });

  it('coerces PORT to number', () => {
    const result = envSchema.safeParse({
      DATABASE_URL: 'postgresql://localhost:5432/db',
      JWT_SECRET: 'a'.repeat(32),
      NVIDIA_API_KEY: 'nvapi-test',
      PORT: '4000',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.PORT).toBe(4000);
    }
  });
});
