/**
 * This file has been created as a way to force any usage
 * of process.env to go through a dotenv.config first.
 */
import 'dotenv/config';
import { z } from 'zod';

export enum ServerType {
  DEV = 'dev',
  API = 'api',
  JOB_RUNNER = 'job-runner',
  BULL_BOARD = 'bull-board'
}

const envVariablesSchema = z.object({
  // Prisma Database URL
  CORE_DATABASE_URL: z.string().trim().min(1),
  // Redis Configs
  REDIS_HOST: z.string().trim().min(1),
  REDIS_PASSWORD: z.string().trim().min(1),
  REDIS_PORT: z.coerce.number().positive().int(),
  // Node Environment
  NODE_ENV: z.enum(['development', 'production', 'test']),
  // Service Name (which runtime service is running)
  SERVER_TYPE: z.nativeEnum(ServerType),
  // Port for the API to run on
  API_PORT: z.optional(z.coerce.number().positive().int()),
  // Admin Password (For mod+ operations)
  ADMIN_PASSWORD: z.string().trim().min(1),
  // Sentry (for error tracking)
  API_SENTRY_DSN: z.string().trim().min(1),
  // Patreon Token (to access their API)
  PATREON_BEARER_TOKEN: z.string().trim().min(1),
  // Discord Bot API URL (to send events to)
  DISCORD_BOT_API_URL: z.string().trim().min(1).url(),
  // Our Prometheus metrics aggregator service URL
  PROMETHEUS_METRICS_SERVICE_URL: z.string().trim().min(1).url(),
  // Discord Monitoring Webhooks
  DISCORD_PATREON_WEBHOOK_URL: z.string().trim().min(1).url(),
  // Openai API Key
  OPENAI_API_KEY: z.string().trim().min(1).startsWith('sk-'),
  // Abuse Protection Configs
  API_ABUSE_PROTECTED_PLAYERS_LIST: z.optional(z.string().trim()),
  // Feature Flags
  API_FEATURE_FLAG_MULTI_METRIC_COMPETITIONS: z.optional(z.string())
});

type EnvKey = keyof typeof envVariablesSchema.shape;

const REQUIRED_VARS_BY_SERVER_TYPE: Record<ServerType, EnvKey[]> = {
  [ServerType.API]: [
    'CORE_DATABASE_URL',
    'REDIS_HOST',
    'REDIS_PORT',
    'REDIS_PASSWORD',
    'PROMETHEUS_METRICS_SERVICE_URL',
    'ADMIN_PASSWORD',
    'API_SENTRY_DSN',
    'API_FEATURE_FLAG_MULTI_METRIC_COMPETITIONS'
  ],
  [ServerType.JOB_RUNNER]: [
    'CORE_DATABASE_URL',
    'REDIS_PORT',
    'REDIS_HOST',
    'REDIS_PASSWORD',
    'PROMETHEUS_METRICS_SERVICE_URL',
    'DISCORD_BOT_API_URL',
    'PATREON_BEARER_TOKEN',
    'DISCORD_PATREON_WEBHOOK_URL',
    'OPENAI_API_KEY',
    'API_ABUSE_PROTECTED_PLAYERS_LIST'
  ],
  [ServerType.BULL_BOARD]: [
    //
    'REDIS_PORT',
    'REDIS_HOST',
    'REDIS_PASSWORD'
  ],
  [ServerType.DEV]: [
    //
    'CORE_DATABASE_URL',
    'REDIS_PORT',
    'REDIS_HOST',
    'REDIS_PASSWORD',
    'ADMIN_PASSWORD'
  ]
};

// This will load env vars from a .env file, type check them, and throw an error
// (interrupting the process) if they're required and missing, or of an invalid type.
try {
  const serverType = envVariablesSchema.pick({ SERVER_TYPE: true }).parse(process.env).SERVER_TYPE;

  const mask = {
    // Implicit vars to validate
    NODE_ENV: true,
    SERVER_TYPE: true,
    // Server type specific vars to validate
    ...Object.fromEntries(REQUIRED_VARS_BY_SERVER_TYPE[serverType].map(k => [k, true]))
  } as { [K in EnvKey]?: true };

  envVariablesSchema.pick(mask).parse(process.env);
} catch (error) {
  const errorPayload = JSON.stringify(error, null, 2);
  throw new Error(`Invalid environment variables. Please check env.ts for more info.\n${errorPayload}`);
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface ProcessEnv extends z.infer<typeof envVariablesSchema> {}
  }
}

export function getThreadIndex() {
  if (process.env.pm_id === undefined) {
    return null;
  }

  return parseInt(process.env.pm_id, 10);
}
