/**
 * Creating a kitchen and joining one by invite go through server-side functions (R2, R3): they
 * need a connection anyway, and the server is the only place that can look up an invite code
 * without already being a member. This port is the phone's one way in.
 */
export interface KitchenGateway {
  /** Makes a kitchen named `name`, with the caller as its first member (R2). */
  createKitchen(name: string, timeZone: string): Promise<CreatedKitchen>;
  /** Uses an invite code to join a kitchen (R3). */
  joinKitchen(code: string): Promise<JoinOutcome>;
  /** The caller's kitchen, found on any phone after signing in - or null if they have none yet. */
  findMyKitchen(): Promise<string | null>;
  /** A kitchen's name and members, for a kitchen the caller belongs to - or null for an id nobody has. */
  getKitchen(kitchenId: string): Promise<KitchenDetails | null>;
  /**
   * The invite a member shares to bring their partner in (TASK-56): the kitchen's pending invite if it
   * still works, or a fresh one when the last expired or was used - or 'full' once the kitchen has
   * both its members (R3). Rejects when the caller is not a member of the kitchen.
   */
  inviteForKitchen(kitchenId: string): Promise<KitchenInvite>;
  /**
   * Who invited the caller and to which kitchen, from the server's own records, before they join
   * (TASK-70) - or null for a code that would not let them in. The names never come from the link.
   */
  previewInvite(code: string): Promise<InvitePreview | null>;
}

export interface InvitePreview {
  readonly inviter: string;
  readonly kitchen: string;
}

export type KitchenInvite = { readonly kind: 'open'; readonly code: string; readonly expiresAt: number } | { readonly kind: 'full' };

export interface CreatedKitchen {
  readonly kitchenId: string;
  readonly inviteCode: string;
}

export interface KitchenMemberDetails {
  readonly uid: string;
  readonly name: string;
}

export interface KitchenDetails {
  readonly name: string;
  readonly members: readonly KitchenMemberDetails[];
}

export type JoinOutcome =
  | { readonly kind: 'joined'; readonly kitchenId: string }
  | { readonly kind: 'rejected'; readonly reason: JoinRejectedReason };

/**
 * `not-found`, `expired` and `used` describe the invite; `full` and `already-member` describe the
 * kitchen it points to. Kept as one union because the screen shows one inline error either way
 * (R3) and does not need to tell the two kinds apart.
 */
export type JoinRejectedReason = 'not-found' | 'expired' | 'used' | 'full' | 'already-member';
