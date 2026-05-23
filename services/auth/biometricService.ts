import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const CREDENTIALS_KEY = 'assigntrack_biometric_credentials';

export type BiometricType = 'fingerprint' | 'facial' | 'iris' | 'none';

// ─── Availability ─────────────────────────────────────────────────────────────

export async function isBiometricAvailable(): Promise<boolean> {
  const compatible = await LocalAuthentication.hasHardwareAsync();
  if (!compatible) return false;
  const enrolled = await LocalAuthentication.isEnrolledAsync();
  return enrolled;
}

export async function getBiometricType(): Promise<BiometricType> {
  const types = await LocalAuthentication.supportedAuthenticationTypesAsync();

  if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
    return 'facial';
  }
  if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
    return 'fingerprint';
  }
  if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) {
    return 'iris';
  }
  return 'none';
}

// ─── Credential Storage ───────────────────────────────────────────────────────
// Credentials are stored encrypted by SecureStore so biometric login can
// retrieve them without the user retyping their password.

export async function saveCredentials(email: string, password: string): Promise<void> {
  if (Platform.OS === 'web') return; // SecureStore is native-only
  await SecureStore.setItemAsync(CREDENTIALS_KEY, JSON.stringify({ email, password }));
}

export async function getCredentials(): Promise<{ email: string; password: string } | null> {
  if (Platform.OS === 'web') return null;
  try {
    const raw = await SecureStore.getItemAsync(CREDENTIALS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function clearCredentials(): Promise<void> {
  if (Platform.OS === 'web') return;
  await SecureStore.deleteItemAsync(CREDENTIALS_KEY).catch(() => {});
}

// ─── Authenticate ─────────────────────────────────────────────────────────────

export async function authenticateWithBiometrics(
  promptMessage: string = 'Authenticate to access AssignTrack'
): Promise<boolean> {
  const result = await LocalAuthentication.authenticateAsync({
    promptMessage,
    fallbackLabel: 'Use PIN',
    cancelLabel: 'Cancel',
    disableDeviceFallback: false,
  });
  return result.success;
}
