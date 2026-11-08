/**
 * Creating a kitchen, inviting a partner by email and joining go through server-side functions
 * (R2, R3): they need a connection anyway, and only the server can match an invite to the verified
 * email on a person's sign-in without letting them read other kitchens. This port is the phone's
 * one way in.
 */
export interface KitchenGateway {
  /** Makes a kitchen named `name`, with the caller as its first member (R2). */
  createKitchen(name: string, timeZone: string): Promise<CreatedKitchen>;
  /**
   * Invites the caller's partner by email to a kitchen the caller belongs to (R2, TASK-78), replacing
   * any earlier invite. The answer never depends on whether the address has signed in to Grocs.
   * Rejects when the caller is not a member of the kitchen.
   */
  inviteByEmail(kitchenId: string, email: string): Promise<InviteByEmailOutcome>;
  /** Takes back the kitchen's invite, if it has one. Rejects when the caller is not a member. */
  cancelInvite(kitchenId: string): Promise<void>;
  /** The invites waiting for the caller's verified sign-in email, oldest first (R3, TASK-78). */
  invitesForMe(): Promise<readonly InviteOffer[]>;
  /**
   * Joins the kitchen that invited the caller (R3). A caller who already belongs to another kitchen
   * leaves it in the same step.
   */
  acceptInvite(kitchenId: string): Promise<AcceptOutcome>;
  /** The caller's kitchen, found on any phone after signing in - or null if they have none yet. */
  findMyKitchen(): Promise<string | null>;
  /** A kitchen's name, members and pending invite, for a kitchen the caller belongs to - or null otherwise. */
  getKitchen(kitchenId: string): Promise<KitchenDetails | null>;
}

export interface CreatedKitchen {
  readonly kitchenId: string;
}

export type InviteByEmailOutcome =
  | { readonly kind: 'invited'; readonly email: string }
  | { readonly kind: 'rejected'; readonly reason: InviteByEmailRejectedReason };

/** `invalid-email` is not an address, `own-email` is the caller's, `full` means both members are in (R3). */
export type InviteByEmailRejectedReason = 'invalid-email' | 'own-email' | 'full';

/** An invite waiting for the caller: which kitchen, what it is called, and who sent it. Names come from the server's records. */
export interface InviteOffer {
  readonly kitchenId: string;
  readonly kitchen: string;
  readonly inviter: string;
}

export type AcceptOutcome =
  | { readonly kind: 'joined'; readonly kitchenId: string }
  | { readonly kind: 'rejected'; readonly reason: AcceptRejectedReason };

/** `not-found`: no invite for this caller (cancelled, replaced or never theirs); `full` and `already-member` describe the kitchen. */
export type AcceptRejectedReason = 'not-found' | 'full' | 'already-member';

export interface KitchenMemberDetails {
  readonly uid: string;
  readonly name: string;
}

export interface KitchenDetails {
  readonly name: string;
  readonly members: readonly KitchenMemberDetails[];
  /** The email invited and not yet joined, or null. */
  readonly invitedEmail: string | null;
}
