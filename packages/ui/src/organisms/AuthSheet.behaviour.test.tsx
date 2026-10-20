// Level 2 of decision-11 (behaviour) for AuthSheet; see atoms/Button.behaviour.test.tsx for the pattern.
import { composeStories } from '@storybook/react-native-web-vite';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import * as stories from './AuthSheet.stories.tsx';

const { Rest, SigningIn, Disabled, PrimaryAction } = composeStories(stories);
afterEach(cleanup);
const user = userEvent.setup({ pointerEventsCheck: 0 });

describe('AuthSheet', () => {
  it('offers Google as the one way to sign in, and a way in for an invite', () => {
    render(<Rest />);
    expect(screen.getByRole('button', { name: 'Continue with Google' })).toBeTruthy();
    expect(screen.getByText('Got an invite?')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Open it to join' })).toBeTruthy();
  });

  it('continues with Google and opens the invite, each to its own callback', async () => {
    const onContinue = vi.fn();
    const onOpenInvite = vi.fn();
    render(<Rest onContinue={onContinue} onOpenInvite={onOpenInvite} />);
    await user.click(screen.getByRole('button', { name: 'Continue with Google' }));
    expect(onContinue).toHaveBeenCalledExactlyOnceWith();
    expect(onOpenInvite).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: 'Open it to join' }));
    expect(onOpenInvite).toHaveBeenCalledExactlyOnceWith();
  });

  it('shows the button busy while Google is open, and does not press twice', async () => {
    const onContinue = vi.fn();
    render(<SigningIn onContinue={onContinue} />);
    const busy = screen.getByRole('button', { name: 'Signing in' });
    expect(busy.getAttribute('aria-busy')).toBe('true');
    await user.click(busy);
    expect(onContinue).not.toHaveBeenCalled();
  });

  it('turns both buttons off when disabled', async () => {
    const onContinue = vi.fn();
    const onOpenInvite = vi.fn();
    render(<Disabled onContinue={onContinue} onOpenInvite={onOpenInvite} />);
    for (const name of ['Continue with Google', 'Open it to join']) {
      const button = screen.getByRole('button', { name });
      expect(button.getAttribute('aria-disabled')).toBe('true');
      await user.click(button);
    }
    expect(onContinue).not.toHaveBeenCalled();
    expect(onOpenInvite).not.toHaveBeenCalled();
  });

  it('can lead with one primary action in place of Google and the invite row', async () => {
    const onPrimary = vi.fn();
    const onContinue = vi.fn();
    render(<PrimaryAction onPrimary={onPrimary} onContinue={onContinue} />);
    expect(screen.queryByRole('button', { name: 'Continue with Google' })).toBeNull();
    expect(screen.queryByText('Got an invite?')).toBeNull();
    await user.click(screen.getByRole('button', { name: 'Try the demo' }));
    expect(onPrimary).toHaveBeenCalledExactlyOnceWith();
    expect(onContinue).not.toHaveBeenCalled();
  });
});
