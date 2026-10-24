// Level 2 of decision-11 (behaviour) for MealFormTemplate; see atoms/Button.behaviour.test.tsx for the pattern.
import { composeStories } from '@storybook/react-native-web-vite';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import * as stories from './MealFormTemplate.stories.tsx';

const { Rest, Editing, Removing, Invalid } = composeStories(stories);
afterEach(cleanup);
const user = userEvent.setup({ pointerEventsCheck: 0 });

describe('MealFormTemplate', () => {
  it('shows the day being planned, the two fields and the action named for the day', () => {
    render(<Rest />);
    expect(screen.getByText('Thursday, Oct 22')).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Add a meal' })).toBeTruthy();
    expect((screen.getByRole('textbox', { name: 'What are you making?' }) as HTMLInputElement).value).toBe('Fried rice');
    expect(screen.getByRole('textbox', { name: 'Recipe link (optional)' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Add to Thursday' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Remove meal' })).toBeNull();
  });

  it('reports changes to the name and the link', async () => {
    const onNameChange = vi.fn();
    const onLinkChange = vi.fn();
    render(<Rest onNameChange={onNameChange} onLinkChange={onLinkChange} />);
    await user.type(screen.getByRole('textbox', { name: 'What are you making?' }), '!');
    expect(onNameChange).toHaveBeenCalledExactlyOnceWith('Fried rice!');
    await user.type(screen.getByRole('textbox', { name: 'Recipe link (optional)' }), 'x');
    expect(onLinkChange).toHaveBeenCalledExactlyOnceWith('x');
  });

  it('pastes into the link, adds the meal and goes back, each to its own callback', async () => {
    const onPasteLink = vi.fn();
    const onSubmit = vi.fn();
    const onBack = vi.fn();
    render(<Rest onPasteLink={onPasteLink} onSubmit={onSubmit} onBack={onBack} />);
    await user.click(screen.getByRole('button', { name: 'Paste' }));
    expect(onPasteLink).toHaveBeenCalledExactlyOnceWith();
    await user.click(screen.getByRole('button', { name: 'Add to Thursday' }));
    expect(onSubmit).toHaveBeenCalledExactlyOnceWith();
    await user.click(screen.getByRole('button', { name: 'Meal plan' }));
    expect(onBack).toHaveBeenCalledExactlyOnceWith();
  });

  it('while adding shows the action busy and locks the fields', async () => {
    const onSubmit = vi.fn();
    render(<Rest adding onSubmit={onSubmit} />);
    const busy = screen.getByRole('button', { name: 'Adding' });
    expect(busy.getAttribute('aria-busy')).toBe('true');
    await user.click(busy);
    expect(onSubmit).not.toHaveBeenCalled();
    expect((screen.getByRole('textbox', { name: 'What are you making?' }) as HTMLInputElement).readOnly).toBe(true);
  });

  it('when editing shows the remove meal button', async () => {
    const onRemove = vi.fn();
    render(<Editing onRemove={onRemove} />);
    expect(screen.getByRole('button', { name: 'Remove meal' })).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Remove meal' }));
    expect(onRemove).toHaveBeenCalledExactlyOnceWith();
  });

  it('while removing disables the primary button but does not show it as busy', async () => {
    const onSubmit = vi.fn();
    render(<Removing onSubmit={onSubmit} />);
    const primary = screen.getByRole('button', { name: 'Save changes' });
    expect(primary.getAttribute('aria-busy')).not.toBe('true');
    expect(primary.hasAttribute('disabled')).toBe(true);
    expect((screen.getByRole('textbox', { name: 'What are you making?' }) as HTMLInputElement).readOnly).toBe(true);
  });

  it('shows link hint when linkError is not set', () => {
    render(<Rest />);
    expect(screen.getByText('Saved with the meal, so the recipe is easy to find again.')).toBeTruthy();
  });

  it('hides link hint and shows error when linkError is set', () => {
    render(<Invalid />);
    expect(screen.getByText('Invalid recipe link')).toBeTruthy();
    expect(screen.queryByText('Saved with the meal, so the recipe is easy to find again.')).toBeNull();
  });
});
