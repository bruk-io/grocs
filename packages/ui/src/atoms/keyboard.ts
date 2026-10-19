interface KeyLike {
  key?: string;
  nativeEvent?: { key?: string };
  preventDefault?: () => void;
}

const isSpace = (event: unknown): boolean => {
  const { key, nativeEvent } = event as KeyLike;
  return (key ?? nativeEvent?.key) === ' ';
};

/**
 * react-native-web presses a control on Enter for every role and on Space only for role "button", but
 * the WAI-ARIA patterns for checkbox and switch want Space. Spread the result onto the Pressable:
 * Space is held back on key down, so the page does not scroll, and acts on key up, as a native control
 * does. On the phones the handlers are never called.
 */
export function spaceActivates(activate: () => void, enabled: boolean): { onKeyDown: (event: unknown) => void; onKeyUp: (event: unknown) => void } {
  return {
    onKeyDown: (event) => {
      if (enabled && isSpace(event)) (event as KeyLike).preventDefault?.();
    },
    onKeyUp: (event) => {
      if (enabled && isSpace(event)) activate();
    },
  };
}
