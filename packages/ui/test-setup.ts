// Setup for the ui test project (jsdom). jsdom has no matchMedia, which Reanimated's web build reads when it
// loads (its reduced-motion check). A stub that reports no preference is what a person who never changed the
// setting has; tests that need the preference set `globalThis.__GROCS_REDUCE_MOTION__` instead.
if (typeof window !== 'undefined' && typeof window.matchMedia !== 'function') {
  window.matchMedia = (query: string): MediaQueryList =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      addListener: () => undefined,
      removeListener: () => undefined,
      dispatchEvent: () => false,
    }) as MediaQueryList;
}
