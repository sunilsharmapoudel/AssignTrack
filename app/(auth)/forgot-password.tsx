import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { validateEmail } from '../../utils/validators';
import { Spacing, FontSize } from '../../constants/theme';

export default function ForgotPasswordScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { resetPassword, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [sent, setSent] = useState(false);

  async function handleReset() {
    const err = validateEmail(email);
    if (err) { setEmailError(err); return; }
    setEmailError('');
    try {
      await resetPassword(email.trim());
      setSent(true);
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Failed to send reset email');
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TouchableOpacity onPress={() => router.back()} style={styles.back}>
        <Ionicons name="arrow-back" size={24} color={colors.text} />
      </TouchableOpacity>

      <View style={[styles.iconContainer, { backgroundColor: colors.primaryLight }]}>
        <Ionicons name="key-outline" size={48} color={colors.primary} />
      </View>

      <Text style={[styles.heading, { color: colors.text }]}>Reset Password</Text>
      <Text style={[styles.body, { color: colors.textSecondary }]}>
        Enter your email address and we'll send you a link to reset your password.
      </Text>

      {sent ? (
        <View style={[styles.successBanner, { backgroundColor: colors.success + '22' }]}>
          <Ionicons name="checkmark-circle-outline" size={20} color={colors.success} />
          <Text style={[styles.successText, { color: colors.success }]}>
            Reset link sent! Check your email.
          </Text>
        </View>
      ) : (
        <>
          <Input
            label="Email"
            placeholder="you@university.edu"
            value={email}
            onChangeText={setEmail}
            error={emailError}
            leftIcon="mail-outline"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Button
            label="Send Reset Link"
            onPress={handleReset}
            loading={isLoading}
            fullWidth
            size="lg"
          />
        </>
      )}

      <TouchableOpacity onPress={() => router.push('/(auth)/login')} style={styles.backToLogin}>
        <Text style={[styles.backToLoginText, { color: colors.primary }]}>Back to Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: Spacing.xl, paddingTop: Spacing.lg },
  back: { marginBottom: Spacing.xl },
  iconContainer: { width: 88, height: 88, borderRadius: 44, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.xl },
  heading: { fontSize: FontSize.xxl, fontWeight: '700', marginBottom: Spacing.sm },
  body: { fontSize: FontSize.md, lineHeight: 22, marginBottom: Spacing.xl },
  successBanner: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, padding: Spacing.md, borderRadius: 8 },
  successText: { flex: 1, fontSize: FontSize.md },
  backToLogin: { marginTop: Spacing.xl, alignSelf: 'center' },
  backToLoginText: { fontSize: FontSize.md, fontWeight: '600' },
});
