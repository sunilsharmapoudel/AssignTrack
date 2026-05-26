import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useAuthStore } from '../store/authStore';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

const ONBOARDING_KEY = 'onboarding_complete';

// Entry point: redirect to onboarding, auth, or main tabs
export default function Index() {
  const router = useRouter();
  const { user, isInitialized } = useAuthStore();

  useEffect(() => {
    if (!isInitialized) return;

    async function redirect() {
      if (!user) {
        // Check if onboarding has been shown before
        try {
          const done = await SecureStore.getItemAsync(ONBOARDING_KEY);
          if (!done) {
            router.replace('/onboarding');
          } else {
            router.replace('/(auth)/login');
          }
        } catch {
          // SecureStore unavailable on web
          router.replace('/(auth)/login');
        }
      } else {
        router.replace('/(tabs)');
      }
    }

    redirect();
  }, [isInitialized, user]);

  return <LoadingSpinner fullScreen message="Loading AssignTrack..." />;
}
