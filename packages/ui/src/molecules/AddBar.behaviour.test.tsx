// Level 2 of decision-11 (behaviour) for AddBar; see atoms/Button.behaviour.test.tsx for the pattern.
import { composeStories } from '@storybook/react-native-web-vite';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import * as stories from './AddBar.stories.tsx';

const { Rest, Filled, Disabled } = composeStories(stories);
afterEach(cleanup);
const user = userEvent.setup({ pointerEventsCheck: 0 });

describe('AddBar', () => {
  it('is a text box named for what it takes, with an Add button inside it', () => {
    render(<Rest />);
    expect(screen.getByRole('textbox', { name: 'Add an item' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Add' })).toBeTruthy();
  });

  it('reports what is typed', async () => {
    const onChangeText = vi.fn();
    render(<Rest onChangeText={onChangeText} />);
    await user.type(screen.getByRole('textbox', { name: 'Add an item' }), 'e');
    expect(onChangeText).toHaveBeenCalledExactlyOnceWith('e');
  });

  it('shows what it was given', () => {
    render(<Filled />);
    expect((screen.getByRole('textbox', { name: 'Add an item' }) as HTMLInputElement).value).toBe('egg');
  });

  it('adds when the button is pressed', async () => {
    const onAdd = vi.fn();
    render(<Filled onAdd={onAdd} />);
    await user.click(screen.getByRole('button', { name: 'Add' }));
    expect(onAdd).toHaveBeenCalledExactlyOnceWith();
  });

  it('submits from the keyboard', async () => {
    const onSubmit = vi.fn();
    render(<Filled onSubmit={onSubmit} />);
    await user.type(screen.getByRole('textbox', { name: 'Add an item' }), '{Enter}');
    expect(onSubmit).toHaveBeenCalledOnce();
  });

  it('turns both the field and the button off when disabled', async () => {
    const onAdd = vi.fn();
    render(<Disabled onAdd={onAdd} />);
    expect((screen.getByRole('textbox', { name: 'Add an item' }) as HTMLInputElement).readOnly).toBe(true);
    const add = screen.getByRole('button', { name: 'Add' });
    expect(add.getAttribute('aria-disabled')).toBe('true');
    await user.click(add);
    expect(onAdd).not.toHaveBeenCalled();
  });
});
