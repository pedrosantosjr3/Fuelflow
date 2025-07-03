import {theme, darkTheme} from '../theme';
import {COLORS} from '@/constants';

describe('Theme', () => {
  describe('theme', () => {
    it('should have correct primary color', () => {
      expect(theme.colors.primary).toBe(COLORS.PRIMARY_BLUE);
    });

    it('should have correct accent color', () => {
      expect(theme.colors.accent).toBe(COLORS.FUEL_ORANGE);
    });

    it('should have correct background color', () => {
      expect(theme.colors.background).toBe(COLORS.PURE_WHITE);
    });

    it('should have correct text color', () => {
      expect(theme.colors.text).toBe(COLORS.DARK_SLATE);
    });

    it('should have correct error color', () => {
      expect(theme.colors.error).toBe(COLORS.DANGER_RED);
    });

    it('should have correct notification color', () => {
      expect(theme.colors.notification).toBe(COLORS.SUCCESS_GREEN);
    });

    it('should have correct roundness', () => {
      expect(theme.roundness).toBe(8);
    });

    it('should have correct font family for regular weight', () => {
      expect(theme.fonts.regular.fontFamily).toBe('System');
      expect(theme.fonts.regular.fontWeight).toBe('400');
    });

    it('should have correct font family for medium weight', () => {
      expect(theme.fonts.medium.fontFamily).toBe('System');
      expect(theme.fonts.medium.fontWeight).toBe('500');
    });

    it('should have correct font family for light weight', () => {
      expect(theme.fonts.light.fontFamily).toBe('System');
      expect(theme.fonts.light.fontWeight).toBe('300');
    });

    it('should have correct font family for thin weight', () => {
      expect(theme.fonts.thin.fontFamily).toBe('System');
      expect(theme.fonts.thin.fontWeight).toBe('200');
    });
  });

  describe('darkTheme', () => {
    it('should inherit from base theme', () => {
      expect(darkTheme.roundness).toBe(theme.roundness);
      expect(darkTheme.fonts).toEqual(theme.fonts);
    });

    it('should have correct dark primary color', () => {
      expect(darkTheme.colors.primary).toBe(COLORS.DARK_PRIMARY);
    });

    it('should have correct dark background color', () => {
      expect(darkTheme.colors.background).toBe(COLORS.DARK_BACKGROUND);
    });

    it('should have correct dark surface color', () => {
      expect(darkTheme.colors.surface).toBe(COLORS.DARK_SURFACE);
    });

    it('should have correct dark text color', () => {
      expect(darkTheme.colors.text).toBe(COLORS.DARK_TEXT);
    });

    it('should have correct dark onSurface color', () => {
      expect(darkTheme.colors.onSurface).toBe(COLORS.DARK_TEXT);
    });

    it('should have correct dark placeholder color', () => {
      expect(darkTheme.colors.placeholder).toBe(COLORS.DARK_SECONDARY_TEXT);
    });

    it('should maintain same accent color as light theme', () => {
      expect(darkTheme.colors.accent).toBe(theme.colors.accent);
    });

    it('should maintain same error color as light theme', () => {
      expect(darkTheme.colors.error).toBe(theme.colors.error);
    });

    it('should maintain same notification color as light theme', () => {
      expect(darkTheme.colors.notification).toBe(theme.colors.notification);
    });
  });

  describe('theme structure', () => {
    it('should have all required color properties', () => {
      const requiredColors = [
        'primary',
        'accent',
        'background',
        'surface',
        'text',
        'placeholder',
        'backdrop',
        'notification',
        'error',
        'onSurface',
        'disabled',
      ];

      requiredColors.forEach(color => {
        expect(theme.colors).toHaveProperty(color);
        expect(darkTheme.colors).toHaveProperty(color);
      });
    });

    it('should have all required font properties', () => {
      const requiredFonts = ['regular', 'medium', 'light', 'thin'];

      requiredFonts.forEach(font => {
        expect(theme.fonts).toHaveProperty(font);
        expect(theme.fonts[font]).toHaveProperty('fontFamily');
        expect(theme.fonts[font]).toHaveProperty('fontWeight');
        
        expect(darkTheme.fonts).toHaveProperty(font);
        expect(darkTheme.fonts[font]).toHaveProperty('fontFamily');
        expect(darkTheme.fonts[font]).toHaveProperty('fontWeight');
      });
    });

    it('should have consistent structure between light and dark themes', () => {
      const lightKeys = Object.keys(theme.colors).sort();
      const darkKeys = Object.keys(darkTheme.colors).sort();

      expect(darkKeys).toEqual(lightKeys);
    });
  });

  describe('color accessibility', () => {
    it('should use high contrast colors for text', () => {
      // Light theme should use dark text on light background
      expect(theme.colors.text).toBe(COLORS.DARK_SLATE);
      expect(theme.colors.background).toBe(COLORS.PURE_WHITE);

      // Dark theme should use light text on dark background
      expect(darkTheme.colors.text).toBe(COLORS.DARK_TEXT);
      expect(darkTheme.colors.background).toBe(COLORS.DARK_BACKGROUND);
    });

    it('should use consistent disabled color', () => {
      expect(theme.colors.disabled).toBe(COLORS.MEDIUM_GRAY);
      expect(darkTheme.colors.disabled).toBe(COLORS.MEDIUM_GRAY);
    });

    it('should use appropriate backdrop color', () => {
      expect(theme.colors.backdrop).toBe('rgba(0, 0, 0, 0.5)');
      expect(darkTheme.colors.backdrop).toBe('rgba(0, 0, 0, 0.5)');
    });
  });
});