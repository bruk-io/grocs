// Level 2 of decision-11 (behaviour) for TabItem; see atoms/Button.behaviour.test.tsx for the pattern.
import { composeStories } from '@storybook/react-native-web-vite';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import * as stories from './TabItem.stories.tsx';

const { Active, Rest, Disabled } = composeStories(stories);
afterEach(cleanup);
const user = userEvent.setup({ pointerEventsCheck: 0 });

describe('TabItem', () => {
  it('is a tab named by its label and its count', () => {
    render(<Rest />);
    expect(screen.getByRole('tab', { name: 'Groceries 14' })).toBeTruthy();
  });

  it('says whether it is the selected tab', () => {
    render(<Active />);
    expect(screen.getByRole('tab', { name: 'Meal plan' }).getAttribute('aria-selected')).toBe('true');
    cleanup();
    render(<Rest />);
    expect(screen.getByRole('tab', { name: 'Groceries 14' }).getAttribute('aria-selected')).toBe('false');
  });

  it('calls onPress once, with no arguments, when pressed', async () => {
    const onPress = vi.fn();
    render(<Rest onPress={onPress} />);
    await user.click(screen.getByRole('tab', { name: 'Groceries 14' }));
    expect(onPress).toHaveBeenCalledExactlyOnceWith();
  });

  it('can be pressed from the keyboard', async () => {
    const onPress = vi.fn();
    render(<Rest onPress={onPress} />);
    await user.tab();
    expect(screen.getByRole('tab', { name: 'Groceries 14' })).toBe(document.activeElement);
    await user.keyboard('{Enter}');
    expect(onPress).toHaveBeenCalledOnce();
  });

  it('reports disabled and does not call onPress', async () => {
    const onPress = vi.fn();
    render(<Disabled onPress={onPress} />);
    const tab = screen.getByRole('tab', { name: 'Groceries 14' });
    expect(tab.getAttribute('aria-disabled')).toBe('true');
    await user.click(tab);
    expect(onPress).not.toHaveBeenCalled();
  });
});
