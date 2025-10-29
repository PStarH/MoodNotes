/**
 * Global type declarations for MoodsNote
 * Extends the Window interface with Electron API types
 */

/**
 * Electron API exposed via contextBridge in preload.ts
 */
export interface ElectronAPI {
  send: (channel: string, data: any) => void
  receive: (channel: string, func: (...args: any[]) => void) => void
  media: MediaAPI
}

export interface MediaManifestEntry {
  id: string
  storedName: string
  originalName: string
  mimeType: string
  size: number
  checksum: string
  createdAt: string
}

export interface MediaIntegrity {
  ok: boolean
  reason?: string
}

export interface MediaAPI {
  save: (payload: { originalName: string; mimeType: string; buffer: ArrayBuffer }) => Promise<{ success: boolean; entry?: MediaManifestEntry; integrity?: MediaIntegrity; error?: string }>
  read: (payload: { id?: string; storedName?: string }) => Promise<{ success: boolean; buffer?: Buffer; entry?: MediaManifestEntry; error?: string }>
  delete: (payload: { id?: string; storedName?: string }) => Promise<{ success: boolean; error?: string }>
  getPath: () => Promise<{ success: boolean; path?: string; error?: string }>
  list: (options?: { verify?: boolean }) => Promise<{ success: boolean; files?: Array<{ entry: MediaManifestEntry; integrity: MediaIntegrity }>; error?: string }>
  open: (payload: { id?: string; storedName?: string }) => Promise<{ success: boolean; error?: string }>
  reveal: (payload: { id?: string; storedName?: string }) => Promise<{ success: boolean; error?: string }>
}

declare global {
  interface Window {
    api: ElectronAPI
  }
}

// This export is required to make this a module
export {}
