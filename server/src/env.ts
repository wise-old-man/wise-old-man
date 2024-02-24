/**
 * This file has been created as a way to force any usage
 * of process.env to go through a dotenv.config first.
 */
import { z } from 'zod';
import 'dotenv/config';

/**
 * This ensures that an env var is required in prod but optional in dev/test.
 */
function prodOnly<T extends z.ZodTypeAny>(varSchema: T) {
  if (process.env.NODE_ENV === 'production') {
    return varSchema;
  }

  return z.optional(varSchema);
}

const envVariablesSchema = z.object({
  // Prisma Database URL
  CORE_DATABASE_URL: z.string().trim().min(1),
  // Redis Configs
  REDIS_HOST: z.string().trim().min(1),
  REDIS_PORT: z.coerce.number().positive().int(),
  // Node Environment
  NODE_ENV: z.enum(['development', 'production', 'test']),
  // Port for the API to run on
  API_PORT: z.optional(z.coerce.number().positive().int()),
  // Admin Password (For mod+ operations)
  ADMIN_PASSWORD: prodOnly(z.string().trim().min(1)),
  // Sentry (for error tracking)
  API_SENTRY_DSN: prodOnly(z.string().trim().min(1)),
  // Patreon Token (to access their API)
  PATREON_BEARER_TOKEN: prodOnly(z.string().trim().min(1)),
  // Discord Bot API URL (to send events to)
  DISCORD_BOT_API_URL: prodOnly(z.string().trim().min(1).url()),
  // Discord Monitoring Webhooks
  DISCORD_PATREON_WEBHOOK_URL: prodOnly(z.string().trim().min(1).url()),
  DISCORD_MONITORING_WEBHOOK_URL: prodOnly(z.string().trim().min(1).url()),
  // Proxy Configs
  PROXY_LIST: prodOnly(z.string().trim().min(1)),
  PROXY_USER: prodOnly(z.string().trim().min(1)),
  PROXY_PASSWORD: prodOnly(z.string().trim().min(1)),
  PROXY_PORT: prodOnly(z.coerce.number().positive().int()),
  CPU_COUNT: prodOnly(z.coerce.number().positive().int())
});

// This will load env vars from a .env file, type check them,and throw an error
// (interrupting the process) if they're required and missing, or of an invalid type.
try {
  envVariablesSchema.parse(process.env);
} catch (error) {
  const errorPayload = JSON.stringify(error, null, 2);
  throw new Error(`Invalid environment variables. Please check env.ts for more info.\n${errorPayload}`);
}

type EnvSchemaType = z.infer<typeof envVariablesSchema>;

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface ProcessEnv extends EnvSchemaType {}
  }
}

export function getThreadIndex() {
  if (process.env.pm_id === undefined) {
    return null;
  }

  return parseInt(process.env.pm_id, 10);
}
