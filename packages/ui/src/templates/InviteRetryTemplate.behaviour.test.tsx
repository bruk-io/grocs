// Level 2 of decision-11 (behaviour) for InviteRetryTemplate; see atoms/Button.behaviour.test.tsx for the pattern.
import { composeStories } from '@storybook/react-native-web-vite';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import * as stories from './InviteRetryTemplate.stories.tsx';
import { InviteRetryTemplate } from './InviteRetryTemplate.tsx';

const { Invalid, FirstAttempt } = composeStories(stories);
afterEach(cleanup);
const user = userEvent.setup({ pointerEventsCheck: 0 });

describe('InviteRetryTemplate', () => {
  it('says the code did not work, and why, on the field that holds it', () => {
    render(<Invalid />);
    expect(screen.getByRole('heading', { name: "Code didn't work" })).toBeTruthy();
    const field = screen.getByRole('textbox', { name: 'Invite code from Bruk' });
    expect((field as HTMLInputElement).value).toBe('MOREL-42');
    expect(field.getAttribute('aria-invalid')).toBe('true');
    expect(screen.getByRole('alert').textContent).toContain('That code is not a match');
  });

  it('reports a change to the code', async () => {
    const onCodeChange = vi.fn();
    render(<Invalid onCodeChange={onCodeChange} />);
    await user.type(screen.getByRole('textbox', { name: 'Invite code from Bruk' }), '1');
    expect(onCodeChange).toHaveBeenCalledExactlyOnceWith('MOREL-421');
  });

  it('checks the code from the button and from the keyboard', async () => {
    const onCheck = vi.fn();
    render(<Invalid onCheck={onCheck} />);
    await user.click(screen.getByRole('button', { name: 'Check code' }));
    expect(onCheck).toHaveBeenCalledOnce();
    await user.type(screen.getByRole('textbox', { name: 'Invite code from Bruk' }), '{Enter}');
    expect(onCheck).toHaveBeenCalledTimes(2);
  });

  it('goes back to the invite', async () => {
    const onBack = vi.fn();
    render(<Invalid onBack={onBack} />);
    await user.click(screen.getByRole('button', { name: 'Back to my invite' }));
    expect(onBack).toHaveBeenCalledExactlyOnceWith();
  });

  it('while checking shows the button busy and locks the field', async () => {
    const onCheck = vi.fn();
    render(<Invalid checking onCheck={onCheck} />);
    const busy = screen.getByRole('button', { name: 'Checking' });
    expect(busy.getAttribute('aria-busy')).toBe('true');
    await user.click(busy);
    expect(onCheck).not.toHaveBeenCalled();
    expect((screen.getByRole('textbox', { name: 'Invite code from Bruk' }) as HTMLInputElement).readOnly).toBe(true);
  });

  it('gives the code field focus back once a check ends, so a rejected code can be retyped at once', () => {
    const { rerender } = render(<Invalid />);
    const field = () => screen.getByRole('textbox', { name: 'Invite code from Bruk' });
    rerender(<Invalid checking />);
    expect(document.activeElement).not.toBe(field());
    rerender(<Invalid checking={false} />);
    expect(document.activeElement).toBe(field());
  });

  it('on a retry keeps the footer for someone who did not expect the invite', () => {
    render(<Invalid />);
    expect(screen.getByText('Not expecting this? You can ignore it.')).toBeTruthy();
  });

  it('shows no error when none is given', () => {
    render(<InviteRetryTemplate attempt="retry" inviter="Bruk" code="MOREL-42" onCodeChange={() => undefined} />);
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('on a first attempt is neutral: no error title, no name, no error, no way back, no footer', async () => {
    const onCheck = vi.fn();
    render(<FirstAttempt onCheck={onCheck} />);
    expect(screen.getByRole('heading', { name: 'Enter your invite code' })).toBeTruthy();
    expect(screen.queryByRole('heading', { name: "Code didn't work" })).toBeNull();
    expect(screen.queryByRole('alert')).toBeNull();
    expect(screen.queryByRole('button', { name: 'Back to my invite' })).toBeNull();
    expect(screen.queryByText(/Bruk/)).toBeNull();
    expect(screen.queryByText('Not expecting this? You can ignore it.')).toBeNull();
    const field = screen.getByRole('textbox', { name: 'Invite code' });
    expect((field as HTMLInputElement).placeholder).toBe('MOREL-42');
    expect((field as HTMLInputElement).value).toBe('');
    expect(field.getAttribute('aria-invalid')).not.toBe('true');
    await user.type(field, '{Enter}');
    expect(onCheck).toHaveBeenCalledOnce();
  });
});
