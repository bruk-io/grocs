// Level 2 of decision-11 (behaviour) for NavTabs; see atoms/Button.behaviour.test.tsx for the pattern.
import { composeStories } from '@storybook/react-native-web-vite';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import * as stories from './NavTabs.stories.tsx';

const { PlanActive, GroceriesActive } = composeStories(stories);
afterEach(cleanup);
const user = userEvent.setup({ pointerEventsCheck: 0 });

describe('NavTabs', () => {
  it('is a tab list with a tab for each page, the active one selected', () => {
    render(<PlanActive />);
    expect(screen.getByRole('tablist', { name: 'Main' })).toBeTruthy();
    expect(screen.getByRole('tab', { name: 'Meal plan' }).getAttribute('aria-selected')).toBe('true');
    expect(screen.getByRole('tab', { name: /Groceries/ }).getAttribute('aria-selected')).toBe('false');
  });

  it('selects the other tab when the active page changes', () => {
    render(<GroceriesActive />);
    expect(screen.getByRole('tab', { name: 'Meal plan' }).getAttribute('aria-selected')).toBe('false');
    expect(screen.getByRole('tab', { name: /Groceries/ }).getAttribute('aria-selected')).toBe('true');
  });

  it('shows what is still to buy on the tab', () => {
    render(<PlanActive />);
    expect(screen.getByRole('tab', { name: /Groceries/ }).textContent).toContain('14');
  });

  it('reports the id of the tab that was pressed', async () => {
    const onSelect = vi.fn();
    render(<PlanActive onSelect={onSelect} />);
    await user.click(screen.getByRole('tab', { name: /Groceries/ }));
    expect(onSelect).toHaveBeenCalledExactlyOnceWith('groceries');
  });
});
