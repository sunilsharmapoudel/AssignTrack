import { useColorScheme } from 'react-native';
import { useSettingsStore } from '../store/settingsStore';
import { Colors, ThemeColors } from '../constants/colors';
import { LightTheme, DarkTheme } from '../constants/theme';

export function useTheme() {
  const systemScheme = useColorScheme();
  const { theme } = useSettingsStore();

  const isDark =
    theme === 'dark' || (theme === 'system' && systemScheme === 'dark');

  const colors: ThemeColors = isDark ? Colors.dark : Colors.light;
  const paperTheme = isDark ? DarkTheme : LightTheme;

  return { isDark, colors, paperTheme };
}
