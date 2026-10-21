// Level 2 of decision-11 (behaviour) for RailRow; see atoms/Button.behaviour.test.tsx for the pattern.
import { composeStories } from '@storybook/react-native-web-vite';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import * as stories from './RailRow.stories.tsx';

const { Rest, Selected, AllItems, Disabled } = composeStories(stories);
afterEach(cleanup);
const user = userEvent.setup({ pointerEventsCheck: 0 });

describe('RailRow', () => {
  it('shows the day, the name and what is to buy, in a button that is not pressed at rest', () => {
    render(<Rest />);
    const row = screen.getByRole('button', { name: /^Mon.*Chana masala.*5.*to buy$/ });
    expect(row.getAttribute('aria-pressed')).toBe('false');
  });

  it('is pressed when the list is narrowed to it', () => {
    render(<Selected />);
    expect(screen.getByRole('button', { name: /Chana masala/ }).getAttribute('aria-pressed')).toBe('true');
  });

  it('All items is just its name', () => {
    render(<AllItems />);
    const row = screen.getByRole('button', { name: 'All items' });
    expect(row.textContent).toBe('All items');
  });

  it('reports a press, and not when disabled', async () => {
    const onPress = vi.fn();
    render(<Rest onPress={onPress} />);
    await user.click(screen.getByRole('button', { name: /Chana masala/ }));
    expect(onPress).toHaveBeenCalledExactlyOnceWith();
    cleanup();
    const never = vi.fn();
    render(<Disabled onPress={never} />);
    await user.click(screen.getByRole('button', { name: /Chana masala/ }));
    expect(never).not.toHaveBeenCalled();
  });
});
