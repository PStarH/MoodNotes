<template>
  <div
    ref="panelRef"
    class="search-panel glass-effect rounded-2xl p-6 warm-shadow-lg fade-in"
    role="dialog"
    aria-labelledby="search-panel-title"
    aria-modal="true"
    :aria-describedby="searchHint ? 'search-panel-hint' : undefined"
  >
    <!-- Search Header -->
    <div class="flex justify-between items-center mb-6">
      <h2 id="search-panel-title" class="text-2xl font-bold text-[#4E3B2B] flex items-center">
        <span class="mr-3" aria-hidden="true">🔍</span>Search & Filter
      </h2>
      <button
        type="button"
        id="search-panel-close"
        @click="$emit('close')"
        class="text-[#7D5A36] hover:text-opacity-80 p-2 hover:bg-[#7D5A36] hover:bg-opacity-10 rounded-lg transition-all"
        aria-label="Close search panel"
      >
        <X :size="24" aria-hidden="true" />
      </button>
    </div>

    <!-- Search Input -->
    <div class="mb-6">
      <label for="search-input" class="sr-only">Search diary entries</label>
      <div class="relative">
        <input
          id="search-input"
          v-model="searchInput"
          @input="handleSearch"
          type="text"
          placeholder="Search your diary entries..."
          class="w-full px-4 py-3 pl-12 glass-effect text-[#4E3B2B] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7D5A36] transition-all"
          aria-label="Search diary entries"
        />
        <Search class="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#7D5A36]" :size="20" aria-hidden="true" />
      </div>
    </div>

    <!-- Filters -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6" role="group" aria-label="Search filters">
      <!-- Date Range -->
      <div class="space-y-2">
        <label for="date-start" class="block text-sm font-semibold text-[#4E3B2B]">Date Range</label>
        <div class="space-y-2">
          <input
            id="date-start"
            v-model="searchFilters.dateRange.start"
            type="date"
            class="w-full px-3 py-2 glass-effect text-[#4E3B2B] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7D5A36] transition-all"
            aria-label="Start date"
          />
          <input
            id="date-end"
            v-model="searchFilters.dateRange.end"
            type="date"
            class="w-full px-3 py-2 glass-effect text-[#4E3B2B] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7D5A36] transition-all"
            aria-label="End date"
          />
        </div>
      </div>

      <!-- Mood Filter -->
      <div class="space-y-2">
        <label for="mood-filter" class="block text-sm font-semibold text-[#4E3B2B]">Mood</label>
        <select
          id="mood-filter"
          v-model="searchFilters.mood"
          class="themed-select w-full text-[#4E3B2B]"
          aria-label="Filter by mood"
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
        <label id="tags-filter-label" class="block text-sm font-semibold text-[#4E3B2B]">Tags</label>
        <div class="space-y-3" role="group" aria-labelledby="tags-filter-label">
          <div class="relative">
            <input
              id="tags-autocomplete"
              v-model="tagQuery"
                @keydown="handleTagInputKeydown"
              type="text"
              placeholder="Type to find tags..."
              class="w-full px-4 py-2 glass-effect text-[#4E3B2B] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7D5A36] transition-all"
              role="combobox"
              aria-autocomplete="list"
              :aria-expanded="matchingTags.length > 0"
              aria-controls="tag-suggestion-list"
              aria-describedby="tag-helper-text"
                :aria-activedescendant="activeTagId"
              autocomplete="off"
            />
            <ul
              v-if="matchingTags.length > 0"
              id="tag-suggestion-list"
              class="absolute left-0 right-0 mt-2 max-h-48 overflow-y-auto glass-effect rounded-xl border border-[#D3C9A6]/70 shadow-lg z-10"
              role="listbox"
            >
              <li
                  v-for="(tag, index) in matchingTags"
                  :key="tag"
                  role="option"
                  :id="`tag-option-${index}`"
                  :aria-selected="index === activeTagIndex"
                >
                <button
                  type="button"
                    class="w-full text-left px-4 py-2 text-sm text-[#4E3B2B] transition-colors"
                    :class="index === activeTagIndex ? 'bg-[#7D5A36]/15 font-semibold' : 'hover:bg-[#7D5A36]/10'"
                    @mousedown.prevent="handleTagSelection(tag)"
                    @click.prevent="handleTagSelection(tag)"
                    @mouseenter="setActiveTag(index)"
                    @focus="setActiveTag(index)"
                    :aria-label="`Add tag ${tag}`"
                  >
                    #{{ tag }}
                  </button>
              </li>
            </ul>
            <p v-else-if="tagQuery" class="absolute left-0 right-0 mt-2 px-4 py-2 text-xs text-[#7D5A36]/80 bg-[#FAF3E0] rounded-lg shadow" role="status">
              No matching tags yet.
            </p>
          </div>
            <p id="tag-helper-text" class="text-xs text-[#7D5A36]/70">Use ↑ ↓ to highlight a suggestion, then press Enter to add it.</p>
          <div v-if="searchFilters.tags.length > 0" class="flex flex-wrap gap-2">
            <span
              v-for="tag in searchFilters.tags"
              :key="tag"
              class="flex items-center gap-2 px-3 py-1.5 bg-[#7D5A36]/15 text-[#7D5A36] rounded-full text-xs font-medium"
            >
              #{{ tag }}
              <button
                type="button"
                class="text-[#7D5A36] hover:text-[#4E3B2B]"
                @click="removeTag(tag)"
                :aria-label="`Remove tag ${tag}`"
              >
                <X :size="14" aria-hidden="true" />
              </button>
            </span>
          </div>
          <div v-else class="text-xs text-[#7D5A36]/70">No tag filters applied.</div>
          <p class="text-xs text-[#7D5A36]/70" aria-live="polite">Applied tags: {{ searchFilters.tags.length }}</p>
        </div>
      </div>
    </div>

    <p
      v-if="searchHint"
      id="search-panel-hint"
      class="-mt-2 mb-6 text-xs text-[#7D5A36]/80"
      role="status"
      aria-live="polite"
    >
      {{ searchHint }}
    </p>

    <!-- Additional Filters -->
    <div class="flex flex-wrap gap-4 mb-6" role="group" aria-label="Additional filters">
      <label class="flex items-center space-x-2 cursor-pointer">
        <input
          id="has-media-filter"
          type="checkbox"
          v-model="searchFilters.hasMedia"
          class="text-[#7D5A36] rounded"
          aria-label="Filter entries with media"
        />
        <span class="text-sm text-[#4E3B2B] font-medium">Has Media</span>
      </label>
    </div>

    <!-- Search Stats -->
    <div class="glass-effect p-4 rounded-xl mb-6 warm-shadow" role="region" aria-labelledby="search-stats-title" aria-live="polite">
      <h3 id="search-stats-title" class="text-lg font-semibold text-[#4E3B2B] mb-3 flex items-center">
        <span class="mr-2" aria-hidden="true">📊</span>Search Results
      </h3>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        <div>
          <p class="text-2xl font-bold text-[#7D5A36]" aria-label="Number of entries found">{{ searchStats.filteredEntries }}</p>
          <p class="text-sm text-[#4E3B2B]">Entries Found</p>
        </div>
        <div>
          <p class="text-2xl font-bold text-[#7D5A36]" aria-label="Total word count">{{ searchStats.totalWords }}</p>
          <p class="text-sm text-[#4E3B2B]">Total Words</p>
        </div>
        <div>
          <p class="text-2xl font-bold text-[#7D5A36]" aria-label="Unique tag count">{{ searchStats.tagCount }}</p>
          <p class="text-sm text-[#4E3B2B]">Unique Tags</p>
        </div>
        <div>
          <p class="text-sm font-bold text-[#7D5A36]" aria-label="Date range span">{{ searchStats.dateRange ? searchStats.dateSpanLabel : '—' }}</p>
          <p class="text-sm text-[#4E3B2B]">Time Span</p>
          <p v-if="searchStats.dateRange" class="text-xs text-[#7D5A36]/80 mt-1" aria-label="Date range details">
            {{ formatDate(searchStats.dateRange.earliest) }} → {{ formatDate(searchStats.dateRange.latest) }}
          </p>
        </div>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="flex justify-end space-x-3" role="group" aria-label="Search actions">
      <button
        type="button"
        @click="handleClearFilters"
        class="px-4 py-2 bg-gray-300 text-gray-700 rounded-xl hover:bg-gray-400 transition-all duration-200 font-semibold"
        aria-label="Clear all search filters"
      >
        Clear All
      </button>
      <button
        type="button"
        @click="$emit('apply-search', { query: searchQuery, filters: searchFilters })"
        class="px-6 py-2 bg-gradient-to-r from-[#7D5A36] to-[#6B4A2E] text-white rounded-xl hover-lift transition-all duration-200 font-semibold warm-shadow"
        aria-label="Apply search filters"
      >
        Apply Search
      </button>
    </div>

    <!-- Results Preview -->
    <div v-if="filteredSummaries.length > 0" class="mt-6">
      <h3 id="results-preview-title" class="text-lg font-semibold text-[#4E3B2B] mb-4 flex items-center">
        <span class="mr-2" aria-hidden="true">📋</span>Preview Results ({{ filteredSummaries.length }})
      </h3>
      <DynamicScroller
        :items="filteredSummaries"
        :min-item-size="120"
        class="max-h-80 custom-scrollbar"
        key-field="date"
        :buffer="200"
        role="list"
        aria-labelledby="results-preview-title"
      >
        <template #default="{ item: summary, index, active }">
          <DynamicScrollerItem
            :item="summary"
            :active="active"
            :size-dependencies="[
              summary.summary,
              summary.tags?.length
            ]"
            :data-index="index"
            class="mb-3"
          >
            <div
              class="glass-effect p-4 rounded-lg hover-lift transition-all duration-200 cursor-pointer"
              role="listitem"
              tabindex="0"
              @click="$emit('select-entry', summary)"
              @keydown.enter="$emit('select-entry', summary)"
              @keydown.space.prevent="$emit('select-entry', summary)"
              :aria-label="`Entry from ${formatDate(summary.date)} with ${summary.mood} mood`"
            >
              <div class="flex justify-between items-start mb-2">
                <span class="font-semibold text-[#4E3B2B]">{{ formatDate(summary.date) }}</span>
                <span class="text-2xl" aria-hidden="true">{{ getMoodEmoji(summary.mood) }}</span>
              </div>
              <p class="text-sm text-[#7D5A36] line-clamp-2">{{ getPreviewText(summary.summary) }}</p>
              <div v-if="summary.tags.length > 0" class="flex flex-wrap gap-1 mt-2">
                <span
                  v-for="tag in summary.tags.slice(0, 3)"
                  :key="tag"
                  class="px-2 py-1 bg-[#7D5A36] bg-opacity-20 text-[#7D5A36] text-xs rounded-full"
                  :aria-label="`Tag: ${tag}`"
                >
                  {{ tag }}
                </span>
                <span v-if="summary.tags.length > 3" class="text-xs text-[#7D5A36]">
                  +{{ summary.tags.length - 3 }} more
                </span>
              </div>
            </div>
          </DynamicScrollerItem>
        </template>
      </DynamicScroller>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { X, Search } from 'lucide-vue-next'
