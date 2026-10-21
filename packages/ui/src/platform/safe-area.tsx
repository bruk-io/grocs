import { createContext, useContext, useMemo } from 'react';
import type { ReactNode } from 'react';
import { tokens } from '../tokens/tokens.ts';

/** The parts of the screen the phone draws over: status bar, gesture bar, display cutouts. In device-independent pixels. */
export interface SafeAreaInsets {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export const NO_INSETS: SafeAreaInsets = { top: 0, right: 0, bottom: 0, left: 0 };

/** A typical edge-to-edge Android phone: status bar on top, gesture bar below. Stories and tests use it. */
export const PHONE_INSETS: SafeAreaInsets = { top: tokens.size.phoneStatusBar, right: 0, bottom: tokens.size.phoneGestureBar, left: 0 };

const SafeAreaContext = createContext<SafeAreaInsets>(NO_INSETS);

export interface SafeAreaProviderProps {
  /** The phone's insets. Left out, they are zero (the browser, Storybook, tests). */
  insets?: Partial<SafeAreaInsets>;
  children: ReactNode;
}

/** The app feeds the real insets in; @grocs/ui reads no native library itself. */
export function SafeAreaProvider({ insets, children }: SafeAreaProviderProps) {
  const { top = 0, right = 0, bottom = 0, left = 0 } = insets ?? {};
  const value = useMemo<SafeAreaInsets>(() => ({ top, right, bottom, left }), [top, right, bottom, left]);
  return <SafeAreaContext.Provider value={value}>{children}</SafeAreaContext.Provider>;
}

/** The insets layouts keep content out of. Zero without a provider. */
export function useSafeArea(): SafeAreaInsets {
  return useContext(SafeAreaContext);
}
