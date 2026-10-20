import * as Linking from 'expo-linking';
import { useState } from 'react';
import { Share, StyleSheet, View } from 'react-native';
import { KitchenSetupTemplate, Text } from '@grocs/ui';
import type { CreateKitchen, KitchenCreated } from '@grocs/application';
import type { App } from '../composition/compose-app.ts';

/** The link a partner opens to land on the join screen with the code filled in. */
function inviteLink(code: string): string {
  return Linking.createURL('join', { queryParams: { code } });
}

const COULD_NOT_CREATE = 'We could not make your kitchen. Check your connection and try again.';

/**
 * Your kitchen, for a signed-in member who has none. Start planning makes the kitchen (CreateKitchen)
 * and shows the invite link and code; pressing it again opens the kitchen's Groceries.
 */
export function KitchenSetupScreen({ app, email, onReady }: { app: App; email: string; onReady: (kitchenId: string) => void }) {
  const [name, setName] = useState('Our kitchen');
  const [creating, setCreating] = useState(false);
  const [created, setCreated] = useState<KitchenCreated | null>(null);
  const [problem, setProblem] = useState<string | null>(null);

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

  return (
    <View style={styles.screen}>
      <KitchenSetupTemplate
        email={email}
        kitchenName={name}
        onKitchenNameChange={setName}
        inviteCode={created?.inviteCode ?? '- - - -'}
        starting={creating}
        {...(created
          ? {
              inviteStatus: { kind: 'waiting' as const, message: 'Waiting for your partner to join' },
              onShare: () => void Share.share({ message: `Join our kitchen on Grocs: ${inviteLink(created.inviteCode)} (code ${created.inviteCode})` }),
              onStart: () => onReady(created.kitchenId),
            }
          : name.trim() === ''
            ? {}
            : { onStart: () => void create() })}
      />
      {problem ? <Text variant="muted">{problem}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({ screen: { flex: 1 } });
