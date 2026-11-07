import { err, ok } from '../result/result.ts';
import type { Result } from '../result/result.ts';

/** Real mushroom names, short enough to read aloud and type back (R2's "short invite code"). */
const INVITE_WORDS = [
  'MOREL', 'PORCINI', 'SHIITAKE', 'CREMINI', 'ENOKI', 'OYSTER', 'MAITAKE', 'TRUFFLE',
  'BUTTON', 'HONEY', 'PUFFBALL', 'BOLETE', 'REISHI', 'HEDGEHOG', 'CHICKEN', 'INKCAP',
  'PARASOL', 'RUSSULA', 'MILKCAP', 'CORAL', 'TURKEY', 'BIRCH', 'SAFFRON', 'VELVET',
  'STRAW', 'WINTER', 'KING', 'PINE', 'ELM', 'CLOUD', 'JELLY', 'FAIRY', 'WAX', 'CHANTY',
] as const;

export const INVITE_CODE_PATTERN = /^[A-Z]+-\d{4}$/;
export const INVITE_LIFETIME_MS = 24 * 60 * 60 * 1000; // 1 day

/**
 * A short, human-typeable invite code (R2) derived from an opaque random id (the ids port, R28):
 * the same id always gives the same code, so generation needs nothing new injected into the join
 * function beyond what it already has. 34 words x 10,000 numbers is ~340,000 codes - still typeable,
 * but wide enough that guessing one before its 1-day expiry, against an otherwise-unthrottled
 * joinKitchen, is not the first thing worth attacking (R3: "a third person can't"). The caller
 * (KitchenStore.createKitchen) still retries on the rare collision - this makes a collision
 * unlikely, not impossible.
 */
export function inviteCodeFromId(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  const word = INVITE_WORDS[hash % INVITE_WORDS.length]!;
  const num = Math.floor(hash / INVITE_WORDS.length) % 10_000;
  return `${word}-${String(num).padStart(4, '0')}`;
}

export function isInviteExpired(createdAt: number, now: number): boolean {
  return now - createdAt > INVITE_LIFETIME_MS;
}

export interface InviteRecord {
  readonly code: string;
  readonly kitchenId: string;
  readonly createdAt: number;
  readonly status: 'pending' | 'used';
}

export type InviteCheckError = 'not-found' | 'expired' | 'used';

/**
 * Whether an invite may be used right now (R3: "an invalid, expired or already-used invite shows
 * an inline error"). Pure and read-only: the join function still re-checks the kitchen itself
 * (full, already a member) inside the same transaction, since whether a second member fits is a
 * fact about the kitchen, not the invite.
 */
export function checkInvite(invite: InviteRecord | null, now: number): Result<InviteRecord, InviteCheckError> {
  if (!invite) return err('not-found');
  if (invite.status === 'used') return err('used');
  if (isInviteExpired(invite.createdAt, now)) return err('expired');
  return ok(invite);
}

/** When an invite made at `createdAt` stops working (R3). */
export function inviteExpiresAt(createdAt: number): number {
  return createdAt + INVITE_LIFETIME_MS;
}

/**
 * The invite a member should share for their kitchen (TASK-56): the newest one still pending and
 * unexpired, or null when there is none and a fresh one has to be issued. Reusing it means asking
 * twice gives the partner one code, not two that both work.
 */
export function inviteToReuse(invites: readonly InviteRecord[], now: number): InviteRecord | null {
  const usable = invites.filter((i) => checkInvite(i, now).ok);
  return usable.reduce<InviteRecord | null>((newest, i) => (newest === null || i.createdAt > newest.createdAt ? i : newest), null);
}

/** What a joiner sees before joining: who invited them, and to which kitchen (TASK-70). */
export interface InvitePreview {
  readonly inviter: string;
  readonly kitchen: string;
}

/**
 * The preview for an invite, or null when it would not let anyone in: unknown, used, expired, or a
 * kitchen already full. The names come from the kitchen itself, never from the link. A kitchen with
 * room has one member, who is the person inviting.
 */
export function invitePreview(
  invite: InviteRecord | null,
  kitchen: { readonly name: string; readonly members: readonly string[]; readonly memberNames: Readonly<Record<string, string>> } | null,
  now: number,
  maxMembers: number,
): InvitePreview | null {
  if (!kitchen || !checkInvite(invite, now).ok || kitchen.members.length >= maxMembers) return null;
  const owner = kitchen.members[0];
  return { inviter: (owner && kitchen.memberNames[owner]) || 'Your partner', kitchen: kitchen.name };
}
