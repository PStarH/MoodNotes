<template>
  <div class="backup-panel glass-effect rounded-2xl p-6 warm-shadow-lg fade-in">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold text-[#4E3B2B] flex items-center">
        <span class="mr-3">💾</span>Backup & Export
      </h2>
      <button @click="$emit('close')" 
              class="text-[#7D5A36] hover:text-opacity-80 p-2 hover:bg-[#7D5A36] hover:bg-opacity-10 rounded-lg transition-all">
        <X :size="24" />
      </button>
    </div>

    <!-- Export Section -->
    <div class="mb-8">
      <h3 class="text-xl font-semibold text-[#4E3B2B] mb-4 flex items-center">
        <span class="mr-2">📤</span>Export Data
      </h3>
      <p class="text-[#7D5A36] mb-4">Download your diary data in various formats for backup or migration.</p>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          @click="handleExport('json')"
          :disabled="isExporting"
          class="export-button flex flex-col items-center p-4 glass-effect rounded-xl hover-lift transition-all duration-200 warm-shadow disabled:opacity-50"
        >
          <div class="text-3xl mb-2">📄</div>
          <span class="font-semibold text-[#4E3B2B]">JSON</span>
          <span class="text-sm text-[#7D5A36] text-center">Complete backup with all data</span>
        </button>

        <button
          @click="handleExport('csv')"
          :disabled="isExporting"
          class="export-button flex flex-col items-center p-4 glass-effect rounded-xl hover-lift transition-all duration-200 warm-shadow disabled:opacity-50"
        >
          <div class="text-3xl mb-2">📊</div>
          <span class="font-semibold text-[#4E3B2B]">CSV</span>
          <span class="text-sm text-[#7D5A36] text-center">Spreadsheet format for analysis</span>
        </button>

        <button
          @click="handleExport('markdown')"
          :disabled="isExporting"
          class="export-button flex flex-col items-center p-4 glass-effect rounded-xl hover-lift transition-all duration-200 warm-shadow disabled:opacity-50"
        >
          <div class="text-3xl mb-2">📝</div>
          <span class="font-semibold text-[#4E3B2B]">Markdown</span>
          <span class="text-sm text-[#7D5A36] text-center">Human-readable format</span>
        </button>
      </div>

      <!-- Export Progress -->
      <div v-if="isExporting" class="mt-4">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm font-medium text-[#4E3B2B]">Exporting...</span>
          <span class="text-sm text-[#7D5A36]">{{ backupProgress }}%</span>
        </div>
        <div class="w-full bg-[#F0E9D2] rounded-full h-2">
          <div 
            class="bg-gradient-to-r from-[#7D5A36] to-[#6B4A2E] h-2 rounded-full transition-all duration-300"
            :style="{ width: `${backupProgress}%` }"
          ></div>
        </div>
      </div>
    </div>

    <!-- Import Section -->
    <div class="mb-8">
      <h3 class="text-xl font-semibold text-[#4E3B2B] mb-4 flex items-center">
        <span class="mr-2">📥</span>Import Data
      </h3>
      <p class="text-[#7D5A36] mb-4">Restore your data from a previous backup (JSON format only).</p>
      
      <div class="border-2 border-dashed border-[#D3C9A6] rounded-xl p-6 text-center">
        <input
          ref="fileInput"
          type="file"
          accept=".json"
          @change="handleFileSelect"
          class="hidden"
        />
        
        <div v-if="!selectedFile" class="cursor-pointer" @click="$refs.fileInput?.click()">
          <div class="text-4xl mb-3">📁</div>
          <p class="text-[#4E3B2B] font-semibold mb-2">Click to select backup file</p>
          <p class="text-sm text-[#7D5A36]">Only JSON backup files are supported</p>
        </div>

        <div v-else class="space-y-4">
          <div class="flex items-center justify-center space-x-2">
            <FileText class="text-[#7D5A36]" :size="20" />
            <span class="text-[#4E3B2B] font-medium">{{ selectedFile.name }}</span>
            <button @click="clearSelectedFile" class="text-red-500 hover:text-red-600">
              <X :size="16" />
            </button>
          </div>
          
          <div class="flex justify-center space-x-3">
            <button
              @click="clearSelectedFile"
              class="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-all"
            >
              Cancel
            </button>
            <button
              @click="handleImport"
              :disabled="isImporting"
              class="px-6 py-2 bg-gradient-to-r from-[#7D5A36] to-[#6B4A2E] text-white rounded-lg hover-lift transition-all duration-200 font-semibold warm-shadow disabled:opacity-50"
            >
              Import Data
            </button>
          </div>
        </div>
      </div>

      <!-- Import Progress -->
      <div v-if="isImporting" class="mt-4">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm font-medium text-[#4E3B2B]">Importing...</span>
          <span class="text-sm text-[#7D5A36]">{{ backupProgress }}%</span>
        </div>
        <div class="w-full bg-[#F0E9D2] rounded-full h-2">
          <div 
            class="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-300"
            :style="{ width: `${backupProgress}%` }"
          ></div>
        </div>
      </div>
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
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { X, FileText, AlertCircle, CheckCircle } from 'lucide-vue-next'
import { useDataBackup } from '@/composables/useDataBackup'

const emit = defineEmits(['close'])

const { exportData, importData, isExporting, isImporting, backupProgress } = useDataBackup()

const selectedFile = ref<File | null>(null)
const message = ref('')
const messageType = ref<'success' | 'error'>('success')

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
  const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
  if (fileInput) {
    fileInput.value = ''
  }
}

const handleImport = async () => {
  if (!selectedFile.value) return

  try {
    await importData(selectedFile.value)
    showMessage('Data imported successfully!', 'success')
    clearSelectedFile()
  } catch (error) {
    showMessage(`Import failed: ${(error as Error).message}`, 'error')
  }
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