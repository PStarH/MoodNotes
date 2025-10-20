/**
 * Centralized Storage Error Handler
 * Handles all types of localForage errors with appropriate messages
 */

export interface StorageError {
  name: string
  message: string
}

/**
 * Handle storage errors and return user-friendly error messages
 * @param error The error object from localforage
 * @param operation The operation being performed (save, load, delete, etc.)
 * @param key The storage key being accessed
 * @returns Error object with appropriate message
 */
export function handleStorageError(error: any, operation: string, key: string): Error {
  console.error(`Storage ${operation} failed for ${key}:`, error)

  // Check error type by name
  switch (error.name) {
    case 'QuotaExceededError':
      return new Error(
        'Storage quota exceeded. Please export your data and delete old entries to free up space.'
      )

    case 'DataCloneError':
      return new Error(
        'Invalid data format. Cannot store non-serializable values. Please check your data.'
      )

    case 'VersionError':
      return new Error(
        'Database version mismatch. Please refresh the app to update to the latest version.'
      )

    case 'InvalidStateError':
      return new Error(
        'Storage is in invalid state. Please restart the app. If the problem persists, try clearing browser data.'
      )

    case 'NetworkError':
      return new Error(
        'Network error while accessing storage. Please check your connection.'
      )

    case 'ConstraintError':
      return new Error(
        'Storage constraint violation. The data may be corrupted. Please export and re-import your data.'
      )

    case 'TransactionInactiveError':
      return new Error(
        'Storage transaction error. Please try again.'
      )

    case 'NotFoundError':
      return new Error(
        `Data not found for key "${key}". It may have been deleted.`
      )

    case 'AbortError':
      return new Error(
        'Storage operation was aborted. Please try again.'
      )

    default:
      // Check if offline
      if (!navigator.onLine) {
        return new Error(
          'You appear to be offline. Changes will be saved when you reconnect.'
        )
      }

      // Generic error with original message
      return new Error(
        `Failed to ${operation}: ${error.message || 'Unknown error'}. Please try again or contact support if this persists.`
      )
  }
}

/**
 * Check if an error is a storage quota error
 */
export function isQuotaError(error: any): boolean {
  return error.name === 'QuotaExceededError'
}

/**
 * Check if an error is a network-related error
 */
export function isNetworkError(error: any): boolean {
  return error.name === 'NetworkError' || !navigator.onLine
}

/**
 * Check if an error is recoverable
 */
export function isRecoverableError(error: any): boolean {
  const recoverableErrors = [
    'NetworkError',
    'TransactionInactiveError',
    'AbortError'
  ]
  return recoverableErrors.includes(error.name) || !navigator.onLine
}

/**
 * Get storage size estimate
 * @returns Promise with estimated storage usage in bytes
 */
export async function getStorageEstimate(): Promise<{ usage: number; quota: number } | null> {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    try {
      const estimate = await navigator.storage.estimate()
      return {
        usage: estimate.usage || 0,
        quota: estimate.quota || 0
      }
    } catch (error) {
      console.warn('Failed to get storage estimate:', error)
      return null
    }
  }
  return null
}

/**
 * Format bytes to human-readable format
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}
