import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: false,
        drop_debugger: false,
      },
    },
    rollupOptions: {
      input: path.resolve(__dirname, 'index.html'),
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
        manualChunks: {
          vendor: ['vue', 'vuex', 'vue-router'],
          editor: ['quill'],
          utils: ['localforage', 'dompurify', 'jspdf'],
          icons: ['lucide-vue-next']
        }
      },
    },
    chunkSizeWarningLimit: 1000
  },
  server: {
    host: 'localhost',
    port: 3000,
  },
  optimizeDeps: {
    include: ['vue', 'vuex', 'vue-router', 'quill', 'localforage', 'dompurify', 'jspdf']
  }
})
