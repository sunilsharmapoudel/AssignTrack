import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Assignment, NotificationPreferences } from '../../types';
import { NOTIFICATION_CHANNELS } from '../../constants/config';
import { addHours, isPast, parseISO } from 'date-fns';

// Configure foreground notification behaviour.
// Wrapped in try-catch — expo-notifications logs an error in Expo Go SDK 54
// (push notification support removed), but local notifications still work.
try {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
} catch (_) {}

// ─── Permissions ──────────────────────────────────────────────────────────────

export async function requestNotificationPermissions(): Promise<boolean> {
  try {
    const { status: existing } = await Notifications.getPermissionsAsync();
    if (existing === 'granted') return true;
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  } catch {
    return false;
  }
}

// ─── Android Channels ─────────────────────────────────────────────────────────

export async function setupNotificationChannels(): Promise<void> {
  if (Platform.OS !== 'android') return;
  try {
    await Notifications.setNotificationChannelAsync(NOTIFICATION_CHANNELS.DEADLINE, {
      name: 'Deadline Reminders',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#4F46E5',
    });
    await Notifications.setNotificationChannelAsync(NOTIFICATION_CHANNELS.DAILY, {
      name: 'Daily Study Reminders',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
    await Notifications.setNotificationChannelAsync(NOTIFICATION_CHANNELS.OVERDUE, {
      name: 'Overdue Alerts',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 500, 250, 500],
    });
  } catch (_) {
    // setNotificationChannelAsync not available in Expo Go SDK 54+
  }
}

// ─── Schedule Deadline Reminder ───────────────────────────────────────────────

export async function scheduleDeadlineReminder(
  assignment: Assignment,
  hoursBefore: number = 24
): Promise<string | null> {
  try {
    const dueDate = parseISO(assignment.dueDate);
    const reminderTime = addHours(dueDate, -hoursBefore);
    if (isPast(reminderTime)) return null;

    return await Notifications.scheduleNotificationAsync({
      content: {
        title: `⏰ Due in ${hoursBefore}h: ${assignment.title}`,
        body: `Subject: ${assignment.subject} · Priority: ${assignment.priority}`,
        data: { assignmentId: assignment.id, type: 'deadline' },
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: reminderTime,
        channelId: NOTIFICATION_CHANNELS.DEADLINE,
      },
    });
  } catch {
    return null;
  }
}

// ─── Schedule Daily Reminder ──────────────────────────────────────────────────

export async function scheduleDailyReminder(time: string): Promise<string> {
  try {
    const [hour, minute] = time.split(':').map(Number);
    await Notifications.cancelAllScheduledNotificationsAsync();
    return await Notifications.scheduleNotificationAsync({
      content: {
        title: '📚 Study Time!',
        body: 'Check your assignments and stay on track.',
        data: { type: 'daily' },
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
        channelId: NOTIFICATION_CHANNELS.DAILY,
      },
    });
  } catch {
    return '';
  }
}

// ─── Send Overdue Alert ───────────────────────────────────────────────────────

export async function sendOverdueAlert(assignment: Assignment): Promise<void> {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `🚨 Overdue: ${assignment.title}`,
        body: `This assignment was due on ${assignment.dueDate}. Complete it now!`,
        data: { assignmentId: assignment.id, type: 'overdue' },
        sound: true,
      },
      trigger: null,
    });
  } catch (_) {}
}

// ─── Cancel ───────────────────────────────────────────────────────────────────

export async function cancelNotification(id: string): Promise<void> {
  try { await Notifications.cancelScheduledNotificationAsync(id); } catch (_) {}
}

export async function cancelAllNotifications(): Promise<void> {
  try { await Notifications.cancelAllScheduledNotificationsAsync(); } catch (_) {}
}

export async function scheduleRemindersForAssignments(
  assignments: Assignment[],
  prefs: NotificationPreferences
): Promise<void> {
  if (!prefs.deadlineReminder) return;
  const pending = assignments.filter((a) => a.status === 'Pending');
  await Promise.all(pending.map((a) => scheduleDeadlineReminder(a, prefs.reminderHoursBefore)));
}

export async function getScheduledNotifications() {
  try {
    return await Notifications.getAllScheduledNotificationsAsync();
  } catch {
    return [];
  }
}
