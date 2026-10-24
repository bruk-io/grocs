import { describe, expect, it } from 'vitest';
import { addMember, createKitchen, isKitchenFull, KITCHEN_SCHEMA_VERSION, MAX_MEMBERS } from './kitchen.ts';
import type { Kitchen } from './kitchen.ts';

const input = {
  id: 'k1',
  name: '  Our   kitchen ',
  timeZone: 'America/New_York',
  ownerUid: 'alex',
  ownerName: 'Alex',
  createdAt: 1000,
};

describe('createKitchen (R2)', () => {
  it('makes a kitchen with one member: its creator', () => {
    const r = createKitchen(input);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.value).toEqual<Kitchen>({
      id: 'k1',
      schemaVersion: KITCHEN_SCHEMA_VERSION,
      name: 'Our kitchen',
      members: ['alex'],
      memberNames: { alex: 'Alex' },
      timeZone: 'America/New_York',
      createdAt: 1000,
    });
  });

  it('trims and collapses whitespace in the name', () => {
    const r = createKitchen({ ...input, name: '  Casa   de   Alex  ' });
    expect(r.ok && r.value.name).toBe('Casa de Alex');
  });

  it('rejects a name with nothing in it', () => {
    expect(createKitchen({ ...input, name: '   ' })).toEqual({ ok: false, error: 'empty-name' });
  });

  it('seeds memberNames with the owner name', () => {
    const r = createKitchen({ ...input, ownerUid: 'sam', ownerName: 'Sam' });
    expect(r.ok && r.value.memberNames).toEqual({ sam: 'Sam' });
  });
});

describe('isKitchenFull / addMember (R3)', () => {
  const kitchen: Kitchen = {
    id: 'k1',
    schemaVersion: KITCHEN_SCHEMA_VERSION,
    name: 'Our kitchen',
    members: ['alex'],
    memberNames: { alex: 'Alex' },
    timeZone: 'America/New_York',
    createdAt: 1000,
  };

  it('is not full with one member, and is full with two', () => {
    expect(isKitchenFull(kitchen)).toBe(false);
    expect(isKitchenFull({ members: ['alex', 'sam'] })).toBe(true);
  });

  it('adds a second member', () => {
    const r = addMember(kitchen, 'sam', 'Sam');
    expect(r.ok).toBe(true);
    expect(r.ok && r.value.members).toEqual(['alex', 'sam']);
  });

  it('adds the joiner name to memberNames without disturbing the owner', () => {
    const r = addMember(kitchen, 'sam', 'Sam');
    expect(r.ok && r.value.memberNames).toEqual({ alex: 'Alex', sam: 'Sam' });
  });

  it('never grows past the max', () => {
    expect(MAX_MEMBERS).toBe(2);
    const full = { ...kitchen, members: ['alex', 'sam'] };
    expect(addMember(full, 'carl', 'Carl')).toEqual({ ok: false, error: 'full' });
  });

  it('rejects a member who already joined', () => {
    expect(addMember(kitchen, 'alex', 'Alex')).toEqual({ ok: false, error: 'already-member' });
  });

  it('checks already-member before full, so the message is specific', () => {
    const full = { ...kitchen, members: ['alex', 'sam'] };
    expect(addMember(full, 'sam', 'Sam')).toEqual({ ok: false, error: 'already-member' });
  });
});
