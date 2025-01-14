import { Theme } from '~/consts';

const THEME_KEY = 'theme';

export const storage = {
  getTheme(): string {
    const str = localStorage.getItem(THEME_KEY);
    if (!str || !Object.values<string>(Theme).includes(str)) {
      return Theme.System;
    }
    return str;
  },

  setTheme(theme: string) {
    localStorage.setItem(THEME_KEY, theme);
  },
};
