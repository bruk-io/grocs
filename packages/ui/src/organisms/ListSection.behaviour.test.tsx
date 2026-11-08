// Level 2 of decision-11 (behaviour) for ListSection; see atoms/Button.behaviour.test.tsx for the pattern.
import { composeStories } from '@storybook/react-native-web-vite';
import { useState } from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ListSection } from './ListSection.tsx';
import * as stories from './ListSection.stories.tsx';

const { Rest, Waiting, AisleOpen } = composeStories(stories);
afterEach(cleanup);
const user = userEvent.setup({ pointerEventsCheck: 0 });

const aisleOptions = [
  { id: 'produce', label: 'Produce' },
  { id: 'pantry', label: 'Pantry' },
];

function StatefulAisleHarness({ onChosen }: { onChosen: (id: string, aisleId: string) => void }) {
  const [openAisleItemId, setOpenAisleItemId] = useState<string | null>(null);
  return (
    <ListSection
      icon="pantry"
      title="Pantry"
      items={[{ id: 'a', name: 'Chickpeas', amount: '2 cans', inCart: false }]}
      aisleOptions={aisleOptions}
      openAisleItemId={openAisleItemId}
      onPressItem={(id) => setOpenAisleItemId(id)}
      onChooseAisle={(id, aisleId) => onChosen(id, aisleId)}
    />
  );
}

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

  it('presses a to-buy row to report which one, named from its own visible name and amount', async () => {
    const onPressItem = vi.fn();
    render(<Rest onPressItem={onPressItem} aisleOptions={[{ id: 'pantry', label: 'Pantry' }]} />);
    await user.click(screen.getByRole('button', { name: 'Basmati rice 2 kg' }));
    expect(onPressItem).toHaveBeenCalledExactlyOnceWith('b');
  });

  it('has no press target when there is nothing to press it with', () => {
    render(<Rest />);
    expect(screen.queryByRole('button', { name: /Basmati rice/ })).toBeNull();
  });

  it('has no press target when onPressItem is given but there are no aisle options', () => {
    const onPressItem = vi.fn();
    render(<Rest onPressItem={onPressItem} aisleOptions={[]} />);
    expect(screen.queryByRole('button', { name: /Basmati rice/ })).toBeNull();
  });

  it('shows the open row\'s aisle chips in a labelled group, the current aisle pressed, and chooses one', async () => {
    const onChooseAisle = vi.fn();
    render(<AisleOpen onChooseAisle={onChooseAisle} />);
    const group = screen.getByRole('group', { name: 'Aisle for Basmati rice' });
    expect(group).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Pantry' }).getAttribute('aria-pressed')).toBe('true');
    expect(screen.getByRole('button', { name: 'Produce' }).getAttribute('aria-pressed')).toBe('false');
    await user.click(screen.getByRole('button', { name: 'Produce' }));
    expect(onChooseAisle).toHaveBeenCalledExactlyOnceWith('b', 'produce');
  });

  it('says aria-expanded on the row that is open, and not on the one that is not', () => {
    render(<AisleOpen />);
    expect(screen.getByRole('button', { name: 'Basmati rice 2 kg' }).getAttribute('aria-expanded')).toBe('true');
    expect(screen.getByRole('button', { name: /^Chickpeas/ }).getAttribute('aria-expanded')).toBe('false');
  });

  it('leaves the chips closed when no row is open', () => {
    render(<Rest onPressItem={() => undefined} aisleOptions={[{ id: 'pantry', label: 'Pantry' }]} openAisleItemId={null} />);
    expect(screen.queryByRole('button', { name: 'Pantry' })).toBeNull();
  });

  it('cannot press a row that is in the cart', () => {
    render(
      <Rest
        onPressItem={() => undefined}
        aisleOptions={[{ id: 'pantry', label: 'Pantry' }]}
        items={[{ id: 'c', name: 'Coffee', inCart: true }]}
      />,
    );
    expect(screen.queryByRole('button', { name: /Coffee/ })).toBeNull();
  });

  it('shows no chip group for a cart row even when its id is the open one', () => {
    render(
      <Rest
        onPressItem={() => undefined}
        aisleOptions={[{ id: 'pantry', label: 'Pantry' }]}
        openAisleItemId="c"
        items={[{ id: 'c', name: 'Coffee', inCart: true }]}
      />,
    );
    expect(screen.queryByRole('group', { name: 'Aisle for Coffee' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Pantry' })).toBeNull();
  });

  it('presses a row, sees its chips, and chooses one, getting the row and the aisle back', async () => {
    const onChosen = vi.fn();
    render(<StatefulAisleHarness onChosen={onChosen} />);
    expect(screen.queryByRole('group', { name: 'Aisle for Chickpeas' })).toBeNull();
    await user.click(screen.getByRole('button', { name: 'Chickpeas 2 cans' }));
    expect(screen.getByRole('group', { name: 'Aisle for Chickpeas' })).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Pantry' }));
    expect(onChosen).toHaveBeenCalledExactlyOnceWith('a', 'pantry');
  });
});
