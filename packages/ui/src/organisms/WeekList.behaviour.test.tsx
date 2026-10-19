// Level 2 of decision-11 (behaviour) for WeekList; see atoms/Button.behaviour.test.tsx for the pattern.
import { composeStories } from '@storybook/react-native-web-vite';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import * as stories from './WeekList.stories.tsx';

const { Rest, Empty } = composeStories(stories);
afterEach(cleanup);
const user = userEvent.setup({ pointerEventsCheck: 0 });

describe('WeekList', () => {
  it('shows all seven days', () => {
    render(<Rest />);
    for (const day of ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']) expect(screen.getByText(day)).toBeTruthy();
  });

  it('shows a slot to plan a meal on each day that has none', () => {
    render(<Rest />);
    expect(screen.getAllByRole('button', { name: 'Plan a meal' })).toHaveLength(3);
    cleanup();
    render(<Empty />);
    expect(screen.getAllByRole('button', { name: 'Plan a meal' })).toHaveLength(7);
  });

  it('opens a meal with its day and its id', async () => {
    const onOpenMeal = vi.fn();
    render(<Rest onOpenMeal={onOpenMeal} />);
    await user.click(screen.getByRole('button', { name: 'Green salad' }));
    expect(onOpenMeal).toHaveBeenCalledExactlyOnceWith('2026-10-21', 'm3');
  });

  it('plans a meal for the day whose slot was pressed', async () => {
    const onPlan = vi.fn();
    render(<Rest onPlan={onPlan} />);
    await user.click(screen.getAllByRole('button', { name: 'Plan a meal' })[1] as HTMLElement);
    expect(onPlan).toHaveBeenCalledExactlyOnceWith('2026-10-22');
  });
});
