// Level 2 of decision-11 (behaviour) for PreferencesTemplate; see atoms/Button.behaviour.test.tsx for the pattern.
import { composeStories } from '@storybook/react-native-web-vite';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import * as stories from './PreferencesTemplate.stories.tsx';

const { Rest } = composeStories(stories);
afterEach(cleanup);
const user = userEvent.setup({ pointerEventsCheck: 0 });

describe('PreferencesTemplate', () => {
  it('shows the signed-in person, their kitchen and the settings cards', () => {
    render(<Rest />);
    expect(screen.getByRole('heading', { name: 'Settings' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Notifications' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Diagnostics' })).toBeTruthy();
    expect(screen.getByText('you@example.com · Our kitchen')).toBeTruthy();
    expect(screen.getByText(/We only nudge you when Shazya adds to the plan or the list/)).toBeTruthy();
  });

  it('shows notifications off, and on when asked', () => {
    render(<Rest />);
    expect(screen.getByRole('switch', { name: 'Tell me when Shazya adds something' }).getAttribute('aria-checked')).toBe('false');
    cleanup();
    render(<Rest notificationsOn />);
    expect(screen.getByRole('switch', { name: 'Tell me when Shazya adds something' }).getAttribute('aria-checked')).toBe('true');
  });

  it('sends the state it wants when notifications are switched', async () => {
    const onNotificationsChange = vi.fn();
    render(<Rest onNotificationsChange={onNotificationsChange} />);
    await user.click(screen.getByRole('switch', { name: 'Tell me when Shazya adds something' }));
    expect(onNotificationsChange).toHaveBeenCalledExactlyOnceWith(true);
  });

  it('copies diagnostics, signs out and goes back, each to its own callback', async () => {
    const onCopyDiagnostics = vi.fn();
    const onSignOut = vi.fn();
    const onBack = vi.fn();
    render(<Rest onCopyDiagnostics={onCopyDiagnostics} onSignOut={onSignOut} onBack={onBack} />);
    await user.click(screen.getByRole('button', { name: 'Copy diagnostics' }));
    expect(onCopyDiagnostics).toHaveBeenCalledExactlyOnceWith();
    await user.click(screen.getByRole('button', { name: 'Sign out' }));
    expect(onSignOut).toHaveBeenCalledExactlyOnceWith();
    await user.click(screen.getByRole('button', { name: 'Groceries' }));
    expect(onBack).toHaveBeenCalledExactlyOnceWith();
  });
});
