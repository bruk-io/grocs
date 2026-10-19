import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { AccessibilityInfo } from 'react-native';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useSystemReduceMotion } from './useSystemReduceMotion.ts';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('useSystemReduceMotion', () => {
  it('starts from the phone setting and follows reduceMotionChanged (R41)', async () => {
    let emit: (on: boolean) => void = () => undefined;
    const remove = vi.fn();
    vi.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(true);
    vi.spyOn(AccessibilityInfo, 'addEventListener').mockImplementation(((_: string, handler: (on: boolean) => void) => {
      emit = handler;
      return { remove };
    }) as never);
    const { result, unmount } = renderHook(() => useSystemReduceMotion());
    await waitFor(() => expect(result.current).toBe(true));
    act(() => emit(false));
    expect(result.current).toBe(false);
    unmount();
    expect(remove).toHaveBeenCalledOnce();
  });
});
