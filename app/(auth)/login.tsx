import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { validateEmail, validatePassword } from '../../utils/validators';
import {
  isBiometricAvailable, getBiometricType, getCredentials,
} from '../../services/auth/biometricService';
import { Spacing, FontSize } from '../../constants/theme';
import type { BiometricType } from '../../services/auth/biometricService';

export default function LoginScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { login, loginWithBiometrics, isLoading, error } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricType, setBiometricType] = useState<BiometricType>('none');

  // Show biometric button only if hardware is available AND credentials are stored
  useEffect(() => {
    async function checkBiometric() {
      if (Platform.OS === 'web') return;
      const [available, creds] = await Promise.all([
        isBiometricAvailable(),
        getCredentials(),
      ]);
      if (available && creds) {
        setBiometricAvailable(true);
        setBiometricType(await getBiometricType());
      }
    }
    checkBiometric();
  }, []);

  function validate(): boolean {
    const eErr = validateEmail(email) ?? '';
    const pErr = validatePassword(password) ?? '';
    setEmailError(eErr);
    setPasswordError(pErr);
    return !eErr && !pErr;
  }

  async function handleLogin() {
    if (!validate()) return;
    try {
      await login(email.trim(), password);
      router.replace('/(tabs)');
    } catch {}
  }

  async function handleBiometricLogin() {
    try {
      await loginWithBiometrics();
      router.replace('/(tabs)');
    } catch {}
  }

  const bioIcon = biometricType === 'facial' ? 'scan-outline' : 'finger-print-outline';
  const bioLabel = biometricType === 'facial' ? 'Face ID' : 'Fingerprint';

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {/* Logo */}
        <View style={styles.logoArea}>
          <View style={[styles.logoCircle, { backgroundColor: colors.primary }]}>
            <Ionicons name="school" size={48} color="#fff" />
          </View>
          <Text style={[styles.appName, { color: colors.text }]}>AssignTrack</Text>
          <Text style={[styles.tagline, { color: colors.textSecondary }]}>
            Your academic productivity partner
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Text style={[styles.heading, { color: colors.text }]}>Welcome back</Text>
          <Text style={[styles.subheading, { color: colors.textSecondary }]}>
            Sign in to continue
          </Text>

          {error && (
            <View style={[styles.errorBanner, { backgroundColor: colors.error + '22' }]}>
              <Ionicons name="alert-circle-outline" size={16} color={colors.error} />
              <Text style={[styles.errorBannerText, { color: colors.error }]}>{error}</Text>
            </View>
          )}

          <Input
            label="Email"
            placeholder="you@university.edu"
            value={email}
            onChangeText={setEmail}
            error={emailError}
            leftIcon="mail-outline"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />

          <Input
            label="Password"
            placeholder="Your password"
            value={password}
            onChangeText={setPassword}
            error={passwordError}
            leftIcon="lock-closed-outline"
            isPassword
          />

          <TouchableOpacity
            onPress={() => router.push('/(auth)/forgot-password')}
            style={styles.forgotPassword}
          >
            <Text style={[styles.forgotText, { color: colors.primary }]}>Forgot password?</Text>
          </TouchableOpacity>

          <Button
            label="Sign In"
            onPress={handleLogin}
            loading={isLoading}
            fullWidth
            size="lg"
            style={styles.loginBtn}
          />

          {biometricAvailable && (
            <>
              <View style={styles.orRow}>
                <View style={[styles.orLine, { backgroundColor: colors.border }]} />
                <Text style={[styles.orText, { color: colors.textSecondary }]}>or</Text>
                <View style={[styles.orLine, { backgroundColor: colors.border }]} />
              </View>

              <TouchableOpacity
                onPress={handleBiometricLogin}
                disabled={isLoading}
                style={[styles.bioBtn, { borderColor: colors.primary, opacity: isLoading ? 0.5 : 1 }]}
              >
                <Ionicons name={bioIcon} size={24} color={colors.primary} />
                <Text style={[styles.bioText, { color: colors.primary }]}>
                  Sign in with {bioLabel}
                </Text>
              </TouchableOpacity>
            </>
          )}

          <View style={styles.registerRow}>
            <Text style={[styles.registerText, { color: colors.textSecondary }]}>
              Don't have an account?{' '}
            </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
              <Text style={[styles.registerLink, { color: colors.primary }]}>Register</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flexGrow: 1, paddingHorizontal: Spacing.xl },
  logoArea: { alignItems: 'center', paddingVertical: Spacing.xxl },
  logoCircle: { width: 96, height: 96, borderRadius: 48, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.md },
  appName: { fontSize: FontSize.xxxl, fontWeight: '800', letterSpacing: -0.5 },
  tagline: { fontSize: FontSize.sm, marginTop: Spacing.xs },
  form: { flex: 1 },
  heading: { fontSize: FontSize.xxl, fontWeight: '700', marginBottom: Spacing.xs },
  subheading: { fontSize: FontSize.md, marginBottom: Spacing.lg },
  errorBanner: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    padding: Spacing.md, borderRadius: 8, marginBottom: Spacing.md,
  },
  errorBannerText: { flex: 1, fontSize: FontSize.sm },
  forgotPassword: { alignSelf: 'flex-end', marginBottom: Spacing.lg },
  forgotText: { fontSize: FontSize.sm, fontWeight: '500' },
  loginBtn: { marginBottom: Spacing.lg },
  orRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.lg },
  orLine: { flex: 1, height: 1 },
  orText: { fontSize: FontSize.sm },
  bioBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: Spacing.sm, padding: Spacing.md, borderRadius: 12,
    borderWidth: 1.5, marginBottom: Spacing.lg,
  },
  bioText: { fontSize: FontSize.md, fontWeight: '600' },
  registerRow: { flexDirection: 'row', justifyContent: 'center' },
  registerText: { fontSize: FontSize.md },
  registerLink: { fontSize: FontSize.md, fontWeight: '600' },
});
