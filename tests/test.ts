import { describe, it, expect } from 'vitest';
import { createTinyThreeSite } from '../src/index';

it('exports createTinyThreeSite', () => {
  expect(typeof createTinyThreeSite).toBe('function');
});
