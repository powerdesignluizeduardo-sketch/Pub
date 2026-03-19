import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

const n8nWebhookTarget =
  process.env.VITE_N8N_WEBHOOK_URL || 'https://webhook.naveedu.io/webhook/maplebear-tutor'

export default defineConfig({
  plugins: [
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },

  server: {
    proxy: {
      '/api-n8n': {
        target: n8nWebhookTarget,
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api-n8n/, ''),
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq, req) => {
            const reqMethod = req.method || 'UNKNOWN'
            const reqUrl = req.url || ''
            const host = proxyReq.getHeader('host')
            const finalPath = (proxyReq as any).path || ''
            const finalUrl = `${String(proxyReq.protocol || 'https:')}//${String(host || '')}${finalPath}`
            const headerNames = proxyReq.getHeaderNames()
            const headers = Object.fromEntries(
              headerNames.map((name) => [String(name), proxyReq.getHeader(name)]),
            )

            console.log(`[vite-proxy][n8n] Intercepted: ${reqMethod} ${reqUrl}`)
            console.log(`[vite-proxy][n8n] Forwarding to: ${finalUrl}`)
            console.log('[vite-proxy][n8n] Outgoing headers:', headers)
          })

          proxy.on('proxyRes', (proxyRes, req) => {
            const reqMethod = req.method || 'UNKNOWN'
            const reqUrl = req.url || ''
            console.log(
              `[vite-proxy][n8n] Response: ${proxyRes.statusCode} ${proxyRes.statusMessage || ''} for ${reqMethod} ${reqUrl}`,
            )
          })

          proxy.on('error', (err, req) => {
            const reqMethod = req.method || 'UNKNOWN'
            const reqUrl = req.url || ''
            console.error(`[vite-proxy][n8n] Connection error on ${reqMethod} ${reqUrl}:`, err.message)
          })
        },
      },
    },
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],
})
