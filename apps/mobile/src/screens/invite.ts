import * as Linking from 'expo-linking';

/**
 * Who is inviting, as the join screen shows it ("Bruk invited you to Our kitchen"). The joiner is not a
 * member yet, so their phone cannot read the kitchen: the sender's phone puts these in the link (TASK-68).
 */
export interface InviteSender {
  readonly inviter?: string;
  readonly kitchen?: string;
}

/** The link a partner opens to land on the join screen with the code filled in. */
export function inviteLink(code: string, sender: InviteSender = {}): string {
  return Linking.createURL('join', {
    queryParams: { code, ...(sender.inviter ? { from: sender.inviter } : {}), ...(sender.kitchen ? { kitchen: sender.kitchen } : {}) },
  });
}

/** What Share sends: the link, and the code for typing in by hand. */
export function inviteMessage(code: string, sender: InviteSender = {}): string {
  return `Join our kitchen on Grocs: ${inviteLink(code, sender)} (code ${code})`;
}
