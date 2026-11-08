// Level 2 of decision-11 (behaviour) for RecipeTemplate; see atoms/Button.behaviour.test.tsx for the pattern.
import { composeStories } from '@storybook/react-native-web-vite';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import * as stories from './RecipeTemplate.stories.tsx';

const { Rest, NoYield } = composeStories(stories);
afterEach(cleanup);
const user = userEvent.setup({ pointerEventsCheck: 0 });

describe('RecipeTemplate', () => {
  it('shows the title, yield, source, ingredients and numbered steps', () => {
    render(<Rest />);
    expect(screen.getByRole('heading', { name: 'Chana masala' })).toBeTruthy();
    expect(screen.getByText('4 servings')).toBeTruthy();
    expect(screen.getByText('From example.com')).toBeTruthy();
    expect(screen.getByText('1 1/2 cups chickpeas')).toBeTruthy();
    expect(screen.getByText(/^1\. Heat the oil/)).toBeTruthy();
  });

  it('leaves out the yield tag when there is none', () => {
    render(<NoYield />);
    expect(screen.queryByText('4 servings')).toBeNull();
  });

  it('goes back to Meal plan', async () => {
    const onBack = vi.fn();
    render(<Rest onBack={onBack} />);
    await user.click(screen.getByRole('button', { name: 'Meal plan' }));
    expect(onBack).toHaveBeenCalledExactlyOnceWith();
  });
});
