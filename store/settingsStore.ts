import { create } from 'zustand';
import { AppSettings, NotificationPreferences } from '../types';
import * as SecureStore from 'expo-secure-store';

const DEFAULT_NOTIFICATION_PREFS: NotificationPreferences = {
  deadlineReminder: true,
  reminderHoursBefore: 24,
  dailyReminder: false,
  dailyReminderTime: '09:00',
  overdueAlert: true,
};

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'system',
  biometricEnabled: false,
  notificationPreferences: DEFAULT_NOTIFICATION_PREFS,
};

const SETTINGS_KEY = 'app_settings';

interface SettingsState extends AppSettings {
  isLoaded: boolean;
  loadSettings: () => Promise<void>;
  saveSettings: (settings: Partial<AppSettings>) => Promise<void>;
  setTheme: (theme: AppSettings['theme']) => void;
  setBiometricEnabled: (enabled: boolean) => void;
  setNotificationPreferences: (prefs: Partial<NotificationPreferences>) => void;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  ...DEFAULT_SETTINGS,
  isLoaded: false,

  loadSettings: async () => {
    try {
      const stored = await SecureStore.getItemAsync(SETTINGS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<AppSettings>;
        set({ ...DEFAULT_SETTINGS, ...parsed, isLoaded: true });
      } else {
        set({ isLoaded: true });
      }
    } catch {
      set({ isLoaded: true });
    }
  },

  saveSettings: async (settings) => {
    const current = get();
    const updated = { ...current, ...settings };
    set(updated);
    try {
      await SecureStore.setItemAsync(
        SETTINGS_KEY,
        JSON.stringify({
          theme: updated.theme,
          biometricEnabled: updated.biometricEnabled,
          notificationPreferences: updated.notificationPreferences,
        })
      );
    } catch {
      // SecureStore not available on web — silently degrade
    }
  },

  setTheme: (theme) => {
    set({ theme });
    get().saveSettings({ theme });
  },

  setBiometricEnabled: (biometricEnabled) => {
    set({ biometricEnabled });
    get().saveSettings({ biometricEnabled });
  },

  setNotificationPreferences: (prefs) => {
    const updated = { ...get().notificationPreferences, ...prefs };
    set({ notificationPreferences: updated });
    get().saveSettings({ notificationPreferences: updated });
  },
}));
