/**
 * Whether a build offers the grocs://dev-sign-in link, and the sign-in it runs. Only a development
 * build connected to the local emulators may: the link signs in as a seed account with a known
 * password, so on live Firebase it must not exist (TASK-62, TASK-65). devTools is null in a release
 * build; emulatorFns is undefined when the build talks to live Firebase.
 */
export function devSignInFor<D>(
  devTools: D | null,
  emulatorFns: unknown,
  signIn: (devTools: D, name: string) => Promise<void>,
): ((name: string) => Promise<void>) | null {
  if (devTools === null || emulatorFns === undefined || emulatorFns === null) return null;
  return (name) => signIn(devTools, name);
}
