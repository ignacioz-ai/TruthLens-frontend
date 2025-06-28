<script setup lang="ts">
import { ref, watch } from 'vue'
import Header from './components/Header.vue';
import { useI18n } from 'vue-i18n'

const { locale } = useI18n({ useScope: 'global' })
const i18nKey = ref(0)

watch(locale, () => {
  i18nKey.value++
})
</script>

<template>
  <div class="min-h-screen" :key="i18nKey">
    <Header />
    <router-view></router-view>
  </div>
</template>