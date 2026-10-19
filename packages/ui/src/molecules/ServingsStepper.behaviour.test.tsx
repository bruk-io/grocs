// Level 2 of decision-11 (behaviour) for ServingsStepper; see atoms/Button.behaviour.test.tsx for the pattern.
import { composeStories } from '@storybook/react-native-web-vite';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import * as stories from './ServingsStepper.stories.tsx';

const { Rest, Min, Max, Disabled } = composeStories(stories);
afterEach(cleanup);
const user = userEvent.setup({ pointerEventsCheck: 0 });
const fewer = () => screen.getByRole('button', { name: 'Fewer servings' });
const more = () => screen.getByRole('button', { name: 'More servings' });

describe('ServingsStepper', () => {
  it('is a group named Servings that shows the number', () => {
    render(<Rest />);
    expect(screen.getByRole('group', { name: 'Servings' }).textContent).toContain('4');
    expect(screen.getByText('serves')).toBeTruthy();
  });

  it('asks for one more or one fewer, as the number it wants', async () => {
    const onChange = vi.fn();
    render(<Rest onChange={onChange} />);
    await user.click(more());
    await user.click(fewer());
    expect(onChange.mock.calls).toEqual([[5], [3]]);
  });

  it('turns the minus off at the minimum and does not report it', async () => {
    const onChange = vi.fn();
    render(<Min onChange={onChange} />);
    expect(fewer().getAttribute('aria-disabled')).toBe('true');
    expect(more().getAttribute('aria-disabled')).not.toBe('true');
    await user.click(fewer());
    expect(onChange).not.toHaveBeenCalled();
  });

  it('turns the plus off at the maximum and does not report it', async () => {
    const onChange = vi.fn();
    render(<Max onChange={onChange} />);
    expect(more().getAttribute('aria-disabled')).toBe('true');
    await user.click(more());
    expect(onChange).not.toHaveBeenCalled();
  });

  it('takes another minimum', () => {
    render(<Rest value={2} min={2} />);
    expect(fewer().getAttribute('aria-disabled')).toBe('true');
  });

  it('turns both buttons off when disabled', async () => {
    const onChange = vi.fn();
    render(<Disabled onChange={onChange} />);
    expect(fewer().getAttribute('aria-disabled')).toBe('true');
    expect(more().getAttribute('aria-disabled')).toBe('true');
    await user.click(more());
    expect(onChange).not.toHaveBeenCalled();
  });
});
