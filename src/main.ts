import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import i18n from './plugins/i18n'

const SUPPORTED_LANGS = ['en', 'es', 'pt', 'fr', 'de', 'it', 'ar', 'ru', 'zh', 'hi'] as const;
type SupportedLang = typeof SUPPORTED_LANGS[number];

async function bootstrap() {
  // Set preferred or default language before mounting the app
  let savedLang = localStorage.getItem('preferred-language') || 'en'
  if (!SUPPORTED_LANGS.includes(savedLang as SupportedLang)) {
    savedLang = 'en'
  }
  i18n.global.locale.value = savedLang as SupportedLang
  document.documentElement.dir = savedLang === 'ar' ? 'rtl' : 'ltr'
  document.documentElement.lang = savedLang

  const app = createApp(App)
  app.use(router as any)
  app.use(i18n)
  app.mount('#app')
}

bootstrap()