import * as Linking from 'expo-linking';

/** The link a partner opens to land on the join screen with the code filled in. */
export function inviteLink(code: string): string {
  return Linking.createURL('join', { queryParams: { code } });
}

/** What Share sends: the link, and the code for typing in by hand. */
export function inviteMessage(code: string): string {
  return `Join our kitchen on Grocs: ${inviteLink(code)} (code ${code})`;
}
