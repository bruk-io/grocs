// Level 2 of decision-11 (behaviour) for MealPlanTemplate; see atoms/Button.behaviour.test.tsx for the pattern.
import { composeStories } from '@storybook/react-native-web-vite';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import * as stories from './MealPlanTemplate.stories.tsx';

const { Week, AnotherWeek } = composeStories(stories);
afterEach(cleanup);
const user = userEvent.setup({ pointerEventsCheck: 0 });

describe('MealPlanTemplate', () => {
  it('shows the week with the plan, and the tab bar with Meal plan selected', () => {
    render(<Week />);
    expect(screen.getByRole('heading', { name: 'This week' })).toBeTruthy();
    expect(screen.getByText('Oct 19 - 25')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Chana masala example.com' })).toBeTruthy();
    expect(screen.getByRole('tab', { name: 'Meal plan' }).getAttribute('aria-selected')).toBe('true');
  });

  it('shows what is still to buy on the Groceries tab, and nothing when there is none', () => {
    render(<Week />);
    expect(screen.getByRole('tab', { name: /Groceries/ }).textContent).toContain('14');
    cleanup();
    render(<Week toBuy={0} />);
    expect(screen.getByRole('tab', { name: 'Groceries' })).toBeTruthy();
  });

  it('steps the week and opens settings', async () => {
    const onPreviousWeek = vi.fn();
    const onNextWeek = vi.fn();
    const onSettings = vi.fn();
    render(<Week onPreviousWeek={onPreviousWeek} onNextWeek={onNextWeek} onSettings={onSettings} />);
    await user.click(screen.getByRole('button', { name: 'Previous week' }));
    await user.click(screen.getByRole('button', { name: 'Next week' }));
    await user.click(screen.getByRole('button', { name: 'Settings' }));
    expect(onPreviousWeek).toHaveBeenCalledOnce();
    expect(onNextWeek).toHaveBeenCalledOnce();
    expect(onSettings).toHaveBeenCalledOnce();
  });

  it('opens a meal and plans an empty day, by day id', async () => {
    const onOpenMeal = vi.fn();
    const onPlan = vi.fn();
    render(<Week onOpenMeal={onOpenMeal} onPlan={onPlan} />);
    await user.click(screen.getByRole('button', { name: 'Green salad' }));
    expect(onOpenMeal).toHaveBeenCalledExactlyOnceWith('2026-10-21', 'm3');
    await user.click(screen.getAllByRole('button', { name: 'Plan a meal' })[0] as HTMLElement);
    expect(onPlan).toHaveBeenCalledExactlyOnceWith('2026-10-20');
  });

  it('goes to Groceries from the tab bar, and does nothing from its own tab', async () => {
    const onOpenGroceries = vi.fn();
    render(<Week onOpenGroceries={onOpenGroceries} />);
    await user.click(screen.getByRole('tab', { name: 'Meal plan' }));
    expect(onOpenGroceries).not.toHaveBeenCalled();
    await user.click(screen.getByRole('tab', { name: /Groceries/ }));
    expect(onOpenGroceries).toHaveBeenCalledExactlyOnceWith();
  });

  it('shows the correct title for current and different weeks', () => {
    render(<Week />);
    expect(screen.getByRole('heading', { name: 'This week' })).toBeTruthy();
    cleanup();
    render(<AnotherWeek />);
    expect(screen.getByRole('heading', { name: 'That week' })).toBeTruthy();
  });
});
