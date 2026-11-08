// Level 2 of decision-11 (behaviour) for AisleChipGroup; see atoms/Button.behaviour.test.tsx for the pattern.
import { composeStories } from '@storybook/react-native-web-vite';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import * as stories from './AisleChipGroup.stories.tsx';

const { Rest, Selected, Disabled } = composeStories(stories);
afterEach(cleanup);
const user = userEvent.setup({ pointerEventsCheck: 0 });

describe('AisleChipGroup', () => {
  it('is a labelled group of chips, one per aisle, none pressed', () => {
    render(<Rest />);
    const group = screen.getByRole('group', { name: 'Aisle for Lemon' });
    expect(group).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Produce' }).getAttribute('aria-pressed')).toBe('false');
    expect(screen.getByRole('button', { name: 'Pantry' }).getAttribute('aria-pressed')).toBe('false');
    expect(screen.getByRole('button', { name: 'Other' }).getAttribute('aria-pressed')).toBe('false');
  });

  it('shows the current aisle pressed', () => {
    render(<Selected />);
    expect(screen.getByRole('button', { name: 'Produce' }).getAttribute('aria-pressed')).toBe('true');
    expect(screen.getByRole('button', { name: 'Pantry' }).getAttribute('aria-pressed')).toBe('false');
  });

  it('reports the aisle chosen, by id', async () => {
    const onSelect = vi.fn();
    render(<Rest onSelect={onSelect} />);
    await user.click(screen.getByRole('button', { name: 'Pantry' }));
    expect(onSelect).toHaveBeenCalledExactlyOnceWith('pantry');
  });

  it('disables every chip and does nothing when pressed', async () => {
    const onSelect = vi.fn();
    render(<Disabled onSelect={onSelect} />);
    const chip = screen.getByRole('button', { name: 'Produce' });
    expect(chip.getAttribute('aria-disabled')).toBe('true');
    await user.click(chip);
    expect(onSelect).not.toHaveBeenCalled();
  });
});
