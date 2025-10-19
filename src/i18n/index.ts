import { createI18n } from 'vue-i18n'
import en from './locales/en'
import zh from './locales/zh'

export const i18n = createI18n({
  legacy: false, // Use Composition API mode
  locale: 'en', // Default locale, will be updated from storage
  fallbackLocale: 'en',
  messages: {
    en,
    zh
  },
  globalInjection: true // Enable $t in templates
})

export default i18n
