import * as Linking from 'expo-linking';

/** Who is inviting, for the words of the share message. Never put in the link: the join screen asks the server instead (TASK-70). */
export interface InviteSender {
  readonly inviter?: string;
  readonly kitchen?: string;
}

/** The link a partner opens to land on the join screen with the code filled in. It carries the code only. */
export function inviteLink(code: string): string {
  return Linking.createURL('join', { queryParams: { code } });
}

/** What Share sends: who is inviting, in the sender's own words, then the link and the code for typing in by hand. */
export function inviteMessage(code: string, sender: InviteSender = {}): string {
  const lead =
    sender.inviter && sender.kitchen
      ? `${sender.inviter} invited you to ${sender.kitchen} on Grocs`
      : sender.kitchen
        ? `Join ${sender.kitchen} on Grocs`
        : 'Join our kitchen on Grocs';
  return `${lead}: ${inviteLink(code)} (code ${code})`;
}
