// Level 2 of decision-11 (behaviour) for WeekNav; see atoms/Button.behaviour.test.tsx for the pattern.
import { composeStories } from '@storybook/react-native-web-vite';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import * as stories from './WeekNav.stories.tsx';

const { Rest } = composeStories(stories);
afterEach(cleanup);
const user = userEvent.setup({ pointerEventsCheck: 0 });

describe('WeekNav', () => {
  it('shows the week between a previous and a next button', () => {
    render(<Rest />);
    expect(screen.getByText('Oct 19 - 25')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Previous week' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Next week' })).toBeTruthy();
  });

  it('reports a step back and a step forward, each to its own callback', async () => {
    const onPrevious = vi.fn();
    const onNext = vi.fn();
    render(<Rest onPrevious={onPrevious} onNext={onNext} />);
    await user.click(screen.getByRole('button', { name: 'Previous week' }));
    expect(onPrevious).toHaveBeenCalledExactlyOnceWith();
    expect(onNext).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: 'Next week' }));
    expect(onNext).toHaveBeenCalledExactlyOnceWith();
    expect(onPrevious).toHaveBeenCalledOnce();
  });
});
