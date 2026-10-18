import type { IdGenerator } from '@grocs/ports';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
const LENGTH = 20;

/** Fills a byte array with random values. Defaults to the platform's secure source when it has one. */
export type RandomBytes = (bytes: Uint8Array) => void;

const defaultRandomBytes: RandomBytes = (bytes) => {
  const c = (globalThis as { crypto?: { getRandomValues?: (a: Uint8Array) => Uint8Array } }).crypto;
  if (c?.getRandomValues) {
    c.getRandomValues(bytes);
    return;
  }
  for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
};

/** 20 random letters and digits: safe in a Firestore document path and a URL, and unique in practice. */
export class RandomIds implements IdGenerator {
  constructor(private readonly randomBytes: RandomBytes = defaultRandomBytes) {}

  newId(): string {
    const bytes = new Uint8Array(LENGTH);
    this.randomBytes(bytes);
    let id = '';
    for (const b of bytes) id += ALPHABET[b % ALPHABET.length];
    return id;
  }
}
