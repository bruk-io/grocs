// Level 2 of decision-11 (behaviour) for KitchenScene: the whole cast is there and answers a tap, and under
// reduce motion nothing in the kitchen is animated (R41, R60). See atoms/Button.behaviour.test.tsx for the pattern.
import { composeStories } from '@storybook/react-native-web-vite';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AccessibilityInfo } from 'react-native';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { tokens } from '../../tokens/tokens.ts';
import { sceneMotion } from './motion.ts';
import * as stories from './Kitchen.stories.tsx';

const { Panning, Reduced } = composeStories(stories);
const user = userEvent.setup({ pointerEventsCheck: 0 });

beforeEach(() => {
  vi.spyOn(AccessibilityInfo, 'announceForAccessibility').mockImplementation(() => undefined);
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const HOSTS = ['Ollie the oyster', 'Shii the shiitake', 'Morty the morel', 'Cremi the cremini', 'Chanty the chanterelle', 'The enoki siblings'];

describe('KitchenScene', () => {
  it('has all six hosts at home, each a button named for the mushroom', () => {
    render(<Panning />);
    for (const host of HOSTS) expect(screen.getByRole('button', { name: `${host}, tap to hear a line` })).toBeTruthy();
  });

  it('reports which host was tapped, and the line they said', async () => {
    const onMascotPress = vi.fn();
    render(<Panning onMascotPress={onMascotPress} />);
    await user.click(screen.getByRole('button', { name: 'Morty the morel, tap to hear a line' }));
    expect(onMascotPress).toHaveBeenCalledExactlyOnceWith('morty', expect.any(String));
  });

  it('still shows every host with reduce motion on', () => {
    render(<Reduced />);
    expect(screen.getAllByRole('button')).toHaveLength(HOSTS.length);
  });

  describe('sceneMotion', () => {
    it('moves nothing when motion is reduced: no pan, no bob, no door, no steam or light', () => {
      expect(sceneMotion(true)).toEqual({ pan: null, bob: null, door: null, parts: {} });
    });

    it('otherwise pans for the pan token and bobs for the bob token, forever', () => {
      const motion = sceneMotion(false);
      expect(motion.pan?.animationDuration).toBe(tokens.motion.duration.kitchenPan);
      expect(motion.bob?.animationDuration).toBe(tokens.motion.duration.kitchenBob);
      expect(motion.pan?.animationIterationCount).toBe('infinite');
      expect(motion.door).not.toBeNull();
    });

    it('starts each puff of steam a third of a cycle after the last', () => {
      const { parts } = sceneMotion(false);
      const delay = (name: string) => ((parts[name] as { style: { animationDelay: number } }).style.animationDelay);
      expect(delay('steam')).toBe(0);
      expect(delay('steam2')).toBe(tokens.motion.duration.mascotCycle / 3);
      expect(delay('steam3')).toBe((tokens.motion.duration.mascotCycle / 3) * 2);
    });
  });
});
