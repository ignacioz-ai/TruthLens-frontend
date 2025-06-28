import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import i18n from './plugins/i18n'
import { loadLocaleMessages } from './i18n/loadLocale'

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