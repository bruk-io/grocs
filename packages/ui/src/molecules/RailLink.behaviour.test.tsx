// Level 2 of decision-11 (behaviour) for RailLink; see atoms/Button.behaviour.test.tsx for the pattern.
import { composeStories } from '@storybook/react-native-web-vite';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import * as stories from './RailLink.stories.tsx';

const { Active, Rest, Disabled } = composeStories(stories);
afterEach(cleanup);
const user = userEvent.setup({ pointerEventsCheck: 0 });

describe('RailLink', () => {
  it('is a link named for its page, and the page showing is current', () => {
    render(<Active />);
    const link = screen.getByRole('link', { name: /^Groceries/ });
    expect(link.getAttribute('aria-current')).toBe('page');
    expect(link.textContent).toContain('14');
  });

  it('is not current at rest and has no count to read', () => {
    render(<Rest />);
    const link = screen.getByRole('link', { name: 'Meal plan' });
    expect(link.getAttribute('aria-current')).toBeNull();
    expect(link.textContent).toBe('Meal plan');
  });

  it('says the count is what is to buy', () => {
    render(<Active />);
    expect(screen.getByRole('link', { name: /14 to buy$/ })).toBeTruthy();
  });

  it('reports a press, and not when disabled', async () => {
    const onPress = vi.fn();
    render(<Rest onPress={onPress} />);
    await user.click(screen.getByRole('link', { name: 'Meal plan' }));
    expect(onPress).toHaveBeenCalledExactlyOnceWith();
    cleanup();
    const never = vi.fn();
    render(<Disabled onPress={never} />);
    await user.click(screen.getByRole('link', { name: 'Meal plan' }));
    expect(never).not.toHaveBeenCalled();
  });
});
