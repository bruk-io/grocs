import { createContext, useContext } from 'react';
import type { NativeApp } from './composition/native.ts';

const Context = createContext<NativeApp | null>(null);

export const AppProvider = Context.Provider;

/** The composed app. Screens get it from here and never build providers themselves (R26). */
export function useNativeApp(): NativeApp {
  const value = useContext(Context);
  if (!value) throw new Error('useNativeApp needs an AppProvider above it; the root layout provides one');
  return value;
}
