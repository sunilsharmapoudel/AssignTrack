import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import {
  validateEmail, validatePassword, validateDisplayName,
} from '../../utils/validators';
import { Spacing, FontSize } from '../../constants/theme';

export default function RegisterScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { register, isLoading, error } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate(): boolean {
    const errs: Record<string, string> = {};
    const nameErr = validateDisplayName(name);
    const emailErr = validateEmail(email);
    const passErr = validatePassword(password);
    if (nameErr) errs.name = nameErr;
    if (emailErr) errs.email = emailErr;
    if (passErr) errs.password = passErr;
    if (password !== confirm) errs.confirm = 'Passwords do not match';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleRegister() {
    if (!validate()) return;
    try {
      await register(email.trim(), password, name.trim());
      router.replace('/(tabs)');
    } catch {}
  }

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        <Text style={[styles.heading, { color: colors.text }]}>Create account</Text>
        <Text style={[styles.subheading, { color: colors.textSecondary }]}>
          Join AssignTrack today
        </Text>

        {error && (
          <View style={[styles.errorBanner, { backgroundColor: colors.error + '22' }]}>
            <Ionicons name="alert-circle-outline" size={16} color={colors.error} />
            <Text style={[styles.errorBannerText, { color: colors.error }]}>{error}</Text>
          </View>
        )}

        <Input
          label="Full Name"
          placeholder="Your name"
          value={name}
          onChangeText={setName}
          error={errors.name}
          leftIcon="person-outline"
          autoComplete="name"
        />

        <Input
          label="Email"
          placeholder="you@university.edu"
          value={email}
          onChangeText={setEmail}
          error={errors.email}
          leftIcon="mail-outline"
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Input
          label="Password"
          placeholder="Minimum 6 characters"
          value={password}
          onChangeText={setPassword}
          error={errors.password}
          leftIcon="lock-closed-outline"
          isPassword
        />

        <Input
          label="Confirm Password"
          placeholder="Repeat your password"
          value={confirm}
          onChangeText={setConfirm}
          error={errors.confirm}
          leftIcon="lock-closed-outline"
          isPassword
        />

        <Button
          label="Create Account"
          onPress={handleRegister}
          loading={isLoading}
          fullWidth
          size="lg"
          style={styles.btn}
        />

        <View style={styles.loginRow}>
          <Text style={[styles.loginText, { color: colors.textSecondary }]}>
            Already have an account?{' '}
          </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
            <Text style={[styles.loginLink, { color: colors.primary }]}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flexGrow: 1, paddingHorizontal: Spacing.xl, paddingTop: Spacing.lg },
  header: { marginBottom: Spacing.lg },
  heading: { fontSize: FontSize.xxl, fontWeight: '700', marginBottom: Spacing.xs },
  subheading: { fontSize: FontSize.md, marginBottom: Spacing.xl },
  errorBanner: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    padding: Spacing.md, borderRadius: 8, marginBottom: Spacing.md,
  },
  errorBannerText: { flex: 1, fontSize: FontSize.sm },
  btn: { marginTop: Spacing.sm, marginBottom: Spacing.lg },
  loginRow: { flexDirection: 'row', justifyContent: 'center', paddingBottom: Spacing.xxl },
  loginText: { fontSize: FontSize.md },
  loginLink: { fontSize: FontSize.md, fontWeight: '600' },
});
