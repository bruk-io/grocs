import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

/** The phone's reduce-motion setting, read once and kept current as the person changes it (R41). Passed to the ui MotionProvider. */
export function useSystemReduceMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    let live = true;
    void AccessibilityInfo.isReduceMotionEnabled().then((on) => {
      if (live) setReduced(on);
    });
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduced);
    return () => {
      live = false;
      subscription.remove();
    };
  }, []);
  return reduced;
}
