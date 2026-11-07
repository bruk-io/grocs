import { describe, expect, it } from 'vitest';
import { inviteLink, inviteMessage } from './invite.ts';

describe('invite link and message (TASK-70)', () => {
  it('puts only the code in the link', () => {
    const link = inviteLink('MOREL-0042');
    expect(link).toContain('code=MOREL-0042');
    expect(link).not.toMatch(/from=|kitchen=/);
  });

  it("names the sender and kitchen in the message's own words", () => {
    expect(inviteMessage('MOREL-0042', { inviter: 'Bruk', kitchen: 'Our kitchen' })).toMatch(/^Bruk invited you to Our kitchen on Grocs: .*\(code MOREL-0042\)$/);
    expect(inviteMessage('MOREL-0042', { kitchen: 'Our kitchen' })).toMatch(/^Join Our kitchen on Grocs: /);
    expect(inviteMessage('MOREL-0042')).toMatch(/^Join our kitchen on Grocs: /);
  });
});
