import { ConflictException, HttpStatus, NotFoundException } from '@nestjs/common';
import { AppException } from '../errors/app.exception.js';
import { resolveError } from './all-exceptions.filter.js';

describe('resolveError', () => {
  it('keeps the code, message and details of an AppException', () => {
    const details = [{ field: 'bedId', messages: ['bed is occupied'] }];
    const exception = new AppException(
      'BED_ALREADY_OCCUPIED',
      'This bed is already occupied',
      HttpStatus.CONFLICT,
      details,
    );

    expect(resolveError(exception)).toEqual({
      status: 409,
      body: { code: 'BED_ALREADY_OCCUPIED', message: 'This bed is already occupied', details },
    });
  });

  it('omits details when an AppException has none', () => {
    const exception = new AppException('SOME_CODE', 'Something', HttpStatus.BAD_REQUEST);

    expect(resolveError(exception).body).not.toHaveProperty('details');
  });

  it('derives the code of a plain HttpException from its status', () => {
    expect(resolveError(new NotFoundException('Student not found'))).toEqual({
      status: 404,
      body: { code: 'NOT_FOUND', message: 'Student not found' },
    });
    expect(resolveError(new ConflictException()).body.code).toBe('CONFLICT');
  });

  it('hides the details of an unexpected error', () => {
    const resolved = resolveError(new Error('connect ECONNREFUSED 10.0.0.5:5432'));

    expect(resolved.status).toBe(500);
    expect(resolved.body.code).toBe('INTERNAL_SERVER_ERROR');
    expect(resolved.body.message).not.toContain('ECONNREFUSED');
  });

  it('treats a thrown non-error value as an unexpected error', () => {
    expect(resolveError('boom').status).toBe(500);
  });
});
