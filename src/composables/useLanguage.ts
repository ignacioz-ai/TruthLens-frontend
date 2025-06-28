import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { loadLocaleMessages } from '../i18n/loadLocale'

export function useLanguage() {
  // Usar siempre el contexto global de i18n
  const { locale } = useI18n({ useScope: 'global' })
  
  // Idiomas disponibles
  const availableLanguages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'pt', name: 'Português', flag: '🇧🇷' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'it', name: 'Italiano', flag: '🇮🇹' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦' },
    { code: 'ru', name: 'Русский', flag: '🇷🇺' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
    { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' }
  ]

  // Idioma actual
  const currentLanguage = computed(() => {
    return availableLanguages.find(lang => lang.code === locale.value) || availableLanguages[0]
  })

  // Cambiar idioma con carga dinámica
  const changeLanguage = async (languageCode: string) => {
    await loadLocaleMessages(languageCode)
    localStorage.setItem('preferred-language', languageCode)
    
    // Para idiomas RTL
    document.documentElement.dir = languageCode === 'ar' ? 'rtl' : 'ltr'
    document.documentElement.lang = languageCode
  }

  // Inicializar idioma desde localStorage
  const initializeLanguage = () => {
    const savedLanguage = localStorage.getItem('preferred-language')
    if (savedLanguage && availableLanguages.some(lang => lang.code === savedLanguage)) {
      changeLanguage(savedLanguage)
    } else {
      // Detectar idioma del navegador
      const browserLanguage = navigator.language.split('-')[0]
      const supportedLanguage = availableLanguages.find(lang => lang.code === browserLanguage)
      if (supportedLanguage) {
        changeLanguage(browserLanguage)
      }
    }
  }

  return {
    availableLanguages,
    currentLanguage,
    changeLanguage,
    initializeLanguage
  }
} 