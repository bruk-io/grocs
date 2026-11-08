// Level 2 of decision-11 (behaviour) for ListSection; see atoms/Button.behaviour.test.tsx for the pattern.
import { composeStories } from '@storybook/react-native-web-vite';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import * as stories from './ListSection.stories.tsx';

const { Rest, Waiting, AisleOpen } = composeStories(stories);
afterEach(cleanup);
const user = userEvent.setup({ pointerEventsCheck: 0 });

describe('ListSection', () => {
  it('names the section, counts its items and shows a row for each', () => {
    render(<Rest />);
    expect(screen.getByRole('heading', { name: 'Pantry' })).toBeTruthy();
    expect(screen.getByText('2')).toBeTruthy();
    expect(screen.getByRole('checkbox', { name: 'Chickpeas' })).toBeTruthy();
    expect(screen.getByRole('checkbox', { name: 'Basmati rice' })).toBeTruthy();
  });

  it('sends the item and the state it wants when one is ticked', async () => {
    const onToggleItem = vi.fn();
    render(<Rest onToggleItem={onToggleItem} />);
    await user.click(screen.getByRole('checkbox', { name: 'Basmati rice' }));
    expect(onToggleItem).toHaveBeenCalledExactlyOnceWith('b', true);
  });

  it('says which items are waiting to be sent', () => {
    render(<Waiting />);
    expect(screen.getAllByText('Waiting to send')).toHaveLength(2);
  });

  it('removes the swiped item', async () => {
    const onRemoveItem = vi.fn();
    render(<Rest onRemoveItem={onRemoveItem} items={[{ id: 'b', name: 'Basmati rice', inCart: false, swiped: true }]} />);
    await user.click(screen.getByRole('button', { name: 'Remove Basmati rice' }));
    expect(onRemoveItem).toHaveBeenCalledExactlyOnceWith('b');
  });

  it('presses a to-buy row to report which one, without a press target when nothing can press it', async () => {
    const onPressItem = vi.fn();
    render(<Rest onPressItem={onPressItem} aisleOptions={[{ id: 'pantry', label: 'Pantry' }]} />);
    await user.click(screen.getByRole('button', { name: 'Change the aisle for Basmati rice' }));
    expect(onPressItem).toHaveBeenCalledExactlyOnceWith('b');
    cleanup();
    render(<Rest />);
    expect(screen.queryByRole('button', { name: /Change the aisle/ })).toBeNull();
  });

  it('shows the open row\'s aisle chips and chooses one', async () => {
    const onChooseAisle = vi.fn();
    render(<AisleOpen onChooseAisle={onChooseAisle} />);
    expect(screen.getByRole('button', { name: 'Pantry' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Produce' })).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Pantry' }));
    expect(onChooseAisle).toHaveBeenCalledExactlyOnceWith('b', 'pantry');
  });

  it('leaves the chips closed when no row is open', () => {
    render(<Rest aisleOptions={[{ id: 'pantry', label: 'Pantry' }]} openAisleItemId={null} />);
    expect(screen.queryByRole('button', { name: 'Pantry' })).toBeNull();
  });
});
