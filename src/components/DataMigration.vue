<template>
    <div class="glass-effect p-6 rounded-2xl warm-shadow" role="region" aria-labelledby="migration-title">
        <div class="mb-4">
            <h3 id="migration-title" class="text-xl font-bold text-[#4E3B2B] flex items-center gap-2">
                <span aria-hidden="true">🔄</span>
                Data Migration
            </h3>
            <p class="text-sm text-[#7D5A36]/80 mt-2">
                Migrate legacy data URLs to the new file system for better performance and reliability.
            </p>
        </div>

        <!-- Migration Status -->
        <div v-if="!needsMigration() && progress.status === 'idle'" class="glass-effect p-4 rounded-xl border border-green-500/30 bg-green-500/5" role="status" aria-live="polite">
            <div class="flex items-start gap-3">
                <span class="text-2xl" aria-hidden="true">✅</span>
                <div>
                    <p class="font-semibold text-[#4E3B2B]">All data is up to date</p>
                    <p class="text-sm text-[#7D5A36]/80 mt-1">
                        Your media files are already using the new file system.
                    </p>
                </div>
            </div>
        </div>

        <!-- Migration Needed -->
        <div v-else-if="needsMigration() && progress.status === 'idle'" class="space-y-4">
            <div class="glass-effect p-4 rounded-xl border border-[#7D5A36]/30" role="alert">
                <div class="flex items-start gap-3">
                    <span class="text-2xl" aria-hidden="true">⚠️</span>
                    <div class="flex-1">
                        <p class="font-semibold text-[#4E3B2B]">Migration recommended</p>
                        <p class="text-sm text-[#7D5A36]/80 mt-1">
                            Found {{ scanForDataUrls() }} media file{{ scanForDataUrls() === 1 ? '' : 's' }} using legacy data URLs.
                        </p>
                    </div>
                </div>
            </div>

            <div class="glass-effect p-4 rounded-xl">
                <h4 class="font-semibold text-[#4E3B2B] mb-2">What will happen:</h4>
                <ul class="space-y-2 text-sm text-[#7D5A36]/80">
                    <li class="flex items-start gap-2">
                        <span>•</span>
                        <span>Media files will be converted from data URLs to proper file references</span>
                    </li>
                    <li class="flex items-start gap-2">
                        <span>•</span>
                        <span>Your data will be preserved - no information will be lost</span>
                    </li>
                    <li class="flex items-start gap-2">
                        <span>•</span>
                        <span>App performance will improve significantly</span>
                    </li>
                    <li class="flex items-start gap-2">
                        <span>•</span>
                        <span>Database size will be reduced</span>
                    </li>
                </ul>
            </div>

            <button
                @click="startMigration"
                class="w-full px-6 py-3 bg-gradient-to-r from-[#7D5A36] to-[#6B4A2E] text-white rounded-xl hover-lift transition-all duration-200 font-semibold warm-shadow flex items-center justify-center gap-2"
                aria-label="Start data migration process"
            >
                <span aria-hidden="true">🚀</span>
                Start Migration
            </button>
        </div>

        <!-- Migration In Progress -->
        <div v-else-if="progress.status === 'running'" class="space-y-4">
            <div class="glass-effect p-4 rounded-xl" role="status" aria-live="polite" aria-atomic="true">
                <div class="flex items-center gap-3 mb-3">
                    <div class="animate-spin text-2xl" aria-hidden="true">⚙️</div>
                    <div class="flex-1">
                        <p class="font-semibold text-[#4E3B2B]">Migration in progress...</p>
                        <p class="text-sm text-[#7D5A36]/80 mt-1">{{ progress.currentFile }}</p>
                    </div>
                </div>

                <!-- Progress Bar -->
                <div class="relative w-full h-3 bg-[#D3C9A6]/30 rounded-full overflow-hidden" role="progressbar" :aria-valuenow="Math.round((progress.processed / progress.total) * 100)" aria-valuemin="0" aria-valuemax="100" :aria-label="`Migration progress: ${progress.processed} of ${progress.total} files processed`">
                    <div
                        class="absolute top-0 left-0 h-full bg-gradient-to-r from-[#7D5A36] to-[#6B4A2E] transition-all duration-300 progress-pulse"
                        :style="{ width: `${(progress.processed / progress.total) * 100}%` }"
                    ></div>
                </div>

                <div class="flex justify-between text-sm text-[#7D5A36]/80 mt-2">
                    <span>{{ progress.processed }} / {{ progress.total }} files</span>
                    <span>{{ Math.round((progress.processed / progress.total) * 100) }}%</span>
                </div>

                <!-- Estimated Time Remaining -->
                <div v-if="estimatedTimeRemaining" class="mt-2 text-center">
                    <p class="text-xs text-[#7D5A36]/70">
                        ⏱️ Estimated time remaining: <span class="font-semibold">{{ estimatedTimeRemaining }}</span>
                    </p>
                </div>
            </div>

            <div v-if="progress.failed > 0" class="glass-effect p-3 rounded-xl border border-orange-500/30 bg-orange-500/5" role="alert">
                <p class="text-sm text-[#7D5A36]">
                    <span aria-hidden="true">⚠️</span> {{ progress.failed }} file{{ progress.failed === 1 ? '' : 's' }} failed to migrate
                </p>
            </div>

            <!-- Detailed File List -->
            <div v-if="progress.files.length > 0" ref="fileListRef" class="glass-effect p-4 rounded-xl max-h-96 overflow-y-auto scroll-smooth">
                <h4 class="font-semibold text-[#4E3B2B] mb-3 flex items-center gap-2">
                    <span aria-hidden="true">📋</span>
                    File Status
                </h4>

                <!-- Pending/In-Progress Files -->
                <div v-if="pendingFiles.length > 0" class="mb-4">
                    <h5 class="text-sm font-semibold text-[#7D5A36]/80 mb-2">
                        ⏳ In Progress ({{ pendingFiles.length }})
                    </h5>
                    <div class="space-y-2">
                        <div
                            v-for="(file, index) in pendingFiles"
                            :key="'pending-' + index"
                            class="flex items-center justify-between p-2 rounded-lg transition-all"
                            :class="{
                                'bg-blue-500/10 ring-2 ring-blue-500/30 animate-pulse-subtle active-migrating-file': file.status === 'migrating',
                                'bg-gray-500/10': file.status === 'pending'
                            }"
                        >
                            <div class="flex-1 min-w-0 mr-2">
                                <div class="flex items-center gap-2">
                                    <span class="text-lg" aria-hidden="true">
                                        {{ file.status === 'migrating' ? '⏳' : '⏸️' }}
                                    </span>
                                    <div class="flex-1 min-w-0">
                                        <p class="text-sm font-medium text-[#4E3B2B] truncate">{{ file.filename }}</p>
                                        <p class="text-xs text-[#7D5A36]/70">{{ file.summaryDate }}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Completed Files -->
                <div v-if="completedFiles.length > 0">
                    <h5 class="text-sm font-semibold text-[#7D5A36]/80 mb-2">
                        ✓ Completed ({{ completedFiles.length }})
                    </h5>
                    <div class="space-y-2">
                        <div
                            v-for="(file, index) in completedFiles"
                            :key="'completed-' + index"
                            class="flex items-center justify-between p-2 rounded-lg transition-colors"
                            :class="{
                                'bg-green-500/10': file.status === 'success',
                                'bg-orange-500/10': file.status === 'failed'
                            }"
                        >
                            <div class="flex-1 min-w-0 mr-2">
                                <div class="flex items-center gap-2">
                                    <span class="text-lg" aria-hidden="true">
                                        {{ file.status === 'success' ? '✅' : '❌' }}
                                    </span>
                                    <div class="flex-1 min-w-0">
                                        <p class="text-sm font-medium text-[#4E3B2B] truncate">{{ file.filename }}</p>
                                        <p class="text-xs text-[#7D5A36]/70">{{ file.summaryDate }}</p>
                                        <p v-if="file.error" class="text-xs text-red-600 mt-1">{{ file.error }}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Migration Complete -->
        <div v-else-if="progress.status === 'completed'" class="space-y-4">
            <div class="glass-effect p-4 rounded-xl border border-green-500/30 bg-green-500/5" role="status" aria-live="polite">
                <div class="flex items-start gap-3">
                    <span class="text-2xl" aria-hidden="true">🎉</span>
                    <div class="flex-1">
                        <p class="font-semibold text-[#4E3B2B]">Migration completed!</p>
                        <p class="text-sm text-[#7D5A36]/80 mt-1">
                            Successfully migrated {{ progress.processed }} file{{ progress.processed === 1 ? '' : 's' }}.
                        </p>
                    </div>
                </div>
            </div>

            <div v-if="progress.failed > 0" class="glass-effect p-4 rounded-xl border border-orange-500/30 bg-orange-500/5" role="alert">
                <p class="font-semibold text-[#4E3B2B] mb-1"><span aria-hidden="true">⚠️</span> Partial Migration</p>
                <p class="text-sm text-[#7D5A36]/80">
                    {{ progress.failed }} file{{ progress.failed === 1 ? '' : 's' }} could not be migrated. Original data has been preserved.
                </p>
            </div>

            <!-- Detailed File List with Retry -->
            <div v-if="progress.files.length > 0" class="glass-effect p-4 rounded-xl max-h-96 overflow-y-auto scroll-smooth">
                <h4 class="font-semibold text-[#4E3B2B] mb-3 flex items-center gap-2">
                    <span aria-hidden="true">📋</span>
                    Migration Results
                </h4>
                <div class="space-y-2">
                    <div
                        v-for="(file, index) in progress.files"
                        :key="index"
                        class="flex items-center justify-between p-2 rounded-lg transition-all"
                        :class="{
                            'bg-green-500/10': file.status === 'success',
                            'bg-orange-500/10': file.status === 'failed'
                        }"
                    >
                        <div class="flex-1 min-w-0 mr-2">
                            <div class="flex items-center gap-2">
                                <span class="text-lg" aria-hidden="true">
                                    {{ file.status === 'success' ? '✅' : '❌' }}
                                </span>
                                <div class="flex-1 min-w-0">
                                    <p class="text-sm font-medium text-[#4E3B2B] truncate">{{ file.filename }}</p>
                                    <p class="text-xs text-[#7D5A36]/70">{{ file.summaryDate }}</p>
                                    <p v-if="file.error" class="text-xs text-red-600 mt-1">{{ file.error }}</p>
                                </div>
                            </div>
                        </div>
                        <button
                            v-if="file.status === 'failed'"
                            @click="handleRetry(file)"
                            class="px-3 py-2 bg-[#7D5A36] text-white text-xs rounded-lg hover:bg-[#6B4A2E] transition-all hover-lift flex items-center gap-1.5 font-semibold warm-shadow"
                            aria-label="Retry migration for this file"
                            title="Retry this file"
                        >
                            <span aria-hidden="true">🔄</span>
                            Retry
                        </button>
                    </div>
                </div>
            </div>

            <button
                @click="resetProgress"
                class="w-full px-6 py-3 glass-effect border border-[#D3C9A6]/60 text-[#4E3B2B] rounded-xl hover-lift transition-all duration-200 font-semibold"
                aria-label="Close migration results"
            >
                Close
            </button>
        </div>

        <!-- Migration Error -->
        <div v-else-if="progress.status === 'error'" class="space-y-4">
            <div class="glass-effect p-4 rounded-xl border border-red-500/30 bg-red-500/5" role="alert">
                <div class="flex items-start gap-3">
                    <span class="text-2xl" aria-hidden="true">❌</span>
                    <div class="flex-1">
                        <p class="font-semibold text-[#4E3B2B]">Migration failed</p>
                        <p class="text-sm text-[#7D5A36]/80 mt-1">
                            An error occurred during migration. Your data has not been modified.
                        </p>
                    </div>
                </div>
            </div>

            <button
                @click="resetProgress"
                class="w-full px-6 py-3 glass-effect border border-[#D3C9A6]/60 text-[#4E3B2B] rounded-xl hover-lift transition-all duration-200 font-semibold"
                aria-label="Retry migration"
            >
                Try Again
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, nextTick, onBeforeUnmount } from 'vue'
import { useDataMigration } from '@/composables/useDataMigration'
import type { MigrationFileInfo } from '@/composables/useDataMigration'

