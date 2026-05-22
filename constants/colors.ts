export const Colors = {
  light: {
    primary: '#4F46E5',
    primaryLight: '#EEF2FF',
    secondary: '#7C3AED',
    accent: '#06B6D4',

    background: '#F9FAFB',
    surface: '#FFFFFF',
    surfaceVariant: '#F3F4F6',
    border: '#E5E7EB',

    text: '#111827',
    textSecondary: '#6B7280',
    textDisabled: '#9CA3AF',
    textOnPrimary: '#FFFFFF',

    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',

    priorityHigh: '#EF4444',
    priorityMedium: '#F59E0B',
    priorityLow: '#10B981',

    tabBar: '#FFFFFF',
    tabBarBorder: '#E5E7EB',
    tabBarActive: '#4F46E5',
    tabBarInactive: '#9CA3AF',

    cardShadow: 'rgba(0, 0, 0, 0.08)',
  },
  dark: {
    primary: '#6366F1',
    primaryLight: '#1E1B4B',
    secondary: '#8B5CF6',
    accent: '#22D3EE',

    background: '#0F172A',
    surface: '#1E293B',
    surfaceVariant: '#334155',
    border: '#475569',

    text: '#F1F5F9',
    textSecondary: '#94A3B8',
    textDisabled: '#64748B',
    textOnPrimary: '#FFFFFF',

    success: '#34D399',
    warning: '#FBBF24',
    error: '#F87171',
    info: '#60A5FA',

    priorityHigh: '#F87171',
    priorityMedium: '#FBBF24',
    priorityLow: '#34D399',

    tabBar: '#1E293B',
    tabBarBorder: '#334155',
    tabBarActive: '#6366F1',
    tabBarInactive: '#64748B',

    cardShadow: 'rgba(0, 0, 0, 0.4)',
  },
} as const;

export type ColorScheme = keyof typeof Colors;
export type ThemeColors = typeof Colors.light;
