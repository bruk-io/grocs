// Level 4 of decision-11: the index route renders with its sample data and no errors.
import { cleanup, fireEvent, screen, waitFor } from '@testing-library/react';
import { AccessibilityInfo } from 'react-native';
import { afterEach, describe, expect, it, vi } from 'vitest';
import Home from '../../app/index.tsx';
import { appOnFakes, renderRoute } from '../../testing/render-route.tsx';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('index route', () => {
  it('shows the Welcome screen when nobody is signed in', async () => {
    renderRoute({ index: Home }, { app: await appOnFakes({ signedIn: false }) });
    expect(await screen.findByText('Grocs')).toBeTruthy();
    expect(screen.getByText('Plan the week. Shop together.')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Continue with Google' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Open it to join' })).toBeTruthy();
  });

  it('does nothing yet when Continue with Google is pressed, and has no test sign-in in a release build', async () => {
    renderRoute({ index: Home }, { app: await appOnFakes({ signedIn: false }) });
    fireEvent.click(await screen.findByRole('button', { name: 'Continue with Google' }));
    expect(screen.getByRole('button', { name: 'Continue with Google' })).toBeTruthy();
    expect(screen.queryByText(/\(test\)/)).toBeNull();
  });

  it('leads to the list from the test sign-in in a development build (R53)', async () => {
    renderRoute({ index: Home }, { app: await appOnFakes({ signedIn: false, dev: true }) });
    fireEvent.click(await screen.findByRole('button', { name: 'Sign in as U1 (test)' }));
    await waitFor(() => expect(screen.getByText('Nothing on the list yet')).toBeTruthy());
  });

  it("shows a mushroom's speech bubble and announces it when it is tapped (R40)", async () => {
    const announce = vi.spyOn(AccessibilityInfo, 'announceForAccessibility').mockImplementation(() => undefined);
    renderRoute({ index: Home }, { app: await appOnFakes({ signedIn: false }) });
    fireEvent.click(await screen.findByRole('button', { name: 'Cremi the cremini, tap to hear a line' }));
    expect(announce).toHaveBeenCalledOnce();
    expect(screen.getByText(String(announce.mock.calls[0]?.[0]))).toBeTruthy();
  });

  it('shows the list for a signed-in person', async () => {
    renderRoute({ index: Home }, { app: await appOnFakes({ signedIn: true }) });
    await waitFor(() => expect(screen.getByText('Nothing on the list yet')).toBeTruthy());
    expect(screen.getByLabelText('Add an item')).toBeTruthy();
  });
});
