import { ref, computed, watch } from 'vue'
import { useStore } from 'vuex'
import { DaySummary } from '@/store/types'
import { useDebounce } from './usePerformance'

export function useSearch() {
  const store = useStore()
  const searchQuery = ref('')
  const searchFilters = ref({
    dateRange: { start: '', end: '' },
    mood: '',
    tags: [] as string[],
    hasMedia: false
  })

  const allSummaries = computed(() => store.state.daySummaries as DaySummary[])

  const filteredSummaries = computed(() => {
    let results = allSummaries.value

    // Text search
    if (searchQuery.value.trim()) {
      const query = searchQuery.value.toLowerCase()
      results = results.filter(summary => 
        summary.summary.toLowerCase().includes(query) ||
        summary.tags.some(tag => tag.toLowerCase().includes(query)) ||
        summary.comfortZoneEntry?.toLowerCase().includes(query) ||
        summary.customSections.some(section => 
          section.title.toLowerCase().includes(query) ||
          section.content.toLowerCase().includes(query)
        )
      )
    }

    // Date range filter
    if (searchFilters.value.dateRange.start) {
      results = results.filter(summary => 
        summary.date >= searchFilters.value.dateRange.start
      )
    }
    if (searchFilters.value.dateRange.end) {
      results = results.filter(summary => 
        summary.date <= searchFilters.value.dateRange.end
      )
    }

    // Mood filter
    if (searchFilters.value.mood) {
      results = results.filter(summary => 
        summary.mood === searchFilters.value.mood
      )
    }

    // Tags filter
    if (searchFilters.value.tags.length > 0) {
      results = results.filter(summary =>
        searchFilters.value.tags.some(tag => summary.tags.includes(tag))
      )
    }

    // Media filter
    if (searchFilters.value.hasMedia) {
      results = results.filter(summary => 
        summary.media && summary.media.length > 0
      )
    }

    return results.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  })

  const debouncedSearch = useDebounce((query: string) => {
    searchQuery.value = query
  }, 300)

  const clearFilters = () => {
    searchQuery.value = ''
    searchFilters.value = {
      dateRange: { start: '', end: '' },
      mood: '',
      tags: [],
      hasMedia: false
    }
  }

  const availableTags = computed(() => {
    const tagSet = new Set<string>()
    allSummaries.value.forEach(summary => {
      summary.tags.forEach(tag => tagSet.add(tag))
    })
    return Array.from(tagSet).sort()
  })

  const searchStats = computed(() => ({
    totalEntries: allSummaries.value.length,
    filteredEntries: filteredSummaries.value.length,
    totalWords: filteredSummaries.value.reduce((sum, summary) => 
      sum + (summary.summary ? summary.summary.split(/\s+/).filter(word => word.length > 0).length : 0), 0
    ),
    dateRange: filteredSummaries.value.length > 0 ? {
      earliest: filteredSummaries.value[filteredSummaries.value.length - 1]?.date,
      latest: filteredSummaries.value[0]?.date
    } : null
  }))

  return {
    searchQuery,
    searchFilters,
    filteredSummaries,
    debouncedSearch,
    clearFilters,
    availableTags,
    searchStats
  }
}