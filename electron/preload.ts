import { contextBridge, ipcRenderer } from 'electron'

// Define the API types for type safety
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

contextBridge.exposeInMainWorld('api', {
  send: (channel: string, data: any) => {
    // Whitelist channels
    let validChannels = ['toMain']
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data)
    }
  },
  receive: (channel: string, func: (...args: any[]) => void) => {
    let validChannels = ['fromMain']
    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, (event, ...args) => func(...args))
    }
  },
  media: {
    save: (filename: string, buffer: ArrayBuffer) =>
      ipcRenderer.invoke('media:save', { filename, buffer }),
    read: (filename: string) =>
      ipcRenderer.invoke('media:read', filename),
    delete: (filename: string) =>
      ipcRenderer.invoke('media:delete', filename),
    getPath: () =>
      ipcRenderer.invoke('media:get-path'),
    list: () =>
      ipcRenderer.invoke('media:list'),
  },
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
