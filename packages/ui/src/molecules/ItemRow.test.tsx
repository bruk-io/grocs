// Level 2 of decision-11 (behaviour) for ItemRow; see atoms/Button.behaviour.test.tsx for the pattern.
import { composeStories } from '@storybook/react-native-web-vite';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import * as stories from './ItemRow.stories.tsx';

const { Rest, InCart, Disabled, Swiped, Loading, AmountOnly, Waiting, New } = composeStories(stories);
afterEach(cleanup);
const user = userEvent.setup({ pointerEventsCheck: 0 });

describe('ItemRow (R50, R65)', () => {
  it('shows the item as a checkbox named after it, unticked', () => {
    render(<Rest />);
    expect(screen.getByRole('checkbox', { name: 'Yellow onions' }).getAttribute('aria-checked')).toBe('false');
  });

  it('ticking asks for the in-cart state, not a toggle (R17)', async () => {
    const onToggle = vi.fn();
    render(<Rest onToggle={onToggle} />);
    await user.click(screen.getByRole('checkbox', { name: 'Yellow onions' }));
    expect(onToggle).toHaveBeenCalledExactlyOnceWith(true);
  });

  it('unticking asks for the to-buy state', async () => {
    const onToggle = vi.fn();
    render(<InCart onToggle={onToggle} />);
    const box = screen.getByRole('checkbox', { name: 'Coffee beans' });
    expect(box.getAttribute('aria-checked')).toBe('true');
    await user.click(box);
    expect(onToggle).toHaveBeenCalledExactlyOnceWith(false);
  });

  it('can be ticked from the keyboard with Space', async () => {
    const onToggle = vi.fn();
    render(<Rest onToggle={onToggle} />);
    await user.tab();
    expect(screen.getByRole('checkbox', { name: 'Yellow onions' })).toBe(document.activeElement);
    await user.keyboard(' ');
    expect(onToggle).toHaveBeenCalledExactlyOnceWith(true);
  });

  it('does nothing when disabled, and says so', async () => {
    const onToggle = vi.fn();
    render(<Disabled onToggle={onToggle} />);
    const box = screen.getByRole('checkbox', { name: 'Yellow onions' });
    expect(box.getAttribute('aria-disabled')).toBe('true');
    await user.click(box);
    expect(onToggle).not.toHaveBeenCalled();
  });

  it('shows the amount, the meal badges and who added it', () => {
    render(<Rest />);
    expect(screen.getByText('2')).toBeTruthy();
    expect(screen.getByText('Chana masala')).toBeTruthy();
    expect(screen.getByText('Sheet-pan chicken')).toBeTruthy();
    expect(screen.getByRole('img', { name: 'Shazya' })).toBeTruthy();
  });

  it('shows just the amount for an extra', () => {
    render(<AmountOnly />);
    expect(screen.getByText('2 cartons')).toBeTruthy();
    expect(screen.queryByRole('img')).toBeNull();
  });

  it('offers Remove when swiped, and reports it', async () => {
    const onRemove = vi.fn();
    render(<Swiped onRemove={onRemove} />);
    await user.click(screen.getByRole('button', { name: 'Remove Oat milk' }));
    expect(onRemove).toHaveBeenCalledExactlyOnceWith();
  });

  it('offers no Remove until it is swiped', () => {
    render(<Rest />);
    expect(screen.queryByRole('button', { name: /Remove/ })).toBeNull();
  });

  it('is a busy placeholder while loading, with nothing to tick', () => {
    render(<Loading />);
    expect(screen.getByLabelText('Loading an item').getAttribute('aria-busy')).toBe('true');
    expect(screen.queryByRole('checkbox')).toBeNull();
  });

  it('says Waiting to send on an item the other phone has not got yet, and nothing otherwise', () => {
    render(<Waiting />);
    expect(screen.getByText('Waiting to send')).toBeTruthy();
    cleanup();
    render(<Rest />);
    expect(screen.queryByText('Waiting to send')).toBeNull();
  });

  it('says New on an item the other person just added, and nothing otherwise', () => {
    render(<New />);
    expect(screen.getByText('New')).toBeTruthy();
    cleanup();
    render(<Rest />);
    expect(screen.queryByText('New')).toBeNull();
  });
});
