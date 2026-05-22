import React, { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity, StyleSheet, TextInputProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { BorderRadius, FontSize, Spacing } from '../../constants/theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  isPassword?: boolean;
}

export function Input({
  label, error, hint, leftIcon, rightIcon, onRightIconPress,
  isPassword = false, style, ...props
}: InputProps) {
  const { colors } = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const borderColor = error ? colors.error : colors.border;

  return (
    <View style={styles.wrapper}>
      {label && <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>}
      <View style={[styles.container, { borderColor, backgroundColor: colors.surface }]}>
        {leftIcon && (
          <Ionicons name={leftIcon} size={18} color={colors.textSecondary} style={styles.leftIcon} />
        )}
        <TextInput
          style={[styles.input, { color: colors.text }, style]}
          placeholderTextColor={colors.textDisabled}
          secureTextEntry={isPassword && !showPassword}
          {...props}
        />
        {isPassword && (
          <TouchableOpacity onPress={() => setShowPassword((v) => !v)} style={styles.icon}>
            <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
        {rightIcon && !isPassword && (
          <TouchableOpacity onPress={onRightIconPress} style={styles.icon}>
            <Ionicons name={rightIcon} size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={[styles.error, { color: colors.error }]}>{error}</Text>}
      {hint && !error && <Text style={[styles.hint, { color: colors.textDisabled }]}>{hint}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: Spacing.md },
  label: { fontSize: FontSize.sm, fontWeight: '500', marginBottom: Spacing.xs },
  container: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md, minHeight: 50,
  },
  input: { flex: 1, fontSize: FontSize.md, paddingVertical: Spacing.sm },
  leftIcon: { marginRight: Spacing.sm },
  icon: { marginLeft: Spacing.sm, padding: Spacing.xs },
  error: { fontSize: FontSize.xs, marginTop: Spacing.xs },
  hint: { fontSize: FontSize.xs, marginTop: Spacing.xs },
});
