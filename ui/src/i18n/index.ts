import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { storage } from '~/utils/storage';
import { en } from './en';
import { zh } from './zh';

const resources = {
  en: {
    translation: en,
  },
  zh: {
    translation: zh,
  },
};

const lang = storage.getLanguage();

i18n.use(initReactI18next).init({
  resources,
  lng: lang,
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

document.documentElement.lang = lang;

export default i18n;
