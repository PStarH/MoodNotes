<template>
  <div
    ref="panelRef"
    class="backup-panel glass-effect rounded-2xl p-6 warm-shadow-lg fade-in"
    role="dialog"
    aria-labelledby="backup-title"
    aria-modal="true"
  >
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <h2 id="backup-title" class="text-2xl font-bold text-[#4E3B2B] flex items-center">
        <span class="mr-3" aria-hidden="true">💾</span>Backup & Export
      </h2>
      <button
        type="button"
        id="backup-panel-close"
        @click="$emit('close')"
        class="text-[#7D5A36] hover:text-opacity-80 p-2 hover:bg-[#7D5A36] hover:bg-opacity-10 rounded-lg transition-all"
        aria-label="Close backup panel"
      >
        <X :size="24" aria-hidden="true" />
      </button>
    </div>

    <!-- Export Section -->
    <div class="mb-8">
      <h3 id="export-section" class="text-xl font-semibold text-[#4E3B2B] mb-4 flex items-center">
        <span class="mr-2" aria-hidden="true">📤</span>Export Data
      </h3>
      <p class="text-[#7D5A36] mb-4">Download your diary data in various formats for backup or migration.</p>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4" role="group" aria-labelledby="export-section">
        <button
          type="button"
          id="export-json-button"
          @click="handleExport('json')"
          :disabled="isExporting"
          :aria-busy="isExporting"
          aria-label="Export data as JSON format"
          class="export-button flex flex-col items-center p-4 glass-effect rounded-xl hover-lift transition-all duration-200 warm-shadow disabled:opacity-50"
        >
          <div class="text-3xl mb-2" aria-hidden="true">📄</div>
          <span class="font-semibold text-[#4E3B2B]">JSON</span>
          <span class="text-sm text-[#7D5A36] text-center">Complete backup with all data</span>
        </button>

        <button
          type="button"
          @click="handleExport('csv')"
          :disabled="isExporting"
          :aria-busy="isExporting"
          aria-label="Export data as CSV format for spreadsheets"
          class="export-button flex flex-col items-center p-4 glass-effect rounded-xl hover-lift transition-all duration-200 warm-shadow disabled:opacity-50"
        >
          <div class="text-3xl mb-2" aria-hidden="true">📊</div>
          <span class="font-semibold text-[#4E3B2B]">CSV</span>
          <span class="text-sm text-[#7D5A36] text-center">Spreadsheet format for analysis</span>
        </button>

        <button
          type="button"
          @click="handleExport('markdown')"
          :disabled="isExporting"
          :aria-busy="isExporting"
          aria-label="Export data as Markdown format"
          class="export-button flex flex-col items-center p-4 glass-effect rounded-xl hover-lift transition-all duration-200 warm-shadow disabled:opacity-50"
        >
          <div class="text-3xl mb-2" aria-hidden="true">📝</div>
          <span class="font-semibold text-[#4E3B2B]">Markdown</span>
          <span class="text-sm text-[#7D5A36] text-center">Human-readable format</span>
        </button>
      </div>

      <!-- Export Progress -->
      <div v-if="isExporting" class="mt-4" role="status" aria-live="polite">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm font-medium text-[#4E3B2B]">Exporting...</span>
          <span class="text-sm text-[#7D5A36]" aria-label="Export progress">{{ backupProgress }}%</span>
        </div>
        <div class="w-full bg-[#F0E9D2] rounded-full h-2" role="progressbar" :aria-valuenow="backupProgress" aria-valuemin="0" aria-valuemax="100">
          <div
            class="bg-gradient-to-r from-[#7D5A36] to-[#6B4A2E] h-2 rounded-full transition-all duration-300"
            :style="{ width: `${backupProgress}%` }"
          ></div>
        </div>
      </div>
    </div>

    <!-- Import Section -->
    <div class="mb-8">
      <h3 id="import-section" class="text-xl font-semibold text-[#4E3B2B] mb-4 flex items-center">
        <span class="mr-2" aria-hidden="true">📥</span>Import Data
      </h3>
      <p class="text-[#7D5A36] mb-4">Restore your data from a previous backup (JSON format only).</p>

      <div class="border-2 border-dashed border-[#D3C9A6] rounded-xl p-6 text-center" role="region" aria-labelledby="import-section">
        <input
          ref="fileInput"
          type="file"
          accept=".json"
          @change="handleFileSelect"
          class="hidden"
          aria-label="Select backup file to import"
        />
        
        <button
          v-if="!selectedFile"
          type="button"
          class="w-full cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7D5A36] rounded-xl py-4"
          @click="triggerFileSelect"
          aria-label="Click to select backup file"
        >
          <div class="text-4xl mb-3" aria-hidden="true">📁</div>
          <p class="text-[#4E3B2B] font-semibold mb-2">Click to select backup file</p>
          <p class="text-sm text-[#7D5A36]">Only JSON backup files are supported</p>
        </button>

        <div v-else class="space-y-4">
          <div class="flex items-center justify-center space-x-2">
            <FileText class="text-[#7D5A36]" :size="20" aria-hidden="true" />
            <span class="text-[#4E3B2B] font-medium">{{ selectedFile.name }}</span>
            <button type="button" @click="clearSelectedFile" class="text-red-500 hover:text-red-600" aria-label="Remove selected file">
              <X :size="16" aria-hidden="true" />
            </button>
          </div>

          <div class="flex justify-center space-x-3" role="group" aria-label="Import actions">
            <button
              type="button"
              @click="clearSelectedFile"
              class="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-all"
              aria-label="Cancel file selection"
            >
              Cancel
            </button>
            <button
              type="button"
              @click="handleImport"
              :disabled="isImporting"
              :aria-busy="isImporting"
              class="px-6 py-2 bg-gradient-to-r from-[#7D5A36] to-[#6B4A2E] text-white rounded-lg hover-lift transition-all duration-200 font-semibold warm-shadow disabled:opacity-50"
              aria-label="Import data from selected file"
            >
              Import Data
            </button>
          </div>
        </div>
      </div>

      <!-- Import Progress -->
      <div v-if="isImporting" class="mt-4" role="status" aria-live="polite">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm font-medium text-[#4E3B2B]">Importing...</span>
          <span class="text-sm text-[#7D5A36]" aria-label="Import progress">{{ backupProgress }}%</span>
        </div>
        <div class="w-full bg-[#F0E9D2] rounded-full h-2" role="progressbar" :aria-valuenow="backupProgress" aria-valuemin="0" aria-valuemax="100">
          <div
            class="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-300"
            :style="{ width: `${backupProgress}%` }"
          ></div>
        </div>
      </div>
    </div>

    <!-- Data Migration -->
    <div class="mb-8">
      <DataMigration />
    </div>

    <!-- Backup Tips -->
    <div class="glass-effect p-4 rounded-xl warm-shadow">
      <h4 class="font-semibold text-[#4E3B2B] mb-3 flex items-center">
        <span class="mr-2">💡</span>Backup Tips
      </h4>
      <ul class="space-y-2 text-sm text-[#7D5A36]">
        <li class="flex items-start">
          <span class="mr-2">•</span>
          <span>Export regularly to prevent data loss</span>
        </li>
        <li class="flex items-start">
          <span class="mr-2">•</span>
          <span>JSON format preserves all data including media references</span>
        </li>
        <li class="flex items-start">
          <span class="mr-2">•</span>
          <span>Store backups in multiple locations (cloud storage, external drives)</span>
        </li>
        <li class="flex items-start">
          <span class="mr-2">•</span>
          <span>Import will merge with existing data, not replace it</span>
        </li>
      </ul>
    </div>

    <!-- Error/Success Messages -->
    <div v-if="message" class="mt-4 p-4 rounded-xl"
         :class="messageType === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'">
      <div class="flex items-center">
        <AlertCircle v-if="messageType === 'error'" :size="20" class="mr-2" />
        <CheckCircle v-else :size="20" class="mr-2" />
        <span class="font-medium">{{ message }}</span>
      </div>
    </div>

    <!-- Import Preview Modal -->
    <div v-if="showImportPreview" class="fixed inset-0 modal-backdrop flex items-center justify-center z-50 p-4" role="presentation">
      <ImportPreview
        :conflicts="importConflicts"
        :stats="importStats"
        @close="closeImportPreview"
        @import="executeImport"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { X, FileText, AlertCircle, CheckCircle } from 'lucide-vue-next'
import { useDataBackup } from '@/composables/useDataBackup'
import { useModalFocus } from '@/composables/useFocusTrap'
import DataMigration from './DataMigration.vue'
import ImportPreview from './ImportPreview.vue'
import type { ImportConflict, ImportStats, ImportMode } from '@/composables/useImportConflict'

const emit = defineEmits(['close'])

const { exportData, importData, analyzeImportFile, isExporting, isImporting, backupProgress } = useDataBackup()
const { containerRef: panelRef, refreshFocus } = useModalFocus({ initialFocus: '#export-json-button', returnFocus: true, onEscape: () => emit('close') })

const fileInput = ref<HTMLInputElement | null>(null)
const selectedFile = ref<File | null>(null)
const message = ref('')
const messageType = ref<'success' | 'error'>('success')

// Import preview state
const showImportPreview = ref(false)
const importPreviewData = ref<any>(null)
const importConflicts = ref<ImportConflict[]>([])
const importStats = ref<ImportStats>({
  totalItems: 0,
  conflicts: 0,
  newItems: 0,
  duplicates: 0
})

const handleExport = async (format: 'json' | 'csv' | 'markdown') => {
  try {
    await exportData(format)
    showMessage('Data exported successfully!', 'success')
  } catch (error) {
    showMessage(`Export failed: ${(error as Error).message}`, 'error')
  }
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    selectedFile.value = file
    clearMessage()
  }
}

const clearSelectedFile = () => {
  selectedFile.value = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const triggerFileSelect = () => {
  fileInput.value?.click()
}

const handleImport = async () => {
  if (!selectedFile.value) return

  try {
    // Analyze import file first
    const analysis = await analyzeImportFile(selectedFile.value)

    importPreviewData.value = analysis.data
    importConflicts.value = analysis.conflicts
    importStats.value = analysis.stats

    // Show preview modal
    showImportPreview.value = true
  } catch (error) {
    showMessage(`Import analysis failed: ${(error as Error).message}`, 'error')
  }
}

const executeImport = async (mode: ImportMode) => {
  try {
    await importData(importPreviewData.value, mode, importConflicts.value)
    showMessage('Data imported successfully!', 'success')
    showImportPreview.value = false
    clearSelectedFile()
    refreshFocus()
  } catch (error) {
    showMessage(`Import failed: ${(error as Error).message}`, 'error')
  }
}

const closeImportPreview = () => {
  showImportPreview.value = false
  refreshFocus()
}

const showMessage = (text: string, type: 'success' | 'error') => {
  message.value = text
  messageType.value = type
  setTimeout(clearMessage, 5000)
}

const clearMessage = () => {
  message.value = ''
}
</script>

<style scoped>
.export-button:hover {
  transform: translateY(-2px);
}

.export-button:disabled {
  cursor: not-allowed;
  transform: none;
}
</style>