import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { useBattery } from '../../hooks/useBattery';
import { FontSize, Spacing } from '../../constants/theme';

export function BatteryIndicator() {
  const { colors } = useTheme();
  const { percentage, isLow, batteryInfo } = useBattery();

  const iconName =
    batteryInfo.state === 'Charging' ? 'battery-charging-outline' :
    percentage >= 75 ? 'battery-full-outline' :
    percentage >= 40 ? 'battery-half-outline' :
    'battery-dead-outline';

  const iconColor = isLow ? colors.error : batteryInfo.state === 'Charging' ? colors.success : colors.textSecondary;

  return (
    <View style={styles.container}>
      <Ionicons name={iconName} size={16} color={iconColor} />
      <Text style={[styles.text, { color: iconColor }]}>{percentage}%</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  text: { fontSize: FontSize.xs, fontWeight: '500' },
});
