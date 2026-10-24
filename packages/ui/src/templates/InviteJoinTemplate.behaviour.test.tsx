// Level 2 of decision-11 (behaviour) for InviteJoinTemplate; see atoms/Button.behaviour.test.tsx for the pattern.
import { composeStories } from '@storybook/react-native-web-vite';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import * as stories from './InviteJoinTemplate.stories.tsx';

const { Rest } = composeStories(stories);
afterEach(cleanup);
const user = userEvent.setup({ pointerEventsCheck: 0 });

describe('InviteJoinTemplate', () => {
  it('says who invited you to what, and that an unexpected invite can be ignored', () => {
    render(<Rest />);
    expect(screen.getByRole('heading', { name: "You're invited" })).toBeTruthy();
    expect(screen.getByText('Alex invited you to')).toBeTruthy();
    expect(screen.getByText('Our kitchen')).toBeTruthy();
    expect(screen.getByText('Not expecting this? You can ignore it.')).toBeTruthy();
  });

  it('has the wordmark, not a back link, and no action bar: one Google button', () => {
    render(<Rest />);
    expect(screen.getByText('Grocs')).toBeTruthy();
    expect(screen.getAllByRole('button').map((b) => b.getAttribute('aria-label') ?? b.textContent)).toEqual(['Chanty the chanterelle, tap to hear a line', 'Join with Google']);
  });

  it('joins with Google', async () => {
    const onJoin = vi.fn();
    render(<Rest onJoin={onJoin} />);
    await user.click(screen.getByRole('button', { name: 'Join with Google' }));
    expect(onJoin).toHaveBeenCalledExactlyOnceWith();
  });

  it('shows the button busy while Google is open, and does not press twice', async () => {
    const onJoin = vi.fn();
    render(<Rest joining onJoin={onJoin} />);
    const busy = screen.getByRole('button', { name: 'Joining' });
    expect(busy.getAttribute('aria-busy')).toBe('true');
    await user.click(busy);
    expect(onJoin).not.toHaveBeenCalled();
  });
});
