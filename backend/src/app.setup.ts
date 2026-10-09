import { INestApplication } from '@nestjs/common';

export const API_PREFIX = 'api/v1';

/**
 * Application-wide HTTP configuration. Shared by main.ts and the e2e tests so
 * both run against the same routes.
 */
export function configureApp(app: INestApplication): void {
  app.setGlobalPrefix(API_PREFIX);
  app.enableShutdownHooks();
}
