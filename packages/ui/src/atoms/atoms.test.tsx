import { composeStories } from '@storybook/react-native-web-vite';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import * as button from './Button.stories.tsx';
import * as checkbox from './Checkbox.stories.tsx';
import * as textField from './TextField.stories.tsx';

afterEach(cleanup);

describe('Button', () => {
  const { Rest, Disabled, Loading } = composeStories(button);

  it('calls onPress when pressed', () => {
    const onPress = vi.fn();
    render(<Rest onPress={onPress} />);
    fireEvent.click(screen.getByRole('button', { name: 'Add' }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('ignores presses when disabled or loading', () => {
    const onPress = vi.fn();
    render(<Disabled onPress={onPress} />);
    fireEvent.click(screen.getByRole('button', { name: 'Add' }));
    cleanup();
    render(<Loading onPress={onPress} />);
    const busy = screen.getByRole('button', { name: 'Add' });
    expect(busy.getAttribute('aria-busy')).toBe('true');
    fireEvent.click(busy);
    expect(onPress).not.toHaveBeenCalled();
  });
});

describe('Checkbox', () => {
  const { Rest, Checked } = composeStories(checkbox);

  it('reports the state it would move to', () => {
    const onChange = vi.fn();
    render(<Rest onChange={onChange} />);
    fireEvent.click(screen.getByRole('checkbox', { name: 'Oat milk' }));
    expect(onChange).toHaveBeenCalledWith(true);
    cleanup();
    render(<Checked onChange={onChange} />);
    fireEvent.click(screen.getByRole('checkbox', { name: 'Oat milk' }));
    expect(onChange).toHaveBeenLastCalledWith(false);
  });
});

describe('TextField', () => {
  const { Rest, Invalid } = composeStories(textField);

  it('is a textbox named by its label and reports typed text', () => {
    const onChangeText = vi.fn();
    render(<Rest onChangeText={onChangeText} />);
    fireEvent.change(screen.getByRole('textbox', { name: 'Add an item' }), { target: { value: 'Eggs' } });
    expect(onChangeText).toHaveBeenCalledWith('Eggs');
  });

  it('announces its error message and marks the field invalid', () => {
    render(<Invalid />);
    expect(screen.getByRole('alert').textContent).toBe('Give the item a name');
    expect(screen.getByRole('textbox', { name: 'Add an item' }).getAttribute('aria-invalid')).toBe('true');
  });
});
