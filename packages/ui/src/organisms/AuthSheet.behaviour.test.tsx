// Level 2 of decision-11 (behaviour) for AuthSheet; see atoms/Button.behaviour.test.tsx for the pattern.
import { composeStories } from '@storybook/react-native-web-vite';
import { cleanup, render, screen } from '@testing-library/react';
import { StyleSheet } from 'react-native';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Text } from '../atoms/Text.tsx';
import { AuthSheet } from './AuthSheet.tsx';
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
    render(<PrimaryAction onPrimary={onPrimary} />);
    expect(screen.queryByRole('button', { name: 'Continue with Google' })).toBeNull();
    expect(screen.queryByText('Got an invite?')).toBeNull();
    expect(screen.getAllByRole('button')).toHaveLength(1);
    await user.click(screen.getByRole('button', { name: 'Try the demo' }));
    expect(onPrimary).toHaveBeenCalledExactlyOnceWith();
  });

  it('still shows the footer under the primary action', () => {
    render(<PrimaryAction footer={<Text>Sign in as Bruk (test)</Text>} />);
    expect(screen.getByRole('button', { name: 'Try the demo' })).toBeTruthy();
    expect(screen.getByText('Sign in as Bruk (test)')).toBeTruthy();
  });

  // The browser sizes a flex: 1 child of a content-sized column to its content; Yoga (Android) gives it a basis of 0, so only its padding is left and the button overflows (TASK-36). The browser cannot show that, so the style is asserted.
  it.each([
    ['sign-in', <AuthSheet key="a" />],
    ['primary action', <AuthSheet key="b" primaryLabel="Try the demo" onPrimary={() => {}} />],
  ])('does not set a flex basis of 0 on the %s sheet, which Yoga turns into a sheet of padding only under a content-sized parent', (_name, element) => {
    // AuthSheet is a plain function component, so calling it gives its root View element and the style it sets.
    const root = AuthSheet(element.props) as { props: { style: unknown } };
    const sheet = StyleSheet.flatten(root.props.style as never) as { flex?: number; flexBasis?: unknown };
    expect(sheet.flex === undefined || sheet.flex === 0 || sheet.flex < 0).toBe(true);
    expect(sheet.flexBasis === undefined || sheet.flexBasis === 'auto').toBe(true);
  });
});
