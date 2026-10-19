// Level 2 of decision-11 (behaviour) for ProgressBar: its counts show and its progress reads to a screen reader.
import { composeStories } from '@storybook/react-native-web-vite';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import * as stories from './ProgressBar.stories.tsx';

const { Empty, Part, Full } = composeStories(stories);
afterEach(cleanup);
const now = () => screen.getByRole('progressbar', { name: 'Shopping progress' }).getAttribute('aria-valuenow');

describe('ProgressBar', () => {
  it('says what is to go and what is in the cart', () => {
    render(<Part />);
    expect(screen.getByText('14 to go')).toBeTruthy();
    expect(screen.getByText('3 in the cart')).toBeTruthy();
  });

  it('reads its progress from the two counts', () => {
    render(<Part />);
    expect(now()).toBe('18');
    cleanup();
    render(<Empty />);
    expect(now()).toBe('0');
    cleanup();
    render(<Full />);
    expect(now()).toBe('100');
  });

  it('reads as empty, not broken, when the list has nothing on it', () => {
    render(<Part toGo={0} inCart={0} />);
    expect(now()).toBe('0');
  });
});
