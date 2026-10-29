const REVIEW_PATH_PREFIX = '/api/reviews/'
const PRIVATE_PATH_PREFIX = '/reviews'
const ALLOWED_EQUIPMENT_STATUSES = new Set(['Not Trained', 'Training', 'Independent'])

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

function cleanText(value, maximumLength = 5000) {
  if (typeof value !== 'string') return ''
  return value.trim().slice(0, maximumLength)
}

function cleanRating(value) {
  const rating = Number(value)
  return Number.isFinite(rating) && rating >= 1 && rating <= 5 ? rating : null
}

function sanitizeBackendPayload(payload) {
  if (!payload || payload.ok !== true || !payload.employee || !Array.isArray(payload.reviews)) {
    throw new Error('Invalid review backend response')
  }

  const employee = {
    name: cleanText(payload.employee.name, 160),
    role: cleanText(payload.employee.role, 160),
    equipment: Array.isArray(payload.employee.equipment)
      ? payload.employee.equipment
        .map((item) => ({
          name: cleanText(item && item.name, 80),
          status: cleanText(item && item.status, 40),
        }))
        .filter((item) => item.name && ALLOWED_EQUIPMENT_STATUSES.has(item.status))
      : [],
  }

  if (!employee.name) throw new Error('Invalid employee review response')

  const reviews = payload.reviews.map((review) => {
    const safeReview = {
      reviewDate: cleanText(review && review.reviewDate, 10),
      roleAtReview: cleanText(review && review.roleAtReview, 160),
      reviewer: cleanText(review && review.reviewer, 160),
      averageRating: Number(review && review.averageRating),
      ratings: {
        workQuality: cleanRating(review && review.ratings && review.ratings.workQuality),
        productivity: cleanRating(review && review.ratings && review.ratings.productivity),
        reliability: cleanRating(review && review.ratings && review.ratings.reliability),
        teamworkCooperation: cleanRating(review && review.ratings && review.ratings.teamworkCooperation),
        professionalConduct: cleanRating(review && review.ratings && review.ratings.professionalConduct),
        responsibilityInitiative: cleanRating(review && review.ratings && review.ratings.responsibilityInitiative),
        coachability: cleanRating(review && review.ratings && review.ratings.coachability),
      },
    }

    if (!Number.isFinite(safeReview.averageRating)) throw new Error('Invalid average rating')
    if (Object.values(safeReview.ratings).some((rating) => rating === null)) {
      throw new Error('Invalid category rating')
    }

    const strengths = cleanText(review && review.strengths)
    const areasToImprove = cleanText(review && review.areasToImprove)
    const expectations = cleanText(review && review.expectationsBeforeNextReview)
    if (strengths) safeReview.strengths = strengths
    if (areasToImprove) safeReview.areasToImprove = areasToImprove
    if (expectations) safeReview.expectationsBeforeNextReview = expectations

    return safeReview
  })

  return { ok: true, employee, reviews }
}

async function handleReviewApi(request, env, url) {
  if (request.method !== 'GET') {
    return jsonResponse({ ok: false }, 405)
  }

  let accessCode = ''
  try {
    accessCode = decodeURIComponent(url.pathname.slice(REVIEW_PATH_PREFIX.length))
  } catch {
    return jsonResponse({ ok: false, code: 'NOT_FOUND' }, 404)
  }

  if (!/^[A-Za-z0-9_-]{8,128}$/.test(accessCode)) {
    return jsonResponse({ ok: false, code: 'NOT_FOUND' }, 404)
  }

  if (!env.REVIEW_APPS_SCRIPT_URL || !env.REVIEW_API_SECRET) {
    return jsonResponse({ ok: false, code: 'SERVICE_UNAVAILABLE' }, 503)
  }

  try {
    const backendResponse = await fetch(env.REVIEW_APPS_SCRIPT_URL, {
      method: 'POST',
      redirect: 'follow',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
      body: new URLSearchParams({
        action: 'getEmployeeReviewPortal',
        secret: env.REVIEW_API_SECRET,
        accessCode,
      }),
    })

    if (!backendResponse.ok) throw new Error('Review backend unavailable')

    const backendPayload = await backendResponse.json()
    if (backendPayload && backendPayload.ok === false && backendPayload.code === 'NOT_FOUND') {
      return jsonResponse({ ok: false, code: 'NOT_FOUND' }, 404)
    }

    return jsonResponse(sanitizeBackendPayload(backendPayload), 200)
  } catch {
    return jsonResponse({ ok: false, code: 'BACKEND_ERROR' }, 502)
  }
}

async function servePrivatePage(request, env, url) {
  let response = await env.ASSETS.fetch(request)

  if (response.status === 404 && request.method === 'GET') {
    const indexUrl = new URL('/index.html', url)
    response = await env.ASSETS.fetch(new Request(indexUrl, {
      method: 'GET',
      headers: request.headers,
    }))
  }

  const headers = new Headers(response.headers)
  headers.set('Cache-Control', 'no-store, private')
  headers.set('Referrer-Policy', 'no-referrer')
  headers.set('X-Robots-Tag', 'noindex, nofollow')
  headers.set('X-Content-Type-Options', 'nosniff')
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers })
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url)

    if (url.pathname.startsWith(REVIEW_PATH_PREFIX)) {
      return handleReviewApi(request, env, url)
    }

    if (url.pathname === PRIVATE_PATH_PREFIX || url.pathname.startsWith(`${PRIVATE_PATH_PREFIX}/`)) {
      return servePrivatePage(request, env, url)
    }

    return env.ASSETS.fetch(request)
  },
}
