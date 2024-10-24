<script setup lang="ts">
import Homepage from './views/Homepage.vue';
import ErrorBoundary from './components/ErrorBoundary.vue';
</script>

<template>
    <ErrorBoundary>
      <router-view/>
    </ErrorBoundary>
</template>

<style scoped>
/* Global styles if any */
</style>