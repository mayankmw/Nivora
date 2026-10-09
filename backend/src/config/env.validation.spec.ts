import { Environment, LogLevel, parseCorsOrigins, validateEnv } from './env.validation.js';

describe('validateEnv', () => {
  it('applies defaults when nothing is set', () => {
    const env = validateEnv({});

    expect(env.NODE_ENV).toBe(Environment.Development);
    expect(env.PORT).toBe(3000);
    expect(env.CORS_ORIGINS).toBe('http://localhost:5173');
    expect(env.LOG_LEVEL).toBe(LogLevel.Log);
  });

  it('converts PORT from the string form used in process.env', () => {
    expect(validateEnv({ PORT: '4000' }).PORT).toBe(4000);
  });

  it.each([
    ['a non-numeric port', { PORT: 'abc' }],
    ['a port out of range', { PORT: '70000' }],
    ['an empty port', { PORT: '' }],
    ['an unknown environment', { NODE_ENV: 'staging' }],
    ['an unknown log level', { LOG_LEVEL: 'loud' }],
    ['a wildcard origin', { CORS_ORIGINS: '*' }],
    ['an origin with a path', { CORS_ORIGINS: 'http://localhost:5173/app' }],
    ['an origin without a scheme', { CORS_ORIGINS: 'localhost:5173' }],
    ['an empty origin list', { CORS_ORIGINS: ' , ' }],
  ])('rejects %s', (_label, raw) => {
    expect(() => validateEnv(raw)).toThrow(/Invalid environment configuration/);
  });

  it('reports every problem in one error', () => {
    expect(() => validateEnv({ PORT: 'abc', NODE_ENV: 'staging' })).toThrow(
      /PORT[\s\S]*NODE_ENV|NODE_ENV[\s\S]*PORT/,
    );
  });
});

describe('parseCorsOrigins', () => {
  it('splits a comma-separated list and trims whitespace', () => {
    expect(parseCorsOrigins('http://localhost:5173, https://app.nivora.in ,')).toEqual([
      'http://localhost:5173',
      'https://app.nivora.in',
    ]);
  });
});
