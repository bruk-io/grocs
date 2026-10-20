import type { KitchenGateway } from '@grocs/ports';
import { describe, expect, it } from 'vitest';
import { createTestClient } from '../testing/client.ts';

const create = (name = 'Our kitchen') => ({ type: 'CreateKitchen' as const, name, timeZone: 'America/Toronto' });

describe('CreateKitchen scenarios (R2)', () => {
  it('creates the kitchen and returns its id and invite code in a KitchenCreated event', async () => {
    const client = await createTestClient({ uid: 'bruk' });
    const result = await client.dispatcher.dispatch(create());
    expect(result.ok && result.value).toEqual([
      { type: 'KitchenCreated', kitchenId: expect.any(String), inviteCode: expect.stringMatching(/^[A-Z]+-\d{4}$/) },
    ]);
  });

  it('needs a signed-in member', async () => {
    const client = await createTestClient({ uid: 'bruk', signedIn: false });
    const result = await client.dispatcher.dispatch(create());
    expect(!result.ok && result.error.code).toBe('not-signed-in');
  });

  it('rejects an empty name without calling the gateway', async () => {
    const client = await createTestClient({ uid: 'bruk' });
    const result = await client.dispatcher.dispatch(create('  '));
    expect(!result.ok && result.error.code).toBe('empty-name');
    expect(client.logger.records().some((r) => r.attributes['port'] === 'kitchens')).toBe(false);
  });

  it('turns a failing gateway into an internal error result, not an exception', async () => {
    const broken: KitchenGateway = {
      createKitchen: () => Promise.reject(new Error('functions are down')),
      joinKitchen: () => Promise.reject(new Error('functions are down')),
      findMyKitchen: () => Promise.reject(new Error('functions are down')),
    };
    const client = await createTestClient({ uid: 'bruk', kitchens: broken });
    const result = await client.dispatcher.dispatch(create());
    expect(!result.ok && result.error.code).toBe('internal');
  });

  it('reaches the gateway only through the instrumented port (R28, R31)', async () => {
    const client = await createTestClient({ uid: 'bruk' });
    await client.dispatcher.dispatch(create());
    const call = client.logger.records().find((r) => r.attributes['method'] === 'createKitchen');
    expect(call?.attributes).toMatchObject({ port: 'kitchens', method: 'createKitchen', outcome: 'ok' });
  });

  it('answers kitchens-unavailable when no gateway is composed', async () => {
    const client = await createTestClient({ uid: 'bruk', kitchens: null });
    const result = await client.dispatcher.dispatch(create());
    expect(!result.ok && result.error.code).toBe('kitchens-unavailable');
  });

  it('never writes the kitchen name to a log record (R36)', async () => {
    const client = await createTestClient({ uid: 'bruk' });
    await client.dispatcher.dispatch(create('Bruk and Shazya'));
    expect(JSON.stringify(client.logger.records())).not.toContain('Shazya');
  });
});
