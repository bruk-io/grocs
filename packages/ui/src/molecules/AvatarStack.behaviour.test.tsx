// Level 2 of decision-11 (behaviour) for AvatarStack: a member's online flag changes what a screen reader hears.
import { composeStories } from '@storybook/react-native-web-vite';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import * as stories from './AvatarStack.stories.tsx';

const { Away, Online } = composeStories(stories);
afterEach(cleanup);

describe('AvatarStack', () => {
  it('names every member', () => {
    render(<Away />);
    expect(screen.getAllByRole('img').map((el) => el.getAttribute('aria-label'))).toEqual(['Alex', 'Sam']);
  });

  it('reads an online member as "name, online" and the others by name', () => {
    render(<Online />);
    expect(screen.getByRole('img', { name: 'Sam, online' })).toBeTruthy();
    expect(screen.getByRole('img', { name: 'Alex' })).toBeTruthy();
    expect(screen.queryByRole('img', { name: 'Sam' })).toBeNull();
  });
});
