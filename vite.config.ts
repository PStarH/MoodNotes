import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  build: {
    outDir: 'dist', // Ensure Electron points to this directory
    emptyOutDir: true,
    rollupOptions: {
      input: path.resolve(__dirname, 'index.html'), // Points to root index.html
      output: {
        // Asset filenames with relative paths
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name].[ext]',
      },
    },
    // Set base to relative to handle Electron's file:// protocol
    base: './',
  },
  server: {
    host: 'localhost',
    port: 3000, // Ensure this matches VITE_DEV_SERVER_URL
  },
})
