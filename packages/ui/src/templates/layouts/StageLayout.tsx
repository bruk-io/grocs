import { useState } from 'react';
import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { LayoutChangeEvent } from 'react-native';
import { ReportWindow } from '../../platform/diagnostic-layout.tsx';
import { useSafeArea } from '../../platform/safe-area.tsx';
import { tokens } from '../../tokens/tokens.ts';

export interface StageLayoutProps {
  /** wordmark: the name and tagline over the top of the stage. */
  wordmark: ReactNode;
  /** kitchen.scene, filling the stage. */
  stage: ReactNode;
  /** auth.sheet, at the foot. */
  sheet: ReactNode;
}

// DIAGNOSTIC (TASK-36): throwaway overlay of onLayout numbers.
const fmt = (l: { x: number; y: number; width: number; height: number }) => `x=${l.x} y=${l.y} w=${l.width} h=${l.height}`;

/** template.stage: first impressions only. The illustration fills the stage; the sheet holds every action and is only as tall as its content. */
export function StageLayout({ wordmark, stage, sheet }: StageLayoutProps) {
  const inset = useSafeArea();
  const [lines, setLines] = useState<Record<string, string>>({});
  const set = (name: string) => (e: LayoutChangeEvent) => {
    const text = fmt(e.nativeEvent.layout);
    setLines((prev) => (prev[name] === text ? prev : { ...prev, [name]: text }));
  };
  const report = (text: string) => setLines((prev) => (prev.window === text ? prev : { ...prev, window: text }));
  return (
    <View style={styles.screen} onLayout={set('screen')}>
      <View style={[styles.stage, { paddingTop: inset.top }]} onLayout={set('stage')}>
        <View style={styles.scene} onLayout={set('scene')}>
          <ReportWindow.Provider value={report}>{stage}</ReportWindow.Provider>
        </View>
        <View pointerEvents="none" style={[styles.wordmark, { top: tokens.space[24] + inset.top }]}>
          {wordmark}
        </View>
      </View>
      <View pointerEvents="none" style={{ position: 'absolute', left: 0, right: 0, top: inset.top + tokens.space[4], backgroundColor: tokens.color.inkDeep, padding: tokens.space[4] }}>
        <Text style={styles.diag}>{`[layout] insets top=${inset.top} bottom=${inset.bottom} left=${inset.left} right=${inset.right}`}</Text>
        {['screen', 'stage', 'scene', 'sheet', 'window'].map((k) => (
          <Text key={k} style={styles.diag}>{`[layout] ${k} ${lines[k] ?? '-'}`}</Text>
        ))}
      </View>
      <View style={styles.sheet} onLayout={set('sheet')}>
        <View style={[styles.sheetBody, { paddingLeft: inset.left, paddingRight: inset.right }]}>{sheet}</View>
        {/* The sheet's colour carries on under the gesture bar. */}
        <View style={{ height: inset.bottom, backgroundColor: tokens.color.surfaceCard }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: tokens.color.surfaceStage },
  // The stage takes whatever the sheet leaves; the scene scales to fill it, and its ceiling colour carries up under the inset.
  stage: { flex: 1, minHeight: 0, backgroundColor: tokens.color.scene.ceiling },
  // Over the scene's own ceiling, above the cast at every height.
  wordmark: { position: 'absolute', left: 0, right: 0, alignItems: 'center', gap: tokens.space[6] },
  scene: { flex: 1, minHeight: 0 },
  sheet: { marginTop: -tokens.space[4] },
  sheetBody: {},
  diag: { color: tokens.color.chartreuse, fontSize: tokens.font.size.small, lineHeight: tokens.font.lineHeight.small },
});
