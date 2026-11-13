import { useState, useEffect, useCallback } from 'react';
import { getTheme, Theme, ThemeContext } from '../themes/index.js';
import { ThemeRefreshConfig } from '../config/loader.js';

interface UseThemeRefreshOptions {
  themeName: string;
  refreshConfig?: ThemeRefreshConfig;
}

/**
 * Hook that periodically re-evaluates the theme and returns the current theme object.
 * 
 * Supports two refresh modes:
 * - intervalHours: Refresh every N hours
 * - atHour: Refresh at a specific hour of day (24h format)
 * 
 * If theme evaluation fails, the last known good theme is retained.
 */
const useThemeRefresh = ({ themeName, refreshConfig }: UseThemeRefreshOptions): Theme => {
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      return getTheme(themeName, { date: new Date() } as ThemeContext);
    } catch (err) {
      console.error(`Failed to load theme '${themeName}': ${err}`);
      // Return a basic fallback theme if the theme can't be loaded
      return {
        id: 'fallback',
        colors: {
          primary: '#e0e0e0',
          border: '#e0e0e0',
          text: '#111111',
          background: '#1a1a1a',
          accent: '#ffffff',
        },
        borderStyle: 'single',
      } as Theme;
    }
  });

  const refreshTheme = useCallback(() => {
    try {
      const newTheme = getTheme(themeName, { date: new Date() } as ThemeContext);
      setTheme(newTheme);
    } catch (err) {
      console.error(`Failed to refresh theme '${themeName}': ${err}`);
      // Keep the last known good theme on error
    }
  }, [themeName]);

  useEffect(() => {
    if (!refreshConfig) {
      return;
    }

    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let refreshedForHour = -1;

    if (refreshConfig.intervalHours) {
      const intervalMs = refreshConfig.intervalHours * 60 * 60 * 1000;
      const scheduleInterval = () => {
        timeoutId = setTimeout(() => {
          refreshTheme();
          scheduleInterval();
        }, intervalMs);
      };
      scheduleInterval();
    } else if (refreshConfig.atHour) {
      const checkAtHour = () => {
        const now = new Date();
        if (now.getHours() === refreshConfig.atHour && now.getHours() !== refreshedForHour) {
          refreshTheme();
          refreshedForHour = now.getHours();
        }
        timeoutId = setTimeout(checkAtHour, 10 * 60 * 1000);
      };
      // Check immediately
      checkAtHour();
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [refreshConfig, refreshTheme]);

  return theme;
};

export default useThemeRefresh;