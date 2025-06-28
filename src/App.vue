<script setup lang="ts">
import Header from './components/Header.vue';
import LanguageNotice from './components/LanguageNotice.vue';
</script>

<template>
  <div class="min-h-screen">
    <Header />
    <LanguageNotice />
    <router-view></router-view>
  </div>
</template>