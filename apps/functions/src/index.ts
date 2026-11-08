// Cloud Functions, the server's composition root (R26). Kitchen creation, inviting by email and
// joining go through here (R2, R3): they need a connection anyway, and the server is the only place
// that can match an invite to the verified email on a person's sign-in without letting them read
// other kitchens (firebase/firestore.rules denies a direct write to kitchens/{kitchenId} for exactly
// this reason).
import { randomUUID } from 'node:crypto';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { HttpsError, onCall } from 'firebase-functions/v2/https';
import { info } from 'firebase-functions/logger';
import { createLiveFetchPage, FirestoreRecipeCache, importRecipeOnServer, KitchenStore, NotAMemberError } from '@grocs/providers-server';
import type { Caller } from '@grocs/providers-server';
import type { CallableRequest } from 'firebase-functions/v2/https';

initializeApp();

function store(): KitchenStore {
  return new KitchenStore(getFirestore(), randomUUID);
}

function requireUid(request: CallableRequest): string {
  if (!request.auth) throw new HttpsError('unauthenticated', 'sign in first');
  return request.auth.uid;
}

/** The caller's display name from their ID token, when the identity provider or account supplies one. */
function callerName(request: CallableRequest): string {
  const name = request.auth?.token['name'];
  return typeof name === 'string' ? name : '';
}

/**
 * The caller as the kitchen store needs them. The email is taken only from the verified ID token, and
 * only when the token says it is verified (TASK-78): an email the phone sends is never trusted.
 */
function caller(request: CallableRequest): Caller {
  const uid = requireUid(request);
  const token = request.auth!.token;
  const email = typeof token['email'] === 'string' && token['email_verified'] === true ? token['email'] : null;
  return { uid, name: callerName(request), email };
}

/** NotAMemberError reaches the phone as permission-denied; anything else as onCall's generic internal error. */
async function asMember<T>(work: () => Promise<T>): Promise<T> {
  try {
    return await work();
  } catch (error) {
    if (error instanceof NotAMemberError) throw new HttpsError('permission-denied', 'not a member of this kitchen');
    throw error;
  }
}

function requireString(data: unknown, field: string): string {
  const value = (data as Record<string, unknown> | null)?.[field];
  if (typeof value !== 'string' || value.trim() === '') throw new HttpsError('invalid-argument', `${field} is required`);
  return value;
}

export const createKitchen = onCall(async (request) => {
  const ownerUid = requireUid(request);
  // requireString already rejects a blank name, so createKitchen's own empty-name check never
  // fires here - nothing left to catch and translate. An unexpected failure (Firestore, say)
  // reaches the caller as onCall's own safe default: a generic "internal" error, logged server
  // side with the real message, as the functions below rely on too.
  const name = requireString(request.data, 'name');
  const timeZone = requireString(request.data, 'timeZone');
  return store().createKitchen(name, timeZone, ownerUid, callerName(request));
});

/** Invites the caller's partner by email to the caller's kitchen (TASK-78). */
export const inviteByEmail = onCall(async (request) => {
  const who = caller(request);
  const kitchenId = requireString(request.data, 'kitchenId');
  // Any string, blank included: whether it is an email is core's call, answered as 'invalid-email'.
  const raw = (request.data as Record<string, unknown> | null)?.['email'];
  const email = typeof raw === 'string' ? raw : '';
  return asMember(() => store().inviteByEmail(kitchenId, email, who));
});

/** Takes back the kitchen's invite. */
export const cancelInvite = onCall(async (request) => {
  const uid = requireUid(request);
  const kitchenId = requireString(request.data, 'kitchenId');
  await asMember(() => store().cancelInvite(kitchenId, uid));
  return null;
});

/** The invites waiting for the caller's verified email. */
export const invitesForMe = onCall(async (request) => store().invitesFor(caller(request)));

/** Joins the kitchen that invited the caller, leaving the one they were in (R3, TASK-78). */
export const acceptInvite = onCall(async (request) => {
  const who = caller(request);
  const kitchenId = requireString(request.data, 'kitchenId');
  return store().acceptInvite(kitchenId, who);
});

export const findMyKitchen = onCall(async (request) => {
  const uid = requireUid(request);
  return store().findKitchenForUid(uid);
});

/**
 * Turns a recipe link into a parsed recipe, or an error kind, cached by the server (decision-15,
 * contract TASK-74 §12). The result comes back as data, ok or not, never as a thrown error: onCall
 * logs an uncaught error's message (R36), and that message could carry the caller's URL. A failure
 * is logged by its error kind only, never the URL.
 */
export const importRecipe = onCall(async (request) => {
  requireUid(request);
  const url = requireString(request.data, 'url');
  const result = await importRecipeOnServer(url, {
    fetchPage: createLiveFetchPage(),
    cache: new FirestoreRecipeCache(getFirestore()),
    now: Date.now,
  });
  if (!result.ok) info('importRecipe failed', { error: result.error });
  return result;
});
