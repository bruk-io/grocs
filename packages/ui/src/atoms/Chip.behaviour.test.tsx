// Level 2 of decision-11 (behaviour) for Chip; see Button.behaviour.test.tsx for the pattern.
import { composeStories } from '@storybook/react-native-web-vite';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import * as stories from './Chip.stories.tsx';

afterEach(cleanup);

const { Rest, Selected, Disabled, QuickAddRest } = composeStories(stories);
const user = userEvent.setup({ pointerEventsCheck: 0 });

describe('Chip', () => {
  it('calls onPress once, with no arguments, when pressed', async () => {
    const onPress = vi.fn();
    render(<Rest onPress={onPress} />);
    await user.click(screen.getByRole('button', { name: 'Chana masala' }));
    expect(onPress).toHaveBeenCalledExactlyOnceWith();
  });

  it('can be pressed from the keyboard with Enter and Space', async () => {
    const onPress = vi.fn();
    render(<Rest onPress={onPress} />);
    await user.tab();
    expect(screen.getByRole('button', { name: 'Chana masala' })).toBe(document.activeElement);
    await user.keyboard('{Enter}');
    await user.keyboard(' ');
    expect(onPress).toHaveBeenCalledTimes(2);
  });

  it('reports whether it is chosen in the accessibility state', () => {
    render(<Rest />);
    expect(screen.getByRole('button', { name: 'Chana masala' }).getAttribute('aria-pressed')).toBe('false');
    cleanup();
    render(<Selected />);
    expect(screen.getByRole('button', { name: 'Chana masala' }).getAttribute('aria-pressed')).toBe('true');
  });

  it('is named by its label whatever its kind', async () => {
    const onPress = vi.fn();
    render(<QuickAddRest onPress={onPress} />);
    await user.click(screen.getByRole('button', { name: 'Bananas' }));
    expect(onPress).toHaveBeenCalledOnce();
  });

  it('reports disabled and does not call onPress', async () => {
    const onPress = vi.fn();
    render(<Disabled onPress={onPress} />);
    const chip = screen.getByRole('button', { name: 'Chana masala' });
    expect(chip.getAttribute('aria-disabled')).toBe('true');
    await user.click(chip);
    expect(onPress).not.toHaveBeenCalled();
  });
});
