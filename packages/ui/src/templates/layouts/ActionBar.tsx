import { StyleSheet, View } from 'react-native';
import { Button } from '../../atoms/Button.tsx';
import { useSafeArea } from '../../platform/safe-area.tsx';
import { tokens } from '../../tokens/tokens.ts';

export interface ActionBarProps {
  label: string;
  /** Primary carries the action shadow; secondary (Sign out) keeps its soft lip. */
  variant?: 'primary' | 'secondary';
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  loadingLabel?: string;
}

/** action.bar: a template region, not an organism. One pinned button, 16 from each side and 24 from the bottom. */
export function ActionBar({ label, variant = 'primary', onPress, disabled = false, loading = false, loadingLabel }: ActionBarProps) {
  const inset = useSafeArea();
  return (
    <View style={[styles.bar, { paddingBottom: tokens.space[24] + inset.bottom, paddingLeft: tokens.space[16] + inset.left, paddingRight: tokens.space[16] + inset.right }]}>
      <View style={[styles.shadow, variant === 'primary' && !disabled && { boxShadow: [...tokens.shadow.action] }]}>
        <Button
          stretch
          variant={variant}
          label={label}
          disabled={disabled}
          loading={loading}
          {...(loadingLabel ? { loadingLabel } : {})}
          {...(onPress ? { onPress } : {})}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { paddingHorizontal: tokens.space[16], paddingBottom: tokens.space[24] },
  shadow: { borderRadius: tokens.radius[20] },
});
