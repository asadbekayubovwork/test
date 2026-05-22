import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

import { WZ_DEV_PROXY_PREFIX as P } from './src/lib/wzDevProxyPrefixes.ts'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const raw = loadEnv(mode, process.cwd(), '')
  const apiTarget = raw.VITE_API_BASE_URL?.replace(/\/+$/, '') || 'https://api-wordzen.stnapps.com'
  const accountTarget =
    raw.VITE_ACCOUNT_API_BASE_URL?.replace(/\/+$/, '') || 'https://account-wordzen.stnapps.com'
  const paymentTarget =
    raw.VITE_PAYMENT_API_BASE_URL?.replace(/\/+$/, '') || 'https://payment-wordzen.stnapps.com'

  const proxyRewrite = (prefix: string) => (path: string) => path.replace(new RegExp(`^${prefix.replace(/\//g, '\\/')}`), '')

  return {
    plugins: [react()],
    server: {
      allowedHosts: ['unscintillant-maudlinly-johnna.ngrok-free.dev'],
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
