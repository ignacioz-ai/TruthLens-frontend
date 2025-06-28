<template>
  <div class="language-selector" ref="selectorRef">
    <button 
      @click="isOpen = !isOpen"
      class="language-button"
      :class="{ 'rtl': currentLanguage.code === 'ar', 'open': isOpen }"
    >
      <span class="flag">{{ currentLanguage.flag }}</span>
      <span class="language-name">{{ currentLanguage.name }}</span>
      <svg class="arrow" :class="{ 'rotated': isOpen }" width="12" height="12" viewBox="0 0 12 12">
        <path d="M2 4l4 4 4-4" stroke="currentColor" fill="none" stroke-width="2"/>
      </svg>
    </button>
    
    <div v-if="isOpen" class="language-dropdown">
      <button
        v-for="language in availableLanguages"
        :key="language.code"
        @click="selectLanguage(language.code)"
        class="language-option"
        :class="{ 
          'active': language.code === currentLanguage.code,
          'rtl': language.code === 'ar' 
        }"
      >
        <span class="flag">{{ language.flag }}</span>
        <span class="language-name">{{ language.name }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useLanguage } from '../composables/useLanguage'

const { availableLanguages, currentLanguage, changeLanguage } = useLanguage()
const isOpen = ref(false)
const selectorRef = ref<HTMLElement | null>(null)

const selectLanguage = (languageCode: string) => {
  changeLanguage(languageCode)
  isOpen.value = false
}

function handleClickOutside(event: MouseEvent) {
  if (selectorRef.value && !selectorRef.value.contains(event.target as Node)) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside)
})
onBeforeUnmount(() => {
  document.removeEventListener('mousedown', handleClickOutside)
})
</script>

<style scoped>
.language-selector {
  position: relative;
  display: inline-block;
}

.language-button {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 10px;
  border: 1px solid #23304a;
  border-radius: 7px;
  background: #10192b;
  color: #e0e6ef;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 13px;
  font-weight: 500;
  box-shadow: 0 2px 8px 0 #00000022;
  min-width: 0;
}
.language-button.open, .language-button:hover {
  border-color: #3b82f6;
  background: #17213a;
}

.language-dropdown {
  position: absolute;
  top: 110%;
  right: 0;
  margin-top: 4px;
  background: #10192b;
  border: 1px solid #23304a;
  border-radius: 8px;
  box-shadow: 0 10px 24px -3px #00000055;
  z-index: 1000;
  min-width: 120px;
  max-width: 160px;
  max-height: 160px;
  overflow-y: auto;
  padding: 4px 0;
}
.language-dropdown::-webkit-scrollbar {
  width: 5px;
  background: transparent;
}
.language-dropdown::-webkit-scrollbar-thumb {
  background: #23304a;
  border-radius: 4px;
}

.language-option {
  display: flex;
  align-items: center;
  gap: 7px;
  width: 100%;
  padding: 7px 12px;
  border: none;
  background: none;
  color: #e0e6ef;
  cursor: pointer;
  transition: background-color 0.18s, color 0.18s;
  font-size: 13px;
  text-align: left;
  border-radius: 5px;
}
.language-option:hover {
  background: rgba(59, 130, 246, 0.13);
  color: #60a5fa;
}
.language-option.active {
  background: rgba(59, 130, 246, 0.22);
  color: #3b82f6;
}
.flag {
  font-size: 15px;
  flex-shrink: 0;
}
.language-name {
  font-weight: 500;
  letter-spacing: 0.01em;
}
.arrow {
  transition: transform 0.2s;
  flex-shrink: 0;
  color: #60a5fa;
}
.arrow.rotated {
  transform: rotate(180deg);
}
.rtl {
  direction: rtl;
  text-align: right;
}
@media (max-width: 768px) {
  .language-button .language-name {
    display: none;
  }
  .language-dropdown {
    right: auto;
    left: 0;
    min-width: 90px;
    max-width: 120px;
  }
}
</style> 