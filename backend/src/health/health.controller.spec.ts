import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller.js';

describe('HealthController', () => {
  let controller: HealthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
    }).compile();

    controller = module.get(HealthController);
  });

  it('reports the service as ok', () => {
    const result = controller.check();

    expect(result.status).toBe('ok');
    expect(result.service).toBe('nivora-api');
    expect(Number.isNaN(Date.parse(result.timestamp))).toBe(false);
    expect(result.uptimeSeconds).toBeGreaterThanOrEqual(0);
  });
});
