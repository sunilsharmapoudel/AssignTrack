import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { Spacing, FontSize } from '../../constants/theme';

interface LoadingSpinnerProps {
  message?: string;
  fullScreen?: boolean;
}

export function LoadingSpinner({ message, fullScreen = false }: LoadingSpinnerProps) {
  const { colors } = useTheme();
  return (
    <View style={[styles.container, fullScreen && styles.fullScreen, { backgroundColor: fullScreen ? colors.background : 'transparent' }]}>
      <ActivityIndicator size="large" color={colors.primary} />
      {message && <Text style={[styles.message, { color: colors.textSecondary }]}>{message}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center', padding: Spacing.xl },
  fullScreen: { flex: 1 },
  message: { marginTop: Spacing.md, fontSize: FontSize.md },
});
