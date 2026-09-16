import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

// GitHub Pages sirve el sitio bajo /<repo>/, mientras que Vercel y el servidor
// de desarrollo lo sirven en la raíz. El código pide sus datos con
// `import.meta.env.BASE_URL`, así que basta con ajustar `base` al publicar.
const base = process.env.BASE_PATH ?? '/'

export default defineConfig({
  base,
  plugins: [vue(), tailwindcss()],
  build: {
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks: {
          maplibre: ['maplibre-gl'],
          three: ['three'],
        },
      },
    },
  },
})
