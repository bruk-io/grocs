import { StyleSheet, View } from 'react-native';
import { Button } from '../atoms/Button.tsx';
import { Spinner } from '../atoms/Spinner.tsx';
import { Text } from '../atoms/Text.tsx';
import { icons } from '../icons/index.ts';
import { tokens } from '../tokens/tokens.ts';

/** status.banner--offline, --syncing and --synced; a banner is only ever read, so each state is what the sync is doing. */
export const STATUSBANNER_STATES = ['offline', 'syncing', 'synced'] as const;

export interface StatusBannerProps {
  kind?: (typeof STATUSBANNER_STATES)[number];
  /** What the banner says, such as "Offline. 2 changes waiting." */
  message: string;
  /** Names the soft button on an offline or syncing banner, such as "Try again". */
  actionLabel?: string;
  /** What the button says while it is busy (syncing), such as "Sending". */
  busyLabel?: string;
  onAction?: () => void;
}

/** Tells the person where their changes are: waiting, going, or sent. Dashed while changes wait, solid once sent (icon, text.small, button.soft). */
export function StatusBanner({ kind = 'offline', message, actionLabel, busyLabel, onAction }: StatusBannerProps) {
  const synced = kind === 'synced';
  const Glyph = kind === 'offline' ? icons['cloud-off'] : icons.check;
  return (
    <View aria-live="polite" style={[styles.banner, synced ? styles.solid : styles.dashed]}>
      {kind === 'syncing' ? <Spinner /> : <Glyph color={synced ? tokens.color.forest : tokens.color.inkSoft} size={tokens.size.iconTileGlyph} />}
      <View style={styles.message}>
        <Text variant="small">{message}</Text>
      </View>
      {!synced && actionLabel ? (
        <Button
          variant="soft"
          label={actionLabel}
          loading={kind === 'syncing'}
          {...(busyLabel ? { loadingLabel: busyLabel } : {})}
          {...(onAction ? { onPress: onAction } : {})}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    minHeight: tokens.size.target,
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.space[10],
    paddingVertical: tokens.space[6],
    paddingLeft: tokens.space[14],
    paddingRight: tokens.space[6],
    borderRadius: tokens.radius[16],
    borderWidth: tokens.size.lineW,
  },
  dashed: { borderStyle: 'dashed', borderColor: tokens.color.lineDone, backgroundColor: tokens.color.surfaceDone },
  solid: { borderColor: 'transparent', backgroundColor: tokens.color.positiveTint },
  message: { flex: 1, minWidth: 0 },
});
