import { describe, expect, it } from 'vitest';
import { parseArgs, planRuns } from './e2e.ts';

const flows = ['sign-in.yaml', 'add-meal.yaml', 'second-device-add.yaml', 'second-device-see.yaml', 'household-invite.yaml', 'household-join.yaml', 'household-full.yaml'];

describe('planRuns', () => {
  it('runs every single-device flow on each device given', () => {
    const runs = planRuns({ android: 'emu', ios: 'sim' }, flows, '1');
    expect(runs.filter((r) => !r.flow.startsWith('second-device') && !r.flow.startsWith('household')).map((r) => `${r.flow}@${r.device}`)).toEqual([
      'add-meal.yaml@emu',
      'sign-in.yaml@emu',
      'add-meal.yaml@sim',
      'sign-in.yaml@sim',
    ]);
  });

  it('with both devices, adds on Android then sees on iOS, sharing one item name', () => {
    const pair = planRuns({ android: 'emu', ios: 'sim' }, flows, '42').filter((r) => r.flow.startsWith('second-device'));
    expect(pair.map((r) => `${r.flow}@${r.device}`)).toEqual(['second-device-add.yaml@emu', 'second-device-see.yaml@sim']);
    expect(pair[0]?.env['ITEM']).toBe('E2E from Alex 42');
    expect(pair[1]?.env['ITEM']).toBe(pair[0]?.env['ITEM']);
  });

  it('skips the two-device pair and the household trio with one device', () => {
    expect(planRuns({ android: 'emu' }, flows, '1').some((r) => r.flow.startsWith('second-device') || r.flow.startsWith('household'))).toBe(false);
  });

  it('with both devices, invites on Android, joins on iOS with the code, then sees the kitchen full on Android (TASK-56)', () => {
    const trio = planRuns({ android: 'emu', ios: 'sim' }, flows, '1').filter((r) => r.flow.startsWith('household'));
    expect(trio.map((r) => `${r.flow}@${r.device}`)).toEqual(['household-invite.yaml@emu', 'household-join.yaml@sim', 'household-full.yaml@emu']);
    expect(trio.map((r) => r.needsInviteCode ?? false)).toEqual([false, true, false]);
  });
});

describe('parseArgs', () => {
  it('reads each device and --build', () => {
    expect(parseArgs(['--android', 'emu', '--ios', 'sim', '--build'])).toEqual({ android: 'emu', ios: 'sim', build: true });
    expect(parseArgs(['--ios', 'sim'])).toEqual({ ios: 'sim', build: false });
  });
});
