// Level 2 of decision-11 (behaviour) for HouseholdTemplate; see atoms/Button.behaviour.test.tsx for the pattern.
import { composeStories } from '@storybook/react-native-web-vite';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import * as stories from './HouseholdTemplate.stories.tsx';

const { Waiting, Full, Loading, Failed } = composeStories(stories);
afterEach(cleanup);
const user = userEvent.setup({ pointerEventsCheck: 0 });

describe('HouseholdTemplate', () => {
  it('names the kitchen and its members, marking the signed-in one', () => {
    render(<Waiting />);
    expect(screen.getByRole('heading', { name: 'Our kitchen' })).toBeTruthy();
    expect(screen.getByText('Bruk (you)')).toBeTruthy();
  });

  it('shows the invite code to send and how long it works while the kitchen has room', () => {
    render(<Waiting />);
    expect(screen.getByText('MOREL-0042')).toBeTruthy();
    expect(screen.getByText('Waiting for your partner to join. Works until 3:40 PM tomorrow.')).toBeTruthy();
  });

  it('shares and copies the invite', async () => {
    const onShare = vi.fn();
    const onCopy = vi.fn();
    render(<Waiting invite={{ kind: 'open', code: 'MOREL-0042', expires: 'Works until 3:40 PM tomorrow', onShare, onCopy }} />);
    await user.click(screen.getByRole('button', { name: /share/i }));
    await user.click(screen.getByRole('button', { name: /copy/i }));
    expect(onShare).toHaveBeenCalledOnce();
    expect(onCopy).toHaveBeenCalledOnce();
  });

  it('shows both members and no code once the kitchen is full', () => {
    render(<Full />);
    expect(screen.getByText('Shazya')).toBeTruthy();
    expect(screen.queryByText('MOREL-0042')).toBeNull();
    expect(screen.getByText(/has both its members/)).toBeTruthy();
  });

  it('says when the invite is still coming, or could not be fetched', () => {
    render(<Loading />);
    expect(screen.getByText('Getting your invite code')).toBeTruthy();
    cleanup();
    render(<Failed />);
    expect(screen.getByText('Could not get an invite code: check your connection and try again')).toBeTruthy();
  });

  it('goes back', async () => {
    const onBack = vi.fn();
    render(<Waiting onBack={onBack} />);
    await user.click(screen.getByRole('button', { name: /Settings/ }));
    expect(onBack).toHaveBeenCalledOnce();
  });
});
