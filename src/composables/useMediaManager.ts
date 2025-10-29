import { ref, Ref, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useToast } from './useToast'

export interface MediaFile {
  id: string
  filename: string
  type: string
  size: number
  url: string // File path or blob URL (storedName when in Electron)
  thumbnail?: string
  createdAt: string
  checksum?: string
  storageKey?: string
  integrity?: {
    ok: boolean
    reason?: string
  }
}

export interface MediaValidation {
  maxSize: number // in bytes
  allowedTypes: string[]
}

const DEFAULT_VALIDATION: MediaValidation = {
  maxSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'video/mp4',
    'video/webm',
    'video/ogg',
    'audio/mpeg',
    'audio/ogg',
    'audio/wav',
    'audio/webm'
  ]
}

// Check if running in Electron environment
const isElectron = () => {
  return !!(window && window.api && window.api.media)
}

export function useMediaManager() {
  const toast = useToast()
  const { t } = useI18n({ useScope: 'global' })
  const mediaFiles: Ref<MediaFile[]> = ref([])
  const isUploading = ref(false)

  // Track all blob URLs created to ensure cleanup
  const blobUrls = new Set<string>()

  // Cache blob URLs by file ID to prevent memory leaks from repeated calls
  const blobUrlCache = new Map<string, string>()

  /**
   * Track a blob URL for cleanup
   */
  const trackBlobUrl = (url: string) => {
    if (url && url.startsWith('blob:')) {
      blobUrls.add(url)
    }
  }

  /**
   * Cleanup all tracked blob URLs
   */
  const cleanupBlobs = () => {
    blobUrls.forEach(url => {
      try {
        URL.revokeObjectURL(url)
      } catch (e) {
        console.warn('Failed to revoke blob URL:', e)
      }
    })
    blobUrls.clear()
    blobUrlCache.clear()
  }

  // Cleanup on component unmount
  onUnmounted(() => {
    cleanupBlobs()
  })

  /**
   * Validate file before upload
   */
  const validateFile = (file: File, validation: MediaValidation = DEFAULT_VALIDATION): { valid: boolean; error?: string } => {
    // Check file size
    if (file.size > validation.maxSize) {
      const maxSizeMB = (validation.maxSize / (1024 * 1024)).toFixed(1)
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2)
      return {
        valid: false,
        error: `File size (${fileSizeMB}MB) exceeds maximum allowed size (${maxSizeMB}MB)`
      }
    }

    // Check file type
    if (!validation.allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: `File type "${file.type}" is not allowed`
      }
    }

    return { valid: true }
  }

  /**
   * Generate thumbnail for images and videos
   */
  const generateThumbnail = async (file: File, url: string): Promise<string | undefined> => {
    if (file.type.startsWith('image/')) {
      return url // For images, use the same URL
    }

    if (file.type.startsWith('video/')) {
      return new Promise((resolve) => {
        const video = document.createElement('video')
        video.src = url
        video.currentTime = 1 // Capture at 1 second

        video.addEventListener('loadeddata', () => {
          const canvas = document.createElement('canvas')
          canvas.width = 200
          canvas.height = 150
          const ctx = canvas.getContext('2d')

          if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
            resolve(canvas.toDataURL('image/jpeg', 0.7))
          } else {
            resolve(undefined)
          }
        })

        video.addEventListener('error', () => resolve(undefined))
      })
    }

    return undefined
  }

  /**
   * Save file to Electron file system
   */
  const saveToElectron = async (file: File): Promise<{ entry: { id: string; storedName: string; checksum: string; createdAt: string; size: number; mimeType: string; originalName: string }; thumbnail?: string; integrity?: { ok: boolean; reason?: string } } | null> => {
    try {
      // Read file as ArrayBuffer
      const arrayBuffer = await file.arrayBuffer()

      // Save file via Electron IPC
      const result = await window.api.media.save({
        originalName: file.name,
        mimeType: file.type,
        buffer: arrayBuffer
      })

      if (!result.success) {
        throw new Error(result.error || 'Failed to save file')
      }

      if (!result.entry) {
        throw new Error('Missing media metadata from main process')
      }

      // For thumbnail, we need to create a temporary blob URL
      const tempUrl = URL.createObjectURL(file)
      const thumbnail = await generateThumbnail(file, tempUrl)
      URL.revokeObjectURL(tempUrl)

      return {
        entry: {
          id: result.entry.id,
          storedName: result.entry.storedName,
          checksum: result.entry.checksum,
          createdAt: result.entry.createdAt,
          size: result.entry.size,
          mimeType: result.entry.mimeType,
          originalName: result.entry.originalName
        },
        thumbnail,
        integrity: result.integrity
      }
    } catch (error) {
      console.error('Error saving to Electron:', error)
      return null
    }
  }

  /**
   * Read file from Electron file system
   */
  const readFromElectron = async (storedName: string): Promise<{ url: string; entry?: { id: string; checksum: string; createdAt: string; size: number; mimeType: string; originalName: string } } | null> => {
    try {
      const result = await window.api.media.read({ storedName })

      if (!result.success || !result.buffer) {
        throw new Error(result.error || 'Failed to read file')
      }

  // Convert buffer to blob URL
  const nodeBuffer = result.buffer as unknown as Uint8Array
  const arrayBuffer = new ArrayBuffer(nodeBuffer.byteLength)
  const byteArray = new Uint8Array(arrayBuffer)
  byteArray.set(nodeBuffer)
  const blob = new Blob([arrayBuffer], { type: result.entry?.mimeType || 'application/octet-stream' })
      const url = URL.createObjectURL(blob)
      return {
        url,
        entry: result.entry ? {
          id: result.entry.id,
          checksum: result.entry.checksum,
          createdAt: result.entry.createdAt,
          size: result.entry.size,
          mimeType: result.entry.mimeType,
          originalName: result.entry.originalName
        } : undefined
      }
    } catch (error) {
      console.error('Error reading from Electron:', error)
      return null
    }
  }

  const listStoredMedia = async (verify = false) => {
    if (!isElectron()) {
      return []
    }

    try {
      const result = await window.api.media.list({ verify })
      if (!result.success || !result.files) {
        return []
      }
      return result.files
    } catch (error) {
      console.error('Failed to list stored media:', error)
      return []
    }
  }

  const openStoredMedia = async (payload: { id?: string; storedName?: string }) => {
    if (!isElectron()) {
      toast.error(t('daySummary.openDesktopOnlyMessage'), t('daySummary.openDesktopOnlyTitle'))
      return false
    }

    try {
      const result = await window.api.media.open(payload)
      if (!result.success) {
        throw new Error(result.error || 'Unknown error')
      }
      return true
    } catch (error) {
      console.error('Failed to open media file:', error)
      toast.error(t('daySummary.openFailedMessage'), t('daySummary.openFailedTitle'))
      return false
    }
  }

  const revealStoredMedia = async (payload: { id?: string; storedName?: string }) => {
    if (!isElectron()) {
      toast.error(t('daySummary.revealDesktopOnlyMessage'), t('daySummary.revealDesktopOnlyTitle'))
      return false
    }

    try {
      const result = await window.api.media.reveal(payload)
      if (!result.success) {
        throw new Error(result.error || 'Unknown error')
      }
      return true
    } catch (error) {
      console.error('Failed to reveal media file:', error)
      toast.error(t('daySummary.revealFailedMessage'), t('daySummary.revealFailedTitle'))
      return false
    }
  }

  /**
   * Upload file to IndexedDB or file system
   */
  const uploadFile = async (file: File, validation?: MediaValidation): Promise<MediaFile | null> => {
    // Validate file
    const { valid, error } = validateFile(file, validation)
    if (!valid) {
      toast.error(error || 'Invalid file', 'Upload Failed')
      return null
    }

    isUploading.value = true

    try {
      let url: string
      let thumbnail: string | undefined
      let checksum: string | undefined
      let createdAt = new Date().toISOString()
      let storageKey: string | undefined
      let integrity: MediaFile['integrity'] = undefined
      let persistedId: string | undefined
      let persistedSize = file.size
      let persistedFilename = file.name

      if (isElectron()) {
        // Use Electron file system
        const result = await saveToElectron(file)
        if (!result) {
          throw new Error('Failed to save file to Electron')
        }
        url = result.entry.storedName
        storageKey = result.entry.storedName
        checksum = result.entry.checksum
        createdAt = result.entry.createdAt
        persistedId = result.entry.id
        persistedSize = result.entry.size
        persistedFilename = result.entry.originalName
        thumbnail = result.thumbnail
        integrity = result.integrity ? { ...result.integrity } : { ok: true }
        // Track thumbnail if it's a blob URL
        if (thumbnail) {
          trackBlobUrl(thumbnail)
        }
      } else {
        // Fallback to blob URL for web
        url = URL.createObjectURL(file)
        trackBlobUrl(url) // Track the blob URL
        thumbnail = await generateThumbnail(file, url)
        if (thumbnail) {
          trackBlobUrl(thumbnail) // Track thumbnail if it's a blob URL
        }
      }

      const mediaFile: MediaFile = {
        id: persistedId || `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        filename: persistedFilename,
        type: file.type,
        size: persistedSize,
        url,
        thumbnail,
        createdAt,
        checksum,
        storageKey,
        integrity
      }

      mediaFiles.value.push(mediaFile)
      toast.success(`File "${file.name}" uploaded successfully`, 'Upload Complete')

      return mediaFile
    } catch (error) {
      console.error('Failed to upload file:', error)
      toast.error('Failed to upload file. Please try again.', 'Upload Error')
      return null
    } finally {
      isUploading.value = false
    }
  }

  /**
   * Delete a media file
   */
  const deleteFile = async (mediaId: string) => {
    const index = mediaFiles.value.findIndex(m => m.id === mediaId)
    if (index !== -1) {
      const file = mediaFiles.value[index]

      // Delete from Electron file system if applicable
      if (isElectron() && !file.url.startsWith('blob:')) {
        try {
          await window.api.media.delete({ id: file.id, storedName: file.storageKey || file.url })
        } catch (error) {
          console.error('Error deleting from Electron:', error)
        }
      }

      // Revoke blob URL to free memory and remove from tracking
      if (file.url.startsWith('blob:')) {
        URL.revokeObjectURL(file.url)
        blobUrls.delete(file.url)
      }
      if (file.thumbnail && file.thumbnail.startsWith('blob:')) {
        URL.revokeObjectURL(file.thumbnail)
        blobUrls.delete(file.thumbnail)
      }

      // Clear from cache
      const cachedUrl = blobUrlCache.get(file.id)
      if (cachedUrl) {
        blobUrlCache.delete(file.id)
      }

      mediaFiles.value.splice(index, 1)
      toast.success('Media file deleted', 'Deleted')
    }
  }

  /**
   * Clear all media files
   */
  const clearAll = async () => {
    for (const file of mediaFiles.value) {
      // Delete from Electron file system if applicable
      if (isElectron() && !file.url.startsWith('blob:')) {
        try {
          await window.api.media.delete({ id: file.id, storedName: file.storageKey || file.url })
        } catch (error) {
          console.error('Error deleting from Electron:', error)
        }
      }

      // Revoke blob URLs and remove from tracking
      if (file.url.startsWith('blob:')) {
        URL.revokeObjectURL(file.url)
        blobUrls.delete(file.url)
      }
      if (file.thumbnail && file.thumbnail.startsWith('blob:')) {
        URL.revokeObjectURL(file.thumbnail)
        blobUrls.delete(file.thumbnail)
      }
    }
    mediaFiles.value = []
    blobUrlCache.clear() // Clear all cached URLs
  }

  /**
   * Get media file by ID
   */
  const getFile = (mediaId: string): MediaFile | undefined => {
    return mediaFiles.value.find(m => m.id === mediaId)
  }

  /**
   * Get display URL for a media file (handles Electron file references)
   */
  const getDisplayUrl = async (mediaFile: MediaFile): Promise<string> => {
    // Check cache first to prevent memory leaks from repeated calls
    const cached = blobUrlCache.get(mediaFile.id)
    if (cached) {
      return cached
    }

    // If it's already a blob URL, cache and return it
    if (mediaFile.url.startsWith('blob:')) {
      blobUrlCache.set(mediaFile.id, mediaFile.url)
      return mediaFile.url
    }

    // If running in Electron and it's a filename, read from file system
    if (isElectron()) {
      const storedKey = mediaFile.storageKey || mediaFile.url
      const result = await readFromElectron(storedKey)
      if (result) {
        if (result.entry) {
          mediaFile.checksum = result.entry.checksum
          mediaFile.createdAt = result.entry.createdAt
          mediaFile.size = result.entry.size
          mediaFile.filename = result.entry.originalName
        }
        trackBlobUrl(result.url)
        blobUrlCache.set(mediaFile.id, result.url) // Cache the created URL
        return result.url
      }
      return mediaFile.url
    }

    return mediaFile.url
  }

  /**
   * Convert legacy data URL to MediaFile
   */
  const convertDataUrlToMediaFile = async (dataUrl: string, filename?: string): Promise<MediaFile | null> => {
    try {
      // Extract mime type from data URL
      const match = dataUrl.match(/^data:([^;]+);base64,/)
      if (!match) {
        throw new Error('Invalid data URL format')
      }

      const mimeType = match[1]
      const base64Data = dataUrl.split(',')[1]

      // Convert base64 to blob
      const byteCharacters = atob(base64Data)
      const byteArrays = []

      for (let offset = 0; offset < byteCharacters.length; offset += 512) {
        const slice = byteCharacters.slice(offset, offset + 512)
        const byteNumbers = new Array(slice.length)

        for (let i = 0; i < slice.length; i++) {
          byteNumbers[i] = slice.charCodeAt(i)
        }

        byteArrays.push(new Uint8Array(byteNumbers))
      }

      const blob = new Blob(byteArrays, { type: mimeType })
      const file = new File([blob], filename || 'migrated-file', { type: mimeType })

      // Upload the file using the normal upload flow
      return await uploadFile(file)
    } catch (error) {
      console.error('Failed to convert data URL:', error)
      return null
    }
  }

  return {
    mediaFiles,
    isUploading,
    uploadFile,
    deleteFile,
    clearAll,
    getFile,
    getDisplayUrl,
    validateFile,
    convertDataUrlToMediaFile,
    listStoredMedia,
    openStoredMedia,
    revealStoredMedia,
    cleanupBlobs, // Expose for manual cleanup if needed
    DEFAULT_VALIDATION,
    isElectron: isElectron()
  }
}
