import { z } from 'zod';

// Define environment schema
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

// Validate environment variables
export const env = envSchema.parse(process.env);

export type Env = z.infer<typeof envSchema>;