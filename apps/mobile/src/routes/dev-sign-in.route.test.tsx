// The end-to-end flows' sign-in link (TASK-62, R51): development builds on the emulators only.
import { cleanup, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import DevSignIn from '../../app/dev-sign-in.tsx';
import Home from '../../app/index.tsx';
import { appOnFakes, renderRoute } from '../../testing/render-route.tsx';

afterEach(cleanup);

describe('dev-sign-in route', () => {
  it('signs the named seed account in and opens the app, when the build offers devSignIn', async () => {
    const app = await appOnFakes({
      signedIn: false,
      devSignIn: async (auth, name) => {
        if (name !== 'alex') throw new Error(`No seed account named "${name}"`);
        await auth.signInWithTestAccount('u1@grocs.test', 'pw');
      },
    });
    renderRoute({ index: Home, 'dev-sign-in': DevSignIn }, { app, location: '/dev-sign-in?as=alex' });
    await waitFor(() => expect(screen.getByText('Nothing on the list yet')).toBeTruthy());
  });

  it('signs nobody in and goes to Welcome in a build without devSignIn (release, or development on live Firebase)', async () => {
    const app = await appOnFakes({ signedIn: false });
    renderRoute({ index: Home, 'dev-sign-in': DevSignIn }, { app, location: '/dev-sign-in?as=alex' });
    expect(await screen.findByRole('button', { name: 'Continue with Google' })).toBeTruthy();
  });

  it('says why when the account name is not a seed account', async () => {
    const app = await appOnFakes({
      signedIn: false,
      devSignIn: async (_auth, name) => {
        throw new Error(`No seed account named "${name}"`);
      },
    });
    renderRoute({ index: Home, 'dev-sign-in': DevSignIn }, { app, location: '/dev-sign-in?as=nobody' });
    expect(await screen.findByText('No seed account named "nobody"')).toBeTruthy();
  });
});
