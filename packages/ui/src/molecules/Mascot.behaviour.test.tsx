// Level 2 of decision-11 (behaviour) for the Mascot: tapping plays the reaction and the bubble, and the line is
// announced to screen readers (R40). Found by role and name, driven with userEvent; no styles or internals.
import { composeStories } from '@storybook/react-native-web-vite';
import { act, cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AccessibilityInfo } from 'react-native';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mascots } from '../mascots/data.ts';
import { reactionMs } from '../mascots/motion.ts';
import { tokens } from '../tokens/tokens.ts';
import * as stories from './Mascot.stories.tsx';

const { Idle, Reduced, Disabled } = composeStories(stories);
const cremi = mascots.cremi;
const label = 'Cremi the cremini, tap to hear a line';

let announce: ReturnType<typeof vi.spyOn>;
beforeEach(() => {
  // The clock also ticks on its own: Testing Library waits on real timers between steps and would hang on a frozen one.
  vi.useFakeTimers({ shouldAdvanceTime: true });
  announce = vi.spyOn(AccessibilityInfo, 'announceForAccessibility').mockImplementation(() => undefined);
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

const user = () => userEvent.setup({ delay: null, pointerEventsCheck: 0 });

describe('Mascot', () => {
  it('is a button named for the mushroom, with a hint that tapping speaks', () => {
    render(<Idle />);
    expect(screen.getByRole('button', { name: label })).toBeTruthy();
    expect(screen.queryByText(cremi.lines[0] as string)).toBeNull();
  });

  it('shows the first line in a bubble, announces it and reports it when tapped', async () => {
    const onPress = vi.fn();
    render(<Idle onPress={onPress} />);
    await user().click(screen.getByRole('button', { name: label }));
    expect(screen.getByText(cremi.lines[0] as string)).toBeTruthy();
    expect(announce).toHaveBeenCalledExactlyOnceWith(cremi.lines[0]);
    expect(onPress).toHaveBeenCalledExactlyOnceWith(cremi.lines[0]);
  });

  it('says the lines in order, one per tap, and starts over after the last', async () => {
    render(<Idle />);
    const tap = async () => user().click(screen.getByRole('button', { name: label }));
    for (let n = 0; n < cremi.lines.length + 1; n++) await tap();
    expect(announce.mock.calls.map((call: unknown[]) => call[0])).toEqual([...cremi.lines, cremi.lines[0]]);
    expect(screen.getByText(cremi.lines[0] as string)).toBeTruthy();
  });

  it('takes the bubble down once the talk duration has passed', async () => {
    render(<Idle />);
    await user().click(screen.getByRole('button', { name: label }));
    expect(screen.getByText(cremi.lines[0] as string)).toBeTruthy();
    // The reaction ends first (the line stays up), then the rest of the talk duration runs.
    act(() => void vi.advanceTimersByTime(reactionMs(cremi)));
    expect(screen.getByText(cremi.lines[0] as string)).toBeTruthy();
    act(() => void vi.advanceTimersByTime(tokens.motion.duration.talk - reactionMs(cremi) - 1));
    expect(screen.getByText(cremi.lines[0] as string)).toBeTruthy();
    act(() => void vi.advanceTimersByTime(1));
    expect(screen.queryByText(cremi.lines[0] as string)).toBeNull();
  });

  it('can be tapped from the keyboard', async () => {
    render(<Idle />);
    await user().tab();
    expect(screen.getByRole('button', { name: label })).toBe(document.activeElement);
    await user().keyboard('{Enter}');
    expect(announce).toHaveBeenCalledExactlyOnceWith(cremi.lines[0]);
  });

  it('still shows and announces the line when motion is reduced', async () => {
    render(<Reduced />);
    await user().click(screen.getByRole('button', { name: label }));
    expect(screen.getByText(cremi.lines[0] as string)).toBeTruthy();
    expect(announce).toHaveBeenCalledExactlyOnceWith(cremi.lines[0]);
  });

  it('does nothing when disabled, and says so', async () => {
    const onPress = vi.fn();
    render(<Disabled onPress={onPress} />);
    const button = screen.getByRole('button', { name: label });
    expect(button.getAttribute('aria-disabled')).toBe('true');
    await user().click(button);
    expect(onPress).not.toHaveBeenCalled();
    expect(announce).not.toHaveBeenCalled();
  });
});
