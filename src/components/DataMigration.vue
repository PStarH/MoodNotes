<template>
    <div class="glass-effect p-6 rounded-2xl warm-shadow">
        <div class="mb-4">
            <h3 class="text-xl font-bold text-[#4E3B2B] flex items-center gap-2">
                <span>🔄</span>
                Data Migration
            </h3>
            <p class="text-sm text-[#7D5A36]/80 mt-2">
                Migrate legacy data URLs to the new file system for better performance and reliability.
            </p>
        </div>

        <!-- Migration Status -->
        <div v-if="!needsMigration() && progress.status === 'idle'" class="glass-effect p-4 rounded-xl border border-green-500/30 bg-green-500/5">
            <div class="flex items-start gap-3">
                <span class="text-2xl">✅</span>
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
            <div class="glass-effect p-4 rounded-xl border border-[#7D5A36]/30">
                <div class="flex items-start gap-3">
                    <span class="text-2xl">⚠️</span>
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
            >
                <span>🚀</span>
                Start Migration
            </button>
        </div>

        <!-- Migration In Progress -->
        <div v-else-if="progress.status === 'running'" class="space-y-4">
            <div class="glass-effect p-4 rounded-xl">
                <div class="flex items-center gap-3 mb-3">
                    <div class="animate-spin text-2xl">⚙️</div>
                    <div class="flex-1">
                        <p class="font-semibold text-[#4E3B2B]">Migration in progress...</p>
                        <p class="text-sm text-[#7D5A36]/80 mt-1">{{ progress.currentFile }}</p>
                    </div>
                </div>

                <!-- Progress Bar -->
                <div class="relative w-full h-3 bg-[#D3C9A6]/30 rounded-full overflow-hidden">
                    <div
                        class="absolute top-0 left-0 h-full bg-gradient-to-r from-[#7D5A36] to-[#6B4A2E] transition-all duration-300"
                        :style="{ width: `${(progress.processed / progress.total) * 100}%` }"
                    ></div>
                </div>

                <div class="flex justify-between text-sm text-[#7D5A36]/80 mt-2">
                    <span>{{ progress.processed }} / {{ progress.total }} files</span>
                    <span>{{ Math.round((progress.processed / progress.total) * 100) }}%</span>
                </div>
            </div>

            <div v-if="progress.failed > 0" class="glass-effect p-3 rounded-xl border border-orange-500/30 bg-orange-500/5">
                <p class="text-sm text-[#7D5A36]">
                    ⚠️ {{ progress.failed }} file{{ progress.failed === 1 ? '' : 's' }} failed to migrate
                </p>
            </div>
        </div>

        <!-- Migration Complete -->
        <div v-else-if="progress.status === 'completed'" class="space-y-4">
            <div class="glass-effect p-4 rounded-xl border border-green-500/30 bg-green-500/5">
                <div class="flex items-start gap-3">
                    <span class="text-2xl">🎉</span>
                    <div class="flex-1">
                        <p class="font-semibold text-[#4E3B2B]">Migration completed!</p>
                        <p class="text-sm text-[#7D5A36]/80 mt-1">
                            Successfully migrated {{ progress.processed }} file{{ progress.processed === 1 ? '' : 's' }}.
                        </p>
                    </div>
                </div>
            </div>

            <div v-if="progress.failed > 0" class="glass-effect p-4 rounded-xl border border-orange-500/30 bg-orange-500/5">
                <p class="font-semibold text-[#4E3B2B] mb-1">⚠️ Partial Migration</p>
                <p class="text-sm text-[#7D5A36]/80">
                    {{ progress.failed }} file{{ progress.failed === 1 ? '' : 's' }} could not be migrated. Original data has been preserved.
                </p>
            </div>

            <button
                @click="resetProgress"
                class="w-full px-6 py-3 glass-effect border border-[#D3C9A6]/60 text-[#4E3B2B] rounded-xl hover-lift transition-all duration-200 font-semibold"
            >
                Close
            </button>
        </div>

        <!-- Migration Error -->
        <div v-else-if="progress.status === 'error'" class="space-y-4">
            <div class="glass-effect p-4 rounded-xl border border-red-500/30 bg-red-500/5">
                <div class="flex items-start gap-3">
                    <span class="text-2xl">❌</span>
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
            >
                Try Again
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useDataMigration } from '@/composables/useDataMigration'

const { progress, migrateAllData, needsMigration, scanForDataUrls, resetProgress } = useDataMigration()

const startMigration = async () => {
    await migrateAllData()
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
</style>
