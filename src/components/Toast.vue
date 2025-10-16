<template>
  <Transition
    enter-active-class="transition-all duration-300 ease-out"
    leave-active-class="transition-all duration-200 ease-in"
    enter-from-class="translate-y-2 opacity-0"
    enter-to-class="translate-y-0 opacity-100"
    leave-from-class="translate-y-0 opacity-100"
    leave-to-class="translate-y-2 opacity-0"
  >
    <div
      v-if="visible"
      :class="toastClasses"
      class="fixed bottom-20 right-6 max-w-sm px-6 py-4 rounded-xl shadow-2xl flex items-start gap-3 z-[60] backdrop-blur-lg"
      role="alert"
      aria-live="polite"
    >
      <div class="flex-shrink-0 text-2xl">
        {{ icon }}
      </div>
      <div class="flex-1 min-w-0">
        <p v-if="title" class="font-semibold mb-1">{{ title }}</p>
        <p class="text-sm opacity-90">{{ message }}</p>
      </div>
      <button
        @click="close"
        class="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity"
        aria-label="Close notification"
      >
        <X :size="18" />
      </button>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { X } from 'lucide-vue-next'

interface Props {
  type?: 'success' | 'error' | 'warning' | 'info'
  title?: string
  message: string
  duration?: number
}

const props = withDefaults(defineProps<Props>(), {
  type: 'info',
  duration: 3000
})

const emit = defineEmits(['close'])

const visible = ref(false)
let timer: NodeJS.Timeout

const toastClasses = computed(() => {
  const baseClasses = 'border-2'
  const variants = {
    success: 'bg-green-500/90 border-green-400 text-white',
    error: 'bg-red-500/90 border-red-400 text-white',
    warning: 'bg-yellow-500/90 border-yellow-400 text-gray-900',
    info: 'bg-[#7D5A36]/90 border-[#D3C9A6] text-white'
  }
  return `${baseClasses} ${variants[props.type]}`
})

const icon = computed(() => {
  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  }
  return icons[props.type]
})

const close = () => {
  visible.value = false
  setTimeout(() => emit('close'), 200)
}

onMounted(() => {
  visible.value = true
  if (props.duration > 0) {
    timer = setTimeout(close, props.duration)
  }
})
</script>
