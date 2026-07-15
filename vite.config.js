import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'

export default defineConfig(({ command }) => {
  return {
    // basicSsl solo en dev: MercadoPago (CardForm/Wallet Brick) exige un origen seguro —
    // sobre http://localhost bloquea el autofill y falla al montar los iframes de pago.
    plugins: [react(), ...(command === 'serve' ? [basicSsl()] : [])],
    base: command === 'serve' ? '/' : '/luxeStay-user-front/',

    build: {
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            if (id.includes('node_modules')) {
              if (id.includes('react')) {
                return 'react-vendor'
              }
            }
          },
          chunkFileNames: 'assets/js/[name]-[hash].js',
          entryFileNames: 'assets/js/[name]-[hash].js',
          assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
        },
      },
      chunkSizeWarningLimit: 1000,
      sourcemap: false,
      cssCodeSplit: true,
    },

    server: {
      compress: true,
      https: true,
    },

    optimizeDeps: {
      include: ['react', 'react-dom', 'react-router-dom'],
    },
  }
})
