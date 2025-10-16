<template>
  <div
    ref="containerRef"
    class="lazy-image-container"
    :class="containerClass"
    :style="containerStyle"
  >
    <img
      v-if="shouldLoad && !hasError"
      :src="src"
      :alt="alt"
      :class="imageClass"
      :style="imageStyle"
      @load="handleLoad"
      @error="handleError"
      class="lazy-image"
      :class="{ 'loaded': isLoaded, 'loading': isLoading }"
    />
    
    <div 
      v-if="!shouldLoad || isLoading"
      class="lazy-image-placeholder"
      :class="placeholderClass"
      :style="placeholderStyle"
    >
      <div v-if="showSpinner" class="lazy-image-spinner">
        <div class="spinner"></div>
      </div>
      <slot name="placeholder" />
    </div>
    
    <div 
      v-if="hasError"
      class="lazy-image-error"
      :class="errorClass"
    >
      <div class="error-icon">❌</div>
      <div class="error-text">Failed to load image</div>
      <slot name="error" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useIntersectionObserver } from '@/composables/usePerformance'

interface Props {
  src: string
  alt?: string
  threshold?: number
  rootMargin?: string
  containerClass?: string
  containerStyle?: Record<string, any>
  imageClass?: string
  imageStyle?: Record<string, any>
  placeholderClass?: string
  placeholderStyle?: Record<string, any>
  errorClass?: string
  showSpinner?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  alt: '',
  threshold: 0.1,
  rootMargin: '50px',
  showSpinner: true
})

const emit = defineEmits(['load', 'error', 'visible'])

const containerRef = ref<HTMLElement>()
const shouldLoad = ref(false)
const isLoading = ref(false)
const isLoaded = ref(false)
const hasError = ref(false)

const { observe, unobserve } = useIntersectionObserver(
  (entries) => {
    const entry = entries[0]
    if (entry.isIntersecting && !shouldLoad.value) {
      shouldLoad.value = true
      isLoading.value = true
      emit('visible')
      
      // Stop observing once we've started loading
      if (containerRef.value) {
        unobserve(containerRef.value)
      }
    }
  },
  {
    threshold: props.threshold,
    rootMargin: props.rootMargin
  }
)

const handleLoad = () => {
  isLoading.value = false
  isLoaded.value = true
  emit('load')
}

const handleError = () => {
  isLoading.value = false
  hasError.value = true
  emit('error')
}

onMounted(() => {
  if (containerRef.value) {
    observe(containerRef.value)
  }
})

onUnmounted(() => {
  if (containerRef.value) {
    unobserve(containerRef.value)
  }
})
</script>

<style scoped>
.lazy-image-container {
  position: relative;
  display: inline-block;
  overflow: hidden;
}

.lazy-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: opacity 0.3s ease;
  opacity: 0;
}

.lazy-image.loading {
  opacity: 0;
}

.lazy-image.loaded {
  opacity: 1;
}

.lazy-image-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #F0E9D2 0%, #E8DCC0 100%);
  color: #7D5A36;
}

.lazy-image-spinner {
  display: flex;
  align-items: center;
  justify-content: center;
}

.spinner {
  width: 24px;
  height: 24px;
  border: 2px solid #D3C9A6;
  border-top: 2px solid #7D5A36;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.lazy-image-error {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(255, 0, 0, 0.1);
  color: #dc2626;
}

.error-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.error-text {
  font-size: 0.875rem;
  text-align: center;
}
</style>