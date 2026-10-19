// Emulator seed data (R52). Two people, one kitchen. The passwords are for the local
// Auth emulator only; development builds offer these as the test sign-in (R53).
export const DEMO_PROJECT = 'demo-grocs';

export const seedUsers = [
  { uid: 'seed-bruk', email: 'bruk@grocs.test', password: 'local-only-password', displayName: 'Bruk' },
  { uid: 'seed-sam', email: 'sam@grocs.test', password: 'local-only-password', displayName: 'Sam' },
] as const;

export const seedKitchen = {
  id: 'seed-kitchen',
  name: 'Home',
  members: seedUsers.map((u) => u.uid),
} as const;
