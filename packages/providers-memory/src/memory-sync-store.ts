import { mergeItem, mergeMeal } from '@grocs/core';
import type { Item, Meal } from '@grocs/core';
import type { SyncStore, Unsubscribe } from '@grocs/ports';

interface ItemWatcher {
  readonly kitchenId: string;
  readonly weekId: string;
  readonly onItems: (items: readonly Item[]) => void;
}

interface MealWatcher {
  readonly kitchenId: string;
  readonly weekId: string;
  readonly onMeals: (meals: readonly Meal[]) => void;
}

/** A sync store held in memory for the demo build. It touches no network and no disk. */
export class MemorySyncStore implements SyncStore {
  readonly #items = new Map<string, Item>();
  readonly #itemWatchers = new Set<ItemWatcher>();
  readonly #meals = new Map<string, Meal>();
  readonly #mealWatchers = new Set<MealWatcher>();

  async mergeItem(kitchenId: string, item: Item): Promise<void> {
    const key = `${kitchenId}/${item.id}`;
    const existing = this.#items.get(key);
    this.#items.set(key, existing ? mergeItem(existing, item) : item);
    for (const w of [...this.#itemWatchers]) {
      if (w.kitchenId === kitchenId) this.#notifyItems(w);
    }
  }

  async getItems(kitchenId: string, weekId: string): Promise<readonly Item[]> {
    return this.#selectItems(kitchenId, weekId);
  }

  watchItems(
    kitchenId: string,
    weekId: string,
    onItems: (items: readonly Item[]) => void,
    _onError?: (error: Error) => void,
  ): Unsubscribe {
    const watcher: ItemWatcher = { kitchenId, weekId, onItems };
    this.#itemWatchers.add(watcher);
    queueMicrotask(() => {
      if (this.#itemWatchers.has(watcher)) this.#notifyItems(watcher);
    });
    return () => {
      this.#itemWatchers.delete(watcher);
    };
  }

  async mergeMeal(kitchenId: string, meal: Meal): Promise<void> {
    const key = `${kitchenId}/${meal.id}`;
    const existing = this.#meals.get(key);
    this.#meals.set(key, existing ? mergeMeal(existing, meal) : meal);
    for (const w of [...this.#mealWatchers]) {
      if (w.kitchenId === kitchenId) this.#notifyMeals(w);
    }
  }

  async getMeals(kitchenId: string, weekId: string): Promise<readonly Meal[]> {
    return this.#selectMeals(kitchenId, weekId);
  }

  watchMeals(
    kitchenId: string,
    weekId: string,
    onMeals: (meals: readonly Meal[]) => void,
    _onError?: (error: Error) => void,
  ): Unsubscribe {
    const watcher: MealWatcher = { kitchenId, weekId, onMeals };
    this.#mealWatchers.add(watcher);
    queueMicrotask(() => {
      if (this.#mealWatchers.has(watcher)) this.#notifyMeals(watcher);
    });
    return () => {
      this.#mealWatchers.delete(watcher);
    };
  }

  #selectItems(kitchenId: string, weekId: string): Item[] {
    return [...this.#items.entries()]
      .filter(([key, item]) => key.startsWith(`${kitchenId}/`) && item.weekId === weekId)
      .map(([, item]) => item);
  }

  #notifyItems(w: ItemWatcher): void {
    queueMicrotask(() => {
      if (this.#itemWatchers.has(w)) w.onItems(this.#selectItems(w.kitchenId, w.weekId));
    });
  }

  #selectMeals(kitchenId: string, weekId: string): Meal[] {
    return [...this.#meals.entries()]
      .filter(([key, meal]) => key.startsWith(`${kitchenId}/`) && meal.weekId.value === weekId)
      .map(([, meal]) => meal);
  }

  #notifyMeals(w: MealWatcher): void {
    queueMicrotask(() => {
      if (this.#mealWatchers.has(w)) w.onMeals(this.#selectMeals(w.kitchenId, w.weekId));
    });
  }
}
