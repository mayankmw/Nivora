import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { appConfig } from './app.config.js';

/**
 * Loads backend/.env into process.env and exposes the typed config globally.
 * Tests ignore .env so they do not depend on a developer's local settings.
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [appConfig],
      ignoreEnvFile: process.env.NODE_ENV === 'test',
    }),
  ],
})
export class AppConfigModule {}
