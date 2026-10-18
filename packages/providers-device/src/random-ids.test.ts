import { idsContract } from '@grocs/ports/testing';
import { describe, expect, it } from 'vitest';
import { RandomIds } from './random-ids.ts';

idsContract({ describe, it, expect }, () => new RandomIds());

describe('RandomIds without a secure source', () => {
  it('still makes a valid id', () => {
    const ids = new RandomIds((bytes) => {
      for (let i = 0; i < bytes.length; i++) bytes[i] = (i * 37 + 11) % 256;
    });
    expect(ids.newId()).toMatch(/^[A-Za-z0-9]{20}$/);
  });
});
