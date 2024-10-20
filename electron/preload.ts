import { contextBridge, ipcRenderer } from 'electron'

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
})

window.addEventListener('DOMContentLoaded', () => {
  // You can expose APIs to the renderer process here
  // For example:
  // window.api = { /* ... */ };
});
