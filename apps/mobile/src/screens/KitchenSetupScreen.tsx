import { useState } from 'react';
import { Share, StyleSheet, View } from 'react-native';
import { KitchenSetupTemplate, Text } from '@grocs/ui';
import type { CreateKitchen, KitchenCreated } from '@grocs/application';
import type { App } from '../composition/compose-app.ts';
import { inviteMessage } from './invite.ts';
import { useGo } from './navigate.ts';


const COULD_NOT_CREATE = 'We could not make your kitchen. Check your connection and try again.';

/**
 * Your kitchen, for a signed-in member who has none. Start planning makes the kitchen (CreateKitchen)
 * and shows the invite link and code; pressing it again opens the kitchen's Groceries.
 */
export function KitchenSetupScreen({ app, email, name: you, onReady }: { app: App; email: string; /** The signed-in person's name, for the share message (TASK-70). */ name?: string; onReady: (kitchenId: string) => void }) {
  const go = useGo();
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
        starting={creating}
        onOpenInvite={go.join}
        {...(created
          ? {
              inviteCode: created.inviteCode,
              inviteStatus: { kind: 'waiting' as const, message: 'Waiting for your partner to join' },
              onShare: () => void Share.share({ message: inviteMessage(created.inviteCode, { kitchen: name, ...(you ? { inviter: you } : {}) }) }),
              onCopy: () => void app.copyText(created.inviteCode),
              onStart: () => onReady(created.kitchenId),
            }
          : name.trim() === ''
            ? { inviteCode: null }
            : { inviteCode: null, onStart: () => void create() })}
      />
      {problem ? <Text variant="muted">{problem}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({ screen: { flex: 1 } });