import { useSearch } from '@/composables/useSearch'
import { useModalFocus } from '@/composables/useFocusTrap'

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

const { containerRef: panelRef } = useModalFocus({ initialFocus: '#search-input', returnFocus: true, onEscape: () => emit('close') })
const searchInput = ref('')
const tagQuery = ref('')
const activeTagIndex = ref(-1)

const matchingTags = computed(() => {
  const query = tagQuery.value.trim().toLowerCase()
  const exclude = new Set(searchFilters.value.tags)

  if (!query) {
    return []
  }

  return availableTags.value
    .filter(tag => !exclude.has(tag))
    .filter(tag => tag.toLowerCase().includes(query))
    .slice(0, 8)
})

const activeTagId = computed(() => {
  return activeTagIndex.value >= 0 ? `tag-option-${activeTagIndex.value}` : undefined
})

watch(matchingTags, tags => {
  activeTagIndex.value = tags.length > 0 ? 0 : -1
})

watch(tagQuery, value => {
  if (!value.trim()) {
    activeTagIndex.value = -1
  }
})

const handleSearch = (event: Event) => {
  const target = event.target as HTMLInputElement
  debouncedSearch(target.value)
}

const resolveTagName = (input: string) => {
  const normalized = input.trim().toLowerCase()
  return availableTags.value.find(tag => tag.toLowerCase() === normalized) || null
}

