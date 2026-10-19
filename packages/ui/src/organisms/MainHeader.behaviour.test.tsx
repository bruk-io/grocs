// Level 2 of decision-11 (behaviour) for MainHeader; see atoms/Button.behaviour.test.tsx for the pattern.
import { composeStories } from '@storybook/react-native-web-vite';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import * as stories from './MainHeader.stories.tsx';

const { Groceries, MealPlan } = composeStories(stories);
afterEach(cleanup);
const user = userEvent.setup({ pointerEventsCheck: 0 });

describe('MainHeader', () => {
  it('on Groceries shows the week, the title, the progress and the add field', () => {
    render(<Groceries />);
    expect(screen.getByText('Week of Oct 19')).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Groceries' })).toBeTruthy();
    expect(screen.getByText('14 to go')).toBeTruthy();
    expect(screen.getByText('3 in the cart')).toBeTruthy();
    expect(screen.getByRole('progressbar', { name: 'Shopping progress' })).toBeTruthy();
    expect(screen.getByRole('textbox', { name: 'Add an item' })).toBeTruthy();
  });

  it('on Meal plan swaps the label for the week nav and leaves out the progress and the add field', () => {
    render(<MealPlan />);
    expect(screen.getByRole('heading', { name: 'This week' })).toBeTruthy();
    expect(screen.getByText('Oct 19 - 25')).toBeTruthy();
    expect(screen.queryByRole('progressbar')).toBeNull();
    expect(screen.queryByRole('textbox')).toBeNull();
  });

  it('opens settings', async () => {
    const onSettings = vi.fn();
    render(<Groceries onSettings={onSettings} />);
    await user.click(screen.getByRole('button', { name: 'Settings' }));
    expect(onSettings).toHaveBeenCalledExactlyOnceWith();
  });

  it('steps the week back and forward', async () => {
    const onPrevious = vi.fn();
    const onNext = vi.fn();
    render(<MealPlan weekNav={{ label: 'Oct 19 - 25', onPrevious, onNext }} />);
    await user.click(screen.getByRole('button', { name: 'Previous week' }));
    await user.click(screen.getByRole('button', { name: 'Next week' }));
    expect(onPrevious).toHaveBeenCalledExactlyOnceWith();
    expect(onNext).toHaveBeenCalledExactlyOnceWith();
  });

  it('reports what is typed and adds from the button', async () => {
    const onChangeText = vi.fn();
    const onAdd = vi.fn();
    render(<Groceries addBar={{ value: '', onChangeText, onAdd }} />);
    await user.type(screen.getByRole('textbox', { name: 'Add an item' }), 'e');
    expect(onChangeText).toHaveBeenCalledExactlyOnceWith('e');
    await user.click(screen.getByRole('button', { name: 'Add' }));
    expect(onAdd).toHaveBeenCalledExactlyOnceWith();
  });

  it('names a mushroom beside the title', () => {
    render(<Groceries />);
    expect(screen.getByRole('button', { name: 'Cremi the cremini, tap to hear a line' })).toBeTruthy();
  });
});
