import { createI18n } from 'vue-i18n'
import en from '../locales/en.json'
import es from '../locales/es.json'
import pt from '../locales/pt.json'
import fr from '../locales/fr.json'
import de from '../locales/de.json'
import it from '../locales/it.json'
import ar from '../locales/ar.json'
import ru from '../locales/ru.json'
import zh from '../locales/zh.json'
import hi from '../locales/hi.json'

export const i18n = createI18n({
  legacy: true,
  locale: 'en', // Default language
  fallbackLocale: 'en',
  globalInjection: true,
  messages: {
    en,
    es,
    pt,
    fr,
    de,
    it,
    ar,
    ru,
    zh,
    hi
  }
})

export default i18n 