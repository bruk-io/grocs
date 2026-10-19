import { err, ok } from '../result/result.ts';
import type { Result } from '../result/result.ts';

/** Real mushroom names, short enough to read aloud and type back (R2's "short invite code"). */
const INVITE_WORDS = [
  'MOREL', 'PORCINI', 'SHIITAKE', 'CREMINI', 'ENOKI', 'OYSTER', 'MAITAKE', 'TRUFFLE',
  'BUTTON', 'HONEY', 'PUFFBALL', 'BOLETE', 'REISHI', 'HEDGEHOG', 'CHICKEN', 'INKCAP',
  'PARASOL', 'RUSSULA', 'MILKCAP', 'CORAL', 'TURKEY', 'BIRCH', 'SAFFRON', 'VELVET',
  'STRAW', 'WINTER', 'KING', 'PINE', 'ELM', 'CLOUD', 'JELLY', 'FAIRY', 'WAX', 'CHANTY',
] as const;

export const INVITE_CODE_PATTERN = /^[A-Z]+-\d{2}$/;
export const INVITE_LIFETIME_MS = 24 * 60 * 60 * 1000; // 1 day

/**
 * A short, human-typeable invite code (R2) derived from an opaque random id (the ids port, R28):
 * the same id always gives the same code, so generation needs nothing new injected into the join
 * function beyond what it already has. The code is not a secret on its own - expiry and single use
 * are what keep a guess from mattering (R3), the same way a short URL token works.
 */
export function inviteCodeFromId(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  const word = INVITE_WORDS[hash % INVITE_WORDS.length]!;
  const num = Math.floor(hash / INVITE_WORDS.length) % 100;
  return `${word}-${String(num).padStart(2, '0')}`;
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
