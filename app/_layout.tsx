import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { subscribeToAuthState } from '../services/firebase/auth';
import { useAuthStore } from '../store/authStore';
import { useSettingsStore } from '../store/settingsStore';
import { useTheme } from '../hooks/useTheme';
import {
  requestNotificationPermissions,
  setupNotificationChannels,
} from '../services/notifications/notificationService';
import { registerBackgroundFetch } from '../services/sync/backgroundTask';
import { getDatabase } from '../services/sqlite/database';
import { getUserProfile } from '../services/firebase/auth';
import { useNotificationStore } from '../store/notificationStore';

// Prevent native splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

function RootLayoutContent() {
  const { paperTheme, isDark } = useTheme();

  return (
    <PaperProvider theme={paperTheme}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <Stack screenOptions={{ headerShown: false, headerBackTitle: '' }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" options={{ title: '' }} />
          <Stack.Screen
            name="assignment/[id]"
            options={{ headerShown: true, title: 'Assignment', presentation: 'card' }}
          />
          <Stack.Screen
            name="assignment/add"
            options={{ headerShown: true, title: 'New Assignment', presentation: 'modal' }}
          />
          <Stack.Screen
            name="assignment/edit/[id]"
            options={{ headerShown: true, title: 'Edit Assignment', presentation: 'modal' }}
          />
          <Stack.Screen
            name="notes"
            options={{ headerShown: true, title: 'Voice Notes', presentation: 'card' }}
          />
          <Stack.Screen
            name="focus"
            options={{ headerShown: true, title: 'Focus Mode', presentation: 'card' }}
          />
          <Stack.Screen
            name="battery"
            options={{ headerShown: true, title: 'Battery Status', presentation: 'card' }}
          />
          <Stack.Screen
            name="notification-settings"
            options={{ headerShown: true, title: 'Notifications', presentation: 'card' }}
          />
          <Stack.Screen
            name="settings"
            options={{ headerShown: true, title: 'Settings', presentation: 'card' }}
          />
        </Stack>
      </GestureHandlerRootView>
    </PaperProvider>
  );
}

export default function RootLayout() {
  const { setUser, setProfile, setInitialized } = useAuthStore();
  const { loadSettings } = useSettingsStore();
  const { setHasPermission } = useNotificationStore();

  useEffect(() => {
    async function init() {
      try {
        // Parallel initialization: settings + SQLite + notification setup
        await Promise.all([
          loadSettings(),
          getDatabase(),
          setupNotificationChannels(),
        ]);

        // Request notification permission (non-blocking)
        requestNotificationPermissions().then(setHasPermission);

        // Register background task
        registerBackgroundFetch().catch(() => {});
      } catch (e) {
        console.warn('Init error', e);
      }
    }

    init();

    // Listen for Firebase auth state changes
    const unsubscribe = subscribeToAuthState(async (user) => {
      if (user) {
        setUser(user);
        const profile = await getUserProfile(user.uid).catch(() => null);
        setProfile(profile);
      } else {
        setUser(null);
        setProfile(null);
      }
      setInitialized(true);
      SplashScreen.hideAsync();
    });

    return unsubscribe;
  }, []);

  return <RootLayoutContent />;
}
