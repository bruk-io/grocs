import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { Platform } from 'react-native';

export type PlatformStyle = 'ios' | 'android';

const defaultStyle = (): PlatformStyle => (Platform.OS === 'ios' ? 'ios' : 'android');

const PlatformStyleContext = createContext<PlatformStyle | null>(null);

/**
 * Which platform's look components use. The apps leave it alone (the phone's own platform is used);
 * Storybook in the browser sets it from its iOS / Android switch (R64), because the browser
 * itself is neither.
 */
export function PlatformStyleProvider({ value, children }: { value: PlatformStyle; children: ReactNode }) {
  return <PlatformStyleContext.Provider value={value}>{children}</PlatformStyleContext.Provider>;
}

export function usePlatformStyle(): PlatformStyle {
  return useContext(PlatformStyleContext) ?? defaultStyle();
}
