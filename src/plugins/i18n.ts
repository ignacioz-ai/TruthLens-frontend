import { createI18n } from 'vue-i18n'

// Importar traducciones locales (fallback)
import en from '../translations/translations_en.json'
import es from '../translations/translations_es.json'
import pt from '../translations/translations_pt.json'
import fr from '../translations/translations_fr.json'
import de from '../translations/translations_de.json'
import it from '../translations/translations_it.json'
import ar from '../translations/translations_ar.json'
import ru from '../translations/translations_ru.json'
import zh from '../translations/translations_zh.json'
import hi from '../translations/translations_hi.json'

const messages = {
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

console.log('Mensajes ES:', es)

export const i18n = createI18n({
  legacy: false, // Composition API
  locale: 'es', // Main language (forzado a español)
  fallbackLocale: 'en', // Fallback language
  messages,
  globalInjection: true, // Inject $t globally
})

export default i18n 