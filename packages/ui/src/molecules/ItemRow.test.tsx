import { composeStories } from '@storybook/react-native-web-vite';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import * as stories from './ItemRow.stories.tsx';

const { Rest, InCart, Disabled, WithAmountAndBadges } = composeStories(stories);
afterEach(cleanup);

describe('ItemRow (R50, R65)', () => {
  it('shows the item as a checkbox named after it, unticked', () => {
    render(<Rest />);
    const box = screen.getByRole('checkbox', { name: 'Oat milk' });
    expect(box.getAttribute('aria-checked')).toBe('false');
  });

  it('ticking asks for the in-cart state, not a toggle (R17)', () => {
    const onToggle = vi.fn();
    render(<Rest onToggle={onToggle} />);
    fireEvent.click(screen.getByRole('checkbox', { name: 'Oat milk' }));
    expect(onToggle).toHaveBeenCalledWith(true);
  });

  it('unticking asks for the to-buy state', () => {
    const onToggle = vi.fn();
    render(<InCart onToggle={onToggle} />);
    const box = screen.getByRole('checkbox', { name: 'Oat milk' });
    expect(box.getAttribute('aria-checked')).toBe('true');
    fireEvent.click(box);
    expect(onToggle).toHaveBeenCalledWith(false);
  });

  it('does nothing when disabled', () => {
    const onToggle = vi.fn();
    render(<Disabled onToggle={onToggle} />);
    const box = screen.getByRole('checkbox', { name: 'Oat milk' });
    expect(box.getAttribute('aria-disabled')).toBe('true');
    fireEvent.click(box);
    expect(onToggle).not.toHaveBeenCalled();
  });

  it('shows the amount and the meal badges', () => {
    render(<WithAmountAndBadges />);
    expect(screen.getByText('2 cartons')).toBeTruthy();
    expect(screen.getByText('Taco night')).toBeTruthy();
    expect(screen.getByText('Pancakes')).toBeTruthy();
  });
});
