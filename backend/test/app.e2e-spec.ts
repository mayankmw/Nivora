import { Body, Controller, Get, Post, type INestApplication } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import { Type } from 'class-transformer';
import { IsEmail, IsInt, IsString, Min, ValidateNested } from 'class-validator';
import request from 'supertest';
import type { App } from 'supertest/types.js';
import { AppModule } from './../src/app.module.js';
import { configureApp } from './../src/app.setup.js';

class GuardianDto {
  @IsString()
  phone: string;
}

class CreateSampleDto {
  @IsEmail()
  email: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  age: number;

  @ValidateNested()
  @Type(() => GuardianDto)
  guardian: GuardianDto;
}

// Test-only routes that exercise the global pipe, interceptor and filter
// until real feature modules exist.
@Controller('samples')
class SampleController {
  @Post()
  create(@Body() dto: CreateSampleDto) {
    return { email: dto.email, age: dto.age, ageType: typeof dto.age };
  }

  @Get('crash')
  crash(): never {
    throw new Error('database password is hunter2');
  }
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const validSample = { email: 'rahul@example.com', age: '21', guardian: { phone: '9876543210' } };

describe('App (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
      controllers: [SampleController],
    }).compile();

    app = moduleFixture.createNestApplication({ logger: false });
    configureApp(app);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('health and routing', () => {
    it('GET /api/v1/health returns ok inside the data envelope', async () => {
      const response = await request(app.getHttpServer()).get('/api/v1/health').expect(200);

      expect(response.body).toEqual({
        data: {
          status: 'ok',
          service: 'nivora-api',
          timestamp: expect.any(String),
          uptimeSeconds: expect.any(Number),
        },
      });
    });

    it.each(['/health', '/api/health', '/api/v2/health'])(
      'does not serve %s (only /api/v1 exists)',
      async (path) => {
        await request(app.getHttpServer()).get(path).expect(404);
      },
    );

    it('does not reveal the framework', async () => {
      const response = await request(app.getHttpServer()).get('/api/v1/health');

      expect(response.headers['x-powered-by']).toBeUndefined();
    });
  });

  describe('request IDs', () => {
    it('generates an ID and returns it in the header', async () => {
      const response = await request(app.getHttpServer()).get('/api/v1/health');

      expect(response.headers['x-request-id']).toMatch(UUID);
    });

    it('reuses a safe ID sent by the caller', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/health')
        .set('x-request-id', 'trace-123.abc');

      expect(response.headers['x-request-id']).toBe('trace-123.abc');
    });

    it('replaces an unsafe ID sent by the caller', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/health')
        .set('x-request-id', 'bad id <script>');

      expect(response.headers['x-request-id']).toMatch(UUID);
    });
  });

  describe('error responses', () => {
    it('reports an unknown route in the error envelope', async () => {
      const response = await request(app.getHttpServer()).get('/api/v1/nope').expect(404);

      expect(response.body).toEqual({
        error: { code: 'NOT_FOUND', message: expect.any(String) },
        requestId: response.headers['x-request-id'],
      });
    });

    it('hides the cause of an unexpected error', async () => {
      const response = await request(app.getHttpServer()).get('/api/v1/samples/crash').expect(500);

      expect(response.body.error.code).toBe('INTERNAL_SERVER_ERROR');
      expect(JSON.stringify(response.body)).not.toContain('hunter2');
      expect(response.body.requestId).toBe(response.headers['x-request-id']);
    });

    it('rejects malformed JSON with a 400', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/samples')
        .set('content-type', 'application/json')
        .send('{"email": ')
        .expect(400);

      expect(response.body.error.code).toBe('BAD_REQUEST');
      expect(response.body.requestId).toBe(response.headers['x-request-id']);
    });
  });

  describe('validation', () => {
    it('accepts a valid body and converts it to the DTO types', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/samples')
        .send(validSample)
        .expect(201);

      expect(response.body).toEqual({
        data: { email: 'rahul@example.com', age: 21, ageType: 'number' },
      });
    });

    it('lists every invalid field, including nested ones', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/samples')
        .send({ email: 'not-an-email', age: 0, guardian: { phone: 42 } })
        .expect(400);

      expect(response.body.error.code).toBe('VALIDATION_FAILED');
      expect(response.body.error.details.map((detail: { field: string }) => detail.field)).toEqual([
        'email',
        'age',
        'guardian.phone',
      ]);
    });

    it('rejects properties the DTO does not declare', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/samples')
        .send({ ...validSample, organizationId: 'someone-elses-org' })
        .expect(400);

      expect(response.body.error.details).toEqual([
        { field: 'organizationId', messages: [expect.stringContaining('should not exist')] },
      ]);
    });
  });

  describe('CORS', () => {
    it('allows the configured frontend origin, with credentials', async () => {
      const response = await request(app.getHttpServer())
        .options('/api/v1/health')
        .set('origin', 'http://localhost:5173')
        .set('access-control-request-method', 'GET');

      expect(response.headers['access-control-allow-origin']).toBe('http://localhost:5173');
      expect(response.headers['access-control-allow-credentials']).toBe('true');
    });

    it('lets the browser read the request ID header', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/health')
        .set('origin', 'http://localhost:5173');

      expect(response.headers['access-control-expose-headers']).toContain('x-request-id');
    });

    it('does not allow other origins', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/health')
        .set('origin', 'https://evil.example');

      expect(response.headers['access-control-allow-origin']).toBeUndefined();
    });
  });
});
