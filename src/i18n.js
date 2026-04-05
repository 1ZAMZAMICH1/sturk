// src/i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Заглушки переводов (позже вынесем в отдельные JSON файлы для удобства)
import ruTranslation from './locales/ru.json';
import enTranslation from './locales/en.json';
import kzTranslation from './locales/kz.json';
import zhTranslation from './locales/zh.json';

const resources = {
  ru: { translation: ruTranslation },
  en: { translation: enTranslation },
  kz: { translation: kzTranslation },
  zh: { translation: zhTranslation }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'ru', // Если что-то не переведено — покажем на русском
    debug: false, // В консоли не будет лишнего мусора

    interpolation: {
      escapeValue: false // React уже защищен от XSS
    }
  });

export default i18n;
