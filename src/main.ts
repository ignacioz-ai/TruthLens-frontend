import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import i18n from './plugins/i18n'

const app = createApp(App)

// Ensure router is used correctly
// Temporary type assertion to resolve TypeScript error
app.use(router as any)
app.use(i18n)

app.mount('#app')