import { err, ok } from '../result/result.ts';
import type { Result } from '../result/result.ts';

export const KITCHEN_SCHEMA_VERSION = 1;
export const MAX_MEMBERS = 2;

/** A shared kitchen (R2). `members` holds 1 or 2 uids, the creator first. */
export interface Kitchen {
  readonly id: string;
  readonly schemaVersion: typeof KITCHEN_SCHEMA_VERSION;
  readonly name: string;
  readonly members: readonly string[];
  readonly timeZone: string;
  readonly createdAt: number;
}

export interface NewKitchenInput {
  readonly id: string;
  readonly name: string;
  readonly timeZone: string;
  readonly ownerUid: string;
  readonly createdAt: number;
}

export type NewKitchenError = 'empty-name';

/** A signed-in person with no kitchen makes one by giving it a name (R2). They are its first member. */
export function createKitchen(input: NewKitchenInput): Result<Kitchen, NewKitchenError> {
  const name = input.name.trim().replace(/\s+/g, ' ');
  if (name === '') return err('empty-name');
  return ok({
    id: input.id,
    schemaVersion: KITCHEN_SCHEMA_VERSION,
    name,
    members: [input.ownerUid],
    timeZone: input.timeZone,
    createdAt: input.createdAt,
  });
}

export function isKitchenFull(kitchen: Pick<Kitchen, 'members'>): boolean {
  return kitchen.members.length >= MAX_MEMBERS;
}

export type JoinKitchenError = 'full' | 'already-member';

/**
 * Add a second member to a kitchen (R3: at most two members). The caller (the join function)
 * re-reads the kitchen inside the same transaction that calls this, so `kitchen` here is never a
 * stale read: Firestore's transaction retries on conflict, not this function.
 */
export function addMember(kitchen: Kitchen, uid: string): Result<Kitchen, JoinKitchenError> {
  if (kitchen.members.includes(uid)) return err('already-member');
  if (isKitchenFull(kitchen)) return err('full');
  return ok({ ...kitchen, members: [...kitchen.members, uid] });
}
