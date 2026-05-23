import { useCallback } from 'react';
import { useAuthStore } from '../store/authStore';
import {
  login,
  register,
  signOut,
  resetPassword,
  getUserProfile,
  updateUserProfile,
} from '../services/firebase/auth';
import {
  authenticateWithBiometrics,
  saveCredentials,
  getCredentials,
  clearCredentials,
} from '../services/auth/biometricService';
import { useSettingsStore } from '../store/settingsStore';

export function useAuth() {
  const store = useAuthStore();
  const { biometricEnabled } = useSettingsStore();

  const handleLogin = useCallback(
    async (email: string, password: string) => {
      store.setLoading(true);
      store.setError(null);
      try {
        const user = await login(email, password);

        // If biometric is enabled in settings, require biometric confirmation after password login
        if (biometricEnabled) {
          const ok = await authenticateWithBiometrics('Confirm with biometrics');
          if (!ok) throw new Error('Biometric authentication failed');
        }

        const profile = await getUserProfile(user.uid);
        store.setUser(user);
        store.setProfile(profile);

        // Persist credentials so the user can log in with biometrics next time
        saveCredentials(email, password).catch(() => {});
      } catch (err: any) {
        store.setError(err.message ?? 'Login failed');
        throw err;
      } finally {
        store.setLoading(false);
      }
    },
    [store, biometricEnabled]
  );

  const handleLoginWithBiometrics = useCallback(async () => {
    store.setLoading(true);
    store.setError(null);
    try {
      const creds = await getCredentials();
      if (!creds) throw new Error('No stored credentials. Please sign in with your password first.');

      const ok = await authenticateWithBiometrics('Sign in to AssignTrack');
      if (!ok) throw new Error('Biometric authentication failed');

      const user = await login(creds.email, creds.password);
      const profile = await getUserProfile(user.uid);
      store.setUser(user);
      store.setProfile(profile);
    } catch (err: any) {
      store.setError(err.message ?? 'Biometric login failed');
      throw err;
    } finally {
      store.setLoading(false);
    }
  }, [store]);

  const handleRegister = useCallback(
    async (email: string, password: string, displayName: string) => {
      store.setLoading(true);
      store.setError(null);
      try {
        const user = await register(email, password, displayName);
        const profile = await getUserProfile(user.uid);
        store.setUser(user);
        store.setProfile(profile);
      } catch (err: any) {
        store.setError(err.message ?? 'Registration failed');
        throw err;
      } finally {
        store.setLoading(false);
      }
    },
    [store]
  );

  const handleSignOut = useCallback(async () => {
    store.setLoading(true);
    try {
      await signOut();
      clearCredentials().catch(() => {});
      store.reset();
    } finally {
      store.setLoading(false);
    }
  }, [store]);

  const handleResetPassword = useCallback(
    async (email: string) => {
      store.setLoading(true);
      store.setError(null);
      try {
        await resetPassword(email);
      } catch (err: any) {
        store.setError(err.message ?? 'Password reset failed');
        throw err;
      } finally {
        store.setLoading(false);
      }
    },
    [store]
  );

  const handleUpdateProfile = useCallback(
    async (data: { displayName?: string; university?: string; course?: string }) => {
      if (!store.user) return;
      await updateUserProfile(store.user.uid, data);
      const profile = await getUserProfile(store.user.uid);
      store.setProfile(profile);
    },
    [store]
  );

  return {
    user: store.user,
    profile: store.profile,
    isLoading: store.isLoading,
    error: store.error,
    isAuthenticated: !!store.user,
    login: handleLogin,
    loginWithBiometrics: handleLoginWithBiometrics,
    register: handleRegister,
    signOut: handleSignOut,
    resetPassword: handleResetPassword,
    updateProfile: handleUpdateProfile,
  };
}
