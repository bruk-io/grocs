// Level 2 of decision-11 (behaviour) for SignInTemplate; see atoms/Button.behaviour.test.tsx for the pattern.
import { composeStories } from '@storybook/react-native-web-vite';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AccessibilityInfo } from 'react-native';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as stories from './SignInTemplate.stories.tsx';

const { Rest, WithFooter } = composeStories(stories);
const user = userEvent.setup({ pointerEventsCheck: 0 });
beforeEach(() => {
  vi.spyOn(AccessibilityInfo, 'announceForAccessibility').mockImplementation(() => undefined);
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('SignInTemplate', () => {
  it('shows the name and the tagline over the kitchen, and the sheet with the ways in', () => {
    render(<Rest />);
    expect(screen.getByRole('heading', { name: 'Grocs' })).toBeTruthy();
    expect(screen.getByText('Plan the week. Shop together.')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Continue with Google' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Open it to join' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Cremi the cremini, tap to hear a line' })).toBeTruthy();
  });

  it('continues with Google and opens the invite', async () => {
    const onContinue = vi.fn();
    const onOpenInvite = vi.fn();
    render(<Rest onContinue={onContinue} onOpenInvite={onOpenInvite} />);
    await user.click(screen.getByRole('button', { name: 'Continue with Google' }));
    expect(onContinue).toHaveBeenCalledExactlyOnceWith();
    await user.click(screen.getByRole('button', { name: 'Open it to join' }));
    expect(onOpenInvite).toHaveBeenCalledExactlyOnceWith();
  });

  it('shows the button busy while Google is open', () => {
    render(<Rest signingIn />);
    expect(screen.getByRole('button', { name: 'Signing in' }).getAttribute('aria-busy')).toBe('true');
  });

  it('shows the footer text, next to Continue with Google', () => {
    render(<WithFooter />);
    expect(screen.getByRole('button', { name: 'Continue with Google' })).toBeTruthy();
    expect(screen.getByText('auth/google-sign-in-cancelled')).toBeTruthy();
  });

  it('reports a tap on a host', async () => {
    const onMascotPress = vi.fn();
    render(<Rest onMascotPress={onMascotPress} />);
    await user.click(screen.getByRole('button', { name: 'Shii the shiitake, tap to hear a line' }));
    expect(onMascotPress).toHaveBeenCalledExactlyOnceWith('shii', expect.any(String));
  });
});
