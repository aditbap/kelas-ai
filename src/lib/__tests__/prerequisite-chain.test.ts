import { describe, expect, it } from 'vitest';

import { wouldCreatePrerequisiteCycle } from '@/lib/prerequisite-chain';

/** Builds a lookup over a plain `module -> its prerequisite` map. */
function lookup(chain: Record<string, string | null>) {
  return async (id: string) => chain[id] ?? null;
}

describe('wouldCreatePrerequisiteCycle', () => {
  it('rejects a module requiring itself', async () => {
    expect(await wouldCreatePrerequisiteCycle('a', 'a', lookup({}))).toBe(true);
  });

  it('allows an unrelated module as a prerequisite', async () => {
    expect(await wouldCreatePrerequisiteCycle('a', 'b', lookup({ b: null }))).toBe(false);
  });

  it('rejects a direct two-module cycle (B already requires A)', async () => {
    expect(await wouldCreatePrerequisiteCycle('a', 'b', lookup({ b: 'a' }))).toBe(true);
  });

  it('rejects an indirect cycle further up the chain (C -> B -> A)', async () => {
    expect(await wouldCreatePrerequisiteCycle('a', 'c', lookup({ c: 'b', b: 'a' }))).toBe(true);
  });

  it('allows a deep chain that never leads back', async () => {
    expect(await wouldCreatePrerequisiteCycle('a', 'd', lookup({ d: 'c', c: 'b', b: null }))).toBe(
      false,
    );
  });

  it('terminates on pre-existing bad data that loops without touching the module', async () => {
    // b -> c -> b is already circular and does not involve `a`; the walk must
    // return rather than spin forever.
    expect(await wouldCreatePrerequisiteCycle('a', 'b', lookup({ b: 'c', c: 'b' }))).toBe(false);
  });
});
