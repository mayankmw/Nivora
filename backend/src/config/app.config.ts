import { registerAs, type ConfigType } from '@nestjs/config';
import { Environment, parseCorsOrigins, validateEnv } from './env.validation.js';

/**
 * Typed application settings. This factory is the only place that reads
 * process.env; everything else injects the result:
 *
 *   constructor(@Inject(appConfig.KEY) private readonly config: AppConfig) {}
 */
export const appConfig = registerAs('app', () => {
  const env = validateEnv(process.env);

  return {
    environment: env.NODE_ENV,
    isProduction: env.NODE_ENV === Environment.Production,
    port: env.PORT,
    corsOrigins: parseCorsOrigins(env.CORS_ORIGINS),
    logLevel: env.LOG_LEVEL,
  };
});

export type AppConfig = ConfigType<typeof appConfig>;
