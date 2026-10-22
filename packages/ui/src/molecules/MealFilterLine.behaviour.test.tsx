// Level 2 of decision-11 (behaviour) for MealFilterLine; see atoms/Button.behaviour.test.tsx for the pattern.
import { composeStories } from '@storybook/react-native-web-vite';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import * as stories from './MealFilterLine.stories.tsx';

const { Rest } = composeStories(stories);
afterEach(cleanup);
const user = userEvent.setup({ pointerEventsCheck: 0 });

describe('MealFilterLine', () => {
  it('says which meal the list is narrowed to and how many items are left to buy', () => {
    render(<Rest />);
    expect(screen.getByText('Only Chana masala · 4 to buy')).toBeTruthy();
  });

  it('asks to show every item again', async () => {
    const onShowAll = vi.fn();
    render(<Rest onShowAll={onShowAll} />);
    await user.click(screen.getByRole('button', { name: 'Show all' }));
    expect(onShowAll).toHaveBeenCalledExactlyOnceWith();
  });
});
