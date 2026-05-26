import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { useBattery } from '../hooks/useBattery';
import { Card } from '../components/ui/Card';
import { ProgressBar } from '../components/dashboard/ProgressBar';
import { Spacing, FontSize } from '../constants/theme';

export default function BatteryScreen() {
  const { colors } = useTheme();
  const { batteryInfo, percentage, isLow, tip } = useBattery();

  const batteryColor =
    percentage >= 75 ? colors.success :
    percentage >= 40 ? colors.warning :
    colors.error;

  const iconName =
    batteryInfo.state === 'Charging' ? 'battery-charging-outline' :
    percentage >= 75 ? 'battery-full-outline' :
    percentage >= 40 ? 'battery-half-outline' :
    'battery-dead-outline';

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Big Battery Display */}
      <View style={[styles.heroCard, { backgroundColor: colors.surface }]}>
        <Ionicons name={iconName} size={80} color={batteryColor} />
        <Text style={[styles.percentage, { color: batteryColor }]}>{percentage}%</Text>
        <Text style={[styles.stateText, { color: colors.textSecondary }]}>{batteryInfo.state}</Text>
        <ProgressBar percentage={percentage} showPercentage={false} height={14} />
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <Card style={styles.statCard}>
          <Ionicons name="flash-outline" size={24} color={colors.warning} />
          <Text style={[styles.statValue, { color: colors.text }]}>{batteryInfo.state}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Status</Text>
        </Card>
        <Card style={styles.statCard}>
          <Ionicons
            name={batteryInfo.lowPowerMode ? 'leaf-outline' : 'cellular-outline'}
            size={24}
            color={batteryInfo.lowPowerMode ? colors.success : colors.primary}
          />
          <Text style={[styles.statValue, { color: colors.text }]}>
            {batteryInfo.lowPowerMode ? 'ON' : 'OFF'}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Low Power</Text>
        </Card>
      </View>

      {/* Tip */}
      <Card>
        <View style={styles.tipRow}>
          <Ionicons name="bulb-outline" size={20} color={colors.warning} />
          <Text style={[styles.tipTitle, { color: colors.text }]}>Optimization Tip</Text>
        </View>
        <Text style={[styles.tipText, { color: colors.textSecondary }]}>{tip}</Text>
      </Card>

      {/* Info */}
      <Card>
        <Text style={[styles.infoTitle, { color: colors.text }]}>Battery & App Impact</Text>
        <InfoRow icon="sync-outline" label="Background sync" value={batteryInfo.lowPowerMode ? 'Paused' : 'Active'} colors={colors} />
        <InfoRow icon="notifications-outline" label="Notifications" value="Always active" colors={colors} />
        <InfoRow icon="location-outline" label="Location services" value={batteryInfo.lowPowerMode ? 'Reduced' : 'Normal'} colors={colors} />
        <InfoRow icon="wifi-outline" label="Connectivity check" value={batteryInfo.lowPowerMode ? 'Reduced' : 'Normal'} colors={colors} />
      </Card>

      {isLow && (
        <View style={[styles.lowBatteryBanner, { backgroundColor: colors.error + '22', borderColor: colors.error + '44' }]}>
          <Ionicons name="warning-outline" size={20} color={colors.error} />
          <Text style={[styles.lowBatteryText, { color: colors.error }]}>
            Battery is low. Background tasks are limited. Charge your device soon.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

function InfoRow({ icon, label, value, colors }: any) {
  return (
    <View style={styles.infoRow}>
      <Ionicons name={icon} size={16} color={colors.textSecondary} />
      <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>{label}</Text>
      <Text style={[styles.infoValue, { color: colors.text }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: Spacing.md },
  heroCard: { alignItems: 'center', padding: Spacing.xl, borderRadius: 16, marginBottom: Spacing.md, gap: Spacing.sm },
  percentage: { fontSize: 56, fontWeight: '800' },
  stateText: { fontSize: FontSize.md },
  statsRow: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.md },
  statCard: { flex: 1, alignItems: 'center', gap: Spacing.xs },
  statValue: { fontSize: FontSize.lg, fontWeight: '700' },
  statLabel: { fontSize: FontSize.xs },
  tipRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm },
  tipTitle: { fontSize: FontSize.md, fontWeight: '700' },
  tipText: { fontSize: FontSize.md, lineHeight: 22 },
  infoTitle: { fontSize: FontSize.lg, fontWeight: '700', marginBottom: Spacing.md },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm },
  infoLabel: { flex: 1, fontSize: FontSize.sm },
  infoValue: { fontSize: FontSize.sm, fontWeight: '600' },
  lowBatteryBanner: { flexDirection: 'row', gap: Spacing.sm, padding: Spacing.md, borderRadius: 12, borderWidth: 1, marginBottom: Spacing.md, alignItems: 'flex-start' },
  lowBatteryText: { flex: 1, fontSize: FontSize.sm, lineHeight: 20 },
});
