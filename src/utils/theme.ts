import {DefaultTheme} from 'react-native-paper';
import {COLORS} from '@/constants';

export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: COLORS.PRIMARY_BLUE,
    accent: COLORS.FUEL_ORANGE,
    background: COLORS.PURE_WHITE,
    surface: COLORS.PURE_WHITE,
    text: COLORS.DARK_SLATE,
    placeholder: COLORS.MEDIUM_GRAY,
    backdrop: 'rgba(0, 0, 0, 0.5)',
    notification: COLORS.SUCCESS_GREEN,
    error: COLORS.DANGER_RED,
    onSurface: COLORS.DARK_SLATE,
    disabled: COLORS.MEDIUM_GRAY,
  },
  roundness: 8,
  fonts: {
    ...DefaultTheme.fonts,
    regular: {
      fontFamily: 'System',
      fontWeight: '400' as const,
    },
    medium: {
      fontFamily: 'System',
      fontWeight: '500' as const,
    },
    light: {
      fontFamily: 'System',
      fontWeight: '300' as const,
    },
    thin: {
      fontFamily: 'System',
      fontWeight: '200' as const,
    },
  },
};

export const darkTheme = {
  ...theme,
  colors: {
    ...theme.colors,
    primary: COLORS.DARK_PRIMARY,
    background: COLORS.DARK_BACKGROUND,
    surface: COLORS.DARK_SURFACE,
    text: COLORS.DARK_TEXT,
    onSurface: COLORS.DARK_TEXT,
    placeholder: COLORS.DARK_SECONDARY_TEXT,
  },
};