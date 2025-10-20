import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import localforage from 'localforage'

export interface StorageStats {
  usage: number // Bytes used
  quota: number // Total bytes available
  usagePercent: number // Percentage used
  remaining: number // Bytes remaining
  isNearLimit: boolean // Above 75%
  isCritical: boolean // Above 90%
  estimate: StorageEstimate | null
}

export interface StorageBreakdown {
  daySummaries: number
  tasks: number
  habits: number
  sparks: number
  calendarEntries: number
  total: number
}

/**
 * Format bytes to human-readable format
 */
const formatBytes = (bytes: number, decimals = 2): string => {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB']

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

/**
 * Calculate approximate size of stored data
 */
const calculateDataSize = async (key: string): Promise<number> => {
  try {
    const data = await localforage.getItem(key)
    if (!data) return 0

    // Convert to JSON string to estimate size
    const jsonString = JSON.stringify(data)
    // Each character in JavaScript is 2 bytes (UTF-16)
    return jsonString.length * 2
  } catch (error) {
    console.error(`Failed to calculate size for ${key}:`, error)
    return 0
  }
}

export function useStorageMonitor() {
  const { t } = useI18n()

  const stats = ref<StorageStats>({
    usage: 0,
    quota: 0,
    usagePercent: 0,
    remaining: 0,
    isNearLimit: false,
    isCritical: false,
    estimate: null
  })

  const breakdown = ref<StorageBreakdown>({
    daySummaries: 0,
    tasks: 0,
    habits: 0,
    sparks: 0,
    calendarEntries: 0,
    total: 0
  })

  const isMonitoring = ref(false)
  const lastChecked = ref<Date | null>(null)

  /**
   * Check if Storage API is supported
   */
  const isStorageApiSupported = computed(() => {
    return 'storage' in navigator && 'estimate' in navigator.storage
  })

  /**
   * Get storage estimate from Storage API
   */
  const getStorageEstimate = async (): Promise<StorageEstimate | null> => {
    if (!isStorageApiSupported.value) {
      console.warn('Storage API not supported in this browser')
      return null
    }

    try {
      const estimate = await navigator.storage.estimate()
      return estimate
    } catch (error) {
      console.error('Failed to get storage estimate:', error)
      return null
    }
  }

  /**
   * Calculate detailed storage breakdown by data type
   */
  const calculateBreakdown = async (): Promise<StorageBreakdown> => {
    const sizes = {
      daySummaries: await calculateDataSize('daySummaries'),
      tasks: await calculateDataSize('tasks'),
      habits: await calculateDataSize('habits'),
      sparks: await calculateDataSize('sparks'),
      calendarEntries: await calculateDataSize('calendarEntries')
    }

    const total = Object.values(sizes).reduce((sum, size) => sum + size, 0)

    return {
      ...sizes,
      total
    }
  }

  /**
   * Update storage statistics
   */
  const updateStats = async (): Promise<void> => {
    isMonitoring.value = true

    try {
      // Get storage estimate from browser
      const estimate = await getStorageEstimate()

      // Calculate detailed breakdown
      const currentBreakdown = await calculateBreakdown()
      breakdown.value = currentBreakdown

      if (estimate && estimate.usage !== undefined && estimate.quota !== undefined) {
        const usage = estimate.usage
        const quota = estimate.quota
        const usagePercent = (usage / quota) * 100
        const remaining = quota - usage

        stats.value = {
          usage,
          quota,
          usagePercent,
          remaining,
          isNearLimit: usagePercent >= 75,
          isCritical: usagePercent >= 90,
          estimate
        }
      } else {
        // Fallback: use breakdown total as usage estimate
        // Assume 50MB default quota if not available
        const defaultQuota = 50 * 1024 * 1024 // 50MB
        const usage = currentBreakdown.total
        const quota = defaultQuota
        const usagePercent = (usage / quota) * 100
        const remaining = quota - usage

        stats.value = {
          usage,
          quota,
          usagePercent,
          remaining,
          isNearLimit: usagePercent >= 75,
          isCritical: usagePercent >= 90,
          estimate: null
        }
      }

      lastChecked.value = new Date()
    } catch (error) {
      console.error('Failed to update storage stats:', error)
    } finally {
      isMonitoring.value = false
    }
  }

  /**
   * Get storage warning message based on usage
   */
  const getWarningMessage = computed(() => {
    if (stats.value.isCritical) {
      return {
        level: 'critical',
        title: t('storage.warning.criticalTitle'),
        message: t('storage.warning.criticalMessage', {
          percent: stats.value.usagePercent.toFixed(1),
          usage: formatBytes(stats.value.usage),
          quota: formatBytes(stats.value.quota)
        }),
        action: t('storage.warning.criticalAction')
      }
    } else if (stats.value.isNearLimit) {
      return {
        level: 'warning',
        title: t('storage.warning.warningTitle'),
        message: t('storage.warning.warningMessage', {
          percent: stats.value.usagePercent.toFixed(1),
          usage: formatBytes(stats.value.usage),
          quota: formatBytes(stats.value.quota)
        }),
        action: t('storage.warning.warningAction')
      }
    }
    return null
  })

  /**
   * Get cleanup suggestions based on storage breakdown
   */
  const getCleanupSuggestions = computed(() => {
    const suggestions = []
    const { daySummaries, tasks, habits } = breakdown.value

    // Suggest cleaning day summaries if they take up more than 60% of total
    if (daySummaries > breakdown.value.total * 0.6) {
      suggestions.push({
        type: 'daySummaries',
        message: t('storage.cleanup.summariesMessage', { size: formatBytes(daySummaries) }),
        action: t('storage.cleanup.summariesAction')
      })
    }

    // Suggest cleaning tasks if they take up more than 20% of total
    if (tasks > breakdown.value.total * 0.2) {
      suggestions.push({
        type: 'tasks',
        message: t('storage.cleanup.tasksMessage', { size: formatBytes(tasks) }),
        action: t('storage.cleanup.tasksAction')
      })
    }

    // Suggest cleaning habits if they take up more than 20% of total
    if (habits > breakdown.value.total * 0.2) {
      suggestions.push({
        type: 'habits',
        message: t('storage.cleanup.habitsMessage', { size: formatBytes(habits) }),
        action: t('storage.cleanup.habitsAction')
      })
    }

    return suggestions
  })

  /**
   * Format storage stats for display
   */
  const formatStats = computed(() => {
    return {
      usage: formatBytes(stats.value.usage),
      quota: formatBytes(stats.value.quota),
      remaining: formatBytes(stats.value.remaining),
      usagePercent: `${stats.value.usagePercent.toFixed(1)}%`,
      breakdown: {
        daySummaries: formatBytes(breakdown.value.daySummaries),
        tasks: formatBytes(breakdown.value.tasks),
        habits: formatBytes(breakdown.value.habits),
        sparks: formatBytes(breakdown.value.sparks),
        calendarEntries: formatBytes(breakdown.value.calendarEntries),
        total: formatBytes(breakdown.value.total)
      }
    }
  })

  /**
   * Check if storage is healthy
   */
  const isStorageHealthy = computed(() => {
    return !stats.value.isNearLimit && !stats.value.isCritical
  })

  /**
   * Initialize monitoring on mount
   */
  onMounted(() => {
    updateStats()
  })

  return {
    // State
    stats,
    breakdown,
    isMonitoring,
    lastChecked,

    // Computed
    isStorageApiSupported,
    getWarningMessage,
    getCleanupSuggestions,
    formatStats,
    isStorageHealthy,

    // Methods
    updateStats,
    getStorageEstimate,
    calculateBreakdown,
    formatBytes
  }
}
