// Level 2 of decision-11 (behaviour) for CelebrationBanner; see atoms/Button.behaviour.test.tsx for the pattern.
import { composeStories } from '@storybook/react-native-web-vite';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import * as stories from './CelebrationBanner.stories.tsx';

const { Rest } = composeStories(stories);
afterEach(cleanup);

describe('CelebrationBanner', () => {
  it('says all is done, politely, to a screen reader as it appears', () => {
    const { container } = render(<Rest />);
    expect(screen.getByText('All done!')).toBeTruthy();
    expect(screen.getByText("Everything's in the cart.")).toBeTruthy();
    expect(container.querySelector('[aria-live="polite"]')).toBeTruthy();
  });

  it('takes its words from props', () => {
    render(<Rest title="Shop finished" message="Nothing left." />);
    expect(screen.getByText('Shop finished')).toBeTruthy();
    expect(screen.getByText('Nothing left.')).toBeTruthy();
  });
});
