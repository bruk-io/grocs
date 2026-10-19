// Level 2 of decision-11 (behaviour) for SuggestionRow; see atoms/Button.behaviour.test.tsx for the pattern.
import { composeStories } from '@storybook/react-native-web-vite';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import * as stories from './SuggestionRow.stories.tsx';

const { Rest, Disabled } = composeStories(stories);
afterEach(cleanup);
const user = userEvent.setup({ pointerEventsCheck: 0 });

describe('SuggestionRow', () => {
  it('is a button named by the item and where it lives', () => {
    render(<Rest />);
    expect(screen.getByRole('button', { name: /^Eggs/ })).toBeTruthy();
    expect(screen.getByText('Dairy & eggs · usually 1 dozen')).toBeTruthy();
  });

  it('adds once, with no arguments, when pressed anywhere on the row', async () => {
    const onAdd = vi.fn();
    render(<Rest onAdd={onAdd} />);
    await user.click(screen.getByText('Eggs'));
    expect(onAdd).toHaveBeenCalledExactlyOnceWith();
  });

  it('can be added from the keyboard', async () => {
    const onAdd = vi.fn();
    render(<Rest onAdd={onAdd} />);
    await user.tab();
    expect(screen.getByRole('button', { name: /^Eggs/ })).toBe(document.activeElement);
    await user.keyboard('{Enter}');
    expect(onAdd).toHaveBeenCalledOnce();
  });

  it('reports disabled and does not add', async () => {
    const onAdd = vi.fn();
    render(<Disabled onAdd={onAdd} />);
    const row = screen.getByRole('button', { name: /^Eggs/ });
    expect(row.getAttribute('aria-disabled')).toBe('true');
    await user.click(row);
    expect(onAdd).not.toHaveBeenCalled();
  });
});
