// Level 2 of decision-11 (behaviour) for HouseholdTemplate; see atoms/Button.behaviour.test.tsx for the pattern.
import { composeStories } from '@storybook/react-native-web-vite';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import * as stories from './HouseholdTemplate.stories.tsx';

const { Rest, Invited, Full, Loading, Failed } = composeStories(stories);
afterEach(cleanup);
const user = userEvent.setup({ pointerEventsCheck: 0 });

describe('HouseholdTemplate', () => {
  it('names the kitchen and its members, marking the signed-in one', () => {
    render(<Rest />);
    expect(screen.getByRole('heading', { name: 'Our kitchen' })).toBeTruthy();
    expect(screen.getByText('Bruk (you)')).toBeTruthy();
  });

  it('asks for the partner\'s email while the kitchen has room, and invites it (TASK-78)', async () => {
    const onInvite = vi.fn();
    render(<Rest invite={{ kind: 'compose', email: 'shazya@gmail.com', onEmailChange: () => undefined, onInvite }} />);
    await user.click(screen.getByRole('button', { name: 'Invite' }));
    expect(onInvite).toHaveBeenCalledOnce();
  });

  it('once invited, names the address and can take it back', async () => {
    const onCancel = vi.fn();
    render(<Invited invite={{ kind: 'invited', email: 'shazya@gmail.com', onCancel }} />);
    expect(screen.getByText('Invited shazya@gmail.com. Waiting for them to join.')).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Cancel invite' }));
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('shows both members and no invite once the kitchen is full', () => {
    render(<Full />);
    expect(screen.getByText('Shazya')).toBeTruthy();
    expect(screen.queryByRole('textbox', { name: 'Their email' })).toBeNull();
    expect(screen.getByText(/has both its members/)).toBeTruthy();
  });

  it('says when the kitchen is still being read, or could not be', () => {
    render(<Loading />);
    expect(screen.getByText('Checking your kitchen')).toBeTruthy();
    cleanup();
    render(<Failed />);
    expect(screen.getByText('Could not check your kitchen: check your connection and try again')).toBeTruthy();
  });

  it('goes back', async () => {
    const onBack = vi.fn();
    render(<Rest onBack={onBack} />);
    await user.click(screen.getByRole('button', { name: /Settings/ }));
    expect(onBack).toHaveBeenCalledOnce();
  });
});
