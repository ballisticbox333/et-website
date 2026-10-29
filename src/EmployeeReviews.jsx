import { useEffect, useMemo, useState } from 'react'

import logo from './assets/ET-custom-logo.png'

const ratingCategories = [
  {
    key: 'workQuality',
    label: 'Work Quality',
    description: 'How clean, correct, complete, and professional the finished work is.',
  },
  {
    key: 'productivity',
    label: 'Productivity',
    description: 'Pace, efficiency, and useful work completed without sacrificing quality.',
  },
  {
    key: 'reliability',
    label: 'Reliability',
    description: 'Attendance, punctuality, preparedness, follow-through, and dependability.',
  },
  {
    key: 'teamworkCooperation',
    label: 'Teamwork / Cooperation',
    description: 'Communication, taking direction, helping the crew, and working well together.',
  },
  {
    key: 'professionalConduct',
    label: 'Professional Conduct',
    description: 'Attitude, respect, maturity, customer-facing behavior, and professionalism.',
  },
  {
    key: 'responsibilityInitiative',
    label: 'Responsibility / Initiative',
    description: 'Noticing what needs attention, taking ownership, and handling routine problems.',
  },
  {
    key: 'coachability',
    label: 'Coachability',
    description: 'Accepting training and correction, applying feedback, and improving over time.',
  },
]

const ratingScale = [
  ['1', 'Seriously below expectations'],
  ['2', 'Needs improvement'],
  ['3', 'Meets expectations'],
  ['4', 'Exceeds expectations'],
  ['5', 'Exceptional'],
]

function useReviewPrivacyMetadata(title) {
  useEffect(() => {
    document.title = title

    const ensureMeta = (name) => {
      let element = document.querySelector(`meta[name="${name}"]`)
      if (!element) {
        element = document.createElement('meta')
        element.setAttribute('name', name)
        document.head.appendChild(element)
      }
      return element
    }

    ensureMeta('robots').setAttribute('content', 'noindex, nofollow')
    ensureMeta('referrer').setAttribute('content', 'no-referrer')
  }, [title])
}

function ReviewUtilityHeader() {
  return (
    <header className="review-utility-header">
      <a href="/" aria-label="E.T. Custom Landscaping home">
        <img src={logo} alt="" />
        <span>E.T. Custom Landscaping</span>
      </a>
      <span>Employee Reviews</span>
    </header>
  )
}

export function ReviewEntryPage() {
  const [accessCode, setAccessCode] = useState('')
  const [showFormatError, setShowFormatError] = useState(false)

  useReviewPrivacyMetadata('Employee Reviews | E.T. Custom Landscaping')

  const submitCode = (event) => {
    event.preventDefault()
    const code = accessCode.trim()

    if (!/^[A-Za-z0-9_-]{8,128}$/.test(code)) {
      setShowFormatError(true)
      return
    }

    window.location.assign(`/reviews/${encodeURIComponent(code)}`)
  }

  return (
    <div className="review-portal-shell review-entry-shell">
      <ReviewUtilityHeader />
      <main className="review-entry-main">
        <section className="review-entry-card" aria-labelledby="review-entry-title">
          <p className="eyebrow">Private Employee Portal</p>
          <h1 id="review-entry-title">View your reviews.</h1>
          <p>Enter your private review access code to view your published employee reviews.</p>

          <form onSubmit={submitCode} noValidate>
            <label htmlFor="reviewAccessCode">Access Code</label>
            <input
              id="reviewAccessCode"
              name="accessCode"
              type="text"
              value={accessCode}
              onChange={(event) => {
                setAccessCode(event.target.value)
                setShowFormatError(false)
              }}
              autoComplete="off"
              autoCapitalize="none"
              spellCheck="false"
              inputMode="text"
              required
              aria-describedby={showFormatError ? 'access-code-error' : undefined}
              aria-invalid={showFormatError}
            />
            {showFormatError && (
              <p className="review-form-error" id="access-code-error" role="alert">
                Enter the access code from your private review link.
              </p>
            )}
            <button type="submit">View My Reviews</button>
          </form>

          <p className="review-entry-privacy">Your access code is not saved on this device.</p>
        </section>
      </main>
    </div>
  )
}

function formatReviewDate(value) {
  if (!value) return 'Date unavailable'
  const parsed = new Date(`${value}T12:00:00`)
  if (Number.isNaN(parsed.getTime())) return 'Date unavailable'
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(parsed)
}

function RatingList({ ratings }) {
  return (
    <div className="employee-rating-list">
      {ratingCategories.map((category) => (
        <div className="employee-rating-row" key={category.key}>
          <div>
            <strong>{category.label}</strong>
            <span>{category.description}</span>
          </div>
          <output aria-label={`${category.label}: ${ratings[category.key]} out of 5`}>
            {ratings[category.key]}<small>/5</small>
          </output>
        </div>
      ))}
    </div>
  )
}

function WrittenFeedback({ review }) {
  const sections = [
    ['strengths', 'Strengths'],
    ['areasToImprove', 'Areas to Improve'],
    ['expectationsBeforeNextReview', 'Expectations Before Next Review'],
  ].filter(([key]) => typeof review[key] === 'string' && review[key].trim())

  if (!sections.length) return null

  return (
    <div className="written-feedback-grid">
      {sections.map(([key, title]) => (
        <section key={key}>
          <h3>{title}</h3>
          <p>{review[key]}</p>
        </section>
      ))}
    </div>
  )
}

