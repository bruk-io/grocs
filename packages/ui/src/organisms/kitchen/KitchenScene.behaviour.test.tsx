// Level 2 of decision-11 (behaviour) for KitchenScene: the whole cast is there and answers a tap, and under
// reduce motion nothing in the kitchen is animated (R41, R60). See atoms/Button.behaviour.test.tsx for the pattern.
import { composeStories } from '@storybook/react-native-web-vite';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AccessibilityInfo } from 'react-native';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { tokens } from '../../tokens/tokens.ts';
import { CAST_BEHIND_DOOR, CAST_IN_FRONT, panStops, WORLD } from './art/scene-layout.ts';
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

  // TASK-36: the scene was a fixed 1020 x 600 box shrunk by a transform. A transform leaves the layout box at full
  // size, and on Android that box pushed the sheet off the screen. Sizing must come from layout.
  describe('layout (TASK-36)', () => {
    it('sizes the world from its window with an aspect ratio, out of flow, and not by a transform', () => {
      render(<Reduced />);
      const world = screen.getByTestId('kitchen-world');
      const style = getComputedStyle(world);
      expect(style.position).toBe('absolute');
      expect(style.height).toBe('100%');
      expect(parseFloat(style.aspectRatio)).toBeCloseTo(WORLD.width / WORLD.height, 3);
      expect(style.transform === '' || style.transform === 'none').toBe(true);
    });

    it('has no element with the scene drawn at a fixed pixel size', () => {
      const { container } = render(<Reduced />);
      const fixed = Array.from(container.querySelectorAll("*")).filter((el) => {
        const style = getComputedStyle(el);
        return style.width === `${WORLD.width}px` || style.height === `${WORLD.height}px`;
      });
      expect(fixed).toHaveLength(0);
    });

    it('places the hosts by percentage of the world', () => {
      render(<Reduced />);
      const morty = CAST_IN_FRONT.find((host) => host.name === 'morty');
      const lefts: string[] = [];
      for (let el: HTMLElement | null = screen.getByRole('button', { name: 'Morty the morel, tap to hear a line' }); el; el = el.parentElement) lefts.push(getComputedStyle(el).left);
      expect(lefts).toContain(`${((morty?.left ?? 0) / WORLD.width) * 100}%`);
    });
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

  describe('panStops', () => {
    const visible = (windowWidth: number, scale: number) => windowWidth / scale;
    const cast = [...CAST_BEHIND_DOOR, ...CAST_IN_FRONT];
    const wholeAt = (stop: number, width: number, host: { left: number; size: number }) => host.left >= -stop && host.left + host.size <= -stop + width;

    it('at scale 1 stops at the kitchen edge and centres the stove between', () => {
      const { mid, far } = panStops(visible(393, 1));
      expect(far).toBe(-(WORLD.width - 393));
      expect(mid).toBe(393 / 2 - (584 + 32));
    });

    it('at scale 1.3 reaches further than the old fixed -630 stop', () => {
      const width = visible(412, 1.3);
      const { mid, far } = panStops(width);
      expect(far).toBeCloseTo(-(WORLD.width - width));
      expect(far).toBeLessThan(-630);
      expect(mid).toBeGreaterThanOrEqual(far);
      expect(mid).toBeLessThanOrEqual(0);
    });

    it('never moves past the left edge when the window shows the whole kitchen', () => {
      expect(panStops(WORLD.width * 2)).toEqual({ mid: 0, far: -0 });
    });

    it.each([
      ['360 x 640', 360, 640],
      ['412 x 915', 412, 915],
      ['the Fold inner screen', 791, 820],
    ])('brings every mascot fully into frame at some stop on %s', (_name, windowWidth, windowHeight) => {
      const width = visible(windowWidth, windowHeight / WORLD.height);
      const { mid, far } = panStops(width);
      for (const host of cast) {
        const sweep = Array.from({ length: 101 }, (_unused, i) => (far * i) / 100);
        expect(sweep.some((stop) => wholeAt(stop, width, host))).toBe(true);
      }
    });

    it('feeds the pan keyframes of the scene motion', () => {
      const { far } = panStops(300);
      const pan = sceneMotion(false, 300).pan?.animationName as unknown as Record<string, { transform: { translateX: number }[] }>;
      expect(pan['57%']?.transform[0]?.translateX).toBe(far);
    });
  });
});
