import { StyleSheet, View } from 'react-native';
import { Avatar } from '../atoms/Avatar.tsx';
import { Button } from '../atoms/Button.tsx';
import { Switch } from '../atoms/Switch.tsx';
import { Text } from '../atoms/Text.tsx';
import { SubHeader } from '../organisms/SubHeader.tsx';
import { tokens } from '../tokens/tokens.ts';
import { ActionBar } from './layouts/ActionBar.tsx';
import { Card } from './layouts/Card.tsx';
import { TaskLayout } from './layouts/TaskLayout.tsx';

/** The Settings screen as it appears in the reference: notifications off. */
export const PREFERENCESTEMPLATE_STATES = ['rest'] as const;

export interface PreferencesTemplateProps {
  /** The signed-in person. */
  name: string;
  email: string;
  /** The kitchen they belong to. */
  kitchen: string;
  /** The partner, named in the notification line: "Tell me when Shazya adds something". */
  partnerName: string;
  notificationsOn: boolean;
  /** Sends the state it wants, never a toggle. */
  onNotificationsChange?: (on: boolean) => void;
  onCopyDiagnostics?: () => void;
  onSignOut?: () => void;
  /** Goes back to Groceries. */
  onBack?: () => void;
}

/** template.task filled for Settings: header.sub, settings cards (switch, button.secondary--s), action.bar--secondary. */
export function PreferencesTemplate({ name, email, kitchen, partnerName, notificationsOn, onNotificationsChange, onCopyDiagnostics, onSignOut, onBack }: PreferencesTemplateProps) {
  const prompt = `Tell me when ${partnerName} adds something`;
  return (
    <TaskLayout
      header={<SubHeader lead={{ kind: 'back', label: 'Groceries', ...(onBack ? { onPress: onBack } : {}) }} tag="Signed in with Google" title="Settings" mascot="morty" />}
      actionBar={<ActionBar label="Sign out" variant="secondary" {...(onSignOut ? { onPress: onSignOut } : {})} />}
    >
      <Card>
        <View style={styles.words}>
          <Text variant="heading" accessibilityRole="header">
            Notifications
          </Text>
          <Text variant="body" tone="muted">{`Off by default. We only nudge you when ${partnerName} adds to the plan or the list.`}</Text>
        </View>
        <View style={styles.switchRow}>
          <View style={styles.switchLabel}>
            <Text variant="label">{prompt}</Text>
          </View>
          <Switch on={notificationsOn} label={prompt} {...(onNotificationsChange ? { onChange: onNotificationsChange } : {})} />
        </View>
      </Card>
      <Card>
        <View style={styles.words}>
          <Text variant="heading" accessibilityRole="header">
            Diagnostics
          </Text>
          <Text variant="body" tone="muted">
            Copies the app version and sync status. Nothing from your lists or plans.
          </Text>
        </View>
        <Button variant="secondary" size="s" stretch label="Copy diagnostics" leadingIcon="copy" {...(onCopyDiagnostics ? { onPress: onCopyDiagnostics } : {})} />
      </Card>
      <Card>
        <View style={styles.account}>
          <Avatar name={name} />
          <View style={styles.words}>
            <Text variant="label">{name}</Text>
            <Text variant="small" tone="muted">{`${email} · ${kitchen}`}</Text>
          </View>
        </View>
      </Card>
    </TaskLayout>
  );
}

const styles = StyleSheet.create({
  words: { gap: tokens.space[4] },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: tokens.space[12],
    paddingVertical: tokens.space[8],
    paddingHorizontal: tokens.space[14],
    borderRadius: tokens.radius[16],
    backgroundColor: tokens.color.surfaceCanvas,
  },
  switchLabel: { flex: 1 },
  account: { flexDirection: 'row', alignItems: 'center', gap: tokens.space[14] },
});
