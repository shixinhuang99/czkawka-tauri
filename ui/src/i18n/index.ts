import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { LANGUAGE_KEY, Languages } from '~/consts';
import { en, type TranslationKeys } from './en';
import { zh } from './zh';

export function initI18n() {
  const resources = {
    en: {
      translation: en,
    },
    zh: {
      translation: zh,
    },
  };

  const lang = getStoredLang();

  i18n.use(initReactI18next).init({
    resources,
    lng: lang,
    fallbackLng: Languages.En,
    interpolation: {
      escapeValue: false,
    },
  });

  document.documentElement.lang = lang;
}

export function t(key: TranslationKeys, obj?: Record<string, any>): string {
  return i18n.t(key, obj);
}

function getStoredLang() {
  try {
    const storedValue = localStorage.getItem(LANGUAGE_KEY);
    if (storedValue) {
      const value = JSON.parse(storedValue);
      if (Object.values(Languages).includes(value)) {
        return value as string;
      }
    }
  } catch {}
  return Languages.En;
}