function ReviewCard({ review, primary = false }) {
  return (
    <article className={`employee-review-card${primary ? ' primary' : ''}`}>
      <header>
        <div>
          <p className="review-card-kicker">{primary ? 'Latest Published Review' : 'Published Review'}</p>
          <h2>{formatReviewDate(review.reviewDate)}</h2>
          <p>
            Reviewed by {review.reviewer}
            {review.roleAtReview ? ` · ${review.roleAtReview}` : ''}
          </p>
        </div>
        <div className="average-rating" aria-label={`Average rating: ${review.averageRating} out of 5`}>
          <strong>{review.averageRating}</strong>
          <span>Average / 5</span>
        </div>
      </header>
      <RatingList ratings={review.ratings} />
      <WrittenFeedback review={review} />
    </article>
  )
}

function ReviewLoadingState() {
  return (
    <main className="review-state-main" aria-live="polite">
      <div className="review-state-card">
        <span className="review-loading-indicator" aria-hidden="true" />
        <h1>Loading your reviews…</h1>
        <p>Please wait a moment.</p>
      </div>
    </main>
  )
}

function ReviewMessageState({ title, message }) {
  return (
    <main className="review-state-main">
      <div className="review-state-card">
        <p className="eyebrow">Employee Reviews</p>
        <h1>{title}</h1>
        {message && <p>{message}</p>}
      </div>
    </main>
  )
}

export function EmployeeReviewPage({ accessCode }) {
  const [state, setState] = useState({ status: 'loading', data: null })
  const codeIsValidLooking = useMemo(() => /^[A-Za-z0-9_-]{8,128}$/.test(accessCode), [accessCode])

  useReviewPrivacyMetadata('My Employee Reviews | E.T. Custom Landscaping')

  useEffect(() => {
    if (!codeIsValidLooking) {
      setState({ status: 'not-found', data: null })
      return undefined
    }

    const controller = new AbortController()

    const loadReviews = async () => {
      try {
        const response = await fetch(`/api/reviews/${encodeURIComponent(accessCode)}`, {
          method: 'GET',
          credentials: 'same-origin',
          cache: 'no-store',
          signal: controller.signal,
          headers: { Accept: 'application/json' },
        })

        if (response.status === 404) {
          setState({ status: 'not-found', data: null })
          return
        }

        if (!response.ok) throw new Error('Review service unavailable')

        const payload = await response.json()
        if (!payload?.ok || !payload.employee || !Array.isArray(payload.reviews)) {
          throw new Error('Unexpected review response')
        }

        setState({ status: 'ready', data: payload })
      } catch (error) {
        if (error.name !== 'AbortError') setState({ status: 'error', data: null })
      }
    }

    loadReviews()
    return () => controller.abort()
  }, [accessCode, codeIsValidLooking])

  if (state.status === 'loading') {
    return <div className="review-portal-shell"><ReviewUtilityHeader /><ReviewLoadingState /></div>
  }

  if (state.status === 'not-found') {
    return (
      <div className="review-portal-shell">
        <ReviewUtilityHeader />
        <ReviewMessageState title="Review page not found." />
      </div>
    )
  }

  if (state.status === 'error') {
    return (
      <div className="review-portal-shell">
        <ReviewUtilityHeader />
        <ReviewMessageState
          title="Reviews are temporarily unavailable."
          message="Please try again in a few minutes."
        />
      </div>
    )
  }

  const { employee, reviews } = state.data
  const [latestReview, ...previousReviews] = reviews

  return (
    <div className="review-portal-shell">
      <ReviewUtilityHeader />
      <main className="employee-review-main">
        <section className="employee-review-welcome" aria-labelledby="employee-review-title">
          <p className="eyebrow">Employee Review Portal</p>
          <h1 id="employee-review-title">{employee.name}</h1>
          {employee.role && <p>{employee.role}</p>}
        </section>

        {employee.equipment.length > 0 && (
          <section className="equipment-proficiency" aria-labelledby="equipment-title">
            <div>
              <p className="review-card-kicker">Current Skills</p>
              <h2 id="equipment-title">Equipment Proficiency</h2>
              <p>These are current training statuses and are separate from performance ratings.</p>
            </div>
            <ul>
              {employee.equipment.map((item) => (
                <li key={item.name}>
                  <span>{item.name}</span>
                  <strong data-status={item.status.toLowerCase().replace(/\s+/g, '-')}>{item.status}</strong>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="rating-scale-card" aria-labelledby="rating-scale-title">
          <div>
            <p className="review-card-kicker">How Ratings Work</p>
            <h2 id="rating-scale-title">A 3 is a good, normal rating.</h2>
            <p>A rating of 3 means you are meeting the expectations of your position.</p>
          </div>
          <ol>
            {ratingScale.map(([score, meaning]) => (
              <li key={score} className={score === '3' ? 'meets-expectations' : ''}>
                <strong>{score}</strong>
                <span>{meaning}</span>
              </li>
            ))}
          </ol>
        </section>

        {latestReview ? (
          <ReviewCard review={latestReview} primary />
        ) : (
          <section className="no-published-reviews">
            <h2>No published reviews yet.</h2>
            <p>Your employee information is active, but no reviews have been published to your portal.</p>
          </section>
        )}

        {previousReviews.length > 0 && (
          <section className="previous-reviews" aria-labelledby="previous-reviews-title">
            <div>
              <p className="review-card-kicker">Review History</p>
              <h2 id="previous-reviews-title">Previous Reviews</h2>
            </div>
            {previousReviews.map((review, index) => (
              <details key={`${review.reviewDate}-${index}`}>
                <summary>
                  <span>{formatReviewDate(review.reviewDate)}</span>
                  <strong>{review.averageRating} / 5</strong>
                </summary>
                <ReviewCard review={review} />
              </details>
            ))}
          </section>
        )}
      </main>
    </div>
  )
}
