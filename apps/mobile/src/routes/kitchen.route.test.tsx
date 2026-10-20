// TASK-1.20.2 (decision-13): the kitchen setup and join screens dispatch CreateKitchen and JoinKitchen,
// proved through the real routes on the fake kitchen gateway. Sign-in routing uses findMyKitchen (TASK-14).
import { cleanup, fireEvent, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import type { JoinOutcome } from '@grocs/ports';
import { FakeClock, FakeKitchenGateway } from '@grocs/ports/testing';
import Home from '../../app/index.tsx';
import Join from '../../app/join.tsx';
import { appOnFakes, renderRoute } from '../../testing/render-route.tsx';
import { JOIN_REJECTION_MESSAGES } from '../screens/JoinInviteScreen.tsx';

afterEach(cleanup);

const ROUTES = { index: Home, join: Join };
const DAY_MS = 24 * 60 * 60 * 1000;

/** A partner (u2) who has made a kitchen, and u1's view of the same server. */
async function partnerWithKitchen() {
  const clock = new FakeClock();
  const mine = new FakeKitchenGateway('u1', undefined, clock);
  const partner = mine.asMember('u2');
  const { inviteCode, kitchenId } = await partner.createKitchen('Partner kitchen', 'UTC');
  return { clock, mine, partner, inviteCode, kitchenId };
}

describe('sign-in routing', () => {
  it('sends a member with a kitchen to Groceries', async () => {
    renderRoute(ROUTES, { app: await appOnFakes({ signedIn: true }) });
    expect(await screen.findByText('Nothing on the list yet')).toBeTruthy();
  });

  it('sends a member with no kitchen to kitchen setup', async () => {
    renderRoute(ROUTES, { app: await appOnFakes({ signedIn: true, kitchen: false }) });
    expect(await screen.findByText('Your kitchen')).toBeTruthy();
    expect(screen.queryByText('Nothing on the list yet')).toBeNull();
  });

  it('lands on Groceries after signing in when the member already has a kitchen', async () => {
    renderRoute(ROUTES, { app: await appOnFakes({ signedIn: false, dev: true }) });
    fireEvent.click(await screen.findByRole('button', { name: 'Sign in as U1 (test)' }));
    await screen.findByText('Nothing on the list yet');
  });
});

describe('creating a kitchen', () => {
  it('shows the invite link and code, then Groceries works on that kitchen', async () => {
    const { mine, partner } = await partnerWithKitchen();
    renderRoute(ROUTES, { app: await appOnFakes({ signedIn: true, kitchen: false, kitchens: mine }) });
    await screen.findByText('Your kitchen');
    fireEvent.click(screen.getByRole('button', { name: 'Start planning' }));
    expect(await screen.findByText(/^[A-Z]+-\d{4}$/)).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Share link' })).toBeTruthy();
    expect(screen.getByText('Waiting for your partner to join')).toBeTruthy();
    // The kitchen exists on the server for its owner.
    expect(await mine.findMyKitchen()).not.toBeNull();
    expect(await partner.findMyKitchen()).not.toBe(await mine.findMyKitchen());

    fireEvent.click(screen.getByRole('button', { name: 'Start planning' }));
    await screen.findByText('Nothing on the list yet');
    const box = screen.getByRole('textbox', { name: 'Add an item' });
    fireEvent.change(box, { target: { value: 'Oat milk' } });
    fireEvent.keyDown(box, { key: 'Enter', code: 'Enter' });
    expect(await screen.findByRole('checkbox', { name: 'Oat milk' })).toBeTruthy();
  });

  it('puts the invite code on the clipboard when Copy code is pressed', async () => {
    const app = await appOnFakes({ signedIn: true, kitchen: false });
    renderRoute(ROUTES, { app });
    await screen.findByText('Your kitchen');
    fireEvent.click(screen.getByRole('button', { name: 'Start planning' }));
    const code = (await screen.findByText(/^[A-Z]+-\d{4}$/)).textContent;
    fireEvent.click(screen.getByRole('button', { name: 'Copy code' }));
    await waitFor(() => expect(app.clipboard.copied).toEqual([code]));
  });

  it('does not make a kitchen with no name', async () => {
    const mine = new FakeKitchenGateway('u1');
    renderRoute(ROUTES, { app: await appOnFakes({ signedIn: true, kitchen: false, kitchens: mine }) });
    await screen.findByText('Your kitchen');
    fireEvent.change(screen.getByRole('textbox', { name: 'Name your kitchen' }), { target: { value: '   ' } });
    fireEvent.click(screen.getByRole('button', { name: 'Start planning' }));
    expect(await mine.findMyKitchen()).toBeNull();
  });

  it('hides Share link and Copy code until the kitchen exists', async () => {
    renderRoute(ROUTES, { app: await appOnFakes({ signedIn: true, kitchen: false }) });
    expect(await screen.findByText('Your code appears after Start planning.')).toBeTruthy();
    expect(screen.queryByRole('button', { name: /Share link/ })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Copy code' })).toBeNull();
  });
});

describe('joining a kitchen', () => {
  it('joins from the invite link and lands on Groceries', async () => {
    const { mine, clock, inviteCode, kitchenId } = await partnerWithKitchen();
    renderRoute(ROUTES, { app: await appOnFakes({ signedIn: true, kitchen: false, kitchens: mine, clock }), location: `/join?code=${inviteCode}` });
    fireEvent.click(await screen.findByRole('button', { name: 'Join with Google' }));
    await screen.findByText('Nothing on the list yet');
    expect(await mine.findMyKitchen()).toBe(kitchenId);
  });

  it('joins from a code typed in', async () => {
    const { mine, clock, inviteCode, kitchenId } = await partnerWithKitchen();
    renderRoute(ROUTES, { app: await appOnFakes({ signedIn: true, kitchen: false, kitchens: mine, clock }), location: '/join' });
    fireEvent.change(await screen.findByRole('textbox'), { target: { value: inviteCode.toLowerCase() } });
    fireEvent.click(screen.getByRole('button', { name: 'Check code' }));
    await screen.findByText('Nothing on the list yet');
    expect(await mine.findMyKitchen()).toBe(kitchenId);
  });

  it('opens /join with a neutral code entry, and says the code did not work only after a rejection', async () => {
    renderRoute(ROUTES, { app: await appOnFakes({ signedIn: true, kitchen: false }), location: '/join' });
    expect(await screen.findByText('Enter your invite code')).toBeTruthy();
    expect(screen.queryByText("Code didn't work")).toBeNull();
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'NOPE-0000' } });
    fireEvent.click(screen.getByRole('button', { name: 'Check code' }));
    expect(await screen.findByText("Code didn't work")).toBeTruthy();
    expect((screen.getByRole('textbox') as HTMLInputElement).value).toBe('NOPE-0000');
  });

  async function enterCode(mine: FakeKitchenGateway, clock: FakeClock, code: string) {
    renderRoute(ROUTES, { app: await appOnFakes({ signedIn: true, kitchen: false, kitchens: mine, clock }), location: '/join' });
    fireEvent.change(await screen.findByRole('textbox'), { target: { value: code } });
    fireEvent.click(screen.getByRole('button', { name: 'Check code' }));
  }

  it('shows its own inline error for a code that is not found', async () => {
    const { mine, clock } = await partnerWithKitchen();
    await enterCode(mine, clock, 'NOPE-0000');
    expect(await screen.findByText(JOIN_REJECTION_MESSAGES['not-found'])).toBeTruthy();
    expect(screen.getByRole('textbox')).toBeTruthy();
  });

  it('shows its own inline error for an expired invite', async () => {
    const { mine, clock, inviteCode } = await partnerWithKitchen();
    clock.advance(DAY_MS + 1);
    await enterCode(mine, clock, inviteCode);
    expect(await screen.findByText(JOIN_REJECTION_MESSAGES.expired)).toBeTruthy();
  });

  it('shows its own inline error for an invite that was used', async () => {
    const { mine, clock, inviteCode, partner } = await partnerWithKitchen();
    const third = partner.asMember('u3');
    expect((await third.joinKitchen(inviteCode)).kind).toBe('joined');
    await enterCode(mine, clock, inviteCode);
    expect(await screen.findByText(JOIN_REJECTION_MESSAGES.used)).toBeTruthy();
  });

  it('shows its own inline error when you are already a member', async () => {
    const { mine, clock } = await partnerWithKitchen();
    // u1 owns a kitchen of their own and opens an invite code that points at it.
    const own = await mine.createKitchen('Mine', 'UTC');
    await enterCode(mine, clock, own.inviteCode);
    expect(await screen.findByText(JOIN_REJECTION_MESSAGES['already-member'])).toBeTruthy();
  });

  it('shows its own inline error when the kitchen is full', async () => {
    // A server that says the kitchen has no room; a full kitchen cannot be reached through the fake once its invite is used.
    const { mine, clock, inviteCode } = await partnerWithKitchen();
    const full: FakeKitchenGateway = Object.assign(Object.create(mine) as FakeKitchenGateway, {
      joinKitchen: async (): Promise<JoinOutcome> => ({ kind: 'rejected', reason: 'full' }),
    });
    await enterCode(full, clock, inviteCode);
    expect(await screen.findByText(JOIN_REJECTION_MESSAGES.full)).toBeTruthy();
  });

  it('asks to sign in first when opened from a link while signed out, and says so inline if that fails', async () => {
    const { mine, clock, inviteCode } = await partnerWithKitchen();
    renderRoute(ROUTES, { app: await appOnFakes({ signedIn: false, kitchen: false, kitchens: mine, clock }), location: `/join?code=${inviteCode}` });
    fireEvent.click(await screen.findByRole('button', { name: 'Join with Google' }));
    expect(await screen.findByText(/could not check that code/)).toBeTruthy();
    expect(await mine.findMyKitchen()).toBeNull();
  });

  it('keeps the five messages different from one another', () => {
    expect(new Set(Object.values(JOIN_REJECTION_MESSAGES)).size).toBe(5);
  });

  it('shows the rejection where the code was entered, after opening an invite link', async () => {
    const { mine, clock } = await partnerWithKitchen();
    renderRoute(ROUTES, { app: await appOnFakes({ signedIn: true, kitchen: false, kitchens: mine, clock }), location: '/join?code=NOPE-0000' });
    fireEvent.click(await screen.findByRole('button', { name: 'Join with Google' }));
    await waitFor(() => expect(screen.getByText(JOIN_REJECTION_MESSAGES['not-found'])).toBeTruthy());
    expect((screen.getByRole('textbox') as HTMLInputElement).value).toBe('NOPE-0000');
  });
});
