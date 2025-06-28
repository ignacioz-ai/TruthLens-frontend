import { createI18n } from 'vue-i18n'


export const i18n = createI18n({
  legacy: false,
  locale: 'en', // Default language
  fallbackLocale: 'en',
  globalInjection: true,
  messages: {} // Empty, will be loaded dynamically
})

export default i18n 