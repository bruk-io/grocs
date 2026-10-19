import { createContext, useContext, useMemo } from 'react';
import type { ReactNode } from 'react';

/** What every animated component reads (R41). No UI component reads the operating system itself. */
export interface MotionValue {
  /** True when the person has asked for less motion: components show still poses and fades only. */
  reduced: boolean;
}

declare global {
  // Set before load by the browser pass (decision-11) so baselines hold still.
  var __GROCS_REDUCE_MOTION__: boolean | undefined;
}

/**
 * The browser's own reduce-motion answer: the pass's global, else the prefers-reduced-motion media query.
 * Only the web build (Storybook, tests) has either; the phone apps always pass `reduced` themselves.
 */
export function readBrowserReducedMotion(): boolean {
  try {
    if (globalThis.__GROCS_REDUCE_MOTION__ === true) return true;
    if (typeof globalThis.matchMedia === 'function') return globalThis.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch {
    // A blocked or missing window means no preference was expressed.
  }
  return false;
}

const MotionContext = createContext<MotionValue | null>(null);

export interface MotionProviderProps {
  /** The app's reduce-motion setting. Left out, the browser's own setting is used (Storybook, tests). */
  reduced?: boolean;
  children: ReactNode;
}

export function MotionProvider({ reduced, children }: MotionProviderProps) {
  const value = useMemo<MotionValue>(() => ({ reduced: reduced ?? readBrowserReducedMotion() }), [reduced]);
  return <MotionContext.Provider value={value}>{children}</MotionContext.Provider>;
}

/** The reduce-motion setting. Without a provider it follows the browser, so a bare story still holds still in the pass. */
export function useMotion(): MotionValue {
  const value = useContext(MotionContext);
  return value ?? { reduced: readBrowserReducedMotion() };
}
