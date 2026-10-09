import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { API_DEFAULT_VERSION, API_PREFIX, configureApp } from './app.setup.js';
import { createAppLogger } from './common/logging/app-logger.js';
import { appConfig, type AppConfig } from './config/app.config.js';

async function bootstrap() {
  // Hold start-up logs until the configured logger is in place.
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const config = app.get<AppConfig>(appConfig.KEY);

  app.useLogger(createAppLogger(config));
  configureApp(app);

  await app.listen(config.port);

  new Logger('Bootstrap').log(
    `API listening on http://localhost:${config.port}/${API_PREFIX}/v${API_DEFAULT_VERSION} (${config.environment})`,
  );
}
await bootstrap();
