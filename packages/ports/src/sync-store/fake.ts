import { mergeItem } from '@grocs/core';
import type { Item } from '@grocs/core';
import type { Unsubscribe } from '../unsubscribe.ts';
import type { SyncStore } from './port.ts';

interface Watcher {
  readonly kitchenId: string;
  readonly weekId: string;
  readonly onItems: (items: readonly Item[]) => void;
}

/** A sync store held in memory. Two clients can share one instance to stand in for two phones. */
export class InMemorySyncStore implements SyncStore {
  readonly #items = new Map<string, Item>();
  readonly #watchers = new Set<Watcher>();

  async mergeItem(kitchenId: string, item: Item): Promise<void> {
    const key = `${kitchenId}/${item.id}`;
    const existing = this.#items.get(key);
    this.#items.set(key, existing ? mergeItem(existing, item) : item);
    for (const w of [...this.#watchers]) {
      if (w.kitchenId === kitchenId) this.#notify(w);
    }
  }

  async getItems(kitchenId: string, weekId: string): Promise<readonly Item[]> {
    return this.#select(kitchenId, weekId);
  }

  watchItems(
    kitchenId: string,
    weekId: string,
    onItems: (items: readonly Item[]) => void,
    _onError?: (error: Error) => void,
  ): Unsubscribe {
    const watcher: Watcher = { kitchenId, weekId, onItems };
    this.#watchers.add(watcher);
    queueMicrotask(() => {
      if (this.#watchers.has(watcher)) this.#notify(watcher);
    });
    return () => {
      this.#watchers.delete(watcher);
    };
  }

  #select(kitchenId: string, weekId: string): Item[] {
    return [...this.#items.entries()]
      .filter(([key, item]) => key.startsWith(`${kitchenId}/`) && item.weekId === weekId)
      .map(([, item]) => item);
  }

  #notify(w: Watcher): void {
    queueMicrotask(() => {
      if (this.#watchers.has(w)) w.onItems(this.#select(w.kitchenId, w.weekId));
    });
  }
}
