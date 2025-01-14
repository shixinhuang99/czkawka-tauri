import { atom } from 'jotai';
import { Theme } from '~/consts';
import { ipc } from '~/ipc';
import { storage } from '~/utils/storage';
import { isSystemDark } from '~/utils/theme';
import { themeAtom } from './primitive';

function applyTheme(theme: string) {
  let finalTheme = theme;
  if (theme === Theme.System) {
    finalTheme = isSystemDark() ? Theme.Dark : Theme.Light;
  }
  const root = window.document.documentElement;
  root.classList.remove(Theme.Light, Theme.Dark);
  root.classList.add(finalTheme);
  return finalTheme;
}

export const initThemeAtom = atom(null, (_, set) => {
  const theme = storage.getTheme();
  const className = applyTheme(theme);
  set(themeAtom, { display: theme, className });
  ipc.setTheme(theme);
});

export const toggleThemeAtom = atom(null, (get, set) => {
  const display = get(themeAtom).display;
  const displayList: string[] = [Theme.Light, Theme.Dark, Theme.System];
  let idx = displayList.indexOf(display);
  if (idx < 0) {
    idx = 0;
  }
  idx += 1;
  if (idx >= displayList.length) {
    idx = 0;
  }
  const newDisplay = displayList[idx];
  const newClassName = applyTheme(newDisplay);
  set(themeAtom, { display: newDisplay, className: newClassName });
  storage.setTheme(newDisplay);
  ipc.setTheme(newDisplay);
});

export const applyMatchMediaAtom = atom(null, (get, set, matches: boolean) => {
  const display = get(themeAtom).display;
  if (display !== Theme.System) {
    return;
  }
  const theme = matches ? Theme.Dark : Theme.Light;
  const newClassName = applyTheme(theme);
  set(themeAtom, { display, className: newClassName });
  ipc.setTheme(display);
});
