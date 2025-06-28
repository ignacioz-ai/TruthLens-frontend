import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import i18n from './plugins/i18n'
import { loadLocaleMessages } from './i18n/loadLocale'
import en from '../public/locales/en.json' // Importa el JSON de inglés por defecto

// load default language
if (i18n.global.getLocaleMessage('en') === undefined || Object.keys(i18n.global.getLocaleMessage('en')).length === 0) {
  i18n.global.setLocaleMessage('en', en)
  i18n.global.locale.value = 'en'
}

async function bootstrap() {
  // Load preferred or default language before mounting the app
  const savedLang = localStorage.getItem('preferred-language') || 'en'
  await loadLocaleMessages(savedLang)

  const app = createApp(App)
  app.use(router as any)
  app.use(i18n)
  app.mount('#app')
}

bootstrap()