// Cloud Functions, the server's composition root (R26). Kitchen creation and joining go through
// here (R2, R3): they need a connection anyway, and the server is the only place that can look up
// an invite code without already being a member (firebase/firestore.rules denies a direct write to
// kitchens/{kitchenId} for exactly this reason).
import { randomUUID } from 'node:crypto';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { HttpsError, onCall } from 'firebase-functions/v2/https';
import { KitchenStore } from '@grocs/providers-server';
import type { CallableRequest } from 'firebase-functions/v2/https';

initializeApp();

function store(): KitchenStore {
  return new KitchenStore(getFirestore(), randomUUID);
}

function requireUid(request: CallableRequest): string {
  if (!request.auth) throw new HttpsError('unauthenticated', 'sign in first');
  return request.auth.uid;
}

function requireString(data: unknown, field: string): string {
  const value = (data as Record<string, unknown> | null)?.[field];
  if (typeof value !== 'string' || value.trim() === '') throw new HttpsError('invalid-argument', `${field} is required`);
  return value;
}

export const createKitchen = onCall(async (request) => {
  const ownerUid = requireUid(request);
  const name = requireString(request.data, 'name');
  const timeZone = requireString(request.data, 'timeZone');
  try {
    return await store().createKitchen(name, timeZone, ownerUid);
  } catch (error) {
    throw new HttpsError('invalid-argument', error instanceof Error ? error.message : 'could not create the kitchen');
  }
});

export const joinKitchen = onCall(async (request) => {
  const uid = requireUid(request);
  const code = requireString(request.data, 'code');
  return store().joinKitchen(code, uid);
});
