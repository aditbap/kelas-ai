import { describe, it, expect } from 'vitest';

import {
  buildAccessExternalId,
  isAccessExternalId,
  parseAccessExternalId,
} from '@/lib/checkout-external-id';

describe('access externalId', () => {
  it('round-trips a UUID student id (which itself contains hyphens) through build/parse', () => {
    const studentId = 'c4aaf81c-b558-4dcf-ac13-3f6fc3eab863';
    const externalId = buildAccessExternalId(studentId, 'abc-123');
    expect(isAccessExternalId(externalId)).toBe(true);
    expect(parseAccessExternalId(externalId)).toEqual({ studentId });
  });

  it('fails to parse garbage input', () => {
    expect(isAccessExternalId('not-a-real-id')).toBe(false);
    expect(parseAccessExternalId('not-a-real-id')).toBeUndefined();
  });
});
