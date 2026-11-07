import { err, ok } from '../result/result.ts';
import type { Result } from '../result/result.ts';
import { addMember, isKitchenFull } from './kitchen.ts';
import type { Kitchen, KitchenInvite } from './kitchen.ts';

// A kitchen is shared by adding the other person's email (R2, R3, TASK-78). The invite sits on the
// kitchen itself, and the person whose verified sign-in email matches it is offered it the next time
// they open the app. Nothing here looks up whether an email has an account, so adding one tells the
// inviter nothing about who uses Grocs.

/** A loose shape check: something@something.something, no spaces. Google decides what is real. */
const EMAIL_SHAPE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** The one form an email is stored and compared in: trimmed and lower case. */
export function normaliseEmail(raw: string): Result<string, 'invalid-email'> {
  const email = raw.trim().toLowerCase();
  return EMAIL_SHAPE.test(email) ? ok(email) : err('invalid-email');
}

export type InviteByEmailError = 'not-a-member' | 'full' | 'invalid-email' | 'own-email';

export interface InviteByEmailInput {
  readonly kitchen: Kitchen;
  readonly callerUid: string;
  /** The caller's own verified email, or null when their sign-in carries none. */
  readonly callerEmail: string | null;
  readonly email: string;
  readonly now: number;
}

/**
 * A member invites their partner by email. A newer invite replaces the one before it: a kitchen
 * has one open place at most (R3), so it has one invite at most.
 */
export function inviteByEmail(input: InviteByEmailInput): Result<Kitchen, InviteByEmailError> {
  const { kitchen, callerUid, callerEmail, now } = input;
  if (!kitchen.members.includes(callerUid)) return err('not-a-member');
  if (isKitchenFull(kitchen)) return err('full');
  const email = normaliseEmail(input.email);
  if (!email.ok) return email;
  if (callerEmail !== null && email.value === callerEmail.trim().toLowerCase()) return err('own-email');
  const invite: KitchenInvite = { email: email.value, invitedBy: callerUid, createdAt: now };
  return ok({ ...kitchen, invite });
}

/** A member takes the invite back before it is used. */
export function cancelInvite(kitchen: Kitchen, callerUid: string): Result<Kitchen, 'not-a-member'> {
  if (!kitchen.members.includes(callerUid)) return err('not-a-member');
  return ok(withoutInvite(kitchen));
}

/** Whether `kitchen` holds an invite for `email` (a verified sign-in email, or null for none). */
export function isInvitedTo(kitchen: Kitchen, email: string | null): boolean {
  if (email === null || kitchen.invite === undefined) return false;
  return kitchen.invite.email === email.trim().toLowerCase();
}

export type AcceptInviteError = 'not-found' | 'full' | 'already-member';

export interface AcceptInviteInput {
  /** The kitchen the invite is for, as read now - or null when it no longer exists. */
  readonly target: Kitchen | null;
  /** The kitchen the person belongs to now, if any. */
  readonly current: Kitchen | null;
  readonly uid: string;
  readonly name: string;
  /** The person's verified sign-in email, or null when their sign-in carries none. */
  readonly email: string | null;
}

export interface AcceptedInvite {
  /** The invited kitchen with the person added and the invite used up. */
  readonly joined: Kitchen;
  /** The kitchen they left, without them - or null when they had none (R3, TASK-78). */
  readonly left: Kitchen | null;
}

/**
 * The invited person joins. Only someone whose verified email is the one invited can (R4). If they
 * already belong to another kitchen they leave it in the same step; its list and meals stay with it.
 */
export function acceptInvite(input: AcceptInviteInput): Result<AcceptedInvite, AcceptInviteError> {
  const { target, current, uid, name, email } = input;
  if (target === null || !isInvitedTo(target, email)) return err('not-found');
  const added = addMember(withoutInvite(target), uid, name);
  if (!added.ok) return added;
  const left = current !== null && current.id !== target.id ? removeMember(current, uid) : null;
  return ok({ joined: added.value, left });
}

/** The kitchen without `uid` as a member. A kitchen whose last member leaves keeps its data and has no members. */
export function removeMember(kitchen: Kitchen, uid: string): Kitchen {
  const { [uid]: _gone, ...memberNames } = kitchen.memberNames;
  return { ...kitchen, members: kitchen.members.filter((m) => m !== uid), memberNames };
}

function withoutInvite(kitchen: Kitchen): Kitchen {
  const { invite: _used, ...rest } = kitchen;
  return rest;
}
