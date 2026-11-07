// Kitchen setup and sharing by email (TASK-1.20.2, TASK-78), proved through the real routes on the fake
// kitchen gateway. Sign-in routing uses findMyKitchen (TASK-14).
import { cleanup, fireEvent, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { FakeClock, FakeKitchenGateway } from '@grocs/ports/testing';
import Home from '../../app/index.tsx';
import { appOnFakes, renderRoute } from '../../testing/render-route.tsx';
import { COULD_NOT_JOIN, JOIN_REJECTION_MESSAGES } from '../screens/InviteOfferScreen.tsx';
import { INVITE_REJECTION_MESSAGES } from '../screens/use-email-invite.ts';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const ROUTES = { index: Home };
const U1 = { uid: 'u1', name: 'U1', email: 'u1@grocs.test' };

/** u1's view of a server where Shazya (u2) has made a kitchen and, unless told not to, invited u1's email. */
async function shazyaInvitesU1({ invite = true } = {}) {
  const clock = new FakeClock();
  const mine = new FakeKitchenGateway(U1, undefined, clock);
  const shazya = mine.asMember({ uid: 'u2', name: 'Shazya', email: 'shazya@grocs.test' });
  const { kitchenId } = await shazya.createKitchen("Shazya's kitchen", 'UTC');
  if (invite) await shazya.inviteByEmail(kitchenId, 'U1@grocs.test');
  return { clock, mine, shazya, kitchenId };
}

/** Presses Start planning on kitchen setup and waits until the kitchen exists and its email field can be used. */
async function makeKitchen() {
  await screen.findByText('Your kitchen');
  fireEvent.click(screen.getByRole('button', { name: 'Start planning' }));
  await waitFor(() => expect(screen.queryByText('You can invite them once your kitchen is made.')).toBeNull());
  return screen.getByRole('textbox', { name: 'Their email' });
}

describe('sign-in routing', () => {
  it('sends a member with a kitchen to Groceries', async () => {
    renderRoute(ROUTES, { app: await appOnFakes({ signedIn: true }) });
    expect(await screen.findByText('Nothing on the list yet')).toBeTruthy();
  });

  it('signs out from kitchen setup back to Welcome, for someone signed in with the wrong account (TASK-67)', async () => {
    renderRoute(ROUTES, { app: await appOnFakes({ signedIn: true, kitchen: false }) });
    fireEvent.click(await screen.findByRole('button', { name: 'Sign out' }));
    expect(await screen.findByRole('button', { name: 'Continue with Google' })).toBeTruthy();
  });

  it('sends a member with no kitchen and no invite to kitchen setup', async () => {
    renderRoute(ROUTES, { app: await appOnFakes({ signedIn: true, kitchen: false }) });
    expect(await screen.findByText('Your kitchen')).toBeTruthy();
    expect(screen.queryByText('Nothing on the list yet')).toBeNull();
  });

  it('lands on Groceries after signing in when the member already has a kitchen', async () => {
    const googleAccount = { uid: 'u1', email: 'u1@grocs.test', displayName: 'U1' };
    renderRoute(ROUTES, { app: await appOnFakes({ signedIn: false, googleAccount }) });
    fireEvent.click(await screen.findByRole('button', { name: 'Continue with Google' }));
    await screen.findByText('Nothing on the list yet');
  });
});

describe('creating a kitchen', () => {
  it("makes the kitchen, invites the partner's email, then Groceries works on that kitchen", async () => {
    const mine = new FakeKitchenGateway(U1);
    const partner = mine.asMember({ uid: 'u2', email: 'shazya@grocs.test' });
    renderRoute(ROUTES, { app: await appOnFakes({ signedIn: true, kitchen: false, kitchens: mine }) });
    const field = await makeKitchen();
    fireEvent.change(field, { target: { value: 'Shazya@grocs.test' } });
    fireEvent.click(screen.getByRole('button', { name: 'Invite' }));
    expect(await screen.findByText('Invited shazya@grocs.test. Waiting for them to join.')).toBeTruthy();
    // The partner is offered it on the server.
    const kitchenId = await mine.findMyKitchen();
    expect(await partner.invitesForMe()).toEqual([{ kitchenId, kitchen: 'Our kitchen', inviter: 'U1' }]);

    fireEvent.click(screen.getByRole('button', { name: 'Start planning' }));
    await screen.findByText('Nothing on the list yet');
    const box = screen.getByRole('textbox', { name: 'Add an item' });
    fireEvent.change(box, { target: { value: 'Oat milk' } });
    fireEvent.keyDown(box, { key: 'Enter', code: 'Enter' });
    expect(await screen.findByRole('checkbox', { name: 'Oat milk' })).toBeTruthy();
  });

  it('says why an address is refused, under the field', async () => {
    renderRoute(ROUTES, { app: await appOnFakes({ signedIn: true, kitchen: false }) });
    fireEvent.change(await makeKitchen(), { target: { value: 'u1@grocs.test' } });
    fireEvent.click(screen.getByRole('button', { name: 'Invite' }));
    expect(await screen.findByText(INVITE_REJECTION_MESSAGES['own-email'])).toBeTruthy();
  });

  it('takes an invite back', async () => {
    const mine = new FakeKitchenGateway(U1);
    renderRoute(ROUTES, { app: await appOnFakes({ signedIn: true, kitchen: false, kitchens: mine }) });
    fireEvent.change(await makeKitchen(), { target: { value: 'shazya@grocs.test' } });
    fireEvent.click(screen.getByRole('button', { name: 'Invite' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Cancel invite' }));
    expect(await screen.findByRole('textbox', { name: 'Their email' })).toBeTruthy();
    expect(await mine.asMember({ uid: 'u2', email: 'shazya@grocs.test' }).invitesForMe()).toEqual([]);
  });

  it('does not make a kitchen with no name', async () => {
    const mine = new FakeKitchenGateway(U1);
    renderRoute(ROUTES, { app: await appOnFakes({ signedIn: true, kitchen: false, kitchens: mine }) });
    await screen.findByText('Your kitchen');
    fireEvent.change(screen.getByRole('textbox', { name: 'Name your kitchen' }), { target: { value: '   ' } });
    fireEvent.click(screen.getByRole('button', { name: 'Start planning' }));
    expect(await mine.findMyKitchen()).toBeNull();
  });

  it('cannot invite until the kitchen exists, and says which email a partner should add instead', async () => {
    renderRoute(ROUTES, { app: await appOnFakes({ signedIn: true, kitchen: false }) });
    expect(await screen.findByText('You can invite them once your kitchen is made.')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Invite' }).getAttribute('aria-disabled')).toBe('true');
    expect(screen.getByText("Joining your partner's kitchen? Ask them to add u1@grocs.test in Household.")).toBeTruthy();
  });
});

describe('an invite waiting on opening the app (TASK-78)', () => {
  it('is offered to someone with no kitchen, naming who sent it, and joining lands on Groceries', async () => {
    const { mine, clock, kitchenId } = await shazyaInvitesU1();
    renderRoute(ROUTES, { app: await appOnFakes({ signedIn: true, kitchen: false, kitchens: mine, clock }) });
    expect(await screen.findByText('Shazya invited you to')).toBeTruthy();
    expect(screen.queryByText(/takes you out of/)).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: "Join Shazya's kitchen" }));
    await screen.findByText('Nothing on the list yet');
    expect(await mine.findMyKitchen()).toBe(kitchenId);
  });

  it('is offered to someone who has a kitchen of their own, says they leave it, and moves them (the bug that started TASK-78)', async () => {
    const { mine, clock, kitchenId } = await shazyaInvitesU1();
    renderRoute(ROUTES, { app: await appOnFakes({ signedIn: true, kitchen: true, kitchens: mine, clock }) });
    const own = await mine.findMyKitchen();
    expect(await screen.findByText('Joining takes you out of Our kitchen. Its list and meals stay there.')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: "Join Shazya's kitchen" }));
    await screen.findByText('Nothing on the list yet');
    expect(await mine.findMyKitchen()).toBe(kitchenId);
    expect(await mine.getKitchen(own!)).toBeNull();
  });

  it('can be put aside with Not now, which opens their own kitchen and leaves the invite in place', async () => {
    const { mine, clock } = await shazyaInvitesU1();
    renderRoute(ROUTES, { app: await appOnFakes({ signedIn: true, kitchen: true, kitchens: mine, clock }) });
    fireEvent.click(await screen.findByRole('button', { name: 'Not now' }));
    await screen.findByText('Nothing on the list yet');
    expect(await mine.invitesForMe()).toHaveLength(1);
  });

  it('is found by Check for an invite on kitchen setup, once the partner has added the email', async () => {
    const { mine, clock, shazya, kitchenId } = await shazyaInvitesU1({ invite: false });
    renderRoute(ROUTES, { app: await appOnFakes({ signedIn: true, kitchen: false, kitchens: mine, clock }) });
    await screen.findByText('Your kitchen');
    await shazya.inviteByEmail(kitchenId, 'u1@grocs.test');
    fireEvent.click(screen.getByRole('button', { name: 'Check for an invite' }));
    expect(await screen.findByText('Shazya invited you to')).toBeTruthy();
  });

  it('is offered after signing in with Google as the invited address', async () => {
    const { mine, clock } = await shazyaInvitesU1();
    const googleAccount = { uid: 'u1', email: 'u1@grocs.test', displayName: 'U1' };
    renderRoute(ROUTES, { app: await appOnFakes({ signedIn: false, kitchen: false, kitchens: mine, clock, googleAccount }) });
    fireEvent.click(await screen.findByRole('button', { name: 'Continue with Google' }));
    expect(await screen.findByText('Shazya invited you to')).toBeTruthy();
  });

  it('says so when the invite was taken back before Join was pressed', async () => {
    const { mine, clock, shazya, kitchenId } = await shazyaInvitesU1();
    renderRoute(ROUTES, { app: await appOnFakes({ signedIn: true, kitchen: false, kitchens: mine, clock }) });
    await screen.findByText('Shazya invited you to');
    await shazya.cancelInvite(kitchenId);
    fireEvent.click(screen.getByRole('button', { name: "Join Shazya's kitchen" }));
    expect(await screen.findByText(JOIN_REJECTION_MESSAGES['not-found'])).toBeTruthy();
    expect(await mine.findMyKitchen()).toBeNull();
  });

  it('says to check the connection when joining fails outright', async () => {
    const { mine, clock } = await shazyaInvitesU1();
    vi.spyOn(mine, 'acceptInvite').mockRejectedValue(new Error('offline'));
    renderRoute(ROUTES, { app: await appOnFakes({ signedIn: true, kitchen: false, kitchens: mine, clock }) });
    fireEvent.click(await screen.findByRole('button', { name: "Join Shazya's kitchen" }));
    await waitFor(() => expect(screen.getByText(COULD_NOT_JOIN)).toBeTruthy());
  });

  it('keeps the three refusal messages different from one another', () => {
    expect(new Set(Object.values(JOIN_REJECTION_MESSAGES)).size).toBe(3);
  });
});
