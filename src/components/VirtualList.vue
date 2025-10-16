<template>
  <div 
    ref="containerRef"
    class="virtual-list-container"
    :style="{ height: containerHeight + 'px' }"
    @scroll="handleScroll"
  >
    <div 
      class="virtual-list-spacer"
      :style="{ height: totalHeight + 'px' }"
    >
      <div 
        class="virtual-list-content"
        :style="{ transform: `translateY(${offsetY}px)` }"
      >
        <div
          v-for="(item, index) in visibleItems"
          :key="getItemKey(item, startIndex + index)"
          class="virtual-list-item"
          :style="{ height: itemHeight + 'px' }"
        >
          <slot :item="item" :index="startIndex + index" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useThrottle } from '@/composables/usePerformance'

interface Props {
  items: any[]
  itemHeight: number
  containerHeight: number
  buffer?: number
  getItemKey?: (item: any, index: number) => string | number
}

const props = withDefaults(defineProps<Props>(), {
  buffer: 5,
  getItemKey: (_, index) => index
})

const containerRef = ref<HTMLElement>()
const scrollTop = ref(0)

const startIndex = computed(() => {
  return Math.floor(scrollTop.value / props.itemHeight)
})

const endIndex = computed(() => {
  return Math.min(
    startIndex.value + Math.ceil(props.containerHeight / props.itemHeight) + props.buffer,
    props.items.length - 1
  )
})

const visibleItems = computed(() => {
  const start = Math.max(0, startIndex.value - props.buffer)
  const end = endIndex.value + 1
  return props.items.slice(start, end)
})

const totalHeight = computed(() => {
  return props.items.length * props.itemHeight
})

const offsetY = computed(() => {
  return Math.max(0, startIndex.value - props.buffer) * props.itemHeight
})

const throttledScroll = useThrottle((event: Event) => {
  const target = event.target as HTMLElement
  scrollTop.value = target.scrollTop
}, 16) // ~60fps

const handleScroll = (event: Event) => {
  throttledScroll(event)
}

// Watch for items changes and reset scroll if needed
watch(() => props.items.length, (newLength, oldLength) => {
  if (newLength < oldLength && scrollTop.value > 0) {
    // If items were removed and we're scrolled down, adjust scroll position
    const maxScrollTop = Math.max(0, totalHeight.value - props.containerHeight)
    if (scrollTop.value > maxScrollTop) {
      scrollTop.value = maxScrollTop
      if (containerRef.value) {
        containerRef.value.scrollTop = maxScrollTop
      }
    }
  }
})

onMounted(() => {
  // Ensure scroll position is synced
  if (containerRef.value) {
    scrollTop.value = containerRef.value.scrollTop
  }
})
</script>

<style scoped>
.virtual-list-container {
  overflow-y: auto;
  position: relative;
}

.virtual-list-spacer {
  position: relative;
}

.virtual-list-content {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
}

.virtual-list-item {
  overflow: hidden;
}

/* Custom scrollbar styling */
.virtual-list-container::-webkit-scrollbar {
  width: 8px;
}

.virtual-list-container::-webkit-scrollbar-track {
  background: rgba(211, 201, 166, 0.3);
  border-radius: 4px;
}

.virtual-list-container::-webkit-scrollbar-thumb {
  background: rgba(125, 90, 54, 0.5);
  border-radius: 4px;
}

.virtual-list-container::-webkit-scrollbar-thumb:hover {
  background: rgba(125, 90, 54, 0.7);
}
</style>