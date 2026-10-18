import { createExtraItem } from '@grocs/core';
import { FakeAuth, FakeClock, InMemorySyncStore, SequentialIds } from '@grocs/ports';
import { describe, expect, it } from 'vitest';
import type { Deps } from '../dispatch/types.ts';
import { watchSession, signOut } from './watch-session.ts';
import { watchWeekItems } from './watch-week.ts';

const make = (): Deps => ({
  syncStore: new InMemorySyncStore(),
  auth: new FakeAuth([{ uid: 'u1', email: 'a@grocs.test', displayName: 'A', password: 'pw' }]),
  clock: new FakeClock(),
  ids: new SequentialIds(),
});
const item = (id: string, at: number, deleted = false) => {
  const r = createExtraItem({ id, weekId: 'w', name: id }, { at, by: 'u1' });
  if (!r.ok) throw new Error('setup');
  return deleted ? { ...r.value, deleted: { at: at + 1, by: 'u1' } } : r.value;
};

describe('watchWeekItems', () => {
  it('delivers visible items in the order added, without deleted ones', async () => {
    const deps = make();
    await deps.syncStore.mergeItem('k', item('b', 2));
    await deps.syncStore.mergeItem('k', item('a', 1));
    await deps.syncStore.mergeItem('k', item('gone', 3, true));
    const seen: string[][] = [];
    const stop = watchWeekItems(deps, 'k', 'w', (items) => seen.push(items.map((i) => i.id)));
    await new Promise((r) => setTimeout(r, 10));
    stop();
    expect(seen[seen.length - 1]).toEqual(['a', 'b']);
  });
});

describe('watchSession', () => {
  it('follows sign-in and sign-out', async () => {
    const deps = make();
    const seen: (string | null)[] = [];
    const stop = watchSession(deps, (u) => seen.push(u?.uid ?? null));
    await (deps.auth as FakeAuth).signInWithTestAccount('a@grocs.test', 'pw');
    await signOut(deps);
    await new Promise((r) => setTimeout(r, 10));
    stop();
    expect(seen).toEqual([null, 'u1', null]);
  });
});
