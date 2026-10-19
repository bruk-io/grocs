// Level 2 of decision-11 (behaviour) for DayRow; see atoms/Button.behaviour.test.tsx for the pattern.
import { composeStories } from '@storybook/react-native-web-vite';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import * as stories from './DayRow.stories.tsx';

const { OneMeal, ManyMeals, Empty } = composeStories(stories);
afterEach(cleanup);
const user = userEvent.setup({ pointerEventsCheck: 0 });

describe('DayRow', () => {
  it('shows the day beside its one meal', () => {
    render(<OneMeal />);
    expect(screen.getByText('FRI')).toBeTruthy();
    expect(screen.getByText('23')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Pizza night' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Plan a meal' })).toBeNull();
  });

  it('shows two or more meals in the order given', () => {
    render(<ManyMeals />);
    const names = screen.getAllByRole('button').map((b) => b.textContent);
    expect(names).toEqual(['Sheet-pan chicken' + 'example.com', 'Green salad']);
  });

  it('shows the slot to plan a meal when the day has none, and plans from it', async () => {
    const onPlan = vi.fn();
    render(<Empty onPlan={onPlan} />);
    await user.click(screen.getByRole('button', { name: 'Plan a meal' }));
    expect(onPlan).toHaveBeenCalledExactlyOnceWith();
  });

  it('opens the meal that was pressed, by its id', async () => {
    const onOpenMeal = vi.fn();
    render(<ManyMeals onOpenMeal={onOpenMeal} />);
    await user.click(screen.getByRole('button', { name: 'Green salad' }));
    expect(onOpenMeal).toHaveBeenCalledExactlyOnceWith('b');
  });
});
