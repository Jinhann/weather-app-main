import { useTheme } from '../../context/theme/useTheme';
import { IconButton } from '../IconButton/IconButton';
import { MoonIcon, SunIcon } from '../icons/Icons';

/** Switches between the light and dark theme. */
export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <IconButton
      label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      aria-pressed={isDark}
      onClick={toggleTheme}
    >
      {isDark ? <SunIcon /> : <MoonIcon />}
    </IconButton>
  );
}
