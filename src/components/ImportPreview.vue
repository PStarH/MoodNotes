<template>
    <div
        ref="previewRef"
        class="glass-effect rounded-2xl p-6 warm-shadow-lg max-h-[80vh] overflow-y-auto custom-scrollbar"
        role="dialog"
        aria-labelledby="import-preview-title"
        aria-modal="true"
    >
        <div class="flex justify-between items-center mb-6">
            <h2 id="import-preview-title" class="text-2xl font-bold text-[#4E3B2B] flex items-center gap-2">
                <span aria-hidden="true">🔍</span>
                Import Preview
            </h2>
            <button
                type="button"
                id="import-preview-close"
                @click="$emit('close')"
                class="text-[#7D5A36] hover:text-opacity-80 p-2 hover:bg-[#7D5A36] hover:bg-opacity-10 rounded-lg transition-all"
                aria-label="Close import preview"
            >
                <X :size="24" aria-hidden="true" />
            </button>
        </div>

        <!-- Import Stats -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6" role="region" aria-label="Import statistics">
            <div class="glass-effect p-4 rounded-xl text-center">
                <div class="text-3xl font-bold text-[#4E3B2B]" aria-label="Total items count">{{ stats.totalItems }}</div>
                <div class="text-sm text-[#7D5A36]/80 mt-1">Total Items</div>
            </div>
            <div class="glass-effect p-4 rounded-xl text-center">
                <div class="text-3xl font-bold text-green-600" aria-label="New items count">{{ stats.newItems }}</div>
                <div class="text-sm text-[#7D5A36]/80 mt-1">New Items</div>
            </div>
            <div class="glass-effect p-4 rounded-xl text-center">
                <div class="text-3xl font-bold text-orange-600" aria-label="Conflicts count">{{ stats.conflicts }}</div>
                <div class="text-sm text-[#7D5A36]/80 mt-1">Conflicts</div>
            </div>
            <div class="glass-effect p-4 rounded-xl text-center">
                <div class="text-3xl font-bold text-[#7D5A36]" aria-label="Duplicates count">{{ stats.duplicates }}</div>
                <div class="text-sm text-[#7D5A36]/80 mt-1">Duplicates</div>
            </div>
        </div>

        <!-- Import Mode Selection -->
        <div v-if="conflicts.length > 0" class="mb-6">
            <h3 id="import-mode-label" class="text-lg font-semibold text-[#4E3B2B] mb-3">Import Mode</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-3" role="radiogroup" aria-labelledby="import-mode-label">
                <label
                    v-for="mode in importModes"
                    :key="mode.value"
                    class="import-mode-option"
                    :class="{ 'import-mode-active': selectedMode === mode.value }"
                >
                    <input
                        type="radio"
                        name="import-mode"
                        :value="mode.value"
                        v-model="selectedMode"
                        class="sr-only"
                        :aria-label="`${mode.label}: ${mode.description}`"
                    />
                    <div>
                        <div class="flex items-center gap-2 mb-1">
                            <span class="text-xl" aria-hidden="true">{{ mode.icon }}</span>
                            <span class="font-semibold text-[#4E3B2B]">{{ mode.label }}</span>
                        </div>
                        <p class="text-xs text-[#7D5A36]/80">{{ mode.description }}</p>
                    </div>
                </label>
            </div>
        </div>

        <!-- Conflict List -->
        <div v-if="conflicts.length > 0" class="mb-6">
            <h3 id="conflicts-section" class="text-lg font-semibold text-[#4E3B2B] mb-3 flex items-center gap-2">
                <span aria-hidden="true">⚠️</span>
                Conflicts Detected ({{ conflicts.length }})
            </h3>
            <div class="space-y-3 max-h-96 overflow-y-auto custom-scrollbar" role="region" aria-labelledby="conflicts-section">
                <div
                    v-for="(conflict, index) in conflicts.slice(0, 10)"
                    :key="index"
                    class="glass-effect p-4 rounded-xl border border-orange-500/30"
                    role="article"
                    :aria-label="`Conflict ${index + 1}: ${getConflictTitle(conflict)}`"
                >
                    <div class="flex items-start justify-between mb-2">
                        <div class="flex items-center gap-2">
                            <span class="text-lg" aria-hidden="true">
                                {{ conflict.type === 'daySummary' ? '📅' : conflict.type === 'task' ? '✅' : '🔄' }}
                            </span>
                            <div>
                                <span class="font-semibold text-[#4E3B2B]">
                                    {{ getConflictTitle(conflict) }}
                                </span>
                                <p class="text-xs text-[#7D5A36]/70">
                                    {{ conflict.type === 'daySummary' ? 'Day Summary' : conflict.type === 'task' ? 'Task' : 'Habit' }}
                                </p>
                            </div>
                        </div>
                        <span
                            class="px-2 py-1 rounded-full text-xs font-semibold"
                            :class="getResolutionClass(conflict.resolution)"
                            :aria-label="`Resolution status: ${getResolutionLabel(conflict.resolution)}`"
                        >
                            {{ getResolutionLabel(conflict.resolution) }}
                        </span>
                    </div>

                    <!-- Conflict Details -->
                    <div class="grid grid-cols-2 gap-3 mt-3 text-xs">
                        <div class="glass-effect p-2 rounded-lg">
                            <p class="font-semibold text-[#4E3B2B] mb-1">Existing</p>
                            <p class="text-[#7D5A36]/80 truncate">{{ getConflictPreview(conflict.existing) }}</p>
                        </div>
                        <div class="glass-effect p-2 rounded-lg">
                            <p class="font-semibold text-[#4E3B2B] mb-1">Incoming</p>
                            <p class="text-[#7D5A36]/80 truncate">{{ getConflictPreview(conflict.incoming) }}</p>
                        </div>
                    </div>
                </div>

                <div v-if="conflicts.length > 10" class="text-center text-sm text-[#7D5A36]/70 py-2">
                    + {{ conflicts.length - 10 }} more conflicts
                </div>
            </div>
        </div>

        <!-- No Conflicts Message -->
        <div v-else class="glass-effect p-6 rounded-xl border border-green-500/30 bg-green-500/5 text-center">
            <span class="text-4xl mb-2 block">✅</span>
            <p class="font-semibold text-[#4E3B2B]">No conflicts detected</p>
            <p class="text-sm text-[#7D5A36]/80 mt-1">All items in the backup are new and can be imported safely.</p>
        </div>

        <!-- Action Buttons -->
        <div class="flex gap-3 mt-6" role="group" aria-label="Import actions">
            <button
                @click="$emit('close')"
                type="button"
                class="flex-1 px-6 py-3 glass-effect border border-[#D3C9A6]/60 text-[#4E3B2B] rounded-xl hover-lift transition-all duration-200 font-semibold"
                aria-label="Cancel import and close preview"
            >
                Cancel
            </button>
            <button
                @click="handleImport"
                type="button"
                class="flex-1 px-6 py-3 bg-gradient-to-r from-[#7D5A36] to-[#6B4A2E] text-white rounded-xl hover-lift transition-all duration-200 font-semibold warm-shadow"
                :aria-label="`${importButtonText} - Click to start import`"
            >
                {{ importButtonText }}
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { X } from 'lucide-vue-next'
import { useModalFocus } from '@/composables/useFocusTrap'
import type { ImportConflict, ImportStats, ImportMode } from '@/composables/useImportConflict'

