// Level 2 of decision-11 (behaviour) for MealCard; see atoms/Button.behaviour.test.tsx for the pattern.
import { composeStories } from '@storybook/react-native-web-vite';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import * as stories from './MealCard.stories.tsx';

const { Rest, Disabled, Tomato } = composeStories(stories);
afterEach(cleanup);
const user = userEvent.setup({ pointerEventsCheck: 0 });

describe('MealCard', () => {
  it('is a button named after the meal and its recipe link', () => {
    render(<Rest />);
    expect(screen.getByRole('button', { name: /Chana masala/ }).textContent).toContain('example.com');
  });

  it('shows no link line for a meal without a recipe', () => {
    render(<Tomato />);
    expect(screen.getByRole('button', { name: 'Pizza night' })).toBeTruthy();
  });

  it('calls onPress once, with no arguments, when pressed', async () => {
    const onPress = vi.fn();
    render(<Rest onPress={onPress} />);
    await user.click(screen.getByRole('button', { name: /Chana masala/ }));
    expect(onPress).toHaveBeenCalledExactlyOnceWith();
  });

  it('can be pressed from the keyboard', async () => {
    const onPress = vi.fn();
    render(<Rest onPress={onPress} />);
    await user.tab();
    expect(screen.getByRole('button', { name: /Chana masala/ })).toBe(document.activeElement);
    await user.keyboard('{Enter}');
    expect(onPress).toHaveBeenCalledOnce();
  });

  it('reports disabled and does not call onPress', async () => {
    const onPress = vi.fn();
    render(<Disabled onPress={onPress} />);
    const card = screen.getByRole('button', { name: /Chana masala/ });
    expect(card.getAttribute('aria-disabled')).toBe('true');
    await user.click(card);
    expect(onPress).not.toHaveBeenCalled();
  });
});
