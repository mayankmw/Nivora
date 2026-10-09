import { useEffect } from 'react';
import { useThemeStore } from '@/stores/theme-store';

const DARK_QUERY = '(prefers-color-scheme: dark)';

/** Applies the chosen theme to <html> and follows the OS setting in "system" mode. */
export function useThemeSync(): void {
  const theme = useThemeStore((state) => state.theme);

  useEffect(() => {
    const media = window.matchMedia(DARK_QUERY);

    const apply = () => {
      const isDark = theme === 'dark' || (theme === 'system' && media.matches);
      const root = document.documentElement;
      root.classList.toggle('dark', isDark);
      root.style.colorScheme = isDark ? 'dark' : 'light';
    };

    apply();

    if (theme !== 'system') return;
    media.addEventListener('change', apply);
    return () => media.removeEventListener('change', apply);
  }, [theme]);
}
