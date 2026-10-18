import { FakeAuth, FakeClock, InMemorySyncStore, MemoryLogger, SequentialIds } from '@grocs/ports/testing';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { composeApp } from '../composition/compose-app.ts';
import { ListScreen } from './ListScreen.tsx';

afterEach(cleanup);

async function appOnFakes() {
  const auth = new FakeAuth([{ uid: 'u1', email: 'u1@grocs.test', displayName: 'U1', password: 'pw' }]);
  await auth.signInWithTestAccount('u1@grocs.test', 'pw');
  const clock = new FakeClock();
  const app = composeApp({
    ports: { syncStore: new InMemorySyncStore(), auth, clock, ids: new SequentialIds('t') },
    logger: new MemoryLogger(),
    runtime: { appVersion: 'test', platform: 'test', kitchenRole: 'member' },
  });
  return app;
}

describe('list screen (R50)', () => {
  it('adds an item from the add bar and shows it in the list', async () => {
    const app = await appOnFakes();
    render(<ListScreen app={app} kitchenId="k1" />);
    expect(screen.getByText('Nothing on the list yet')).toBeTruthy();

    fireEvent.change(screen.getByLabelText('Add an item'), { target: { value: 'Oat milk' } });
    fireEvent.click(screen.getByText('Add'));

    await waitFor(() => expect(screen.getByRole('checkbox', { name: 'Oat milk' })).toBeTruthy());
    expect((screen.getByLabelText('Add an item') as HTMLInputElement).value).toBe('');
  });

  it('asks for a name when the add bar is empty', async () => {
    const app = await appOnFakes();
    render(<ListScreen app={app} kitchenId="k1" />);
    fireEvent.click(screen.getByText('Add'));
    await waitFor(() => expect(screen.getByText('Type what to buy first')).toBeTruthy());
  });
});
