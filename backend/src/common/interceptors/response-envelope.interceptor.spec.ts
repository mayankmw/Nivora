import { StreamableFile } from '@nestjs/common';
import { PaginatedResult } from '../http/api-response.js';
import { toEnvelope } from './response-envelope.interceptor.js';

describe('toEnvelope', () => {
  it('wraps an object in data', () => {
    expect(toEnvelope({ id: 1 })).toEqual({ data: { id: 1 } });
  });

  it('wraps arrays, primitives and null in data', () => {
    expect(toEnvelope([1, 2])).toEqual({ data: [1, 2] });
    expect(toEnvelope('ok')).toEqual({ data: 'ok' });
    expect(toEnvelope(null)).toEqual({ data: null });
  });

  it('puts pagination details in meta', () => {
    const result = new PaginatedResult([{ id: 1 }], { page: 2, limit: 20, total: 21 });

    expect(toEnvelope(result)).toEqual({
      data: [{ id: 1 }],
      meta: { page: 2, limit: 20, total: 21 },
    });
  });

  it('leaves empty responses and file downloads untouched', () => {
    const file = new StreamableFile(Buffer.from('pdf'));

    expect(toEnvelope(undefined)).toBeUndefined();
    expect(toEnvelope(file)).toBe(file);
  });
});
