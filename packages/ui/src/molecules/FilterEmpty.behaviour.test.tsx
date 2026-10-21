// Level 2 of decision-11 (behaviour) for FilterEmpty; see atoms/Button.behaviour.test.tsx for the pattern.
import { composeStories } from '@storybook/react-native-web-vite';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import * as stories from './FilterEmpty.stories.tsx';

const { Rest } = composeStories(stories);
afterEach(cleanup);

describe('FilterEmpty', () => {
  it('names the meal that has nothing on the list', () => {
    render(<Rest />);
    expect(screen.getByText('Nothing on the list for Chana masala yet.')).toBeTruthy();
  });
});
