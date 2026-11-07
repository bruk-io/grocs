// Level 2 of decision-11 (behaviour) for KitchenSetupTemplate; see atoms/Button.behaviour.test.tsx for the pattern.
import { composeStories } from '@storybook/react-native-web-vite';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import * as stories from './KitchenSetupTemplate.stories.tsx';

const { Rest, Made, Invited } = composeStories(stories);
afterEach(cleanup);
const user = userEvent.setup({ pointerEventsCheck: 0 });

describe('KitchenSetupTemplate', () => {
  it('names who is signed in and the kitchen', () => {
    render(<Rest />);
    expect(screen.getByText('Signed in as you@example.com')).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Your kitchen' })).toBeTruthy();
    expect((screen.getByRole('textbox', { name: 'Name your kitchen' }) as HTMLInputElement).value).toBe('Our kitchen');
  });

  it('reports a change to the kitchen name', async () => {
    const onKitchenNameChange = vi.fn();
    render(<Rest onKitchenNameChange={onKitchenNameChange} />);
    await user.type(screen.getByRole('textbox', { name: 'Name your kitchen' }), 's');
    expect(onKitchenNameChange).toHaveBeenCalledExactlyOnceWith('Our kitchens');
  });

  it('starts', async () => {
    const onStart = vi.fn();
    render(<Rest onStart={onStart} />);
    await user.click(screen.getByRole('button', { name: 'Start planning' }));
    expect(onStart).toHaveBeenCalledExactlyOnceWith();
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

  it('before the kitchen is made, says which email the partner should add and looks for their invite (TASK-78)', async () => {
    const onCheckInvites = vi.fn();
    render(<Rest onCheckInvites={onCheckInvites} />);
    expect(screen.getByText("Joining your partner's kitchen? Ask them to add you@example.com in Household.")).toBeTruthy();
    expect(screen.getByText('You can invite them once your kitchen is made.')).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Check for an invite' }));
    expect(onCheckInvites).toHaveBeenCalledOnce();
  });

  it('once the kitchen is made, asks for the partner\'s email and stops offering to look for an invite', async () => {
    const onInvite = vi.fn();
    render(<Made invite={{ kind: 'compose', email: 'shazya@gmail.com', onEmailChange: () => undefined, onInvite }} />);
    expect(screen.queryByRole('button', { name: 'Check for an invite' })).toBeNull();
    await user.click(screen.getByRole('button', { name: 'Invite' }));
    expect(onInvite).toHaveBeenCalledOnce();
  });

  it('shows who is invited', () => {
    render(<Invited />);
    expect(screen.getByText('Invited shazya@gmail.com. Waiting for them to join.')).toBeTruthy();
  });

  it('signs out, before and after the kitchen exists, for someone signed in with the wrong account (TASK-67)', async () => {
    const onSignOut = vi.fn();
    render(<Rest onSignOut={onSignOut} />);
    await user.click(screen.getByRole('button', { name: 'Sign out' }));
    cleanup();
    render(<Made onSignOut={onSignOut} />);
    await user.click(screen.getByRole('button', { name: 'Sign out' }));
    expect(onSignOut).toHaveBeenCalledTimes(2);
  });
});
