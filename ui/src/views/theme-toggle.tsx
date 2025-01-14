import { useAtomValue, useSetAtom } from 'jotai';
import { Moon, Sun, TvMinimal } from 'lucide-react';
import { useEffect } from 'react';
import { themeAtom } from '~/atom/primitive';
import {
  applyMatchMediaAtom,
  initThemeAtom,
  toggleThemeAtom,
} from '~/atom/theme';
import { TooltipButton } from '~/components';
import { DARK_MODE_MEDIA, Theme } from '~/consts';

export function ThemeToggle() {
  const theme = useAtomValue(themeAtom);
  const initTheme = useSetAtom(initThemeAtom);
  const toggleTheme = useSetAtom(toggleThemeAtom);
  const applyMatchMedia = useSetAtom(applyMatchMediaAtom);

  useEffect(() => {
    initTheme();
    const mql = window.matchMedia(DARK_MODE_MEDIA);
    applyMatchMedia(mql.matches);
    const listener = (e: MediaQueryListEvent) => {
      applyMatchMedia(e.matches);
    };
    mql.addEventListener('change', listener);
    return () => mql.removeEventListener('change', listener);
  }, []);

  return (
    <TooltipButton
      tooltip="Toggle theme"
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
    >
      {theme.display === Theme.Light && <Sun />}
      {theme.display === Theme.Dark && <Moon />}
      {theme.display === Theme.System && <TvMinimal />}
    </TooltipButton>
  );
}
