import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enCommon from '../../../public/locales/en/common.json';
import frCommon from '../../../public/locales/fr/common.json';

const resources = {
  en: { common: enCommon },
  fr: { common: frCommon },
} as const;

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    ns: ['common'],
    defaultNS: 'common',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['navigator', 'htmlTag', 'path', 'cookie'],
      caches: ['cookie'],
    },
  });

export default i18n;
