const OPERATIONS_API_PATH = '/api/operations'

function jsonResponse(payload, status) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store, private',
      'Referrer-Policy': 'no-referrer',
      'X-Content-Type-Options': 'nosniff',
      'X-Robots-Tag': 'noindex, nofollow',
    },
  })
}

function removeSensitiveFields(value) {
  if (Array.isArray(value)) return value.map(removeSensitiveFields)
  if (!value || typeof value !== 'object') return value
  const safe = {}
  for (const [key, child] of Object.entries(value)) {
    if (/^(password|passwordHash|sessionIdHash)$/i.test(key)) continue
    safe[key] = removeSensitiveFields(child)
  }
  return safe
}

async function handleOperationsApi(request, env) {
  if (request.method !== 'POST') return jsonResponse({ ok: false, code: 'METHOD_NOT_ALLOWED', message: 'POST required.' }, 405)
  if (!env.OPERATIONS_APPS_SCRIPT_URL || !env.OPERATIONS_API_SHARED_SECRET) {
    return jsonResponse({ ok: false, code: 'API_NOT_CONFIGURED', message: 'Operations backend is not configured.' }, 503)
  }

  try {
    const body = await request.json()
    body.apiSecret = env.OPERATIONS_API_SHARED_SECRET
    const upstream = await fetch(env.OPERATIONS_APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
      body: JSON.stringify(body),
      redirect: 'follow',
    })
    if (!upstream.ok) throw new Error('Apps Script returned ' + upstream.status)
    const result = removeSensitiveFields(await upstream.json())
    const status = result && result.ok === true
      ? 200
      : result && (result.code === 'UNAUTHORIZED' || /^SESSION_/.test(result.code || ''))
        ? 401
        : result && /NOT_FOUND/.test(result.code || '')
          ? 404
          : 400
    return jsonResponse(result, status)
  } catch (error) {
    console.error('[E.T. Operations Worker] Upstream request failed.', { message: error && error.message ? error.message : String(error) })
    return jsonResponse({ ok: false, code: 'BACKEND_UNAVAILABLE', message: 'Operations are temporarily unavailable.' }, 502)
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    if (url.pathname === OPERATIONS_API_PATH) return handleOperationsApi(request, env)
    return env.ASSETS.fetch(request)
  },
}
