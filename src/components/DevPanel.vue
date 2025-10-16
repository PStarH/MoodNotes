<template>
  <div v-if="isDev" class="dev-panel fixed bottom-4 left-4 z-50">
    <button
      @click="isOpen = !isOpen"
      class="dev-toggle bg-purple-600 text-white p-3 rounded-full shadow-lg hover:bg-purple-700 transition-all"
    >
      <Code :size="20" />
    </button>

    <transition
      enter-active-class="transition-all duration-300 ease-out"
      leave-active-class="transition-all duration-300 ease-in"
      enter-from-class="opacity-0 scale-95 translate-y-2"
      enter-to-class="opacity-100 scale-100 translate-y-0"
      leave-from-class="opacity-100 scale-100 translate-y-0"
      leave-to-class="opacity-0 scale-95 translate-y-2"
    >
      <div
        v-if="isOpen"
        class="dev-content bg-gray-900 text-white rounded-lg shadow-2xl mt-4 w-80 max-h-96 overflow-y-auto"
      >
        <div class="p-4 border-b border-gray-700">
          <h3 class="text-lg font-bold text-purple-300">Developer Panel</h3>
        </div>

        <div class="p-4 space-y-4">
          <!-- Performance Metrics -->
          <div>
            <h4 class="font-semibold text-green-300 mb-2">Performance</h4>
            <div class="text-sm space-y-1">
              <div>Load Time: {{ metrics.loadTime }}ms</div>
              <div>Memory: {{ metrics.memoryUsage.toFixed(2) }}MB</div>
              <div>Components: {{ metrics.componentCount }}</div>
            </div>
          </div>

          <!-- Feature Status -->
          <div>
            <h4 class="font-semibold text-blue-300 mb-2">Features</h4>
            <div class="text-sm space-y-1">
              <div class="flex items-center">
                <span class="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                Search & Filter
              </div>
              <div class="flex items-center">
                <span class="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                Data Backup/Export
              </div>
              <div class="flex items-center">
                <span class="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                Keyboard Shortcuts
              </div>
              <div class="flex items-center">
                <span class="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                Theme Switching
              </div>
              <div class="flex items-center">
                <span class="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                Virtual Scrolling
              </div>
              <div class="flex items-center">
                <span class="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                Lazy Loading
              </div>
            </div>
          </div>

          <!-- Keyboard Shortcuts -->
          <div>
            <h4 class="font-semibold text-yellow-300 mb-2">Shortcuts</h4>
            <div class="text-xs space-y-1">
              <div>Ctrl+N: New Entry</div>
              <div>Ctrl+F: Search</div>
              <div>Ctrl+B: Backup</div>
              <div>Esc: Close Modals</div>
            </div>
          </div>

          <!-- Issues -->
          <div v-if="issues.length > 0">
            <h4 class="font-semibold text-red-300 mb-2">Issues</h4>
            <div class="text-xs space-y-1">
              <div v-for="issue in issues" :key="issue" class="text-red-200">
                {{ issue }}
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex space-x-2">
            <button
              @click="downloadReport"
              class="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-all"
            >
              Export Report
            </button>
            <button
              @click="clearData"
              class="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-all"
            >
              Clear Data
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Code } from 'lucide-vue-next'
import { usePerformanceMonitor } from '@/utils/performanceMonitor'

const isDev = computed(() => import.meta.env.DEV)
const isOpen = ref(false)
const { getMetrics, detectIssues, generateReport } = usePerformanceMonitor()

const metrics = ref({
  loadTime: 0,
  memoryUsage: 0,
  componentCount: 0
})

const issues = ref<string[]>([])

const updateData = () => {
  metrics.value = getMetrics()
  issues.value = detectIssues()
}

const downloadReport = () => {
  const report = generateReport()
  const blob = new Blob([report], { type: 'text/markdown' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `performance-report-${new Date().toISOString().split('T')[0]}.md`
  link.click()
  URL.revokeObjectURL(url)
}

const clearData = () => {
  if (confirm('Are you sure you want to clear all application data? This cannot be undone.')) {
    localStorage.clear()
    sessionStorage.clear()
    if ('indexedDB' in window) {
      // Clear IndexedDB data used by LocalForage
      indexedDB.deleteDatabase('MoodNotes')
    }
    location.reload()
  }
}

onMounted(() => {
  updateData()
  setInterval(updateData, 5000) // Update every 5 seconds
})
</script>

<style scoped>
.dev-panel {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

.dev-content::-webkit-scrollbar {
  width: 6px;
}

.dev-content::-webkit-scrollbar-track {
  background: #374151;
  border-radius: 3px;
}

.dev-content::-webkit-scrollbar-thumb {
  background: #6b7280;
  border-radius: 3px;
}

.dev-content::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}
</style>