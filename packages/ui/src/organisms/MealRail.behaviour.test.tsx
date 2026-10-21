// Level 2 of decision-11 (behaviour) for MealRail; see atoms/Button.behaviour.test.tsx for the pattern.
import { composeStories } from '@storybook/react-native-web-vite';
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import * as stories from './MealRail.stories.tsx';

const { NothingSelected, MealSelected, NoMealsYet } = composeStories(stories);
afterEach(cleanup);
const user = userEvent.setup({ pointerEventsCheck: 0 });

describe('MealRail', () => {
  it('is a navigation landmark holding the two pages, with Groceries current and its remaining count', () => {
    render(<NothingSelected />);
    const nav = screen.getByRole('navigation', { name: 'Sections and meals' });
    expect(within(nav).getByRole('link', { name: 'Meal plan' }).getAttribute('aria-current')).toBeNull();
    const groceries = within(nav).getByRole('link', { name: /^Groceries/ });
    expect(groceries.getAttribute('aria-current')).toBe('page');
    expect(groceries.textContent).toContain('14');
  });

  it('lists This week\'s meals: All items, each meal with its day and count, and Plan a meal', () => {
    render(<NothingSelected />);
    expect(screen.getByRole('heading', { name: "This week's meals" })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'All items' }).getAttribute('aria-pressed')).toBe('true');
    const chana = screen.getByRole('button', { name: /^Mon.*Chana masala.*5/ });
    expect(chana.getAttribute('aria-pressed')).toBe('false');
    expect(chana.textContent).toContain('Mon');
    expect(chana.textContent).toContain('5');
    expect(screen.getByRole('button', { name: /^Wed.*Sheet-pan chicken.*3/ })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Plan a meal' })).toBeTruthy();
  });

  it('marks the chosen meal pressed and All items not', () => {
    render(<MealSelected />);
    expect(screen.getByRole('button', { name: /^Mon.*Chana masala.*5/ }).getAttribute('aria-pressed')).toBe('true');
    expect(screen.getByRole('button', { name: 'All items' }).getAttribute('aria-pressed')).toBe('false');
  });

  it('with no meals shows only All items and Plan a meal', () => {
    render(<NoMealsYet />);
    expect(screen.getAllByRole('button').map((b) => b.textContent)).toEqual(['All items', 'Plan a meal']);
  });

  it('asks for a meal by id, and for all items when the chosen meal or All items is pressed', async () => {
    const onSelectMeal = vi.fn();
    const onShowAll = vi.fn();
    render(<NothingSelected onSelectMeal={onSelectMeal} onShowAll={onShowAll} />);
    await user.click(screen.getByRole('button', { name: /^Fri.*Pizza night.*2/ }));
    expect(onSelectMeal).toHaveBeenCalledExactlyOnceWith('pizza');
    await user.click(screen.getByRole('button', { name: 'All items' }));
    expect(onShowAll).toHaveBeenCalledExactlyOnceWith();
    cleanup();
    const again = vi.fn();
    const none = vi.fn();
    render(<MealSelected onSelectMeal={none} onShowAll={again} />);
    await user.click(screen.getByRole('button', { name: /^Mon.*Chana masala.*5/ }));
    expect(again).toHaveBeenCalledExactlyOnceWith();
    expect(none).not.toHaveBeenCalled();
  });

  it('reports the page chosen and the wish to plan a meal', async () => {
    const onSelectSection = vi.fn();
    const onPlanMeal = vi.fn();
    render(<NothingSelected onSelectSection={onSelectSection} onPlanMeal={onPlanMeal} />);
    await user.click(screen.getByRole('link', { name: 'Meal plan' }));
    expect(onSelectSection).toHaveBeenCalledExactlyOnceWith('plan');
    await user.click(screen.getByRole('button', { name: 'Plan a meal' }));
    expect(onPlanMeal).toHaveBeenCalledExactlyOnceWith();
  });

  it('shows no count on Groceries when nothing is left to buy', () => {
    render(<NothingSelected toGo={0} />);
    expect(screen.getByRole('link', { name: 'Groceries' })).toBeTruthy();
  });
});
