import { Theme } from '~/consts';

const THEME_KEY = 'theme';
const LANG_KEY = 'language';

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

  getLanguage(): string {
    return localStorage.getItem(LANG_KEY) || 'en';
  },

  setLanguage(v: string) {
    localStorage.setItem(LANG_KEY, v);
  },
};
