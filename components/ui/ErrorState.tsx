import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { Button } from './Button';
import { Spacing, FontSize } from '../../constants/theme';

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  const { colors } = useTheme();
  return (
    <View style={styles.container}>
      <Ionicons name="alert-circle-outline" size={56} color={colors.error} />
      <Text style={[styles.title, { color: colors.text }]}>Something went wrong</Text>
      <Text style={[styles.message, { color: colors.textSecondary }]}>{message}</Text>
      {onRetry && <Button label="Try Again" onPress={onRetry} style={styles.button} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xxl },
  title: { fontSize: FontSize.xl, fontWeight: '600', marginTop: Spacing.md },
  message: { fontSize: FontSize.md, marginTop: Spacing.sm, textAlign: 'center', lineHeight: 22 },
  button: { marginTop: Spacing.lg },
});
