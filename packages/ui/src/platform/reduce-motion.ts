import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

type MotionWindow = { __GROCS_REDUCE_MOTION__?: boolean; matchMedia?: (query: string) => { matches: boolean } };

/** True where the person, the browser pass or a test asked for no motion. Readable outside React. */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  const w = window as unknown as MotionWindow;
  if (w.__GROCS_REDUCE_MOTION__ === true) return true;
  return typeof w.matchMedia === 'function' && w.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Whether motion should hold still: the web signals at once, the phones' setting once it has been read. */
export function useReduceMotion(): boolean {
  const [reduce, setReduce] = useState(prefersReducedMotion);
  useEffect(() => {
    let live = true;
    void AccessibilityInfo.isReduceMotionEnabled().then((on) => {
      if (live && on) setReduce(true);
    });
    return () => {
      live = false;
    };
  }, []);
  return reduce;
}
