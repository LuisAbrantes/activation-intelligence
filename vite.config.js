import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      react(),
      tailwindcss(),
    ],
    server: {
      proxy: {
        // AbacatePay — reescreve /api/abacate/xxx → api.abacatepay.com/v2/xxx
        '/api/abacate': {
          target: 'https://api.abacatepay.com/v2',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/abacate/, ''),
        },
        // Groq — reescreve /api/groq → api.groq.com/openai/v1/chat/completions
        // Injeta a GROQ_KEY do .env como Bearer token, para que o frontend
        // não precise conhecer a chave nem em dev.
        '/api/groq': {
          target: 'https://api.groq.com/openai/v1/chat/completions',
          changeOrigin: true,
          rewrite: () => '', // path fixo, todo request vai pro mesmo endpoint
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              const groqKey = env.GROQ_KEY
              if (groqKey) {
                proxyReq.setHeader('Authorization', `Bearer ${groqKey}`)
              }
            })
          },
        },
      },
    },
  }
})
