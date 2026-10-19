import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    outDir: 'dist',
    // Never inline assets as base64 — always emit separate files
    assetsInlineLimit: 0,
    rollupOptions: {
      output: {
        assetFileNames: 'assets/[name]-[hash][extname]',
        chunkFileNames:  'assets/[name]-[hash].js',
        entryFileNames:  'assets/[name]-[hash].js',
      },
    },
  },
  server: {
    port: 3000,
  },
})
