// Level 2 of decision-11 (behaviour) for Checkbox; see Button.behaviour.test.tsx for the pattern.
import { composeStories } from '@storybook/react-native-web-vite';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import * as stories from './Checkbox.stories.tsx';

afterEach(cleanup);

const { Rest, Checked, Disabled } = composeStories(stories);
const user = userEvent.setup({ pointerEventsCheck: 0 });

describe('Checkbox', () => {
  it('is unchecked at rest and reports the state it would move to: checked', async () => {
    const onChange = vi.fn();
    render(<Rest onChange={onChange} />);
    const box = screen.getByRole('checkbox', { name: 'Oat milk' });
    expect(box.getAttribute('aria-checked')).toBe('false');
    await user.click(box);
    expect(onChange).toHaveBeenCalledExactlyOnceWith(true);
  });

  it('is checked in the accessibility state and reports unchecked when pressed', async () => {
    const onChange = vi.fn();
    render(<Checked onChange={onChange} />);
    const box = screen.getByRole('checkbox', { name: 'Oat milk' });
    expect(box.getAttribute('aria-checked')).toBe('true');
    await user.click(box);
    expect(onChange).toHaveBeenCalledExactlyOnceWith(false);
  });

  it('can be toggled from the keyboard', async () => {
    const onChange = vi.fn();
    render(<Rest onChange={onChange} />);
    await user.tab();
    expect(screen.getByRole('checkbox', { name: 'Oat milk' })).toBe(document.activeElement);
    await user.keyboard('{Enter}');
    expect(onChange).toHaveBeenCalledExactlyOnceWith(true);
  });

  it('can be toggled with the Space key, which is how a checkbox is operated (WAI-ARIA)', async () => {
    const onChange = vi.fn();
    render(<Checked onChange={onChange} />);
    await user.tab();
    expect(screen.getByRole('checkbox', { name: 'Oat milk' })).toBe(document.activeElement);
    await user.keyboard(' ');
    expect(onChange).toHaveBeenCalledExactlyOnceWith(false);
  });

  it('does not react to Space while disabled', async () => {
    const onChange = vi.fn();
    render(<Disabled onChange={onChange} />);
    screen.getByRole('checkbox', { name: 'Oat milk' }).focus();
    await user.keyboard(' ');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('reports disabled and does not call onChange', async () => {
    const onChange = vi.fn();
    render(<Disabled onChange={onChange} />);
    const box = screen.getByRole('checkbox', { name: 'Oat milk' });
    expect(box.getAttribute('aria-disabled')).toBe('true');
    await user.click(box);
    expect(onChange).not.toHaveBeenCalled();
  });
});
