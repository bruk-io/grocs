// Level 2 of decision-11 (behaviour) for EmptyList; see atoms/Button.behaviour.test.tsx for the pattern.
import { composeStories } from '@storybook/react-native-web-vite';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import * as stories from './EmptyList.stories.tsx';

const { Rest } = composeStories(stories);
afterEach(cleanup);
const user = userEvent.setup({ pointerEventsCheck: 0 });

describe('EmptyList', () => {
  it('says the list is empty and how to fill it', () => {
    render(<Rest />);
    expect(screen.getByText('Nothing on the list yet')).toBeTruthy();
    expect(screen.getByText(/plan a meal and its ingredients will turn up here/)).toBeTruthy();
  });

  it('adds an item from the button', async () => {
    const onAction = vi.fn();
    render(<Rest onAction={onAction} />);
    await user.click(screen.getByRole('button', { name: 'Add an item' }));
    expect(onAction).toHaveBeenCalledExactlyOnceWith();
  });

  it('takes its words from props', () => {
    render(<Rest title="No meals yet" message="Plan one." actionLabel="Plan a meal" />);
    expect(screen.getByText('No meals yet')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Plan a meal' })).toBeTruthy();
  });
});
