import { ConsoleLogger, type LogLevel as NestLogLevel } from '@nestjs/common';
import type { AppConfig } from '../../config/app.config.js';
import { LogLevel } from '../../config/env.validation.js';

const LEVELS_BY_VERBOSITY: LogLevel[] = [
  LogLevel.Error,
  LogLevel.Warn,
  LogLevel.Log,
  LogLevel.Debug,
  LogLevel.Verbose,
];

/** LOG_LEVEL=warn prints fatal, error and warn; LOG_LEVEL=debug adds log and debug. */
export function resolveLogLevels(level: LogLevel): NestLogLevel[] {
  const enabled = LEVELS_BY_VERBOSITY.slice(0, LEVELS_BY_VERBOSITY.indexOf(level) + 1);
  return ['fatal', ...enabled];
}

/**
 * Nest's built-in logger: readable, coloured lines in development and one
 * JSON object per line in production, ready for a log collector.
 */
export function createAppLogger(config: AppConfig): ConsoleLogger {
  return new ConsoleLogger({
    prefix: 'Nivora',
    json: config.isProduction,
    colors: !config.isProduction,
    logLevels: resolveLogLevels(config.logLevel),
  });
}
