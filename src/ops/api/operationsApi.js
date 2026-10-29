const API_URL = import.meta.env.VITE_OPERATIONS_API_URL || '/api/operations'

let sessionToken = ''

class OperationsApiError extends Error {
  constructor(message, code = 'API_ERROR', status = 0, details = undefined) {
    super(message)
    this.name = 'OperationsApiError'
    this.code = code
    this.status = status
    this.details = details
  }
}

async function request(action, payload = {}, options = {}) {
  const body = {
    action,
    payload,
  }

  if (options.authenticated !== false) body.sessionToken = sessionToken
  if (options.mutation) {
    body.mutationId = options.mutation.mutationId
    body.clientTimestamp = options.mutation.clientTimestamp
  }

  let response
  try {
    response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
      body: JSON.stringify(body),
      cache: 'no-store',
    })
  } catch (error) {
    console.error('[E.T. Operations API] Network request failed.', { action, mutationId: options.mutation?.mutationId, error })
    throw new OperationsApiError('The Operations server could not be reached.', 'NETWORK_ERROR', 0, error.message)
  }

  let result
  try {
    result = await response.json()
  } catch {
    throw new OperationsApiError('The Operations server returned an invalid response.', 'INVALID_RESPONSE', response.status)
  }

  if (!response.ok || result?.ok !== true) {
    console.error('[E.T. Operations API] Backend rejected request.', { action, mutationId: options.mutation?.mutationId, status: response.status, code: result?.code, message: result?.message, details: result?.details })
    throw new OperationsApiError(
      result?.message || 'The Operations request could not be completed.',
      result?.code || 'API_ERROR',
      response.status,
      result?.details,
    )
  }

  return result.data
}

const realOperationsApi = {
  mode: 'real',
  apiUrl: API_URL,

  setSessionToken(token) {
    sessionToken = token || ''
  },

  getApiInfo() {
    return request('getApiInfo', {}, { authenticated: false })
  },

  async login(username, password, deviceLabel = '') {
    const data = await request('login', { username, password, deviceLabel }, { authenticated: false })
    sessionToken = data.sessionToken
    return data
  },

  async logout() {
    try {
      return await request('logout')
    } finally {
      sessionToken = ''
    }
  },

  getCurrentUser() {
    return request('getCurrentUser')
  },

  getBootstrapData() {
    return request('bootstrap')
  },

  getHistory(payload = {}) {
    return request('getHistory', payload)
  },

  createRun(payload, mutation) {
    return request('createRun', payload, { mutation })
  },

  mutate(action, payload, mutation) {
    return request(action, payload, { mutation })
  },
}

export const operationsApi = realOperationsApi
export { OperationsApiError }
