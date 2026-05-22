import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { BorderRadius, FontSize, Spacing } from '../../constants/theme';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  style,
  textStyle,
}: ButtonProps) {
  const { colors } = useTheme();

  const containerStyle: ViewStyle = {
    ...styles.base,
    ...sizeStyles[size],
    ...(fullWidth && { width: '100%' }),
    ...variantContainerStyle(variant, colors),
    ...((disabled || loading) && styles.disabled),
    ...(style as object),
  };

  const labelStyle: TextStyle = {
    ...styles.label,
    ...sizeLabelStyles[size],
    ...variantTextStyle(variant, colors),
    ...(textStyle as object),
  };

  return (
    <TouchableOpacity
      style={containerStyle}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.75}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' || variant === 'ghost' ? colors.primary : colors.textOnPrimary} size="small" />
      ) : (
        <Text style={labelStyle}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}

function variantContainerStyle(variant: Variant, colors: any): ViewStyle {
  switch (variant) {
    case 'primary':   return { backgroundColor: colors.primary };
    case 'secondary': return { backgroundColor: colors.secondary };
    case 'danger':    return { backgroundColor: colors.error };
    case 'outline':   return { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: colors.primary };
    case 'ghost':     return { backgroundColor: 'transparent' };
  }
}

function variantTextStyle(variant: Variant, colors: any): TextStyle {
  switch (variant) {
    case 'primary':
    case 'secondary':
    case 'danger':  return { color: colors.textOnPrimary };
    case 'outline':
    case 'ghost':   return { color: colors.primary };
  }
}

const sizeStyles: Record<Size, ViewStyle> = {
  sm: { paddingVertical: Spacing.xs, paddingHorizontal: Spacing.md, borderRadius: BorderRadius.sm },
  md: { paddingVertical: Spacing.sm + 2, paddingHorizontal: Spacing.lg, borderRadius: BorderRadius.md },
  lg: { paddingVertical: Spacing.md, paddingHorizontal: Spacing.xl, borderRadius: BorderRadius.md },
};

const sizeLabelStyles: Record<Size, TextStyle> = {
  sm: { fontSize: FontSize.sm },
  md: { fontSize: FontSize.md },
  lg: { fontSize: FontSize.lg },
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontWeight: '600',
    textAlign: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
});
