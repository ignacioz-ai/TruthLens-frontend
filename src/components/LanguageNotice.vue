<script setup lang="ts">
import { ref, onMounted } from 'vue';

const showNotice = ref(false);
const userLanguage = ref('');

onMounted(() => {
  // Detectar el idioma del navegador
  userLanguage.value = navigator.language.split('-')[0];
  
  // Verificar si ya se cerró el aviso antes
  const noticeDismissed = localStorage.getItem('language-notice-dismissed');
  
  // Mostrar el aviso solo si:
  // 1. El idioma del usuario no es inglés
  // 2. No se ha cerrado antes
  // 3. No está en modo de desarrollo
  if (userLanguage.value !== 'en' && !noticeDismissed && import.meta.env.PROD) {
    // Esperar un poco para que la página cargue completamente
    setTimeout(() => {
      showNotice.value = true;
    }, 2000);
  }
});

const dismissNotice = () => {
  showNotice.value = false;
  // Guardar en localStorage para no mostrar de nuevo
  localStorage.setItem('language-notice-dismissed', 'true');
};

const getLanguageName = (code: string) => {
  const languages: Record<string, string> = {
    'es': 'Español',
    'fr': 'Français',
    'de': 'Deutsch',
    'it': 'Italiano',
    'pt': 'Português',
    'ru': 'Русский',
    'zh': '中文',
    'ja': '日本語',
    'ko': '한국어',
    'ar': 'العربية',
    'hi': 'हिन्दी'
  };
  return languages[code] || code;
};
</script>

<template>
  <div v-if="showNotice" class="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 max-w-md mx-4">
    <div class="bg-blue-900/90 backdrop-blur-sm border border-blue-400/50 rounded-lg p-4 shadow-lg animate-fade-in">
      <div class="flex items-start space-x-3">
        <div class="flex-shrink-0">
          <svg class="w-5 h-5 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
          </svg>
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm text-blue-100">
            <span class="font-medium">
              ¿Prefieres ver TruthLens en {{ getLanguageName(userLanguage) }}?
            </span>
            <br>
            <span class="text-blue-200/80">
              Tu navegador puede traducir automáticamente esta página. Busca el botón "Traducir" en la barra de direcciones.
            </span>
          </p>
        </div>
        <button
          @click="dismissNotice"
          class="flex-shrink-0 text-blue-300 hover:text-blue-100 transition-colors"
          title="Cerrar"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px) translateX(-50%);
  }
  to {
    opacity: 1;
    transform: translateY(0) translateX(-50%);
  }
}
</style> 