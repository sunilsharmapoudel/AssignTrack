import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { Priority, AssignmentStatus } from '../../types';
import { BorderRadius, FontSize, Spacing } from '../../constants/theme';

type BadgeVariant = Priority | AssignmentStatus | 'info';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
}

export function Badge({ label, variant = 'info' }: BadgeProps) {
  const { colors } = useTheme();

  const bg = variantBg(variant, colors);
  const fg = variantFg(variant, colors);

  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.label, { color: fg }]}>{label}</Text>
    </View>
  );
}

function variantBg(v: BadgeVariant, colors: any): string {
  switch (v) {
    case 'High':      return colors.priorityHigh + '22';
    case 'Medium':    return colors.priorityMedium + '22';
    case 'Low':       return colors.priorityLow + '22';
    case 'Completed': return colors.success + '22';
    case 'Pending':   return colors.warning + '22';
    default:          return colors.info + '22';
  }
}

function variantFg(v: BadgeVariant, colors: any): string {
  switch (v) {
    case 'High':      return colors.priorityHigh;
    case 'Medium':    return colors.priorityMedium;
    case 'Low':       return colors.priorityLow;
    case 'Completed': return colors.success;
    case 'Pending':   return colors.warning;
    default:          return colors.info;
  }
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingVertical: 2,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  label: { fontSize: FontSize.xs, fontWeight: '600' },
});
