import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: false,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
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
    chunkSizeWarningLimit: 1000,
    base: './',
  },
  server: {
    host: 'localhost',
    port: 3000,
  },
  optimizeDeps: {
    include: ['vue', 'vuex', 'vue-router', 'quill', 'localforage', 'dompurify', 'jspdf']
  }
})
