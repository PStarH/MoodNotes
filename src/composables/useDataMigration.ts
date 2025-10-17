import { ref } from 'vue'
import { useStore } from 'vuex'
import { useMediaManager } from './useMediaManager'
import { useToast } from './useToast'
import type { DaySummary } from '@/store/types'

export interface MigrationProgress {
  total: number
  processed: number
  failed: number
  currentFile: string
  status: 'idle' | 'running' | 'completed' | 'error'
}

export function useDataMigration() {
  const store = useStore()
  const { convertDataUrlToMediaFile } = useMediaManager()
  const toast = useToast()

  const progress = ref<MigrationProgress>({
    total: 0,
    processed: 0,
    failed: 0,
    currentFile: '',
    status: 'idle'
  })

  /**
   * Check if a URL is a data URL
   */
  const isDataUrl = (url: string): boolean => {
    return url.startsWith('data:')
  }

  /**
   * Scan all day summaries and count data URLs that need migration
   */
  const scanForDataUrls = (): number => {
    const summaries = store.state.daySummaries as DaySummary[]
    let count = 0

    for (const summary of summaries) {
      if (summary.media && Array.isArray(summary.media)) {
        for (const media of summary.media) {
          if (typeof media === 'string' && isDataUrl(media)) {
            count++
          } else if (typeof media === 'object' && media.url && isDataUrl(media.url)) {
            count++
          }
        }
      }
    }

    return count
  }

  /**
   * Migrate a single day summary's media from data URLs to file references
   */
  const migrateSummary = async (summary: DaySummary): Promise<DaySummary> => {
    if (!summary.media || !Array.isArray(summary.media) || summary.media.length === 0) {
      return summary
    }

    const migratedMedia = []

    for (const media of summary.media) {
      try {
        // Handle old format (string data URL)
        if (typeof media === 'string' && isDataUrl(media)) {
          progress.value.currentFile = 'Converting legacy data URL...'
          const mediaFile = await convertDataUrlToMediaFile(media)

          if (mediaFile) {
            migratedMedia.push(mediaFile)
            progress.value.processed++
          } else {
            console.error('Failed to convert data URL')
            progress.value.failed++
            migratedMedia.push(media) // Keep original if conversion failed
          }
        }
        // Handle new format with data URL in object
        else if (typeof media === 'object' && media.url && isDataUrl(media.url)) {
          progress.value.currentFile = media.filename || 'Converting data URL...'
          const mediaFile = await convertDataUrlToMediaFile(media.url, media.filename)

          if (mediaFile) {
            migratedMedia.push(mediaFile)
            progress.value.processed++
          } else {
            console.error('Failed to convert data URL for:', media.filename)
            progress.value.failed++
            migratedMedia.push(media) // Keep original if conversion failed
          }
        }
        // Already migrated or blob URL
        else {
          migratedMedia.push(media)
        }
      } catch (error) {
        console.error('Error migrating media:', error)
        progress.value.failed++
        migratedMedia.push(media) // Keep original on error
      }
    }

    return {
      ...summary,
      media: migratedMedia
    }
  }

  /**
   * Migrate all data URLs in all day summaries
   */
  const migrateAllData = async (): Promise<void> => {
    try {
      progress.value.status = 'running'
      progress.value.total = scanForDataUrls()
      progress.value.processed = 0
      progress.value.failed = 0

      if (progress.value.total === 0) {
        toast.info('No data URLs found to migrate', 'Migration Complete')
        progress.value.status = 'completed'
        return
      }

      const summaries = store.state.daySummaries as DaySummary[]
      const migratedSummaries = []

      for (const summary of summaries) {
        const migratedSummary = await migrateSummary(summary)
        migratedSummaries.push(migratedSummary)
      }

      // Update all summaries in the store
      for (const summary of migratedSummaries) {
        await store.dispatch('updateDaySummary', summary)
      }

      progress.value.status = 'completed'

      const successCount = progress.value.processed
      const failCount = progress.value.failed

      if (failCount > 0) {
        toast.warning(
          `Migration completed with ${failCount} error${failCount === 1 ? '' : 's'}. ${successCount} file${successCount === 1 ? '' : 's'} migrated successfully.`,
          'Migration Completed'
        )
      } else {
        toast.success(
          `Successfully migrated ${successCount} file${successCount === 1 ? '' : 's'} to the new file system.`,
          'Migration Complete'
        )
      }
    } catch (error) {
      console.error('Migration error:', error)
      progress.value.status = 'error'
      toast.error('Migration failed. Please try again or contact support.', 'Migration Error')
    }
  }

  /**
   * Check if migration is needed
   */
  const needsMigration = (): boolean => {
    return scanForDataUrls() > 0
  }

  /**
   * Reset migration progress
   */
  const resetProgress = () => {
    progress.value = {
      total: 0,
      processed: 0,
      failed: 0,
      currentFile: '',
      status: 'idle'
    }
  }

  return {
    progress,
    migrateAllData,
    needsMigration,
    scanForDataUrls,
    resetProgress
  }
}
