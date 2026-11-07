import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { KitchenSetupTemplate, Text } from '@grocs/ui';
import type { CreateKitchen, KitchenCreated } from '@grocs/application';
import type { App } from '../composition/compose-app.ts';
import { useGo } from './navigate.ts';
import { useEmailInvite } from './use-email-invite.ts';

const COULD_NOT_CREATE = 'We could not make your kitchen. Check your connection and try again.';

export interface KitchenSetupScreenProps {
  app: App;
  email: string;
  onReady: (kitchenId: string) => void;
  /** Looks again for a partner's invite to this email (TASK-78). */
  onCheckInvites?: () => void;
  checkingInvites?: boolean;
}

/**
 * Your kitchen, for a signed-in member who has none. Start planning makes the kitchen (CreateKitchen),
 * then the partner's email can be added; pressing it again opens the kitchen's Groceries. Someone
 * waiting to join their partner's kitchen can look for the invite here instead.
 */
export function KitchenSetupScreen({ app, email, onReady, onCheckInvites, checkingInvites = false }: KitchenSetupScreenProps) {
  const go = useGo();
  const [name, setName] = useState('Our kitchen');
  const [creating, setCreating] = useState(false);
  const [created, setCreated] = useState<KitchenCreated | null>(null);
  const [problem, setProblem] = useState<string | null>(null);
  const card = useEmailInvite(app, created?.kitchenId ?? '', null);

  const create = async () => {
    setProblem(null);
    setCreating(true);
    try {
      const command: CreateKitchen = { type: 'CreateKitchen', name, timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone };
      const result = await app.dispatch(command);
      const event = result.ok ? result.value.find((e): e is KitchenCreated => e.type === 'KitchenCreated') : undefined;
      if (event) setCreated(event);
      else setProblem(COULD_NOT_CREATE);
    } catch {
      setProblem(COULD_NOT_CREATE);
    } finally {
      setCreating(false);
    }
  };

  const onStart = created ? () => onReady(created.kitchenId) : name.trim() === '' ? undefined : () => void create();
  return (
    <View style={styles.screen}>
      <KitchenSetupTemplate
        email={email}
        kitchenName={name}
        onKitchenNameChange={setName}
        starting={creating}
        invite={created ? card : { kind: 'noKitchen' }}
        checkingInvites={checkingInvites}
        {...(onCheckInvites && !created ? { onCheckInvites } : {})}
        // A failed sign-out is logged by the instrumented auth port; they stay where they are, as in Settings.
        onSignOut={() => void app.signOut().then(go.welcome, () => undefined)}
        {...(onStart ? { onStart } : {})}
      />
      {problem ? <Text variant="muted">{problem}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({ screen: { flex: 1 } });
