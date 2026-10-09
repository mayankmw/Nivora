import { LogLevel } from '../../config/env.validation.js';
import { resolveLogLevels } from './app-logger.js';

describe('resolveLogLevels', () => {
  it('enables the chosen level and everything more severe', () => {
    expect(resolveLogLevels(LogLevel.Error)).toEqual(['fatal', 'error']);
    expect(resolveLogLevels(LogLevel.Log)).toEqual(['fatal', 'error', 'warn', 'log']);
    expect(resolveLogLevels(LogLevel.Verbose)).toEqual([
      'fatal',
      'error',
      'warn',
      'log',
      'debug',
      'verbose',
    ]);
  });
});
