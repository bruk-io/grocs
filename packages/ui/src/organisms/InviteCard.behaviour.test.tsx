// Level 2 of decision-11 (behaviour) for InviteCard; see atoms/Button.behaviour.test.tsx for the pattern.
import { composeStories } from '@storybook/react-native-web-vite';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import * as stories from './InviteCard.stories.tsx';

const { Waiting, Joined, Unsent, Unshareable } = composeStories(stories);
afterEach(cleanup);
const user = userEvent.setup({ pointerEventsCheck: 0 });

describe('InviteCard', () => {
  it('shows the code and the two ways to send it', () => {
    render(<Waiting />);
    expect(screen.getByText('MOREL-24')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Share link' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Copy code' })).toBeTruthy();
  });

  it('shares and copies, each to its own callback', async () => {
    const onShare = vi.fn();
    const onCopy = vi.fn();
    render(<Waiting onShare={onShare} onCopy={onCopy} />);
    await user.click(screen.getByRole('button', { name: 'Share link' }));
    expect(onShare).toHaveBeenCalledExactlyOnceWith();
    expect(onCopy).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: 'Copy code' }));
    expect(onCopy).toHaveBeenCalledExactlyOnceWith();
  });

  it('says it is waiting for the partner, then that they joined', () => {
    render(<Waiting />);
    expect(screen.getByText('Link sent. Waiting for them to join…')).toBeTruthy();
    cleanup();
    render(<Joined />);
    expect(screen.getByText('Sam joined your kitchen!')).toBeTruthy();
  });

  it('has no status line before the link is shared', () => {
    const { container } = render(<Unsent />);
    expect(container.querySelector('[aria-live="polite"]')).toBeNull();
  });

  it('disables both buttons when there is nothing to share, and enables each with its handler', () => {
    const disabled = (name: string) => screen.getByRole('button', { name }).getAttribute('aria-disabled') === 'true';
    render(<Unshareable />);
    expect(disabled('Share link')).toBe(true);
    expect(disabled('Copy code')).toBe(true);
    cleanup();
    render(<Unshareable onShare={() => undefined} />);
    expect(disabled('Share link')).toBe(false);
    expect(disabled('Copy code')).toBe(true);
  });
});
