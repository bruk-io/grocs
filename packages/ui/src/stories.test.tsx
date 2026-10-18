/// <reference types="vite/client" />
// Every story renders (R65), and every interactive element in it has a role and an accessible
// name (R50). One test per story, so a broken state is named in the failure.
import { composeStories } from '@storybook/react-native-web-vite';
import type { Meta } from '@storybook/react-native-web-vite';
import { cleanup, render, screen } from '@testing-library/react';
import type { ComponentType } from 'react';
import { afterEach, describe, expect, it } from 'vitest';

type StoryModule = { default: Meta };
const modules = import.meta.glob<StoryModule>('./**/*.stories.tsx', { eager: true });

afterEach(cleanup);

describe('every story renders and is accessible', () => {
  it('finds the story files', () => {
    expect(Object.keys(modules).length).toBeGreaterThanOrEqual(6);
  });

  for (const [file, mod] of Object.entries(modules)) {
    const stories = composeStories(mod as never) as Record<string, ComponentType>;
    describe(file, () => {
      for (const [name, Story] of Object.entries(stories)) {
        it(name, () => {
          const { container } = render(<Story />);
          expect(container.childNodes.length).toBeGreaterThan(0);
          for (const role of ['checkbox', 'button', 'textbox'] as const) {
            for (const el of screen.queryAllByRole(role)) {
              const label = el.getAttribute('aria-label') ?? el.getAttribute('placeholder') ?? el.textContent;
              expect(label, `${role} in ${file} ${name} needs an accessible name`).toBeTruthy();
            }
          }
        });
      }
    });
  }
});
