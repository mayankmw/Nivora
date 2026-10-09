// class-transformer's @Type needs the Reflect metadata API; load it here so this
// file also works when imported on its own (for example in unit tests).
import 'reflect-metadata';
import { plainToInstance, Type } from 'class-transformer';
import { IsEnum, IsInt, IsNotEmpty, IsString, Max, Min, validateSync } from 'class-validator';

export enum Environment {
  Development = 'development',
  Test = 'test',
  Production = 'production',
}

/** Ordered from least to most verbose. */
export enum LogLevel {
  Error = 'error',
  Warn = 'warn',
  Log = 'log',
  Debug = 'debug',
  Verbose = 'verbose',
}

/**
 * Every environment variable the API reads, with its type and default.
 * Add new variables here and to .env.example.
 */
export class EnvironmentVariables {
  @IsEnum(Environment)
  NODE_ENV: Environment = Environment.Development;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(65535)
  PORT: number = 3000;

  @IsString()
  @IsNotEmpty()
  CORS_ORIGINS: string = 'http://localhost:5173';

  @IsEnum(LogLevel)
  LOG_LEVEL: LogLevel = LogLevel.Log;
}

export function parseCorsOrigins(value: string): string[] {
  return value
    .split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);
}

/** True for values like "https://app.example.com" or "http://localhost:5173". */
function isHttpOrigin(value: string): boolean {
  try {
    const url = new URL(value);
    return (url.protocol === 'http:' || url.protocol === 'https:') && url.origin === value;
  } catch {
    return false;
  }
}

/**
 * Parses and validates raw environment variables. Throws one error listing
 * every problem, so a misconfigured deployment fails at startup, not at runtime.
 */
export function validateEnv(raw: Record<string, unknown>): EnvironmentVariables {
  const env = plainToInstance(EnvironmentVariables, raw);

  const problems = validateSync(env, { skipMissingProperties: false }).flatMap((error) =>
    Object.values(error.constraints ?? {}),
  );

  if (typeof env.CORS_ORIGINS === 'string') {
    const origins = parseCorsOrigins(env.CORS_ORIGINS);
    if (origins.length === 0) {
      problems.push('CORS_ORIGINS must list at least one origin');
    }
    for (const origin of origins.filter((value) => !isHttpOrigin(value))) {
      problems.push(
        `CORS_ORIGINS entry "${origin}" must be an http(s) origin with no path, such as http://localhost:5173`,
      );
    }
  }

  if (problems.length > 0) {
    throw new Error(
      `Invalid environment configuration:\n${problems.map((problem) => `  - ${problem}`).join('\n')}`,
    );
  }

  return env;
}
