// Level 2 of decision-11 (behaviour) for TextField; see Button.behaviour.test.tsx for the pattern.
import { composeStories } from '@storybook/react-native-web-vite';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import * as stories from './TextField.stories.tsx';

afterEach(cleanup);

const { Rest, Filled, Disabled, Invalid, InlineRest, InlineDisabled } = composeStories(stories);
const user = userEvent.setup({ pointerEventsCheck: 0 });

describe('TextField', () => {
  it('reports each typed character through onChangeText', async () => {
    const onChangeText = vi.fn();
    render(<Rest onChangeText={onChangeText} />);
    await user.type(screen.getByRole('textbox', { name: 'Add an item' }), 'Eg');
    expect(onChangeText).toHaveBeenNthCalledWith(1, 'E');
    expect(onChangeText).toHaveBeenNthCalledWith(2, 'g');
  });

  it('shows its value', () => {
    render(<Filled />);
    expect((screen.getByRole('textbox', { name: 'Add an item' }) as HTMLInputElement).value).toBe('Fried rice');
  });

  it('calls onSubmit when Enter is pressed', async () => {
    const onSubmit = vi.fn();
    render(<Filled onSubmit={onSubmit} />);
    await user.type(screen.getByRole('textbox', { name: 'Add an item' }), '{Enter}');
    expect(onSubmit).toHaveBeenCalledOnce();
  });

  it('cannot be edited while disabled', async () => {
    const onChangeText = vi.fn();
    render(<Disabled onChangeText={onChangeText} />);
    const field = screen.getByRole('textbox', { name: 'Can not edit' });
    expect((field as HTMLInputElement).readOnly).toBe(true);
    await user.type(field, 'x');
    expect(onChangeText).not.toHaveBeenCalled();
  });

  it('marks the field invalid and announces the message', () => {
    render(<Invalid />);
    expect(screen.getByRole('textbox', { name: 'Add an item' }).getAttribute('aria-invalid')).toBe('true');
    expect(screen.getByRole('alert').textContent).toBe('Enter a name');
  });

  it('has no button inside unless it is the inline kind', () => {
    render(<Rest />);
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('calls onAction when the button inside the inline field is pressed', async () => {
    const onAction = vi.fn();
    render(<InlineRest onAction={onAction} />);
    await user.click(screen.getByRole('button', { name: 'Add item' }));
    expect(onAction).toHaveBeenCalledExactlyOnceWith();
  });

  it('disables the button inside the field with the field', async () => {
    const onAction = vi.fn();
    render(<InlineDisabled onAction={onAction} />);
    const button = screen.getByRole('button', { name: 'Add item' });
    expect(button.getAttribute('aria-disabled')).toBe('true');
    await user.click(button);
    expect(onAction).not.toHaveBeenCalled();
  });
});
