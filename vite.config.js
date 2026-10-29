import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'

function operationsEntryPlugin(isOperations) {
  return {
    name: 'et-operations-entry',
    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        if (!isOperations) return html
        return html
          .replace('/src/main.jsx', '/src/ops-main.jsx')
          .replace('E.T. Custom Landscaping provides lawn maintenance and landscaping throughout Duval County, St. Johns County, and the Beaches.', 'E.T. Operations field route application.')
          .replace('<title>E.T. Custom Landscaping</title>', '<meta name="robots" content="noindex, nofollow" />\n    <link rel="manifest" href="/manifest.webmanifest" />\n    <meta name="theme-color" content="#0d3424" />\n    <title>E.T. Operations</title>')
      },
    },
  }
}

function operationsDevelopmentProxy(env) {
  return {
    name: 'et-operations-development-proxy',
    configureServer(server) {
      server.middlewares.use('/api/operations', async (request, response) => {
        if (request.method !== 'POST') {
          response.statusCode = 405
          response.setHeader('Content-Type', 'application/json')
          response.end(JSON.stringify({ ok: false, code: 'METHOD_NOT_ALLOWED', message: 'POST required.' }))
          return
        }

        if (!env.OPERATIONS_APPS_SCRIPT_URL || !env.OPERATIONS_API_SHARED_SECRET) {
          response.statusCode = 503
          response.setHeader('Content-Type', 'application/json')
          response.end(JSON.stringify({ ok: false, code: 'API_NOT_CONFIGURED', message: 'Set OPERATIONS_APPS_SCRIPT_URL and OPERATIONS_API_SHARED_SECRET in .env.local.' }))
          return
        }

        try {
          let rawBody = ''
          for await (const chunk of request) rawBody += chunk
          const body = JSON.parse(rawBody || '{}')
          body.apiSecret = env.OPERATIONS_API_SHARED_SECRET
          const upstream = await fetch(env.OPERATIONS_APPS_SCRIPT_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
            body: JSON.stringify(body),
            redirect: 'follow',
          })
          const text = await upstream.text()
          response.statusCode = upstream.ok ? 200 : upstream.status
          response.setHeader('Content-Type', 'application/json; charset=utf-8')
          response.setHeader('Cache-Control', 'no-store')
          response.end(text)
        } catch (error) {
          response.statusCode = 502
          response.setHeader('Content-Type', 'application/json')
          response.end(JSON.stringify({ ok: false, code: 'BACKEND_UNAVAILABLE', message: 'Apps Script could not be reached.', details: error.message }))
        }
      })
    },
  }
}

export default defineConfig(({ mode, command }) => {
  const env = loadEnv(mode, '.', '')
  const isOperations = mode === 'operations'
  const useMockOperations = command === 'serve' && env.VITE_OPERATIONS_USE_MOCKS === 'true'
  return {
    plugins: [react(), operationsEntryPlugin(isOperations), operationsDevelopmentProxy(env)],
    base: '/',
    publicDir: isOperations ? 'public-ops' : 'public',
    resolve: {
      alias: {
        '@operations-api': resolve(
          useMockOperations ? 'src/ops/api/mockOperationsApi.js' : 'src/ops/api/operationsApi.js',
        ),
      },
    },
  }
})
