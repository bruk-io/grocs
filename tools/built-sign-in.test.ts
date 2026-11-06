import { describe, expect, it } from 'vitest';
import { clientIdsIn, kindOf, NO_EXPECTED_RULE, RULE, verdict, WRONG_ID_RULE } from './built-sign-in.ts';

describe('clientIdsIn', () => {
  it('finds a web client ID among bundle bytes', () => {
    const bundle = '\u0000webClientId\u0000950648718006-qf0blvdefh26l0sptdg2nqv2qbomt1it.apps.googleusercontent.com\u0000';
    expect(clientIdsIn(bundle)).toEqual(['950648718006-qf0blvdefh26l0sptdg2nqv2qbomt1it.apps.googleusercontent.com']);
  });

  it('finds nothing in a bundle that only names the option, as build 8 did', () => {
    expect(clientIdsIn('GoogleSignin.configure({ webClientId: undefined }) googleusercontent')).toEqual([]);
  });

  it('reports a repeated ID once', () => {
    const id = '1234567-abcdefghijklmnopqrstuvwxyz012345.apps.googleusercontent.com';
    expect(clientIdsIn(`${id} ${id}`)).toEqual([id]);
  });
});

describe('kindOf', () => {
  it('tells an iOS archive from an Android one by extension', () => {
    expect(kindOf('build/Grocs.ipa')).toBe('ipa');
    expect(kindOf('grocs.apk')).toBe('apk');
    expect(kindOf('grocs.aab')).toBeNull();
  });
});

describe('verdict', () => {
  const web = '950648718006-qf0blvdefh26l0sptdg2nqv2qbomt1it.apps.googleusercontent.com';
  const ios = '950648718006-qbdlrjkjt6f5lmc0c1aihstprp5ok5l8.apps.googleusercontent.com';

  it('passes a bundle carrying the expected web client ID', () => {
    expect(verdict([web], web, true).ok).toBe(true);
  });

  it('fails a bundle that carries only some other Google client ID (TASK-54)', () => {
    expect(verdict([ios], web, true)).toEqual({ ok: false, rule: WRONG_ID_RULE, found: [ios] });
  });

  it('fails in CI when no expected ID was given, rather than accepting any ID', () => {
    expect(verdict([web], undefined, true)).toEqual({ ok: false, rule: NO_EXPECTED_RULE, found: [web] });
  });

  it('fails a bundle with no client ID at all', () => {
    expect(verdict([], web, true)).toEqual({ ok: false, rule: RULE, found: [] });
  });

  it('outside CI with no expected ID, passes and says which IDs it found', () => {
    expect(verdict([ios], undefined, false)).toEqual({ ok: true, note: `carries Google client ID ${ios} (no expected ID given)` });
  });
});
