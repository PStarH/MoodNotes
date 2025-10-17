import { ref } from 'vue'
import { useStore } from 'vuex'
import { useMediaManager } from './useMediaManager'
import { useToast } from './useToast'
import type { DaySummary } from '@/store/types'

export interface MigrationFileInfo {
  summaryDate: string
  filename: string
  status: 'pending' | 'migrating' | 'success' | 'failed'
  error?: string
  originalUrl?: string
}

export interface MigrationProgress {
  total: number
  processed: number
  failed: number
  currentFile: string
  status: 'idle' | 'running' | 'completed' | 'error'
  files: MigrationFileInfo[]
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
    status: 'idle',
    files: []
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
   * Build detailed file list for migration tracking
   */
  const buildFileList = (): MigrationFileInfo[] => {
    const summaries = store.state.daySummaries as DaySummary[]
    const fileList: MigrationFileInfo[] = []

    for (const summary of summaries) {
      if (summary.media && Array.isArray(summary.media)) {
        for (const media of summary.media) {
          if (typeof media === 'string' && isDataUrl(media)) {
            fileList.push({
              summaryDate: summary.date,
              filename: 'Legacy media file',
              status: 'pending',
              originalUrl: media.substring(0, 100) + '...' // Show first 100 chars
            })
          } else if (typeof media === 'object' && media.url && isDataUrl(media.url)) {
            fileList.push({
              summaryDate: summary.date,
              filename: media.filename || 'Unknown file',
              status: 'pending',
              originalUrl: media.url.substring(0, 100) + '...'
            })
          }
        }
      }
    }

    return fileList
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
      progress.value.files = buildFileList()
      progress.value.total = progress.value.files.length
      progress.value.processed = 0
      progress.value.failed = 0

      if (progress.value.total === 0) {
        toast.info('No data URLs found to migrate', 'Migration Complete')
        progress.value.status = 'completed'
        return
      }

      const summaries = store.state.daySummaries as DaySummary[]
      const migratedSummaries = []
      let fileIndex = 0

      for (const summary of summaries) {
        const migratedSummary = await migrateSummaryWithTracking(summary, fileIndex)
        migratedSummaries.push(migratedSummary.summary)
        fileIndex = migratedSummary.nextFileIndex
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
   * Migrate a summary and track individual file progress
   */
  const migrateSummaryWithTracking = async (summary: DaySummary, startFileIndex: number): Promise<{ summary: DaySummary, nextFileIndex: number }> => {
    if (!summary.media || !Array.isArray(summary.media) || summary.media.length === 0) {
      return { summary, nextFileIndex: startFileIndex }
    }

    const migratedMedia = []
    let fileIndex = startFileIndex

    for (const media of summary.media) {
      try {
        // Handle old format (string data URL)
        if (typeof media === 'string' && isDataUrl(media)) {
          if (progress.value.files[fileIndex]) {
            progress.value.files[fileIndex].status = 'migrating'
            progress.value.currentFile = progress.value.files[fileIndex].filename
          }

          const mediaFile = await convertDataUrlToMediaFile(media)

          if (mediaFile) {
            migratedMedia.push(mediaFile)
            progress.value.processed++
            if (progress.value.files[fileIndex]) {
              progress.value.files[fileIndex].status = 'success'
            }
          } else {
            console.error('Failed to convert data URL')
            progress.value.failed++
            if (progress.value.files[fileIndex]) {
              progress.value.files[fileIndex].status = 'failed'
              progress.value.files[fileIndex].error = 'Failed to convert data URL'
            }
            migratedMedia.push(media) // Keep original if conversion failed
          }
          fileIndex++
        }
        // Handle new format with data URL in object
        else if (typeof media === 'object' && media.url && isDataUrl(media.url)) {
          if (progress.value.files[fileIndex]) {
            progress.value.files[fileIndex].status = 'migrating'
            progress.value.currentFile = progress.value.files[fileIndex].filename
          }

          const mediaFile = await convertDataUrlToMediaFile(media.url, media.filename)

          if (mediaFile) {
            migratedMedia.push(mediaFile)
            progress.value.processed++
            if (progress.value.files[fileIndex]) {
              progress.value.files[fileIndex].status = 'success'
            }
          } else {
            console.error('Failed to convert data URL for:', media.filename)
            progress.value.failed++
            if (progress.value.files[fileIndex]) {
              progress.value.files[fileIndex].status = 'failed'
              progress.value.files[fileIndex].error = 'Failed to convert data URL'
            }
            migratedMedia.push(media) // Keep original if conversion failed
          }
          fileIndex++
        }
        // Already migrated or blob URL
        else {
          migratedMedia.push(media)
        }
      } catch (error) {
        console.error('Error migrating media:', error)
        progress.value.failed++
        if (progress.value.files[fileIndex]) {
          progress.value.files[fileIndex].status = 'failed'
          progress.value.files[fileIndex].error = error instanceof Error ? error.message : 'Unknown error'
        }
        migratedMedia.push(media) // Keep original on error
        fileIndex++
      }
    }

    return {
      summary: {
        ...summary,
        media: migratedMedia
      },
      nextFileIndex: fileIndex
    }
  }

  /**
   * Retry migration for a specific failed file
   */
  const retryFile = async (fileInfo: MigrationFileInfo): Promise<boolean> => {
    try {
      const summaries = store.state.daySummaries as DaySummary[]
      const summary = summaries.find(s => s.date === fileInfo.summaryDate)

      if (!summary || !summary.media) {
        toast.error('Could not find the associated journal entry', 'Retry Failed')
        return false
      }

      // Find the media item to retry
      const mediaIndex = summary.media.findIndex(media => {
        if (typeof media === 'string' && isDataUrl(media)) {
          return media.substring(0, 100) === fileInfo.originalUrl?.substring(0, 100)
        } else if (typeof media === 'object' && media.url && isDataUrl(media.url)) {
          return media.filename === fileInfo.filename
        }
        return false
      })

      if (mediaIndex === -1) {
        toast.error('Media file no longer exists or has already been migrated', 'Retry Failed')
        return false
      }

      const media = summary.media[mediaIndex]

      // Update file status to migrating
      fileInfo.status = 'migrating'
      progress.value.currentFile = fileInfo.filename

      let mediaFile
      if (typeof media === 'string') {
        mediaFile = await convertDataUrlToMediaFile(media)
      } else if (typeof media === 'object' && media.url) {
        mediaFile = await convertDataUrlToMediaFile(media.url, media.filename)
      }

      if (mediaFile) {
        // Update the media in the summary
        const updatedMedia = [...summary.media]
        updatedMedia[mediaIndex] = mediaFile

        await store.dispatch('updateDaySummary', {
          ...summary,
          media: updatedMedia
        })

        // Update file status
        fileInfo.status = 'success'
        fileInfo.error = undefined
        progress.value.processed++
        progress.value.failed--

        toast.success(`Successfully migrated ${fileInfo.filename}`, 'Retry Successful')
        return true
      } else {
        fileInfo.status = 'failed'
        fileInfo.error = 'Failed to convert data URL'
        toast.error(`Failed to migrate ${fileInfo.filename}`, 'Retry Failed')
        return false
      }
    } catch (error) {
      console.error('Error retrying file:', error)
      fileInfo.status = 'failed'
      fileInfo.error = error instanceof Error ? error.message : 'Unknown error'
      toast.error(`Error migrating ${fileInfo.filename}: ${fileInfo.error}`, 'Retry Failed')
      return false
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
      status: 'idle',
      files: []
    }
  }

  return {
    progress,
    migrateAllData,
    needsMigration,
    scanForDataUrls,
    resetProgress,
    retryFile
  }
}
