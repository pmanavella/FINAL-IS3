import { test, expect } from 'vitest';
import * as API from '../api'; // tu API real

test('API exporta funciones', () => {
  expect(API).toHaveProperty('list');
  expect(API).toHaveProperty('create');
  expect(API).toHaveProperty('update');
  expect(API).toHaveProperty('remove');
});
