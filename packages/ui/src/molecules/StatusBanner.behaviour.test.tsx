// Level 2 of decision-11 (behaviour) for StatusBanner; see atoms/Button.behaviour.test.tsx for the pattern.
import { composeStories } from '@storybook/react-native-web-vite';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import * as stories from './StatusBanner.stories.tsx';

const { Offline, Syncing, Synced } = composeStories(stories);
afterEach(cleanup);
const user = userEvent.setup({ pointerEventsCheck: 0 });

describe('StatusBanner', () => {
  it('says what is waiting and offers to try again when offline', async () => {
    const onAction = vi.fn();
    render(<Offline onAction={onAction} />);
    expect(screen.getByText('Offline. 2 changes waiting.')).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Try again' }));
    expect(onAction).toHaveBeenCalledExactlyOnceWith();
  });

  it('shows its button as busy, under the busy name, and ignores presses while syncing', async () => {
    const onAction = vi.fn();
    render(<Syncing onAction={onAction} />);
    expect(screen.getByText('Sending 2 changes…')).toBeTruthy();
    const button = screen.getByRole('button', { name: 'Sending' });
    expect(button.getAttribute('aria-busy')).toBe('true');
    await user.click(button);
    expect(onAction).not.toHaveBeenCalled();
  });

  it('has no button once everything is sent', () => {
    render(<Synced />);
    expect(screen.getByText('Back online. Everything is sent.')).toBeTruthy();
    expect(screen.queryByRole('button')).toBeNull();
  });
});
