import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en.json';
import sr from './locales/sr.json';

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    sr: { translation: sr },
  },
  lng: localStorage.getItem('language') ?? 'sr',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export default i18n;