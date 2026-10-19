// Level 2 of decision-11 (behaviour) for SubHeader; see atoms/Button.behaviour.test.tsx for the pattern.
import { composeStories } from '@storybook/react-native-web-vite';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import * as stories from './SubHeader.stories.tsx';

const { Back, Line, Wordmark } = composeStories(stories);
afterEach(cleanup);
const user = userEvent.setup({ pointerEventsCheck: 0 });

describe('SubHeader', () => {
  it('with a back link names the parent screen, shows the date tag and the title', () => {
    render(<Back />);
    expect(screen.getByRole('button', { name: 'Meal plan' })).toBeTruthy();
    expect(screen.getByText('Thursday, Oct 22')).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Add a meal' })).toBeTruthy();
  });

  it('goes back when the back link is pressed', async () => {
    const onPress = vi.fn();
    render(<Back lead={{ kind: 'back', label: 'Meal plan', onPress }} />);
    await user.click(screen.getByRole('button', { name: 'Meal plan' }));
    expect(onPress).toHaveBeenCalledExactlyOnceWith();
  });

  it('with the wordmark has no back link, because nothing sits behind it', () => {
    render(<Wordmark />);
    expect(screen.getByText('Grocs')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Meal plan' })).toBeNull();
    expect(screen.getByRole('heading', { name: "You're invited" })).toBeTruthy();
  });

  it('with a plain line shows it as text, not as a button', () => {
    render(<Line />);
    expect(screen.getByText('Signed in as you@example.com')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Signed in as you@example.com' })).toBeNull();
  });
});
