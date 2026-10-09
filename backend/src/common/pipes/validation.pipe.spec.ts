import type { ValidationError } from '@nestjs/common';
import { toErrorDetails } from './validation.pipe.js';

describe('toErrorDetails', () => {
  it('lists the messages of each invalid field', () => {
    const errors: ValidationError[] = [
      { property: 'email', constraints: { isEmail: 'email must be an email' } },
      {
        property: 'name',
        constraints: { isString: 'name must be a string', minLength: 'name is too short' },
      },
    ];

    expect(toErrorDetails(errors)).toEqual([
      { field: 'email', messages: ['email must be an email'] },
      { field: 'name', messages: ['name must be a string', 'name is too short'] },
    ]);
  });

  it('uses a dot path for nested fields', () => {
    const errors: ValidationError[] = [
      {
        property: 'guardian',
        children: [{ property: 'phone', constraints: { isString: 'phone must be a string' } }],
      },
    ];

    expect(toErrorDetails(errors)).toEqual([
      { field: 'guardian.phone', messages: ['phone must be a string'] },
    ]);
  });
});
