<script setup lang="ts">
import { onMounted } from 'vue';
import Header from './components/Header.vue';
import { useLanguage } from './composables/useLanguage';

const { initializeLanguage } = useLanguage();

onMounted(() => {
  initializeLanguage();
});
</script>

<template>
  <div class="min-h-screen">
    <Header />
    <router-view></router-view>
  </div>
</template>