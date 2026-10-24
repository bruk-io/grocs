import { useState } from 'react';
import { InviteRetryTemplate } from '@grocs/ui';
import { useGo } from './navigate.ts';

/** The invite code did not match, with sample data. Back to my invite leads to the invite. */
export function JoinInviteInvalidScreen() {
  const go = useGo();
  const [code, setCode] = useState('MOREL-42');
  return (
    <InviteRetryTemplate
      inviter="Alex"
      code={code}
      onCodeChange={setCode}
      errorMessage="That code is not a match. Check it with Alex, or ask for a fresh link."
      onBack={go.join}
    />
  );
}
