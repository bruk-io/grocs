// Level 4 of decision-11: the index route renders with its sample data and no errors.
import { createExtraItem, weekIdFor } from '@grocs/core';
import type { Item } from '@grocs/core';
import { FakeClock, FakeKitchenGateway, InMemorySyncStore } from '@grocs/ports/testing';
import { cleanup, fireEvent, screen, waitFor } from '@testing-library/react';
import { AccessibilityInfo } from 'react-native';
import { afterEach, describe, expect, it, vi } from 'vitest';
import Home from '../../app/index.tsx';
import Plan from '../../app/plan.tsx';
import Settings from '../../app/settings.tsx';
import { appOnFakes, renderRoute } from '../../testing/render-route.tsx';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('index route', () => {
  it('shows the Welcome screen when nobody is signed in', async () => {
    renderRoute({ index: Home }, { app: await appOnFakes({ signedIn: false }) });
    expect(await screen.findByText('Grocs')).toBeTruthy();
    expect(screen.getByText('Plan the week. Shop together.')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Continue with Google' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Open it to join' })).toBeTruthy();
  });

  it('does nothing yet when Continue with Google is pressed, and has no test sign-in in a release build', async () => {
    renderRoute({ index: Home }, { app: await appOnFakes({ signedIn: false }) });
    fireEvent.click(await screen.findByRole('button', { name: 'Continue with Google' }));
    expect(screen.getByRole('button', { name: 'Continue with Google' })).toBeTruthy();
    expect(screen.queryByText(/\(test\)/)).toBeNull();
  });

  it('leads to the list from the test sign-in in a development build (R53)', async () => {
    renderRoute({ index: Home }, { app: await appOnFakes({ signedIn: false, dev: true }) });
    fireEvent.click(await screen.findByRole('button', { name: 'Sign in as U1 (test)' }));
    await waitFor(() => expect(screen.getByText('Nothing on the list yet')).toBeTruthy());
  });

  it("shows a mushroom's speech bubble and announces it when it is tapped (R40)", async () => {
    const announce = vi.spyOn(AccessibilityInfo, 'announceForAccessibility').mockImplementation(() => undefined);
    renderRoute({ index: Home }, { app: await appOnFakes({ signedIn: false }) });
    fireEvent.click(await screen.findByRole('button', { name: 'Cremi the cremini, tap to hear a line' }));
    expect(announce).toHaveBeenCalledOnce();
    expect(screen.getByText(String(announce.mock.calls[0]?.[0]))).toBeTruthy();
  });

  it('shows Groceries from the live list for a signed-in person, with tabs to Plan and Settings', async () => {
    renderRoute({ index: Home, plan: Plan, settings: Settings }, { app: await appOnFakes({ signedIn: true }) });
    await screen.findByText('Nothing on the list yet');
    expect(screen.getByRole('textbox', { name: 'Add an item' })).toBeTruthy();
    fireEvent.click(screen.getByText('Meal plan'));
    expect(await screen.findByText('This week')).toBeTruthy();
    fireEvent.click(screen.getByText('Groceries'));
    expect(await screen.findByText('Nothing on the list yet')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Settings' }));
    expect(await screen.findByText('Notifications')).toBeTruthy();
  });

  it('shows the all-done state when every item is in the cart', async () => {
    // The skeleton has no command that puts an item in the cart yet, so the store starts with one that is.
    const syncStore = new InMemorySyncStore();
    const stamp = { at: 1, by: 'u2' };
    const made = createExtraItem({ id: 'c1', weekId: weekIdFor(new FakeClock().now()), name: 'Bananas' }, stamp);
    if (!made.ok) throw new Error('bad fixture');
    const kitchens = new FakeKitchenGateway('u1');
    const { kitchenId } = await kitchens.createKitchen('Our kitchen', 'UTC');
    await syncStore.mergeItem(kitchenId, { ...made.value, state: { value: 'in-cart', stamp } });
    renderRoute({ index: Home }, { app: await appOnFakes({ signedIn: true, syncStore, kitchen: false, kitchens }) });
    expect(await screen.findByRole('checkbox', { name: 'Bananas' })).toBeTruthy();
    expect(screen.queryByText('Nothing on the list yet')).toBeNull();
    expect(screen.queryByText('This week')).toBeNull();
    expect((screen.getAllByRole('button', { name: /enoki siblings, tap to hear a line/i })).length).toBeGreaterThan(0);
  });

  describe('ticking', () => {
    async function withBananas(syncStore: InMemorySyncStore) {
      const kitchens = new FakeKitchenGateway('u1');
      const { kitchenId } = await kitchens.createKitchen('Our kitchen', 'UTC');
      const made = createExtraItem({ id: 'c1', weekId: weekIdFor(new FakeClock().now()), name: 'Bananas' }, { at: 1, by: 'u2' });
      if (!made.ok) throw new Error('bad fixture');
      await syncStore.mergeItem(kitchenId, made.value);
      return appOnFakes({ signedIn: true, syncStore, kitchen: false, kitchens });
    }

    it('moves an item into the cart when ticked and back when unticked', async () => {
      renderRoute({ index: Home }, { app: await withBananas(new InMemorySyncStore()) });
      fireEvent.click(await screen.findByRole('checkbox', { name: 'Bananas', checked: false }));
      expect(await screen.findByRole('checkbox', { name: 'Bananas', checked: true })).toBeTruthy();
      expect(screen.queryByText('This week')).toBeNull();
      fireEvent.click(screen.getByRole('checkbox', { name: 'Bananas' }));
      expect(await screen.findByRole('checkbox', { name: 'Bananas', checked: false })).toBeTruthy();
      expect(screen.getByText('This week')).toBeTruthy();
    });

    it('shows the banner and leaves the item where it was when the tick fails', async () => {
      class FailingStore extends InMemorySyncStore {
        failing = false;
        override mergeItem(kitchenId: string, item: Item): Promise<void> {
          return this.failing ? Promise.reject(new Error('offline')) : super.mergeItem(kitchenId, item);
        }
      }
      const store = new FailingStore();
      const failing = await withBananas(store);
      store.failing = true;
      renderRoute({ index: Home }, { app: failing });
      fireEvent.click(await screen.findByRole('checkbox', { name: 'Bananas', checked: false }));
      expect(await screen.findByText('Could not update that item')).toBeTruthy();
      expect(screen.getByRole('checkbox', { name: 'Bananas', checked: false })).toBeTruthy();
    });
  });

  describe('clearing the cart', () => {
    class FailingStore extends InMemorySyncStore {
      failing = false;
      override mergeItem(kitchenId: string, item: Item): Promise<void> {
        return this.failing ? Promise.reject(new Error('offline')) : super.mergeItem(kitchenId, item);
      }
    }

    async function withBananas(syncStore: InMemorySyncStore, clock = new FakeClock()) {
      const kitchens = new FakeKitchenGateway('u1', undefined, clock);
      const { kitchenId } = await kitchens.createKitchen('Our kitchen', 'UTC');
      const made = createExtraItem({ id: 'c1', weekId: weekIdFor(clock.now()), name: 'Bananas' }, { at: 1, by: 'u2' });
      if (!made.ok) throw new Error('bad fixture');
      await syncStore.mergeItem(kitchenId, made.value);
      const apples = createExtraItem({ id: 'c2', weekId: weekIdFor(clock.now()), name: 'Apples' }, { at: 1, by: 'u2' });
      if (!apples.ok) throw new Error('bad fixture');
      await syncStore.mergeItem(kitchenId, apples.value);
      return appOnFakes({ signedIn: true, syncStore, kitchen: false, kitchens, clock });
    }

    it('removes the in-cart items from Groceries when Clear the cart is pressed', async () => {
      const clock = new FakeClock();
      renderRoute({ index: Home }, { app: await withBananas(new InMemorySyncStore(), clock) });
      fireEvent.click(await screen.findByRole('checkbox', { name: 'Bananas', checked: false }));
      await screen.findByRole('checkbox', { name: 'Bananas', checked: true });
      clock.advance(60_000); // the clear is a later action than the tick
      fireEvent.click(screen.getByRole('button', { name: 'Clear the cart' }));
      await waitFor(() => expect(screen.queryByText('Bananas')).toBeNull());
      expect(screen.getByRole('checkbox', { name: 'Apples', checked: false })).toBeTruthy();
    });

    it('shows the banner and keeps the cart when the clear fails', async () => {
      const store = new FailingStore();
      const clock = new FakeClock();
      renderRoute({ index: Home }, { app: await withBananas(store, clock) });
      fireEvent.click(await screen.findByRole('checkbox', { name: 'Bananas', checked: false }));
      await screen.findByRole('checkbox', { name: 'Bananas', checked: true });
      store.failing = true;
      clock.advance(60_000); // the clear is a later action than the tick
      fireEvent.click(screen.getByRole('button', { name: 'Clear the cart' }));
      expect(await screen.findByText('Could not clear the cart')).toBeTruthy();
      expect(screen.getByRole('checkbox', { name: 'Bananas', checked: true })).toBeTruthy();
    });
  });
});
