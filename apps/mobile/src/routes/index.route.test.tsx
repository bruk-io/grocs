// Level 4 of decision-11: the index route renders with its sample data and no errors.
import { cleanup, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import Home from '../../app/index.tsx';
import { appOnFakes, renderRoute } from '../../testing/render-route.tsx';

afterEach(cleanup);

describe('index route', () => {
  it('shows the sign-in screen when nobody is signed in', async () => {
    renderRoute({ index: Home }, { app: await appOnFakes({ signedIn: false }) });
    expect(await screen.findByText('Grocs')).toBeTruthy();
    expect(screen.getByText('Sign in with Google is not built yet')).toBeTruthy();
  });

  it('shows the list for a signed-in person', async () => {
    renderRoute({ index: Home }, { app: await appOnFakes({ signedIn: true }) });
    await waitFor(() => expect(screen.getByText('Nothing on the list yet')).toBeTruthy());
    expect(screen.getByLabelText('Add an item')).toBeTruthy();
  });
});
