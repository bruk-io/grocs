// Level 2 of decision-11 (behaviour) for MealEmpty; see atoms/Button.behaviour.test.tsx for the pattern.
import { composeStories } from '@storybook/react-native-web-vite';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import * as stories from './MealEmpty.stories.tsx';

const { Rest, Disabled } = composeStories(stories);
afterEach(cleanup);
const user = userEvent.setup({ pointerEventsCheck: 0 });

describe('MealEmpty', () => {
  it('is one button named by what it says', () => {
    render(<Rest />);
    expect(screen.getByRole('button', { name: 'Plan a meal' })).toBeTruthy();
  });

  it('takes another label', () => {
    render(<Rest label="Plan dinner" />);
    expect(screen.getByRole('button', { name: 'Plan dinner' })).toBeTruthy();
  });

  it('calls onPress once, with no arguments, when pressed', async () => {
    const onPress = vi.fn();
    render(<Rest onPress={onPress} />);
    await user.click(screen.getByRole('button', { name: 'Plan a meal' }));
    expect(onPress).toHaveBeenCalledExactlyOnceWith();
  });

  it('can be pressed from the keyboard', async () => {
    const onPress = vi.fn();
    render(<Rest onPress={onPress} />);
    await user.tab();
    await user.keyboard('{Enter}');
    expect(onPress).toHaveBeenCalledOnce();
  });

  it('reports disabled and does not call onPress', async () => {
    const onPress = vi.fn();
    render(<Disabled onPress={onPress} />);
    const slot = screen.getByRole('button', { name: 'Plan a meal' });
    expect(slot.getAttribute('aria-disabled')).toBe('true');
    await user.click(slot);
    expect(onPress).not.toHaveBeenCalled();
  });
});
