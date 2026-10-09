import { VersioningType, type INestApplication } from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';
import {
  REQUEST_ID_HEADER,
  requestIdMiddleware,
} from './common/middleware/request-id.middleware.js';
import { requestLoggerMiddleware } from './common/middleware/request-logger.middleware.js';
import { appConfig, type AppConfig } from './config/app.config.js';

export const API_PREFIX = 'api';
export const API_DEFAULT_VERSION = '1';

/**
 * Application-wide HTTP configuration. Shared by main.ts and the e2e tests so
 * both run against the same routes and middleware.
 */
export function configureApp(app: INestApplication): void {
  const config = app.get<AppConfig>(appConfig.KEY);

  // Registered first so every request, including ones that fail before
  // reaching a controller, has an ID and is logged.
  app.use(requestIdMiddleware, requestLoggerMiddleware);

  // Routes are served as /api/v1/...; a controller or handler opts into a
  // newer version with @Version('2').
  app.setGlobalPrefix(API_PREFIX);
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: API_DEFAULT_VERSION });

  app.enableCors({
    origin: config.corsOrigins,
    // The refresh-token cookie will need credentialed requests.
    credentials: true,
    exposedHeaders: [REQUEST_ID_HEADER],
  });

  // Do not advertise the framework.
  (app as NestExpressApplication).disable('x-powered-by');

  app.enableShutdownHooks();
}
