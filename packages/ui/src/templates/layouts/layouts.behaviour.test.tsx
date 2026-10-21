// Level 2 of decision-11 (behaviour) for the layouts: each keeps its top content below the top inset and its bottom actions above the bottom inset.
import { cleanup, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { Text } from 'react-native';
import { afterEach, describe, expect, it } from 'vitest';
import { SafeAreaProvider } from '../../platform/safe-area.tsx';
import { ActionBar } from './ActionBar.tsx';
import { MainLayout } from './MainLayout.tsx';
import { StageLayout } from './StageLayout.tsx';
import { TaskLayout } from './TaskLayout.tsx';

afterEach(cleanup);

const insets = { top: 40, bottom: 24, left: 7, right: 9 };
const px = (el: Element, prop: 'paddingTop' | 'paddingBottom' | 'paddingLeft' | 'paddingRight' | 'bottom' | 'top') => parseFloat(getComputedStyle(el)[prop]);
/** The nearest ancestor (or the element itself) whose computed style carries a non-zero value for `prop`. */
const up = (el: Element, prop: Parameters<typeof px>[1]) => {
  for (let e: Element | null = el; e; e = e.parentElement) if (px(e, prop) > 0) return px(e, prop);
  return 0;
};
const phone = (node: ReactNode) => <SafeAreaProvider insets={insets}>{node}</SafeAreaProvider>;

describe('MainLayout', () => {
  const layout = (
    <MainLayout header={<Text>head</Text>} nav={<Text>tabs</Text>}>
      <Text>body</Text>
    </MainLayout>
  );
  it('starts below the top inset and lifts the tab bar and the last row above the bottom inset', () => {
    render(phone(layout));
    expect(px(screen.getByText('head').parentElement as Element, 'paddingTop')).toBe(40);
    expect(up(screen.getByText('tabs'), 'bottom')).toBe(20 + 24);
    expect(up(screen.getByText('body'), 'paddingBottom')).toBeGreaterThanOrEqual(24);
  });
  it('adds nothing with zero insets', () => {
    render(layout);
    expect(px(screen.getByText('head').parentElement as Element, 'paddingTop')).toBe(0);
    expect(up(screen.getByText('tabs'), 'bottom')).toBe(20);
  });
});

describe('TaskLayout', () => {
  const layout = (
    <TaskLayout header={<Text>head</Text>} actionBar={<ActionBar label="Save" />}>
      <Text>body</Text>
    </TaskLayout>
  );
  it('starts below the top inset', () => {
    render(phone(layout));
    expect(px(screen.getByText('head').parentElement as Element, 'paddingTop')).toBe(40);
    expect(px(screen.getByText('head').parentElement as Element, 'paddingLeft')).toBe(7);
  });
  it('keeps the action bar above the bottom inset', () => {
    render(phone(layout));
    expect(up(screen.getByRole('button', { name: 'Save' }), 'paddingBottom')).toBe(24 + 24);
  });
  it('keeps the footer above the bottom inset when there is no action bar', () => {
    render(
      phone(
        <TaskLayout header={<Text>head</Text>} footer={<Text>quiet</Text>}>
          <Text>body</Text>
        </TaskLayout>,
      ),
    );
    expect(up(screen.getByText('quiet'), 'paddingBottom')).toBe(24 + 24);
  });
  it('keeps the last content above the bottom inset when there is neither', () => {
    render(
      phone(
        <TaskLayout header={<Text>head</Text>}>
          <Text>body</Text>
        </TaskLayout>,
      ),
    );
    expect(up(screen.getByText('body'), 'paddingBottom')).toBe(24 + 24);
  });
});

describe('ActionBar', () => {
  it('sits above the bottom inset, and by the side insets', () => {
    render(phone(<ActionBar label="Save" />));
    const bar = screen.getByRole('button', { name: 'Save' });
    expect(up(bar, 'paddingBottom')).toBe(48);
    const lefts: number[] = [];
    for (let e: Element | null = bar; e; e = e.parentElement) lefts.push(px(e, 'paddingLeft'));
    expect(lefts).toContain(16 + 7);
  });
  it('keeps its own 24 with zero insets', () => {
    render(<ActionBar label="Save" />);
    expect(up(screen.getByRole('button', { name: 'Save' }), 'paddingBottom')).toBe(24);
  });
});

describe('StageLayout', () => {
  const layout = <StageLayout wordmark={<Text>name</Text>} stage={<Text>kitchen</Text>} sheet={<Text>sheet</Text>} />;
  it('moves the stage and the wordmark below the top inset', () => {
    render(phone(layout));
    expect(up(screen.getByText('kitchen'), 'paddingTop')).toBe(40);
    expect(up(screen.getByText('name'), 'top')).toBe(56 + 40);
  });
  it('carries the sheet colour under the bottom inset', () => {
    render(phone(layout));
    const spacer = screen.getByText('sheet').parentElement?.nextElementSibling as Element;
    expect(px(spacer, 'paddingTop') + parseFloat(getComputedStyle(spacer).height)).toBe(24);
  });
  it('adds nothing with zero insets', () => {
    render(layout);
    expect(up(screen.getByText('name'), 'top')).toBe(56);
    expect(up(screen.getByText('kitchen'), 'paddingTop')).toBe(0);
  });
});
