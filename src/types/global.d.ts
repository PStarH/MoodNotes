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
  media: {
    save: (filename: string, buffer: ArrayBuffer) => Promise<{ success: boolean; path?: string; error?: string }>
    read: (filename: string) => Promise<{ success: boolean; buffer?: Buffer; error?: string }>
    delete: (filename: string) => Promise<{ success: boolean; error?: string }>
    getPath: () => Promise<{ success: boolean; path?: string; error?: string }>
    list: () => Promise<{ success: boolean; files?: string[]; error?: string }>
  }
}

declare global {
  interface Window {
    api: ElectronAPI
  }
}

// This export is required to make this a module
export {}
