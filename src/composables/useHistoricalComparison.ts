import { computed, Ref } from 'vue'
import { useStore } from 'vuex'
import { DaySummary } from '@/store/types'

/**
 * Composable for comparing current day with the same day last year
 * Provides historical data and comparison utilities
 */
export function useHistoricalComparison(currentDate: Ref<Date> | Date) {
  const store = useStore()

  /**
   * Get the date from one year ago
   */
  const lastYearDate = computed(() => {
    const date = currentDate instanceof Date ? currentDate : currentDate.value
    const lastYear = new Date(date)
    lastYear.setFullYear(lastYear.getFullYear() - 1)
    return lastYear
  })

  /**
   * Format date to ISO string (YYYY-MM-DD)
   */
  const formatDateString = (date: Date): string => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  /**
   * Get the day summary from last year
   */
  const lastYearSummary = computed((): DaySummary | undefined => {
    const dateString = formatDateString(lastYearDate.value)
    return store.getters.getDaySummary(dateString)
  })

  /**
   * Check if historical data exists
   */
  const hasHistoricalData = computed(() => {
    return lastYearSummary.value !== undefined
  })

  /**
   * Get formatted date string for display
   */
  const lastYearDateString = computed(() => {
    return formatDateString(lastYearDate.value)
  })

  /**
   * Get mood emoji from last year
   */
  const lastYearMood = computed(() => {
    if (!lastYearSummary.value) return null
    return lastYearSummary.value.mood || null
  })

  /**
   * Get tags from last year
   */
  const lastYearTags = computed(() => {
    if (!lastYearSummary.value) return []
    return lastYearSummary.value.tags || []
  })

  /**
   * Get summary text from last year (first 150 chars)
   */
  const lastYearSummaryPreview = computed(() => {
    if (!lastYearSummary.value || !lastYearSummary.value.summary) return ''

    // Strip HTML tags for preview
    const tmp = document.createElement('DIV')
    tmp.innerHTML = lastYearSummary.value.summary
    const text = tmp.textContent || tmp.innerText || ''

    return text.substring(0, 150) + (text.length > 150 ? '...' : '')
  })

  /**
   * Get daily check data from last year
   */
  const lastYearDailyCheck = computed(() => {
    if (!lastYearSummary.value) return null
    return lastYearSummary.value.dailyCheck || null
  })

  /**
   * Compare tags between current and last year
   * Returns { common: string[], added: string[], removed: string[] }
   */
  const compareTagsWithCurrent = (currentTags: string[]) => {
    const lastYear = new Set(lastYearTags.value)
    const current = new Set(currentTags)

    const common = currentTags.filter(tag => lastYear.has(tag))
    const added = currentTags.filter(tag => !lastYear.has(tag))
    const removed = lastYearTags.value.filter(tag => !current.has(tag))

    return { common, added, removed }
  }

  /**
   * Get comparison summary for display
   */
  const comparisonSummary = computed(() => {
    if (!hasHistoricalData.value) {
      return {
        exists: false,
        message: 'No entry from last year'
      }
    }

    return {
      exists: true,
      date: lastYearDateString.value,
      mood: lastYearMood.value,
      tags: lastYearTags.value,
      preview: lastYearSummaryPreview.value,
      dailyCheck: lastYearDailyCheck.value,
      fullSummary: lastYearSummary.value
    }
  })

  return {
    lastYearDate,
    lastYearSummary,
    hasHistoricalData,
    lastYearDateString,
    lastYearMood,
    lastYearTags,
    lastYearSummaryPreview,
    lastYearDailyCheck,
    compareTagsWithCurrent,
    comparisonSummary
  }
}