const props = defineProps<{
    conflicts: ImportConflict[]
    stats: ImportStats
}>()

const emit = defineEmits<{
    close: []
    import: [mode: ImportMode]
}>()

const { containerRef: previewRef } = useModalFocus({ initialFocus: '#import-preview-close', returnFocus: true, onEscape: () => emit('close') })
const selectedMode = ref<ImportMode>('merge')

const importModes = [
    {
        value: 'merge' as ImportMode,
        icon: '🔀',
        label: 'Smart Merge',
        description: 'Combine new data with existing entries intelligently'
    },
    {
        value: 'replace' as ImportMode,
        icon: '🔄',
        label: 'Replace All',
        description: 'Replace existing entries with imported data'
    },
    {
        value: 'preview' as ImportMode,
        icon: '👁️',
        label: 'Keep Existing',
        description: 'Skip conflicts and only import new items'
    }
]

const importButtonText = computed(() => {
    switch (selectedMode.value) {
        case 'merge':
            return `Merge ${props.stats.totalItems} Items`
        case 'replace':
            return `Replace & Import ${props.stats.totalItems} Items`
        case 'preview':
            return `Import ${props.stats.newItems} New Items`
        default:
            return 'Import'
    }
})

const getConflictTitle = (conflict: ImportConflict): string => {
    if (conflict.type === 'daySummary' && conflict.date) {
        return conflict.date
    }
    if (conflict.type === 'task') {
        return conflict.incoming.description || 'Task'
    }
    if (conflict.type === 'habit') {
        return conflict.incoming.name || 'Habit'
    }
    return 'Unknown'
}

const getConflictPreview = (data: any): string => {
    if (!data) return 'No data'

    if (data.summary) {
        // Day summary
        const text = stripHtml(data.summary)
        return text.length > 50 ? text.slice(0, 50) + '...' : text
    }
    if (data.description) {
        // Task
        return data.description
    }
    if (data.name) {
        // Habit
        return data.name
    }
    return JSON.stringify(data).slice(0, 50) + '...'
}

const stripHtml = (html: string): string => {
    const tmp = document.createElement('DIV')
    tmp.innerHTML = html
    return tmp.textContent || tmp.innerText || ''
}

const getResolutionClass = (resolution?: 'keep' | 'replace' | 'skip'): string => {
    switch (resolution) {
        case 'replace':
            return 'bg-orange-100 text-orange-700'
        case 'keep':
            return 'bg-green-100 text-green-700'
        case 'skip':
            return 'bg-gray-100 text-gray-700'
        default:
            return 'bg-blue-100 text-blue-700'
    }
}

const getResolutionLabel = (resolution?: 'keep' | 'replace' | 'skip'): string => {
    switch (resolution) {
        case 'replace':
            return 'Will Replace'
        case 'keep':
            return 'Will Keep'
        case 'skip':
            return 'Will Skip'
        default:
            return 'Pending'
    }
}

const handleImport = () => {
    emit('import', selectedMode.value)
}
</script>

<style scoped>
.import-mode-option {
    display: flex;
    align-items: flex-start;
    padding: 1rem;
    border-radius: 1rem;
    border: 2px solid rgba(125, 90, 54, 0.2);
    background: rgba(250, 243, 224, 0.7);
    cursor: pointer;
    transition: all 0.2s ease;
}

.import-mode-option:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(78, 59, 43, 0.15);
}

.import-mode-active {
    border-color: rgba(125, 90, 54, 0.6);
    background: rgba(125, 90, 54, 0.1);
    box-shadow: 0 10px 28px rgba(78, 59, 43, 0.18);
}

.custom-scrollbar {
    scrollbar-width: thin;
    scrollbar-color: #7D5A36 #F0E9D2;
}

.custom-scrollbar::-webkit-scrollbar {
    width: 8px;
    height: 8px;
}

.custom-scrollbar::-webkit-scrollbar-track {
    background: #F0E9D2;
    border-radius: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
    background: #7D5A36;
    border-radius: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #6B4A2E;
}
</style>
