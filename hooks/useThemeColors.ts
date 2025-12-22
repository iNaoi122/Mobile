import { useMemo } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { Colors, ColorScheme } from '../constants/colors';

export const useThemeColors = (): ColorScheme => {
  const { theme } = useSettings();

  const colors = useMemo(() => {
    return theme === 'dark' ? Colors.dark : Colors.light;
  }, [theme]);

  return colors;
};
