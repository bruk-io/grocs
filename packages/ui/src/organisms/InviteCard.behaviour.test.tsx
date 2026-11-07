// Level 2 of decision-11 (behaviour) for InviteCard; see atoms/Button.behaviour.test.tsx for the pattern.
import { composeStories } from '@storybook/react-native-web-vite';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { InviteCard } from './InviteCard.tsx';
import * as stories from './InviteCard.stories.tsx';

const { Filled, Invalid, Sending, Invited, NoKitchen } = composeStories(stories);
afterEach(cleanup);
const user = userEvent.setup({ pointerEventsCheck: 0 });

describe('InviteCard (TASK-78)', () => {
  it('passes what is typed to onEmailChange', async () => {
    const onEmailChange = vi.fn();
    render(<InviteCard kind="compose" email="" onEmailChange={onEmailChange} onInvite={() => undefined} />);
    await user.type(screen.getByRole('textbox', { name: 'Their email' }), 's');
    expect(onEmailChange).toHaveBeenCalledWith('s');
  });

  it('invites from the button', async () => {
    const onInvite = vi.fn();
    render(<Filled onInvite={onInvite} />);
    await user.click(screen.getByRole('button', { name: 'Invite' }));
    expect(onInvite).toHaveBeenCalledOnce();
  });

  it('shows why the last try did not work, and marks the field invalid', () => {
    render(<Invalid />);
    expect(screen.getByRole('alert').textContent).toContain('not an email address');
    expect(screen.getByRole('textbox', { name: 'Their email' }).getAttribute('aria-invalid')).toBe('true');
  });

  it('locks the field and the button while sending', () => {
    render(<Sending />);
    expect((screen.getByRole('textbox', { name: 'Their email' }) as HTMLInputElement).readOnly).toBe(true);
    expect(screen.getByRole('button', { name: 'Inviting' }).getAttribute('aria-disabled')).toBe('true');
  });

  it('once invited, names the address and cancels from its button', async () => {
    const onCancel = vi.fn();
    render(<Invited onCancel={onCancel} />);
    expect(screen.getByText('Invited shazya@gmail.com. Waiting for them to join.')).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Cancel invite' }));
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('before the kitchen exists, says when inviting becomes possible and cannot be used', () => {
    render(<NoKitchen />);
    expect(screen.getByText('You can invite them once your kitchen is made.')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Invite' }).getAttribute('aria-disabled')).toBe('true');
  });
});
