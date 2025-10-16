<template>
  <div class="animate-pulse">
    <slot>
      <div class="glass-effect rounded-xl p-6 space-y-4">
        <div class="h-4 bg-[#D3C9A6] rounded w-3/4"></div>
        <div class="h-4 bg-[#D3C9A6] rounded w-1/2"></div>
        <div class="h-4 bg-[#D3C9A6] rounded w-5/6"></div>
      </div>
    </slot>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.theme-dark .bg-\[#D3C9A6\] {
  background-color: rgba(51, 65, 85, 0.5);
}
</style>
