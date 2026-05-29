import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { useSettingsStore } from '../store/settingsStore';
import { useNotificationStore } from '../store/notificationStore';
import { useAssignments } from '../hooks/useAssignments';
import {
  requestNotificationPermissions,
  scheduleDailyReminder,
  cancelAllNotifications,
  scheduleRemindersForAssignments,
  getScheduledNotifications,
} from '../services/notifications/notificationService';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Spacing, FontSize } from '../constants/theme';

const REMINDER_OPTIONS = [1, 6, 12, 24, 48];

export default function NotificationSettingsScreen() {
  const { colors } = useTheme();
  const { notificationPreferences, setNotificationPreferences } = useSettingsStore();
  const { hasPermission, setHasPermission, scheduledCount, setScheduledCount } = useNotificationStore();
  const { assignments } = useAssignments();

  useEffect(() => {
    getScheduledNotifications().then((n) => setScheduledCount(n.length));
  }, []);

  async function requestPermission() {
    const granted = await requestNotificationPermissions();
    setHasPermission(granted);
    if (!granted) Alert.alert('Permission Denied', 'Enable notifications in system settings.');
  }

  async function handleScheduleAll() {
    if (!hasPermission) { await requestPermission(); return; }
    await scheduleRemindersForAssignments(assignments, notificationPreferences);
    const scheduled = await getScheduledNotifications();
    setScheduledCount(scheduled.length);
    Alert.alert('Done', `Scheduled ${scheduled.length} reminder(s).`);
  }

  async function handleCancelAll() {
    await cancelAllNotifications();
    setScheduledCount(0);
    Alert.alert('Cancelled', 'All scheduled notifications removed.');
  }

  async function handleDailyReminderToggle(value: boolean) {
    setNotificationPreferences({ dailyReminder: value });
    if (value && hasPermission) {
      await scheduleDailyReminder(notificationPreferences.dailyReminderTime);
    }
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Permission Status */}
      {!hasPermission && (
        <View style={[styles.permBanner, { backgroundColor: colors.warning + '22', borderColor: colors.warning }]}>
          <Ionicons name="notifications-off-outline" size={20} color={colors.warning} />
          <Text style={[styles.permText, { color: colors.warning }]}>
            Notifications are disabled. Tap to enable.
          </Text>
          <Button label="Enable" onPress={requestPermission} size="sm" />
        </View>
      )}

      {/* Status Card */}
      <Card>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Status</Text>
        <StatusRow icon="checkmark-circle-outline" label="Permission" value={hasPermission ? 'Granted' : 'Denied'} ok={hasPermission} colors={colors} />
        <StatusRow icon="alarm-outline" label="Scheduled" value={`${scheduledCount} notification(s)`} ok={scheduledCount > 0} colors={colors} />
      </Card>

      {/* Deadline Reminders */}
      <Card>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Deadline Reminders</Text>
        <ToggleRow
          label="Enable Reminders"
          sub="Get notified before assignments are due"
          value={notificationPreferences.deadlineReminder}
          onChange={(v) => setNotificationPreferences({ deadlineReminder: v })}
          colors={colors}
        />

        {notificationPreferences.deadlineReminder && (
          <>
            <Text style={[styles.optionLabel, { color: colors.textSecondary }]}>Remind me how many hours before?</Text>
            <View style={styles.hoursRow}>
              {REMINDER_OPTIONS.map((h) => (
                <View
                  key={h}
                  style={[
                    styles.hourChip,
                    { borderColor: colors.border },
                    notificationPreferences.reminderHoursBefore === h && { backgroundColor: colors.primary, borderColor: colors.primary },
                  ]}
                >
                  <Text
                    onPress={() => setNotificationPreferences({ reminderHoursBefore: h })}
                    style={{ color: notificationPreferences.reminderHoursBefore === h ? '#fff' : colors.textSecondary, fontWeight: '600', fontSize: FontSize.sm }}
                  >
                    {h}h
                  </Text>
                </View>
              ))}
            </View>
          </>
        )}
      </Card>

      {/* Daily Reminder */}
      <Card>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Daily Study Reminder</Text>
        <ToggleRow
          label="Daily Reminder"
          sub="Get a daily nudge to check your assignments"
          value={notificationPreferences.dailyReminder}
          onChange={handleDailyReminderToggle}
          colors={colors}
        />
      </Card>

      {/* Overdue Alerts */}
      <Card>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Overdue Alerts</Text>
        <ToggleRow
          label="Overdue Alerts"
          sub="Get alerted when an assignment passes its due date"
          value={notificationPreferences.overdueAlert}
          onChange={(v) => setNotificationPreferences({ overdueAlert: v })}
          colors={colors}
        />
      </Card>

      {/* Actions */}
      <Card>
        <Button label="Schedule All Reminders" onPress={handleScheduleAll} fullWidth style={styles.btn} />
        <Button label="Cancel All Notifications" onPress={handleCancelAll} variant="outline" fullWidth />
      </Card>
    </ScrollView>
  );
}

function ToggleRow({ label, sub, value, onChange, colors }: any) {
  return (
    <View style={styles.toggleRow}>
      <View style={styles.toggleText}>
        <Text style={[styles.toggleLabel, { color: colors.text }]}>{label}</Text>
        <Text style={[styles.toggleSub, { color: colors.textSecondary }]}>{sub}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: colors.border, true: colors.primary }}
        thumbColor="#fff"
      />
    </View>
  );
}

function StatusRow({ icon, label, value, ok, colors }: any) {
  return (
    <View style={styles.statusRow}>
      <Ionicons name={icon} size={18} color={ok ? colors.success : colors.error} />
      <Text style={[styles.statusLabel, { color: colors.textSecondary }]}>{label}</Text>
      <Text style={[styles.statusValue, { color: ok ? colors.success : colors.error }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: Spacing.md },
  permBanner: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    padding: Spacing.md, borderRadius: 12, borderWidth: 1, marginBottom: Spacing.md,
  },
  permText: { flex: 1, fontSize: FontSize.sm },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: '700', marginBottom: Spacing.md },
  toggleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.md },
  toggleText: { flex: 1 },
  toggleLabel: { fontSize: FontSize.md, fontWeight: '500' },
  toggleSub: { fontSize: FontSize.xs, marginTop: 2 },
  optionLabel: { fontSize: FontSize.sm, marginBottom: Spacing.sm },
  hoursRow: { flexDirection: 'row', gap: Spacing.sm, flexWrap: 'wrap' },
  hourChip: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderRadius: 20, borderWidth: 1.5 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm },
  statusLabel: { flex: 1, fontSize: FontSize.sm },
  statusValue: { fontSize: FontSize.sm, fontWeight: '600' },
  btn: { marginBottom: Spacing.sm },
});
