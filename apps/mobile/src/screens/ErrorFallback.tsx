import { StyleSheet, View } from 'react-native';
import { Button, PlatformStyleProvider, Text, tokens } from '@grocs/ui';

/** What the root ErrorBoundary shows: one line and a way to try again. It names nothing about the error. */
export function ErrorFallback({ onRetry }: { onRetry: () => void }) {
  return (
    <PlatformStyleProvider value="android">
      <View style={styles.page}>
        <Text variant="heading" accessibilityRole="header">
          Something went wrong
        </Text>
        <Text variant="body" tone="muted">
          Try again. If it keeps happening, copy diagnostics from Settings.
        </Text>
        <Button variant="primary" label="Try again" onPress={onRetry} />
      </View>
    </PlatformStyleProvider>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, justifyContent: 'center', gap: tokens.space[14], padding: tokens.space[14] },
});
