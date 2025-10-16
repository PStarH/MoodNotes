<template>
  <div class="search-panel glass-effect rounded-2xl p-6 warm-shadow-lg fade-in">
    <!-- Search Header -->
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold text-[#4E3B2B] flex items-center">
        <span class="mr-3">🔍</span>Search & Filter
      </h2>
      <button @click="$emit('close')" 
              class="text-[#7D5A36] hover:text-opacity-80 p-2 hover:bg-[#7D5A36] hover:bg-opacity-10 rounded-lg transition-all">
        <X :size="24" />
      </button>
    </div>

    <!-- Search Input -->
    <div class="mb-6">
      <div class="relative">
        <input
          v-model="searchInput"
          @input="handleSearch"
          type="text"
          placeholder="Search your diary entries..."
          class="w-full px-4 py-3 pl-12 glass-effect text-[#4E3B2B] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7D5A36] transition-all"
        />
        <Search class="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#7D5A36]" :size="20" />
      </div>
    </div>

    <!-- Filters -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      <!-- Date Range -->
      <div class="space-y-2">
        <label class="block text-sm font-semibold text-[#4E3B2B]">Date Range</label>
        <div class="space-y-2">
          <input
            v-model="searchFilters.dateRange.start"
            type="date"
            class="w-full px-3 py-2 glass-effect text-[#4E3B2B] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7D5A36] transition-all"
          />
          <input
            v-model="searchFilters.dateRange.end"
            type="date"
            class="w-full px-3 py-2 glass-effect text-[#4E3B2B] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7D5A36] transition-all"
          />
        </div>
      </div>

      <!-- Mood Filter -->
      <div class="space-y-2">
        <label class="block text-sm font-semibold text-[#4E3B2B]">Mood</label>
        <select
          v-model="searchFilters.mood"
          class="w-full px-3 py-2 glass-effect text-[#4E3B2B] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7D5A36] transition-all"
        >
          <option value="">All Moods</option>
          <option value="happy">😄 Happy</option>
          <option value="neutral">😐 Neutral</option>
          <option value="sad">😢 Sad</option>
          <option value="excited">🎉 Excited</option>
          <option value="angry">😠 Angry</option>
        </select>
      </div>

      <!-- Tags Filter -->
      <div class="space-y-2">
        <label class="block text-sm font-semibold text-[#4E3B2B]">Tags</label>
        <div class="max-h-32 overflow-y-auto custom-scrollbar">
          <div v-for="tag in availableTags" :key="tag" class="flex items-center space-x-2 py-1">
            <input
              type="checkbox"
              :id="`tag-${tag}`"
              :value="tag"
              v-model="searchFilters.tags"
              class="text-[#7D5A36] rounded"
            />
            <label :for="`tag-${tag}`" class="text-sm text-[#4E3B2B] cursor-pointer">{{ tag }}</label>
          </div>
        </div>
      </div>
    </div>

    <!-- Additional Filters -->
    <div class="flex flex-wrap gap-4 mb-6">
      <label class="flex items-center space-x-2 cursor-pointer">
        <input
          type="checkbox"
          v-model="searchFilters.hasMedia"
          class="text-[#7D5A36] rounded"
        />
        <span class="text-sm text-[#4E3B2B] font-medium">Has Media</span>
      </label>
    </div>

    <!-- Search Stats -->
    <div class="glass-effect p-4 rounded-xl mb-6 warm-shadow">
      <h3 class="text-lg font-semibold text-[#4E3B2B] mb-3 flex items-center">
        <span class="mr-2">📊</span>Search Results
      </h3>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        <div>
          <p class="text-2xl font-bold text-[#7D5A36]">{{ searchStats.filteredEntries }}</p>
          <p class="text-sm text-[#4E3B2B]">Entries Found</p>
        </div>
        <div>
          <p class="text-2xl font-bold text-[#7D5A36]">{{ searchStats.totalWords }}</p>
          <p class="text-sm text-[#4E3B2B]">Total Words</p>
        </div>
        <div v-if="searchStats.dateRange">
          <p class="text-sm font-bold text-[#7D5A36]">{{ formatDate(searchStats.dateRange.earliest) }}</p>
          <p class="text-sm text-[#4E3B2B]">Earliest</p>
        </div>
        <div v-if="searchStats.dateRange">
          <p class="text-sm font-bold text-[#7D5A36]">{{ formatDate(searchStats.dateRange.latest) }}</p>
          <p class="text-sm text-[#4E3B2B]">Latest</p>
        </div>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="flex justify-end space-x-3">
      <button
        @click="clearFilters"
        class="px-4 py-2 bg-gray-300 text-gray-700 rounded-xl hover:bg-gray-400 transition-all duration-200 font-semibold"
      >
        Clear All
      </button>
      <button
        @click="$emit('apply-search', { query: searchQuery, filters: searchFilters })"
        class="px-6 py-2 bg-gradient-to-r from-[#7D5A36] to-[#6B4A2E] text-white rounded-xl hover-lift transition-all duration-200 font-semibold warm-shadow"
      >
        Apply Search
      </button>
    </div>

    <!-- Results Preview -->
    <div v-if="filteredSummaries.length > 0" class="mt-6">
      <h3 class="text-lg font-semibold text-[#4E3B2B] mb-4 flex items-center">
        <span class="mr-2">📋</span>Preview Results ({{ Math.min(5, filteredSummaries.length) }} of {{ filteredSummaries.length }})
      </h3>
      <div class="space-y-3 max-h-80 overflow-y-auto custom-scrollbar">
        <div
          v-for="summary in filteredSummaries.slice(0, 5)"
          :key="summary.date"
          class="glass-effect p-4 rounded-lg hover-lift transition-all duration-200 cursor-pointer"
          @click="$emit('select-entry', summary)"
        >
          <div class="flex justify-between items-start mb-2">
            <span class="font-semibold text-[#4E3B2B]">{{ formatDate(summary.date) }}</span>
            <span class="text-2xl">{{ getMoodEmoji(summary.mood) }}</span>
          </div>
          <p class="text-sm text-[#7D5A36] line-clamp-2">{{ getPreviewText(summary.summary) }}</p>
          <div v-if="summary.tags.length > 0" class="flex flex-wrap gap-1 mt-2">
            <span
              v-for="tag in summary.tags.slice(0, 3)"
              :key="tag"
              class="px-2 py-1 bg-[#7D5A36] bg-opacity-20 text-[#7D5A36] text-xs rounded-full"
            >
              {{ tag }}
            </span>
            <span v-if="summary.tags.length > 3" class="text-xs text-[#7D5A36]">
              +{{ summary.tags.length - 3 }} more
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { X, Search } from 'lucide-vue-next'
import { useSearch } from '@/composables/useSearch'
import { DaySummary } from '@/store/types'

const emit = defineEmits(['close', 'apply-search', 'select-entry'])

const {
  searchQuery,
  searchFilters,
  filteredSummaries,
  debouncedSearch,
  clearFilters,
  availableTags,
  searchStats
} = useSearch()

const searchInput = ref('')

const handleSearch = (event: Event) => {
  const target = event.target as HTMLInputElement
  debouncedSearch(target.value)
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const getMoodEmoji = (mood: string) => {
  const moodEmojis: Record<string, string> = {
    happy: '😄',
    neutral: '😐',
    sad: '😢',
    excited: '🎉',
    angry: '😠'
  }
  return moodEmojis[mood] || '😐'
}

const getPreviewText = (text: string) => {
  if (!text) return 'No content'
  const plainText = text.replace(/<[^>]*>/g, '').trim()
  return plainText.length > 100 ? plainText.substring(0, 100) + '...' : plainText
}

// Watch for filter changes and apply them automatically
watch([searchFilters], () => {
  // Filters are already reactive through the useSearch composable
}, { deep: true })
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>