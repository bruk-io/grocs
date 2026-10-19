// The skeleton's add-item flow (R50, R10), now through the Groceries template at the signed-in home route.
// The file keeps its old name because the weakening check forbids deleting a test file; renaming it needs
// a recorded human exception (tools/checks/weakening-overrides.json).
import { cleanup, fireEvent, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import Home from '../../app/index.tsx';
import { appOnFakes, renderRoute } from '../../testing/render-route.tsx';

afterEach(cleanup);

describe('add-item flow through the Groceries template (R50)', () => {
  it('adds an item from the add bar and shows it in the list', async () => {
    renderRoute({ index: Home }, { app: await appOnFakes({ signedIn: true }) });
    await screen.findByText('Nothing on the list yet');
    fireEvent.change(screen.getByRole('textbox', { name: 'Add an item' }), { target: { value: 'Oat milk' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add' }));
    await waitFor(() => expect(screen.getByRole('checkbox', { name: 'Oat milk' })).toBeTruthy());
    expect((screen.getByRole('textbox', { name: 'Add an item' }) as HTMLInputElement).value).toBe('');
    expect(screen.queryByText('Nothing on the list yet')).toBeNull();
  });

  it('asks for a name when the add bar is empty', async () => {
    renderRoute({ index: Home }, { app: await appOnFakes({ signedIn: true }) });
    await screen.findByText('Nothing on the list yet');
    fireEvent.click(screen.getByRole('button', { name: 'Add' }));
    await waitFor(() => expect(screen.getByText('Type what to buy first')).toBeTruthy());
  });
});
