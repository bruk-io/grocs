import { describe, expect, it } from 'vitest';
import { clientIdsIn, kindOf } from './built-sign-in.ts';

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
