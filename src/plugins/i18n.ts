import { createI18n } from 'vue-i18n'
import en from '../../public/locales/en.json'
import es from '../../public/locales/es.json'
import pt from '../../public/locales/pt.json'
import fr from '../../public/locales/fr.json'
import de from '../../public/locales/de.json'
import it from '../../public/locales/it.json'
import ar from '../../public/locales/ar.json'
import ru from '../../public/locales/ru.json'
import zh from '../../public/locales/zh.json'
import hi from '../../public/locales/hi.json'

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