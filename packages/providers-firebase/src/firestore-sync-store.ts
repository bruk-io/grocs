import { decodeItem, encodeItem, mergeItem } from '@grocs/core';
import type { Item } from '@grocs/core';
import type { SyncStore, Unsubscribe } from '@grocs/ports';
import type { FirestoreFns, QuerySnapshotLike } from './sdk.ts';

/**
 * The kitchen's items in Firestore: `kitchens/{kitchenId}/items/{itemId}`, one document per item in
 * the shape core defines (R30). It translates; the merge rules are core's (field-level
 * last-write-wins, permanent deletes).
 *
 * mergeItem reads, merges and writes in a transaction so two phones changing different fields at
 * the same moment keep both changes. A Firestore transaction needs a connection, so a merge made
 * offline fails instead of queueing; making R16 work is part of design question D4.
 */
export class FirestoreSyncStore implements SyncStore {
  constructor(
    private readonly fs: FirestoreFns,
    private readonly db: unknown,
  ) {}

  async mergeItem(kitchenId: string, item: Item): Promise<void> {
    const ref = this.fs.doc(this.db, 'kitchens', kitchenId, 'items', item.id);
    await this.fs.runTransaction(this.db, async (tx) => {
      const snapshot = await tx.get(ref);
      let merged = item;
      if (snapshot.exists()) {
        const stored = decodeItem(snapshot.data());
        if (!stored.ok) throw new Error(`invalid item document ${item.id}: ${stored.error.path} ${stored.error.message}`);
        merged = mergeItem(stored.value, item);
      }
      tx.set(ref, encodeItem(merged));
    });
  }

  async getItems(kitchenId: string, weekId: string): Promise<readonly Item[]> {
    const snapshot = await this.fs.getDocs(this.#weekQuery(kitchenId, weekId));
    const { items, problems } = decodeAll(snapshot);
    if (problems.length > 0) throw new Error(problems.join('; '));
    return items;
  }

  watchItems(
    kitchenId: string,
    weekId: string,
    onItems: (items: readonly Item[]) => void,
    onError?: (error: Error) => void,
  ): Unsubscribe {
    return this.fs.onSnapshot(this.#weekQuery(kitchenId, weekId), {
      next: (snapshot) => {
        const { items, problems } = decodeAll(snapshot);
        for (const problem of problems) onError?.(new Error(problem));
        onItems(items);
      },
      error: (error) => onError?.(error),
    });
  }

  #weekQuery(kitchenId: string, weekId: string): unknown {
    return this.fs.query(this.fs.collection(this.db, 'kitchens', kitchenId, 'items'), this.fs.where('weekId', '==', weekId));
  }
}

function decodeAll(snapshot: QuerySnapshotLike): { items: Item[]; problems: string[] } {
  const items: Item[] = [];
  const problems: string[] = [];
  for (const doc of snapshot.docs) {
    const decoded = decodeItem(doc.data());
    if (decoded.ok) items.push(decoded.value);
    else problems.push(`invalid item document ${doc.id}: ${decoded.error.path} ${decoded.error.message}`);
  }
  return { items, problems };
}
