// Level 2 of decision-11 (behaviour), the pattern to copy: compose a story, find the element by role and
// name, drive it with userEvent, and assert what a person or a screen reader gets - the callback and its
// arguments, and the state in the accessibility tree. No styles, no component internals.
import { composeStories } from '@storybook/react-native-web-vite';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import * as stories from './Button.stories.tsx';

afterEach(cleanup);

const { Rest, Disabled, Loading } = composeStories(stories);
// The disabled and loading buttons ignore the pointer, which is what these tests check, so userEvent must
// still try the click instead of refusing it first.
const user = userEvent.setup({ pointerEventsCheck: 0 });

describe('Button', () => {
  it('calls onPress once, with no arguments, when pressed', async () => {
    const onPress = vi.fn();
    render(<Rest onPress={onPress} />);
    await user.click(screen.getByRole('button', { name: 'Add to list' }));
    expect(onPress).toHaveBeenCalledOnce();
    expect(onPress).toHaveBeenCalledWith();
  });

  it('can be pressed from the keyboard', async () => {
    const onPress = vi.fn();
    render(<Rest onPress={onPress} />);
    await user.tab();
    expect(screen.getByRole('button', { name: 'Add to list' })).toBe(document.activeElement);
    await user.keyboard('{Enter}');
    expect(onPress).toHaveBeenCalledOnce();
  });

  it('is enabled and not busy at rest', () => {
    render(<Rest />);
    const button = screen.getByRole('button', { name: 'Add to list' });
    expect(button.getAttribute('aria-disabled')).not.toBe('true');
    expect(button.getAttribute('aria-busy')).not.toBe('true');
  });

  it('reports disabled and does not call onPress', async () => {
    const onPress = vi.fn();
    render(<Disabled onPress={onPress} />);
    const button = screen.getByRole('button', { name: 'Add to list' });
    expect(button.getAttribute('aria-disabled')).toBe('true');
    await user.click(button);
    expect(onPress).not.toHaveBeenCalled();
  });

  it('reports busy and does not call onPress while loading', async () => {
    const onPress = vi.fn();
    render(<Loading onPress={onPress} />);
    // While loading the name is what the button now says, so a screen reader hears "Adding", busy.
    const button = screen.getByRole('button', { name: 'Adding' });
    expect(button.getAttribute('aria-busy')).toBe('true');
    expect(button.getAttribute('aria-disabled')).toBe('true');
    await user.click(button);
    expect(onPress).not.toHaveBeenCalled();
  });
});
