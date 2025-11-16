import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow';
import { atom } from 'jotai';
import { DARK_MODE_MEDIA, Theme } from '~/consts';
import { themeAtom } from './primitive';

function isSystemDark() {
  return window.matchMedia(DARK_MODE_MEDIA).matches;
}

function setSystemTheme(theme: string) {
  const ww = getCurrentWebviewWindow();
  if (theme === Theme.Light || theme === Theme.Dark) {
    ww.setTheme(theme);
  } else {
    ww.setTheme(null);
  }
}

function applyTheme(theme: string) {
  let className = theme;
  if (theme === Theme.System) {
    className = isSystemDark() ? Theme.Dark : Theme.Light;
  }
  const root = window.document.documentElement;
  root.classList.remove(Theme.Light, Theme.Dark);
  root.classList.add(className);
}

export const initThemeAtom = atom(null, (get) => {
  const theme = get(themeAtom);
  applyTheme(theme);
  setSystemTheme(theme);
});

export const applyMatchMediaAtom = atom(null, (get, _, isDark: boolean) => {
  const theme = get(themeAtom);
  if (theme !== Theme.System) {
    return;
  }
  applyTheme(isDark ? Theme.Dark : Theme.Light);
  setSystemTheme(theme);
});

export const setThemeAtom = atom(null, (get, set, choose: string) => {
  const theme = get(themeAtom);
  if (theme === choose) {
    return;
  }
  set(themeAtom, choose);
  applyTheme(choose);
  setSystemTheme(choose);
});
