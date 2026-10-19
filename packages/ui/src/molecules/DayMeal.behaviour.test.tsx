// Level 2 of decision-11 (behaviour) for DayMeal; see atoms/Button.behaviour.test.tsx for the pattern.
import { composeStories } from '@storybook/react-native-web-vite';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import * as stories from './DayMeal.stories.tsx';

const { Rest, Disabled } = composeStories(stories);
afterEach(cleanup);
const user = userEvent.setup({ pointerEventsCheck: 0 });

describe('DayMeal', () => {
  it('shows the day over its date, beside the meal', () => {
    render(<Rest />);
    expect(screen.getByText('FRI')).toBeTruthy();
    expect(screen.getByText('23')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Pizza night' })).toBeTruthy();
  });

  it('calls onPress once, with no arguments, when the meal is pressed', async () => {
    const onPress = vi.fn();
    render(<Rest onPress={onPress} />);
    await user.click(screen.getByRole('button', { name: 'Pizza night' }));
    expect(onPress).toHaveBeenCalledExactlyOnceWith();
  });

  it('reports disabled and does not call onPress', async () => {
    const onPress = vi.fn();
    render(<Disabled onPress={onPress} />);
    const meal = screen.getByRole('button', { name: 'Pizza night' });
    expect(meal.getAttribute('aria-disabled')).toBe('true');
    await user.click(meal);
    expect(onPress).not.toHaveBeenCalled();
  });
});
