// Level 2 of decision-11 (behaviour) for LabelledField; see atoms/Button.behaviour.test.tsx for the pattern.
import { composeStories } from '@storybook/react-native-web-vite';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import * as stories from './LabelledField.stories.tsx';

const { Rest, Filled, Disabled, Invalid } = composeStories(stories);
afterEach(cleanup);
const user = userEvent.setup({ pointerEventsCheck: 0 });
const box = () => screen.getByRole('textbox', { name: 'Recipe link (optional)' });

describe('LabelledField', () => {
  it('names the text box after the label, with "(optional)" when it is', () => {
    render(<Rest />);
    expect(box()).toBeTruthy();
    expect(screen.getByPlaceholderText('Paste a link')).toBeTruthy();
  });

  it('shows the hint, and says the field is not invalid', () => {
    render(<Rest />);
    expect(screen.getByText('Saved with the meal, so the recipe is easy to find again.')).toBeTruthy();
    expect(box().getAttribute('aria-invalid')).toBe('false');
  });

  it('reports what is typed', async () => {
    const onChangeText = vi.fn();
    render(<Rest onChangeText={onChangeText} />);
    await user.type(box(), 'h');
    expect(onChangeText).toHaveBeenCalledExactlyOnceWith('h');
  });

  it('shows the value it was given', () => {
    render(<Filled />);
    expect((box() as HTMLInputElement).value).toBe('https://example.com/chana-masala');
  });

  it('calls the inside action when it is pressed', async () => {
    const onAction = vi.fn();
    render(<Rest onAction={onAction} />);
    await user.click(screen.getByRole('button', { name: 'Paste' }));
    expect(onAction).toHaveBeenCalledExactlyOnceWith();
  });

  it('shows the error instead of the hint and marks the field invalid', () => {
    render(<Invalid />);
    expect(screen.getByRole('alert').textContent).toBe('That link does not look right.');
    expect(box().getAttribute('aria-invalid')).toBe('true');
    expect(screen.queryByText('Saved with the meal, so the recipe is easy to find again.')).toBeNull();
  });

  it('turns the field and its action off when disabled', async () => {
    const onAction = vi.fn();
    render(<Disabled onAction={onAction} />);
    expect((box() as HTMLInputElement).readOnly).toBe(true);
    await user.click(screen.getByRole('button', { name: 'Paste' }));
    expect(onAction).not.toHaveBeenCalled();
  });
});
