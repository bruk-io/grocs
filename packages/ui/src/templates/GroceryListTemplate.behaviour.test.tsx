// Level 2 of decision-11 (behaviour) for GroceryListTemplate; see atoms/Button.behaviour.test.tsx for the pattern.
import { composeStories } from '@storybook/react-native-web-vite';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AccessibilityInfo } from 'react-native';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as stories from './GroceryListTemplate.stories.tsx';

const { Groceries, Offline, Toast, Empty, AllDone } = composeStories(stories);
const user = userEvent.setup({ pointerEventsCheck: 0 });
beforeEach(() => {
  vi.spyOn(AccessibilityInfo, 'announceForAccessibility').mockImplementation(() => undefined);
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('GroceryListTemplate', () => {
  it('shows the progress, the add field, the sections with their rows, and the tab bar with Groceries selected', () => {
    render(<Groceries />);
    expect(screen.getByRole('heading', { name: 'Groceries' })).toBeTruthy();
    expect(screen.getByText('14 to go')).toBeTruthy();
    expect(screen.getByRole('textbox', { name: 'Add an item' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Produce' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Meat' })).toBeTruthy();
    expect(screen.getByRole('checkbox', { name: 'Yellow onions' })).toBeTruthy();
    expect(screen.getByRole('tab', { name: /Groceries/ }).getAttribute('aria-selected')).toBe('true');
  });

  it('shows the partner toast when there is one, and not otherwise', () => {
    render(<Groceries />);
    expect(screen.getByText('Sam added Oat milk · just now')).toBeTruthy();
    cleanup();
    render(<Offline />);
    expect(screen.queryByText('Sam added Oat milk · just now')).toBeNull();
  });

  it('marks the item that is new', () => {
    render(<Toast />);
    expect(screen.getByText('New')).toBeTruthy();
  });

  it('offline shows the banner, tags the waiting items, and tries again', async () => {
    const onTryAgain = vi.fn();
    render(<Offline banner={{ kind: 'offline', message: 'Offline. 2 changes waiting.', actionLabel: 'Try again', onAction: onTryAgain }} />);
    expect(screen.getByText('Offline. 2 changes waiting.')).toBeTruthy();
    expect(screen.getAllByText('Waiting to send')).toHaveLength(2);
    await user.click(screen.getByRole('button', { name: 'Try again' }));
    expect(onTryAgain).toHaveBeenCalledExactlyOnceWith();
  });

  it('reports what is typed in the add field and adds from the button and the keyboard', async () => {
    const onAddValueChange = vi.fn();
    const onAdd = vi.fn();
    render(<Groceries onAddValueChange={onAddValueChange} onAdd={onAdd} addValue="egg" />);
    await user.type(screen.getByRole('textbox', { name: 'Add an item' }), 's');
    expect(onAddValueChange).toHaveBeenCalledExactlyOnceWith('eggs');
    await user.click(screen.getByRole('button', { name: 'Add' }));
    expect(onAdd).toHaveBeenCalledExactlyOnceWith();
    await user.type(screen.getByRole('textbox', { name: 'Add an item' }), '{Enter}');
    expect(onAdd).toHaveBeenCalledTimes(2);
  });

  it('sends the item and the state it wants when one is ticked', async () => {
    const onToggleItem = vi.fn();
    render(<Groceries onToggleItem={onToggleItem} />);
    await user.click(screen.getByRole('checkbox', { name: 'Lemon' }));
    expect(onToggleItem).toHaveBeenCalledExactlyOnceWith('i4', true);
  });

  it('with nothing on the list shows the empty list and adds an item from it', async () => {
    const onAddItem = vi.fn();
    render(<Empty onAddItem={onAddItem} />);
    expect(screen.getByText('Nothing on the list yet')).toBeTruthy();
    expect(screen.queryByText('All done!')).toBeNull();
    await user.click(screen.getByRole('button', { name: 'Add an item' }));
    expect(onAddItem).toHaveBeenCalledExactlyOnceWith();
  });

  it('with everything in the cart celebrates, lists the cart, unticks an item and clears the cart', async () => {
    const onToggleItem = vi.fn();
    const onClearCart = vi.fn();
    render(<AllDone onToggleItem={onToggleItem} onClearCart={onClearCart} />);
    expect(screen.getByText('All done!')).toBeTruthy();
    expect(screen.queryByText('Nothing on the list yet')).toBeNull();
    expect(screen.getByRole('heading', { name: 'In the cart' })).toBeTruthy();
    await user.click(screen.getByRole('checkbox', { name: 'Bananas' }));
    expect(onToggleItem).toHaveBeenCalledExactlyOnceWith('c1', false);
    await user.click(screen.getByRole('button', { name: 'Clear the cart' }));
    expect(onClearCart).toHaveBeenCalledExactlyOnceWith();
  });

  it('shows no number on the Groceries tab when nothing is left to buy', () => {
    render(<AllDone />);
    expect(screen.getByRole('tab', { name: 'Groceries' })).toBeTruthy();
  });

  it('goes to Meal plan from the tab bar and to settings from the header', async () => {
    const onOpenPlan = vi.fn();
    const onSettings = vi.fn();
    render(<Groceries onOpenPlan={onOpenPlan} onSettings={onSettings} />);
    await user.click(screen.getByRole('tab', { name: 'Meal plan' }));
    expect(onOpenPlan).toHaveBeenCalledExactlyOnceWith();
    await user.click(screen.getByRole('button', { name: 'Settings' }));
    expect(onSettings).toHaveBeenCalledExactlyOnceWith();
  });
});
