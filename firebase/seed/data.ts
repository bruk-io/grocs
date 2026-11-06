// Emulator seed data (R52). Two people, one kitchen. The passwords are for the local
// Auth emulator only; development builds offer these as the test sign-in (R53).
export const DEMO_PROJECT = 'demo-grocs';

export const seedUsers = [
  { uid: 'seed-alex', email: 'alex@grocs.test', password: 'local-only-password', displayName: 'Alex' },
  { uid: 'seed-sam', email: 'sam@grocs.test', password: 'local-only-password', displayName: 'Sam' },
] as const;

export const seedKitchen = {
  id: 'seed-kitchen',
  name: 'Home',
  members: seedUsers.map((u) => u.uid),
} as const;

/**
 * Two more people for the invite flow (TASK-56): Jo has a kitchen with room for a partner, Pat has
 * no kitchen yet. Kept apart from seedUsers, which the emulator tests treat as one full kitchen.
 */
export const inviteSeedUsers = [
  { uid: 'seed-jo', email: 'jo@grocs.test', password: 'local-only-password', displayName: 'Jo' },
  { uid: 'seed-pat', email: 'pat@grocs.test', password: 'local-only-password', displayName: 'Pat' },
] as const;

/** Jo's kitchen, reset to Jo alone on every seed so Pat can join it again. */
export const seedOpenKitchen = {
  id: 'seed-open-kitchen',
  name: "Jo's kitchen",
  members: [inviteSeedUsers[0].uid],
} as const;

/** Every seed account, as the development build's grocs://dev-sign-in link finds them by name. */
export const seedAccounts = [...seedUsers, ...inviteSeedUsers] as const;
