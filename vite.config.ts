import react from '@vitejs/plugin-react'
import { loadEnv, type Plugin } from 'vite'
import { defineConfig } from 'vitest/config'

/**
 * Serves POST /api/genai during `vite dev` by forwarding to the same handler
 * the Vercel Function uses. Reads GEMINI_API_KEY from .env.local.
 */
function genaiDevApi(env: Record<string, string>): Plugin {
  return {
    name: 'counterdraft-genai-dev-api',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/api/genai', async (req, res) => {
        const { handleGenAIRequest } = await server.ssrLoadModule('/server/genai.ts')
        const chunks: Buffer[] = []
        for await (const chunk of req) chunks.push(chunk as Buffer)
        const request = new Request(`http://localhost${req.originalUrl ?? '/api/genai'}`, {
          method: req.method,
          headers: req.headers as Record<string, string>,
          body: req.method === 'POST' ? Buffer.concat(chunks) : undefined,
        })
        const response: Response = await handleGenAIRequest(request, env)
        res.statusCode = response.status
        response.headers.forEach((value, key) => res.setHeader(key, value))
        res.end(await response.text())
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react(), genaiDevApi(loadEnv(mode, process.cwd(), 'GEMINI_'))],
  test: {
    environment: 'jsdom',
    globals: true,
    fileParallelism: false,
  },
}))
