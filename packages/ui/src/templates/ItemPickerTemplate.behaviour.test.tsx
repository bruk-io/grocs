// Level 2 of decision-11 (behaviour) for ItemPickerTemplate; see atoms/Button.behaviour.test.tsx for the pattern.
import { composeStories } from '@storybook/react-native-web-vite';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import * as stories from './ItemPickerTemplate.stories.tsx';

const { Typing, WithAmountAndAisle } = composeStories(stories);
afterEach(cleanup);
const user = userEvent.setup({ pointerEventsCheck: 0 });

describe('ItemPickerTemplate', () => {
  it('shows what is typed, the meals, the suggestions and what the household buys often', () => {
    render(<Typing />);
    expect(screen.getByRole('heading', { name: 'Add an item' })).toBeTruthy();
    expect((screen.getByRole('textbox', { name: 'Add an item' }) as HTMLInputElement).value).toBe('egg');
    expect(screen.getByRole('button', { name: 'Chana masala' })).toBeTruthy();
    expect(screen.getByRole('button', { name: /Eggs/ })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Bananas' })).toBeTruthy();
  });

  it('reports what is typed and adds from the button and the keyboard', async () => {
    const onValueChange = vi.fn();
    const onAdd = vi.fn();
    render(<Typing onValueChange={onValueChange} onAdd={onAdd} />);
    await user.type(screen.getByRole('textbox', { name: 'Add an item' }), 's');
    expect(onValueChange).toHaveBeenCalledExactlyOnceWith('eggs');
    await user.click(screen.getByRole('button', { name: 'Add' }));
    expect(onAdd).toHaveBeenCalledExactlyOnceWith();
    await user.type(screen.getByRole('textbox', { name: 'Add an item' }), '{Enter}');
    expect(onAdd).toHaveBeenCalledTimes(2);
  });

  it('chooses a meal for the item and chooses none again by pressing it twice', async () => {
    const onSelectMeal = vi.fn();
    const { rerender } = render(<Typing onSelectMeal={onSelectMeal} />);
    await user.click(screen.getByRole('button', { name: 'Pizza night' }));
    expect(onSelectMeal).toHaveBeenLastCalledWith('pizza');
    rerender(<Typing onSelectMeal={onSelectMeal} selectedMealId="pizza" />);
    expect(screen.getByRole('button', { name: 'Pizza night' }).getAttribute('aria-pressed')).toBe('true');
    await user.click(screen.getByRole('button', { name: 'Pizza night' }));
    expect(onSelectMeal).toHaveBeenLastCalledWith(undefined);
  });

  it('adds a suggestion and a usual item, by id', async () => {
    const onAddSuggestion = vi.fn();
    const onAddFrequent = vi.fn();
    render(<Typing onAddSuggestion={onAddSuggestion} onAddFrequent={onAddFrequent} />);
    await user.click(screen.getByRole('button', { name: /Egg noodles/ }));
    expect(onAddSuggestion).toHaveBeenCalledExactlyOnceWith('s2');
    await user.click(screen.getByRole('button', { name: 'Limes' }));
    expect(onAddFrequent).toHaveBeenCalledExactlyOnceWith('f2');
  });

  it('leaves out a group that has nothing in it', () => {
    render(<Typing meals={[]} suggestions={[]} frequent={[]} />);
    expect(screen.queryByText('Suggestions')).toBeNull();
    expect(screen.queryByText('You buy often')).toBeNull();
    expect(screen.queryByText(/For a meal/)).toBeNull();
  });

  it('goes back to Groceries', async () => {
    const onBack = vi.fn();
    render(<Typing onBack={onBack} />);
    await user.click(screen.getByRole('button', { name: 'Groceries' }));
    expect(onBack).toHaveBeenCalledExactlyOnceWith();
  });

  it('leaves out the amount field and aisle chips when not given', () => {
    render(<Typing />);
    expect(screen.queryByRole('textbox', { name: 'Amount' })).toBeNull();
    expect(screen.queryByText(/Aisle/)).toBeNull();
  });

  it('shows the amount field, reports what is typed in it, and adds from its Enter like the name field', async () => {
    const onAmountChange = vi.fn();
    const onAdd = vi.fn();
    render(<WithAmountAndAisle onAmountChange={onAmountChange} onAdd={onAdd} />);
    expect((screen.getByRole('textbox', { name: 'Amount' }) as HTMLInputElement).value).toBe('2 cartons');
    await user.type(screen.getByRole('textbox', { name: 'Amount' }), 's');
    expect(onAmountChange).toHaveBeenCalledExactlyOnceWith('2 cartonss');
    await user.type(screen.getByRole('textbox', { name: 'Amount' }), '{Enter}');
    expect(onAdd).toHaveBeenCalledTimes(1);
  });

  it('chooses an aisle for the item and chooses none again by pressing it twice', async () => {
    const onSelectAisle = vi.fn();
    render(<WithAmountAndAisle onSelectAisle={onSelectAisle} />);
    expect(screen.getByRole('button', { name: 'Dairy & eggs' }).getAttribute('aria-pressed')).toBe('true');
    await user.click(screen.getByRole('button', { name: 'Produce' }));
    expect(onSelectAisle).toHaveBeenCalledExactlyOnceWith('produce');
    await user.click(screen.getByRole('button', { name: 'Dairy & eggs' }));
    expect(onSelectAisle).toHaveBeenLastCalledWith(undefined);
  });
});
