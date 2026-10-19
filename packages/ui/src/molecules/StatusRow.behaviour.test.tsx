// Level 2 of decision-11 (behaviour) for StatusRow: its kind changes what a screen reader hears.
import { composeStories } from '@storybook/react-native-web-vite';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import * as stories from './StatusRow.stories.tsx';

const { Waiting, Joined } = composeStories(stories);
afterEach(cleanup);

describe('StatusRow', () => {
  it('says only the message while waiting, with no avatar', () => {
    render(<Waiting />);
    expect(screen.getByText('Link sent. Waiting for them to join…')).toBeTruthy();
    expect(screen.queryByRole('img')).toBeNull();
  });

  it('adds the joined person as a named avatar', () => {
    render(<Joined />);
    expect(screen.getByRole('img', { name: 'Sam' })).toBeTruthy();
    expect(screen.getByText('Sam joined your kitchen!')).toBeTruthy();
  });

  it('draws no avatar when joined without a name', () => {
    render(<Joined name={undefined as never} />);
    expect(screen.queryByRole('img')).toBeNull();
  });
});
