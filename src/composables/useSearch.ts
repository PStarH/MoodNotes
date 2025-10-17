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
      results = results.filter(summary => {
        const summaryText = summary.summary ? summary.summary.toLowerCase() : ''
        const tagsMatch = (summary.tags || []).some(tag => tag.toLowerCase().includes(query))
        const comfortZone = summary.comfortZoneEntry ? summary.comfortZoneEntry.toLowerCase() : ''
        const sectionsMatch = (summary.customSections || []).some(section => {
          const title = section.title ? section.title.toLowerCase() : ''
          const content = section.content ? section.content.toLowerCase() : ''
          return title.includes(query) || content.includes(query)
        })
        return summaryText.includes(query) || tagsMatch || comfortZone.includes(query) || sectionsMatch
      })
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

  const searchStats = computed(() => {
    const filtered = filteredSummaries.value
    const totalWords = filtered.reduce((sum, summary) => {
      if (!summary.summary) return sum
      return sum + summary.summary.split(/\s+/).filter(word => word.length > 0).length
    }, 0)

    const tagSet = new Set<string>()
    filtered.forEach(summary => {
      (summary.tags || []).forEach(tag => tagSet.add(tag))
    })

    let dateSpanDays = 0
    let dateSpanLabel = '—'
    let earliest: string | undefined
    let latest: string | undefined

    if (filtered.length > 0) {
      earliest = filtered[filtered.length - 1]?.date
      latest = filtered[0]?.date

      const earliestDate = earliest ? new Date(earliest) : null
      const latestDate = latest ? new Date(latest) : null

      if (earliestDate && latestDate) {
        earliestDate.setHours(0, 0, 0, 0)
        latestDate.setHours(0, 0, 0, 0)
        const diff = Math.abs(latestDate.getTime() - earliestDate.getTime())
        dateSpanDays = Math.floor(diff / (1000 * 60 * 60 * 24)) + 1
        dateSpanLabel = dateSpanDays === 1 ? '1 day' : `${dateSpanDays} days`
      }
    }

    return {
      totalEntries: allSummaries.value.length,
      filteredEntries: filtered.length,
      totalWords,
      dateRange: filtered.length > 0 ? { earliest, latest } : null,
      tagCount: tagSet.size,
      appliedTagCount: searchFilters.value.tags.length,
      dateSpanDays,
      dateSpanLabel
    }
  })

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