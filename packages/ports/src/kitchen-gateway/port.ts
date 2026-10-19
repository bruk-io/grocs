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
}

export interface CreatedKitchen {
  readonly kitchenId: string;
  readonly inviteCode: string;
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
