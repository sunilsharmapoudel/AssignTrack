import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { BorderRadius, FontSize, Spacing } from '../../constants/theme';

interface ProgressBarProps {
  percentage: number;
  label?: string;
  showPercentage?: boolean;
  height?: number;
}

export function ProgressBar({ percentage, label, showPercentage = true, height = 10 }: ProgressBarProps) {
  const { colors } = useTheme();
  const clamped = Math.max(0, Math.min(100, percentage));

  const barColor =
    clamped >= 75 ? colors.success :
    clamped >= 40 ? colors.warning :
    colors.error;

  return (
    <View style={styles.wrapper}>
      {(label || showPercentage) && (
        <View style={styles.header}>
          {label && <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>}
          {showPercentage && <Text style={[styles.percentage, { color: colors.text }]}>{clamped}%</Text>}
        </View>
      )}
      <View style={[styles.track, { backgroundColor: colors.border, height }]}>
        <View
          style={[styles.fill, { width: `${clamped}%`, backgroundColor: barColor, height, borderRadius: BorderRadius.full }]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginVertical: Spacing.xs },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.xs },
  label: { fontSize: FontSize.sm },
  percentage: { fontSize: FontSize.sm, fontWeight: '600' },
  track: { borderRadius: BorderRadius.full, overflow: 'hidden' },
  fill: { borderRadius: BorderRadius.full },
});
