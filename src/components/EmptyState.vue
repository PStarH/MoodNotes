<template>
  <div class="flex flex-col items-center justify-center py-16 px-6 text-center">
    <div class="mb-6 text-6xl opacity-20">
      {{ icon }}
    </div>
    <h3 class="text-2xl font-bold text-themed mb-3">
      {{ title }}
    </h3>
    <p class="text-themed-secondary mb-6 max-w-md leading-relaxed">
      {{ description }}
    </p>
    <slot name="action">
      <button
        v-if="actionText"
        @click="$emit('action')"
        class="bg-themed-primary text-white px-6 py-3 rounded-xl hover-lift transition-all duration-200 warm-shadow font-semibold flex items-center gap-2"
      >
        <component v-if="actionIcon" :is="actionIcon" :size="20" />
        {{ actionText }}
      </button>
    </slot>
  </div>
</template>

<script setup lang="ts">
interface Props {
  icon: string
  title: string
  description: string
  actionText?: string
  actionIcon?: any
}

defineProps<Props>()
defineEmits(['action'])
</script>
