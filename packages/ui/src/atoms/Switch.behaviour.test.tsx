// Level 2 of decision-11 (behaviour) for Switch; see Button.behaviour.test.tsx for the pattern.
import { composeStories } from '@storybook/react-native-web-vite';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import * as stories from './Switch.stories.tsx';

afterEach(cleanup);

const { Rest, On, Disabled } = composeStories(stories);
const user = userEvent.setup({ pointerEventsCheck: 0 });

describe('Switch', () => {
  it('is off at rest and reports the state it would move to: on', async () => {
    const onChange = vi.fn();
    render(<Rest onChange={onChange} />);
    const control = screen.getByRole('switch', { name: 'Reminders' });
    expect(control.getAttribute('aria-checked')).toBe('false');
    await user.click(control);
    expect(onChange).toHaveBeenCalledExactlyOnceWith(true);
  });

  it('is on in the accessibility state and reports off when pressed', async () => {
    const onChange = vi.fn();
    render(<On onChange={onChange} />);
    const control = screen.getByRole('switch', { name: 'Reminders' });
    expect(control.getAttribute('aria-checked')).toBe('true');
    await user.click(control);
    expect(onChange).toHaveBeenCalledExactlyOnceWith(false);
  });

  it('can be toggled with Enter and with Space', async () => {
    const onChange = vi.fn();
    render(<Rest onChange={onChange} />);
    await user.tab();
    expect(screen.getByRole('switch', { name: 'Reminders' })).toBe(document.activeElement);
    await user.keyboard('{Enter}');
    await user.keyboard(' ');
    expect(onChange).toHaveBeenCalledTimes(2);
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('reports disabled and does not call onChange', async () => {
    const onChange = vi.fn();
    render(<Disabled onChange={onChange} />);
    const control = screen.getByRole('switch', { name: 'Reminders' });
    expect(control.getAttribute('aria-disabled')).toBe('true');
    await user.click(control);
    expect(onChange).not.toHaveBeenCalled();
  });
});
