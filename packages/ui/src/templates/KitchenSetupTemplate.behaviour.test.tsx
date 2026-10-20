// Level 2 of decision-11 (behaviour) for KitchenSetupTemplate; see atoms/Button.behaviour.test.tsx for the pattern.
import { composeStories } from '@storybook/react-native-web-vite';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import * as stories from './KitchenSetupTemplate.stories.tsx';

const { Rest, InviteUnavailable } = composeStories(stories);
afterEach(cleanup);
const user = userEvent.setup({ pointerEventsCheck: 0 });

describe('KitchenSetupTemplate', () => {
  it('names who is signed in, the kitchen, and the invite to send', () => {
    render(<Rest />);
    expect(screen.getByText('Signed in as you@example.com')).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Your kitchen' })).toBeTruthy();
    expect((screen.getByRole('textbox', { name: 'Name your kitchen' }) as HTMLInputElement).value).toBe('Our kitchen');
    expect(screen.getByText('MOREL-24')).toBeTruthy();
  });

  it('reports a change to the kitchen name', async () => {
    const onKitchenNameChange = vi.fn();
    render(<Rest onKitchenNameChange={onKitchenNameChange} />);
    await user.type(screen.getByRole('textbox', { name: 'Name your kitchen' }), 's');
    expect(onKitchenNameChange).toHaveBeenCalledExactlyOnceWith('Our kitchens');
  });

  it('shares, copies and starts, each to its own callback', async () => {
    const onShare = vi.fn();
    const onCopy = vi.fn();
    const onStart = vi.fn();
    render(<Rest onShare={onShare} onCopy={onCopy} onStart={onStart} />);
    await user.click(screen.getByRole('button', { name: 'Share link' }));
    await user.click(screen.getByRole('button', { name: 'Copy code' }));
    await user.click(screen.getByRole('button', { name: 'Start planning' }));
    expect(onShare).toHaveBeenCalledExactlyOnceWith();
    expect(onCopy).toHaveBeenCalledExactlyOnceWith();
    expect(onStart).toHaveBeenCalledExactlyOnceWith();
  });

  it('shows where the invite stands once there is a status', () => {
    render(<Rest inviteStatus={{ message: 'Link sent. Waiting for them to join…' }} />);
    expect(screen.getByText('Link sent. Waiting for them to join…')).toBeTruthy();
  });

  it('while starting shows the action busy and locks the name', async () => {
    const onStart = vi.fn();
    render(<Rest starting onStart={onStart} />);
    const busy = screen.getByRole('button', { name: 'Starting' });
    expect(busy.getAttribute('aria-busy')).toBe('true');
    await user.click(busy);
    expect(onStart).not.toHaveBeenCalled();
    expect((screen.getByRole('textbox', { name: 'Name your kitchen' }) as HTMLInputElement).readOnly).toBe(true);
  });

  it('shows the invite card with Share link and Copy code disabled when there is nothing to share', () => {
    render(<InviteUnavailable />);
    expect(screen.getByRole('button', { name: 'Share link' }).getAttribute('aria-disabled')).toBe('true');
    expect(screen.getByRole('button', { name: 'Copy code' }).getAttribute('aria-disabled')).toBe('true');
  });
});
