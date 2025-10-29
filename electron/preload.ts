import { contextBridge, ipcRenderer } from 'electron'

// Define the API types for type safety
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
contextBridge.exposeInMainWorld('api', {
  send: (channel: string, data: any) => {
    // Whitelist channels
      const validChannels = ['toMain']
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data)
    }
  },
  receive: (channel: string, func: (...args: any[]) => void) => {
      const validChannels = ['fromMain']
    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, (event, ...args) => func(...args))
    }
  },
  media: {
      save: (payload: { originalName: string; mimeType: string; buffer: ArrayBuffer }) =>
        ipcRenderer.invoke('media:save', payload),
      read: (payload: { id?: string; storedName?: string }) =>
        ipcRenderer.invoke('media:read', payload),
      delete: (payload: { id?: string; storedName?: string }) =>
        ipcRenderer.invoke('media:delete', payload),
    getPath: () =>
      ipcRenderer.invoke('media:get-path'),
      list: (options?: { verify?: boolean }) =>
        ipcRenderer.invoke('media:list', options),
      open: (payload: { id?: string; storedName?: string }) =>
        ipcRenderer.invoke('media:open', payload),
      reveal: (payload: { id?: string; storedName?: string }) =>
        ipcRenderer.invoke('media:reveal', payload),
    } as MediaAPI,
})

// Extend the Window interface for TypeScript
declare global {
  interface Window {
    api: ElectronAPI
  }
}

window.addEventListener('DOMContentLoaded', () => {
  // Media API is now available at window.api.media
});
