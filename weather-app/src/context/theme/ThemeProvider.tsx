import { useCallback, useEffect, useMemo } from 'react';
import type { ReactNode } from 'react';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import type { Theme } from '../../types/theme';
import { ThemeContext } from './ThemeContext';
import { isTheme } from '../../utils/theme';

export const THEME_STORAGE_KEY = 'todays-weather:theme:v1';

const isStoredTheme = (value: unknown): value is Theme | null => value === null || isTheme(value);

function getSystemTheme(): Theme {
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/** Provides the active theme: the user's saved choice, otherwise the OS preference. */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [savedTheme, setSavedTheme] = useLocalStorage<Theme | null>(
    THEME_STORAGE_KEY,
    null,
    isStoredTheme,
  );
  const theme = savedTheme ?? getSystemTheme();

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const toggleTheme = useCallback(
    () => setSavedTheme(theme === 'dark' ? 'light' : 'dark'),
    [setSavedTheme, theme],
  );

  const value = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
