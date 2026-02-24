import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';

import { colors, radius } from '../constants/theme';

export function AppButton({
  label,
  onPress,
  loading,
  variant = 'primary',
}: {
  label: string;
  onPress: () => void;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
}) {
  const style = variant === 'secondary' ? styles.secondary : variant === 'danger' ? styles.danger : styles.primary;

  return (
    <Pressable onPress={onPress} style={[styles.base, style]} disabled={loading}>
      {loading ? <ActivityIndicator color={colors.text} /> : <Text style={styles.label}>{label}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.sm,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  label: { color: colors.text, fontWeight: '700', fontSize: 14 },
  primary: { backgroundColor: colors.primaryDark, borderColor: colors.primary },
  secondary: { backgroundColor: 'transparent', borderColor: colors.border },
  danger: { backgroundColor: 'rgba(248,113,113,0.2)', borderColor: colors.danger },
});
