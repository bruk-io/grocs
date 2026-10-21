import { createElement } from 'react';
import type { ComponentType, ReactElement } from 'react';
import { PHONE_INSETS, SafeAreaProvider } from '../platform/safe-area.tsx';

/** A story decorator: draws the story as an edge-to-edge Android phone does, under a status bar and a gesture bar. */
export const withPhoneInsets = (Story: ComponentType): ReactElement =>
  createElement(SafeAreaProvider, { insets: PHONE_INSETS, children: createElement(Story) });
