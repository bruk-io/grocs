// Level 2 of decision-11 (behaviour) for InviteJoinTemplate; see atoms/Button.behaviour.test.tsx for the pattern.
import { composeStories } from '@storybook/react-native-web-vite';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import * as stories from './InviteJoinTemplate.stories.tsx';

const { Rest, Leaving, Joining, Error: Failed } = composeStories(stories);
afterEach(cleanup);
const user = userEvent.setup({ pointerEventsCheck: 0 });

describe('InviteJoinTemplate (TASK-78)', () => {
  it('says who invited you to what', () => {
    render(<Rest />);
    expect(screen.getByRole('heading', { name: "You're invited" })).toBeTruthy();
    expect(screen.getByText('Shazya invited you to')).toBeTruthy();
    expect(screen.getByText('Our kitchen')).toBeTruthy();
  });

  it('joins, or puts it aside, each to its own callback', async () => {
    const onJoin = vi.fn();
    const onNotNow = vi.fn();
    render(<Rest onJoin={onJoin} onNotNow={onNotNow} />);
    await user.click(screen.getByRole('button', { name: 'Join Our kitchen' }));
    await user.click(screen.getByRole('button', { name: 'Not now' }));
    expect(onJoin).toHaveBeenCalledOnce();
    expect(onNotNow).toHaveBeenCalledOnce();
  });

  it('says nothing about leaving for someone with no kitchen', () => {
    render(<Rest />);
    expect(screen.queryByText(/takes you out of/)).toBeNull();
  });

  it('says which kitchen joining leaves, and that its list stays there', () => {
    render(<Leaving />);
    expect(screen.getByText('Joining takes you out of My kitchen. Its list and meals stay there.')).toBeTruthy();
  });

  it('while joining, shows it busy and cannot be put aside', async () => {
    const onNotNow = vi.fn();
    render(<Joining onNotNow={onNotNow} />);
    expect(screen.getByRole('button', { name: 'Joining' }).getAttribute('aria-busy')).toBe('true');
    await user.click(screen.getByRole('button', { name: 'Not now' }));
    expect(onNotNow).not.toHaveBeenCalled();
  });

  it('shows why the join did not go through', () => {
    render(<Failed />);
    const message = screen.getByText('That invite was taken back. Ask your partner to add you again.');
    expect(message.closest('[aria-live="polite"]')).toBeTruthy();
  });
});
