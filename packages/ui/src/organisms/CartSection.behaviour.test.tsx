// Level 2 of decision-11 (behaviour) for CartSection; see atoms/Button.behaviour.test.tsx for the pattern.
import { composeStories } from '@storybook/react-native-web-vite';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import * as stories from './CartSection.stories.tsx';

const { Rest } = composeStories(stories);
afterEach(cleanup);
const user = userEvent.setup({ pointerEventsCheck: 0 });

describe('CartSection', () => {
  it('shows what is in the cart, ticked, under a header that counts it', () => {
    render(<Rest />);
    expect(screen.getByRole('heading', { name: 'In the cart' })).toBeTruthy();
    expect(screen.getByText('2')).toBeTruthy();
    expect((screen.getByRole('checkbox', { name: 'Bananas' }) as HTMLInputElement).getAttribute('aria-checked')).toBe('true');
  });

  it('sends the item and false when one is unticked', async () => {
    const onToggleItem = vi.fn();
    render(<Rest onToggleItem={onToggleItem} />);
    await user.click(screen.getByRole('checkbox', { name: 'Coffee beans' }));
    expect(onToggleItem).toHaveBeenCalledExactlyOnceWith('b', false);
  });

  it('clears the cart', async () => {
    const onClear = vi.fn();
    render(<Rest onClear={onClear} />);
    await user.click(screen.getByRole('button', { name: 'Clear the cart' }));
    expect(onClear).toHaveBeenCalledExactlyOnceWith();
  });
});
