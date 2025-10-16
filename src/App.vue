<script setup lang="ts">
import { onMounted } from 'vue'
import { useTheme } from '@/composables/useTheme'
import Homepage from './views/Homepage.vue';
import ErrorBoundary from './components/ErrorBoundary.vue';

const { initTheme } = useTheme()

onMounted(() => {
  initTheme()
})
</script>

<template>
    <ErrorBoundary>
      <router-view/>
    </ErrorBoundary>
</template>

<style scoped>
/* Global styles if any */
</style>