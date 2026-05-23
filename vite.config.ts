import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(() => {
  return {
    plugins: [react()],
    server: {
      allowedHosts: ['.ngrok-free.dev', '.ngrok-free.app', '.ngrok.io'],
      // proxy: {
      //   // Медиа курсов
      //   '/media': {
      //     target: 'https://media.stnapps.com',
      //     changeOrigin: true,
      //     secure: true,
      //     rewrite: (path) => path.replace(/^\/media/, ''),
      //   },
      //   // Legacy proxy path kept for compatibility
      //   '/wordzen': {
      //     target: 'https://api-wordzen.stnapps.com',
      //     changeOrigin: true,
      //     secure: true,
      //   },
      //   [P.api]: {
      //     target: apiTarget,
      //     changeOrigin: true,
      //     secure: true,
      //     rewrite: proxyRewrite(P.api),
      //   },
      //   [P.account]: {
      //     target: accountTarget,
      //     changeOrigin: true,
      //     secure: true,
      //     rewrite: proxyRewrite(P.account),
      //   },
      //   [P.payment]: {
      //     target: paymentTarget,
      //     changeOrigin: true,
      //     secure: true,
      //     rewrite: proxyRewrite(P.payment),
      //   },
      // },
    },
  }
})
