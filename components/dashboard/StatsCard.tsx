import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../ui/Card';
import { useTheme } from '../../hooks/useTheme';
import { FontSize, Spacing } from '../../constants/theme';

interface StatsCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: number | string;
  color?: string;
  subtitle?: string;
}

export function StatsCard({ icon, label, value, color, subtitle }: StatsCardProps) {
  const { colors } = useTheme();
  const iconColor = color ?? colors.primary;

  return (
    <Card style={styles.card}>
      <View style={[styles.iconContainer, { backgroundColor: iconColor + '22' }]}>
        <Ionicons name={icon} size={22} color={iconColor} />
      </View>
      <Text style={[styles.value, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
      {subtitle && <Text style={[styles.subtitle, { color: colors.textDisabled }]}>{subtitle}</Text>}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, alignItems: 'center', paddingVertical: Spacing.md },
  iconContainer: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.sm },
  value: { fontSize: FontSize.xxl, fontWeight: '700' },
  label: { fontSize: FontSize.xs, fontWeight: '500', marginTop: 2, textAlign: 'center' },
  subtitle: { fontSize: FontSize.xs, marginTop: 2, textAlign: 'center' },
});