const addTagFilter = (tag: string) => {
  if (!tag) return
  if (searchFilters.value.tags.includes(tag)) return
  searchFilters.value.tags = [...searchFilters.value.tags, tag]
}

const handleTagSelection = (tag: string) => {
  addTagFilter(tag)
  tagQuery.value = ''
  activeTagIndex.value = -1
}

const handleTagSubmit = () => {
  if (!tagQuery.value.trim()) return
  const matched = resolveTagName(tagQuery.value) || matchingTags.value[0]
  if (matched) {
    addTagFilter(matched)
  }
  tagQuery.value = ''
  activeTagIndex.value = -1
}

const removeTag = (tag: string) => {
  searchFilters.value.tags = searchFilters.value.tags.filter(existing => existing !== tag)
}

const handleClearFilters = () => {
  clearFilters()
  tagQuery.value = ''
  searchInput.value = ''
  activeTagIndex.value = -1
}

const handleTagInputKeydown = (event: KeyboardEvent) => {
  const hasSuggestions = matchingTags.value.length > 0

  switch (event.key) {
    case 'ArrowDown':
      if (!hasSuggestions) return
      event.preventDefault()
      activeTagIndex.value = (activeTagIndex.value + 1) % matchingTags.value.length
      break
    case 'ArrowUp':
      if (!hasSuggestions) return
      event.preventDefault()
      activeTagIndex.value =
        activeTagIndex.value <= 0 ? matchingTags.value.length - 1 : activeTagIndex.value - 1
      break
    case 'Enter':
      event.preventDefault()
      if (hasSuggestions && activeTagIndex.value >= 0) {
        handleTagSelection(matchingTags.value[activeTagIndex.value])
      } else {
        handleTagSubmit()
      }
      break
    case 'Tab':
      if (hasSuggestions && activeTagIndex.value >= 0) {
        handleTagSelection(matchingTags.value[activeTagIndex.value])
      } else if (!hasSuggestions && tagQuery.value.trim()) {
        handleTagSubmit()
      }
      break
    case 'Escape':
      if (tagQuery.value) {
        event.preventDefault()
        tagQuery.value = ''
        activeTagIndex.value = -1
      }
      break
    default:
      break
  }
}

const setActiveTag = (index: number) => {
  activeTagIndex.value = index
}

const formatDate = (dateString?: string) => {
  if (!dateString) return '—'
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

const searchHint = computed(() => {
  const stats = searchStats.value
  if (!stats) return ''

  if (stats.filteredEntries === 0) {
    return 'No entries match yet — try broadening the filters or date range.'
  }

  const parts: string[] = []
  parts.push(`${stats.filteredEntries} ${stats.filteredEntries === 1 ? 'entry' : 'entries'}`)
  parts.push(`${stats.tagCount} unique ${stats.tagCount === 1 ? 'tag' : 'tags'}`)

  if (stats.appliedTagCount > 0) {
    parts.push(`${stats.appliedTagCount} active tag filter${stats.appliedTagCount === 1 ? '' : 's'}`)
  }

  if (stats.dateSpanLabel && stats.dateRange) {
    parts.push(stats.dateSpanLabel)
  }

  return `Showing ${parts.join(' • ')}`
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  line-clamp: 2;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>