const { progress, migrateAllData, needsMigration, scanForDataUrls, resetProgress, retryFile } = useDataMigration()

// Track start time and calculate ETA
const migrationStartTime = ref<number>(0)
const estimatedTimeRemaining = computed(() => {
    if (progress.value.status !== 'running' || progress.value.processed === 0) return null

    const elapsed = Date.now() - migrationStartTime.value
    const avgTimePerFile = elapsed / progress.value.processed
    const remaining = progress.value.total - progress.value.processed
    const estimatedMs = avgTimePerFile * remaining

    if (estimatedMs < 1000) return 'Less than a second'
    if (estimatedMs < 60000) return `About ${Math.ceil(estimatedMs / 1000)} seconds`
    return `About ${Math.ceil(estimatedMs / 60000)} minute${Math.ceil(estimatedMs / 60000) > 1 ? 's' : ''}`
})

// Group files by status
const pendingFiles = computed(() =>
    progress.value.files.filter(f => f.status === 'pending' || f.status === 'migrating')
)
const completedFiles = computed(() =>
    progress.value.files.filter(f => f.status === 'success' || f.status === 'failed')
)

// Refs for auto-scroll
const fileListRef = ref<HTMLElement | null>(null)

// Watch for active file changes and scroll to it
const stopWatch = watch(() => progress.value.files.find(f => f.status === 'migrating'), async (activeFile) => {
    if (activeFile && fileListRef.value) {
        await nextTick()
        const activeElement = fileListRef.value.querySelector('.active-migrating-file')
        activeElement?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
})

onBeforeUnmount(() => {
    stopWatch()
})

const startMigration = async () => {
    migrationStartTime.value = Date.now()
    await migrateAllData()
}

const handleRetry = async (fileInfo: MigrationFileInfo) => {
    await retryFile(fileInfo)
}

</script>

<style scoped>
@keyframes spin {
    from {
        transform: rotate(0deg);
    }
    to {
        transform: rotate(360deg);
    }
}

.animate-spin {
    animation: spin 1s linear infinite;
}

@keyframes pulse-subtle {
    0%, 100% {
        opacity: 1;
        transform: scale(1);
    }
    50% {
        opacity: 0.95;
        transform: scale(1.01);
    }
}

.animate-pulse-subtle {
    animation: pulse-subtle 2s ease-in-out infinite;
}

@keyframes progress-pulse {
    0%, 100% {
        opacity: 1;
    }
    50% {
        opacity: 0.85;
    }
}

.progress-pulse {
    animation: progress-pulse 1.5s ease-in-out infinite;
}

.scroll-smooth {
    scroll-behavior: smooth;
}
</style>
