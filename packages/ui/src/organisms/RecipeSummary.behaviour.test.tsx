// Level 2 of decision-11 (behaviour) for RecipeSummary; see atoms/Button.behaviour.test.tsx for the pattern.
import { composeStories } from '@storybook/react-native-web-vite';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import * as stories from './RecipeSummary.stories.tsx';

const { Rest, MinServings } = composeStories(stories);
afterEach(cleanup);
const user = userEvent.setup({ pointerEventsCheck: 0 });

describe('RecipeSummary', () => {
  it('says how many ingredients were found, where, and for how many servings', () => {
    render(<Rest />);
    expect(screen.getByText('Found 12 ingredients')).toBeTruthy();
    expect(screen.getByText('example.com')).toBeTruthy();
    expect(screen.getByText('4')).toBeTruthy();
  });

  it('sends the number of servings it wants, not a step', async () => {
    const onServingsChange = vi.fn();
    render(<Rest onServingsChange={onServingsChange} />);
    await user.click(screen.getByRole('button', { name: 'More servings' }));
    expect(onServingsChange).toHaveBeenLastCalledWith(5);
    await user.click(screen.getByRole('button', { name: 'Fewer servings' }));
    expect(onServingsChange).toHaveBeenLastCalledWith(3);
  });

  it('turns the minus off at one serving', async () => {
    const onServingsChange = vi.fn();
    render(<MinServings onServingsChange={onServingsChange} />);
    const fewer = screen.getByRole('button', { name: 'Fewer servings' });
    expect(fewer.getAttribute('aria-disabled')).toBe('true');
    await user.click(fewer);
    expect(onServingsChange).not.toHaveBeenCalled();
  });
});
