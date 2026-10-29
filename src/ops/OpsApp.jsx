import { Component, useEffect, useRef, useState } from 'react'
import logo from '../assets/ET-custom-logo.png'
import { operationsApi } from '@operations-api'
import { opsDb } from './storage/opsDb'
import './ops.css'

const SESSION_KEY = 'et-operations-session'
const ROOT_DEPLOYMENT = import.meta.env.MODE === 'operations' || import.meta.env.VITE_APP_TARGET === 'operations'
const STOP_STATE_ACTIONS = new Set(['arriveStop', 'startWork', 'pauseStop', 'resumeStop', 'stopForDay', 'completeStop', 'abortStop', 'abortRoute', 'departStop', 'joinStop', 'leaveStop', 'switchStop', 'returnStop', 'logRunInterruption'])
const MUTATION_LABELS = {
  createRun: 'Creating route run…',
  createLiveRun: 'Starting live route…',
  createRoute: 'Creating route…',
  updateRoute: 'Saving route…',
  createStop: 'Creating Stop…',
  updateStop: 'Saving Stop…',
  startRun: 'Starting route…',
  updateRunCrewCount: 'Saving route crew count…',
  stopRunForDay: 'Stopping route for the day…',
  resumeRun: 'Resuming route…',
  arriveStop: 'Saving arrival…',
  startWork: 'Saving work start…',
  pauseStop: 'Saving pause…',
  resumeStop: 'Saving resume…',
  stopForDay: 'Saving stop for day…',
  completeStop: 'Saving completion…',
  departStop: 'Saving departure…',
  joinStop: 'Saving crew join…',
  leaveStop: 'Saving crew departure…',
  switchStop: 'Saving stop change…',
  updateStopCrewCount: 'Saving crew count…',
  completeRun: 'Saving route completion…',
  abortStop: 'Saving Stop abort…',
  abortRoute: 'Saving route abort…',
  removeFromHistory: 'Removing record from History…',
  returnStop: 'Saving return visit…',
  logRunInterruption: 'Saving route interruption…',
  addTravelDelay: 'Saving travel delay…',
  editTravelDelay: 'Saving travel correction…',
  addRunStop: 'Adding Stop…',
  saveRunAsRoute: 'Saving reusable route…',
  saveRoute: 'Saving route…',
  archiveRoute: 'Archiving route…',
  restoreRoute: 'Restoring route…',
  deleteArchivedRoute: 'Deleting route…',
  archiveStop: 'Archiving Stop…',
  restoreStop: 'Restoring Stop…',
  deleteArchivedStop: 'Deleting Stop…',
  reportPropertyIssue: 'Saving property issue…',
  reportMachineIssue: 'Saving equipment issue…',
  reportRunIssue: 'Saving route issue…',
  resolvePropertyIssue: 'Resolving property issue…',
  resolveMachineIssue: 'Resolving equipment issue…',
  resolveRunIssue: 'Resolving route issue…',
  editTimestamp: 'Saving corrected time…',
  createUser: 'Creating user…',
  resetPassword: 'Resetting password…',
  revokeSessions: 'Revoking sessions…',
}

function savingLabel(action) {
  return MUTATION_LABELS[action] || 'Saving change…'
}

function formatMinutes(value) {
  const minutes = Math.max(0, Math.round(Number(value) || 0))
  const hours = Math.floor(minutes / 60)
  const remainder = minutes % 60
  if (!hours) return `${remainder} min`
  if (!remainder) return `${hours} hr`
  return `${hours} hr ${remainder} min`
}

function formatTime(value) {
  if (!value) return 'Not recorded'
  return new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', hour: 'numeric', minute: '2-digit' }).format(new Date(value))
}

function ordinal(value) {
  const number = Number(value)
  if (!number) return '—'
  const mod100 = number % 100
  const suffix = mod100 >= 11 && mod100 <= 13 ? 'th' : ({ 1: 'st', 2: 'nd', 3: 'rd' }[number % 10] || 'th')
  return `${number}${suffix}`
}

function cx(...parts) {
  return parts.filter(Boolean).join(' ')
}

function rawTruckValue(value) {
  return value == null ? '' : String(value)
}

function availableTruckCategories(properties) {
  return [...new Set(properties.map((property) => rawTruckValue(property.truck)).filter((value) => value !== ''))]
    .sort((left, right) => left.localeCompare(right, undefined, { numeric: true }))
}

function opsPath() {
  const path = window.location.pathname.replace(/\/+$/, '')
  if (ROOT_DEPLOYMENT) return `/ops${path === '' || path === '/' ? '' : path}`
  return path.startsWith('/ops') ? path : '/ops'
}

function useOpsNavigation() {
  const [path, setPath] = useState(opsPath)
  useEffect(() => {
    const update = () => setPath(opsPath())
    window.addEventListener('popstate', update)
    return () => window.removeEventListener('popstate', update)
  }, [])
  const navigate = (nextPath) => {
    const target = ROOT_DEPLOYMENT ? nextPath.replace(/^\/ops/, '') || '/' : nextPath
    window.history.pushState({}, '', target)
    const internalPath = nextPath.split('?')[0].split('#')[0]
    setPath(internalPath.replace(/\/+$/, '') || '/ops')
    window.scrollTo(0, 0)
  }
  return { path, navigate }
}

function applyOptimisticAction(source, action, payload) {
  const next = structuredClone(source)
  const run = payload.runId ? next.activeRuns.find((item) => item.id === payload.runId) : null
  const stop = run && payload.runStopId ? run.stops.find((item) => item.id === payload.runStopId) : null
  const at = payload.at || new Date().toISOString()
  const nextOrder = () => Math.max(0, ...run.stops.map((item) => item.actualOrder || 0)) + 1

  if (action === 'startRun') Object.assign(run, { status: 'Active', startedAt: at })
  if (action === 'updateRunCrewCount') run.startingCrewCount = Number(payload.crewCount)
  if (action === 'completeRun') Object.assign(run, { status: 'Completed', endedAt: at })
  if (action === 'abortRoute' && run) Object.assign(run, { status: 'Aborted', endedAt: at })
  if (action === 'arriveStop') Object.assign(stop, { status: 'Active', arrivedAt: at, actualOrder: stop.actualOrder || nextOrder() })
  if (action === 'startWork' || action === 'resumeStop') Object.assign(stop, { status: 'Active', firstWorkStartedAt: stop.firstWorkStartedAt || at, activeSegmentStartedAt: at, pauseStartedAt: undefined })
  if (action === 'pauseStop') Object.assign(stop, { status: 'Paused', pauseStartedAt: at })
  if (action === 'stopForDay') Object.assign(stop, { status: 'Stopped for Day', stoppedAt: at })
  if (action === 'completeStop') Object.assign(stop, { status: 'Completed', completedAt: at, activeWorkMinutes: Math.max(stop.activeWorkMinutes || 0, 24) })
  if (action === 'abortStop' && stop) stop.status = payload.mode === 'partial' ? 'Aborted — Partial Work' : 'Voided'
  if (action === 'returnStop' && stop) Object.assign(stop, { status: 'Returned', completedAt: undefined, departedAt: undefined })
  if (action === 'departStop') stop.departedAt = at
  if (action === 'updateStopCrewCount') stop.crewCount = Number(payload.crewCount)
  if (action === 'switchStop') {
    const nextStop = run.stops.find((item) => item.id === payload.nextRunStopId)
    if (stop?.status === 'Active') stop.status = 'Paused'
    Object.assign(nextStop, { status: 'Active', arrivedAt: nextStop.arrivedAt || at, actualOrder: nextStop.actualOrder || nextOrder() })
  }
  if (action === 'addTravelDelay') run.travelDelays = [...(run.travelDelays || []), { id: `LOCAL-${Date.now()}`, reason: payload.reason, excludedMinutes: Number(payload.minutes), startedAt: at }]
  if (action === 'editTimestamp' && stop && payload.field) stop[payload.field] = payload.value
  if (action === 'reportPropertyIssue') next.propertyIssues.push({ id: `LOCAL-PI-${Date.now()}`, reportedAt: at, status: 'Open', ...payload })
  if (action === 'reportMachineIssue') {
    next.machineIssues.push({ id: `LOCAL-MI-${Date.now()}`, reportedAt: at, status: 'Open', ...payload })
    const machine = next.machines.find((item) => item.id === payload.machineId)
    if (machine) machine.status = payload.severity
  }
  if (action === 'resolvePropertyIssue') {
    const issue = next.propertyIssues.find((item) => item.id === payload.issueId)
    if (issue) Object.assign(issue, { status: 'Resolved', resolutionOutcome: payload.outcome, resolutionNotes: payload.notes, resolvedAt: at })
  }
  if (action === 'resolveMachineIssue') {
    const issue = next.machineIssues.find((item) => item.id === payload.issueId)
    if (issue) Object.assign(issue, { status: 'Resolved', resolutionOutcome: payload.outcome, resolutionNotes: payload.notes, resolvedAt: at })
  }
  if (action === 'archiveRoute') {
    const route = next.routes.find((item) => item.id === payload.routeId)
    if (route) Object.assign(route, { archived: true, active: false })
  }
  if (action === 'createStop') {
    const requestedIds = [...new Set(payload.propertyIds)].sort()
    const existing = next.stops.find((item) => !item.archived && [...item.propertyIds].sort().join('|') === requestedIds.join('|'))
    if (!existing) next.stops.push({ id: `LOCAL-STP-${Date.now()}`, name: payload.name, propertyIds: requestedIds, propertyCount: requestedIds.length, active: true, archived: false })
  }
  return next
}

function Login({ onLogin, pending, error }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  return (
    <div className="ops-login-shell">
      <main className="ops-login-card">
        <div className="ops-login-brand"><img src={logo} alt="" /><div><strong>E.T. Operations</strong><span>Field operations</span></div></div>
        <div className="ops-login-heading"><span>Secure team access</span><h1>Sign in to today’s work.</h1><p>Your session stays available on this device so you can keep moving throughout the day.</p></div>
        <form onSubmit={(event) => { event.preventDefault(); onLogin(username, password) }}>
          <label>Username<input autoCapitalize="none" autoComplete="username" value={username} onChange={(event) => setUsername(event.target.value)} /></label>
          <label>Password<input type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} /></label>
          {error && <p className="ops-form-error" role="alert">{error}</p>}
          <button className="ops-button ops-button-primary ops-button-large" disabled={pending}>{pending ? 'Signing in…' : 'Sign in'}</button>
        </form>
        {operationsApi.mode === 'mock' ? <p className="ops-demo-note"><strong>Development mock mode:</strong> use <code>tyler</code> for admin or <code>john</code> for route leader with any password.</p> : <p className="ops-login-security">Use the username and password created by an Operations administrator.</p>}
      </main>
    </div>
  )
}

function ConnectionStatus({ online, syncing, pendingCount, failedCount, activeMutation }) {
  let text = 'Synced'
  let state = 'synced'
  if (!online) { text = `Offline — ${pendingCount} change${pendingCount === 1 ? '' : 's'} queued`; state = 'offline' }
  else if (syncing) { text = 'Syncing'; state = 'syncing' }
  else if (activeMutation) { text = activeMutation.label; state = 'syncing' }
  else if (failedCount) { text = `${failedCount} change${failedCount === 1 ? '' : 's'} need attention`; state = 'failed' }
  return <div className={`ops-sync ops-sync-${state}`}><span />{text}</div>
}

function MutationFailureBanner({ failure, online, onRetry, onResolve }) {
  if (!failure) return null
  return <section className="ops-mutation-failure" role="alert"><div><span>Online backend mutation failed</span><strong>{failure.message}</strong><small>{failure.action}{failure.code ? ` · ${failure.code}` : ''} · Mutation ${failure.mutationId}</small></div><div><button className="ops-button ops-button-primary" disabled={!online} onClick={() => onRetry(failure)}>Retry</button><button className="ops-button ops-button-secondary" onClick={() => onResolve(failure)}>Resolve</button></div></section>
}

function MutationBlockingOverlay({ mutation }) {
  if (!mutation || mutation.source === 'offline') return null
  return <div className="ops-mutation-overlay" role="status" aria-live="assertive" aria-busy="true"><div><span className="ops-saving-spinner" /><strong>{mutation.label}</strong><p>Waiting for the Operations backend. Other changes are temporarily blocked.</p></div></div>
}

function Shell({ user, path, navigate, onLogout, sync, mutationFailure, onRetryMutation, onResolveMutation, children }) {
  const section = path.split('/')[2] || 'dashboard'
  const navItems = [
    ['dashboard', '/ops', 'Today', '⌂'],
    ['routes', '/ops/routes', 'Routes', '↕'],
    ['issues', '/ops/issues', 'Issues', '!'],
    ['machines', '/ops/machines', 'Equipment', '⚙'],
  ]
  if (user.admin) navItems.push(['history', '/ops/history', 'History', '◷'], ['users', '/ops/users', 'Users', '♙'])
  return (
    <div className="ops-app">
      <header className="ops-topbar">
        <button className="ops-brand-button" onClick={() => navigate('/ops')} aria-label="Operations dashboard"><img src={logo} alt="" /><span><strong>E.T. Operations</strong><small>{operationsApi.mode === 'mock' ? 'Preview data' : 'Live'}</small></span></button>
        <div className="ops-topbar-actions"><ConnectionStatus {...sync} /><button className="ops-user-button" onClick={onLogout}><span>{user.name.slice(0, 1)}</span><b>{user.name}</b><small>Sign out</small></button></div>
      </header>
      <div className="ops-layout">
        <aside className="ops-sidebar" aria-label="Operations navigation">
          <nav>{navItems.map(([id, href, label, icon]) => <button className={section === id || (id === 'dashboard' && section === 'dashboard') ? 'active' : ''} key={id} onClick={() => navigate(href)}><span>{icon}</span>{label}</button>)}</nav>
          {user.admin && <div className="ops-admin-tag">Admin access</div>}
        </aside>
        <main className="ops-content"><MutationFailureBanner failure={mutationFailure} online={sync.online} onRetry={onRetryMutation} onResolve={onResolveMutation} />{children}</main>
      </div>
      <nav className="ops-bottom-nav" aria-label="Mobile operations navigation">{navItems.map(([id, href, label, icon]) => <button className={section === id || (id === 'dashboard' && section === 'dashboard') ? 'active' : ''} key={id} onClick={() => navigate(href)}><span>{icon}</span>{label}</button>)}</nav>
    </div>
  )
}

function PageHeading({ eyebrow, title, copy, actions }) {
  return <header className="ops-page-heading"><div><span>{eyebrow}</span><h1>{title}</h1>{copy && <p>{copy}</p>}</div>{actions && <div className="ops-heading-actions">{actions}</div>}</header>
}

function ProgressBar({ value, label }) {
  return <div className="ops-progress"><div><span>{label}</span><strong>{Math.round(value)}%</strong></div><div className="ops-progress-track"><i style={{ width: `${Math.min(100, Math.max(0, value))}%` }} /></div></div>
}

function StatusPill({ value }) {
  return <span className={`ops-status ops-status-${String(value).toLowerCase().replaceAll(' ', '-')}`}>{value}</span>
}

function Dashboard({ data, user, navigate }) {
  const ownRuns = data.activeRuns.filter((run) => run.routeLeaderUserId === user.id && !['Completed', 'Canceled'].includes(run.status))
  const ownRun = ownRuns[0]
  const leaders = data.activeRuns.filter((run) => run.routeLeaderUserId !== user.id && !['Completed', 'Canceled'].includes(run.status))
  const openImportant = [...data.propertyIssues, ...data.machineIssues, ...data.runIssues].filter((issue) => issue.status === 'Open' && !['Informational', 'Issue'].includes(issue.severity))
  const completed = ownRun?.stops.filter((stop) => stop.status === 'Completed').length || 0
  const current = ownRun?.stops.find((stop) => ['Active', 'Paused', 'Stopped for Day'].includes(stop.status))

  return <>
    <PageHeading eyebrow="Field dashboard" title={`Good ${new Date().getHours() < 12 ? 'morning' : 'afternoon'}, ${user.name}.`} copy="Everything needed to run today’s work, without digging through extra screens." actions={!ownRun && <button className="ops-button ops-button-primary" onClick={() => navigate('/ops/start')}>Start a route</button>} />
    {ownRun ? <section className="ops-today-card">
      <div className="ops-today-top"><div><span>Today’s route</span><h2>{ownRun.routeName}</h2><p>{ownRun.truck} · {ownRun.startingCrewCount} people</p></div><StatusPill value={ownRun.status} /></div>
      <ProgressBar value={ownRun.stops.length ? completed / ownRun.stops.length * 100 : 0} label={`${completed} of ${ownRun.stops.length} stops complete`} />
      <div className="ops-today-grid"><div><span>Current stop</span><strong>{current?.stopName || 'Choose your first stop'}</strong></div><div><span>Baseline remaining</span><strong>{formatMinutes(ownRun.stops.filter((stop) => stop.status !== 'Completed').reduce((sum, stop) => sum + stop.baselineEstimateMinutes, 0))}</strong></div><div><span>Historical remaining</span><strong>{formatMinutes(ownRun.stops.filter((stop) => stop.status !== 'Completed').reduce((sum, stop) => sum + (stop.historicalAverageMinutes || stop.baselineEstimateMinutes), 0))}</strong></div></div>
      <button className="ops-button ops-button-primary ops-button-large" onClick={() => navigate(`/ops/run/${ownRun.id}`)}>{ownRun.status === 'Not Started' ? 'Review and start route' : 'Continue route'}</button>
    </section> : <section className="ops-empty-hero"><span>No route started</span><h2>Ready when the crew is.</h2><p>Choose a shared company route, confirm the truck and crew count, then start the day.</p><button className="ops-button ops-button-primary ops-button-large" onClick={() => navigate('/ops/start')}>Choose today’s route</button></section>}

    <div className="ops-dashboard-grid">
      <section className="ops-panel"><div className="ops-panel-heading"><div><span>Team visibility</span><h2>Other active routes</h2></div></div>{leaders.length ? <div className="ops-leader-list">{leaders.map((run) => { const leader = run.routeLeaderName || 'Route leader'; const done = run.stops.filter((stop) => stop.status === 'Completed').length; const active = run.stops.find((stop) => ['Active', 'Arrived', 'Paused'].includes(stop.status)); return <article key={run.id}><div className="ops-avatar">{leader[0]}</div><div><strong>{leader} · {run.routeName}</strong><span>{active?.stopName || 'Between stops'} · {active?.dailyService?.currentCrewCount || run.startingCrewCount} current crew{active?.shared ? ' · Shared Stop' : ''}{active?.firstWorkStartedAt ? ` · Started ${formatTime(active.firstWorkStartedAt)}` : ''}{active?.shared && active?.participantJoinedAt && active.participantJoinedAt !== active.firstWorkStartedAt ? ` · This route joined ${formatTime(active.participantJoinedAt)}` : ''}</span><ProgressBar value={run.stops.length ? done / run.stops.length * 100 : 0} label={`${done}/${run.stops.length} complete`} /></div><StatusPill value={run.status} /></article> })}</div> : <p className="ops-empty-copy">No other route leaders are currently working.</p>}</section>
      <section className="ops-panel"><div className="ops-panel-heading"><div><span>Needs attention</span><h2>Important open issues</h2></div><button onClick={() => navigate('/ops/issues')}>View all</button></div>{openImportant.length ? <div className="ops-issue-list">{openImportant.slice(0, 4).map((issue) => <article key={issue.id}><StatusPill value={issue.severity} /><strong>{issue.issueType || issue.machineId || 'Operational issue'}</strong><p>{issue.description}</p></article>)}</div> : <div className="ops-clear-state"><span>✓</span><div><strong>No important issues</strong><p>Nothing urgent is currently open.</p></div></div>}</section>
    </div>
  </>
}

function RouteLibrary({ data, user, navigate, perform }) {
  const [showArchived, setShowArchived] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const routes = data.routes.filter((route) => showArchived || !route.archived)
  const reusableStops = data.stops.filter((stop) => showArchived || !stop.archived)
  return <>
    <PageHeading eyebrow="Shared company routes" title="Route Library" copy="Reusable templates are shared across the company. Daily runs keep their own historical snapshots." actions={<><button className="ops-button ops-button-secondary" onClick={() => setShowArchived((value) => !value)}>{showArchived ? 'Hide archived' : 'Show archived'}</button>{user.admin && <button className="ops-button ops-button-primary" onClick={() => navigate('/ops/routes/builder')}>Build route</button>}</>} />
    <div className="ops-route-grid">{routes.map((route) => {
      const stops = route.stops.map((item) => data.stops.find((stop) => stop.id === item.stopId)).filter(Boolean)
      const minutes = stops.reduce((sum, stop) => sum + stop.propertyCount * 30, 0)
      return <article className={cx('ops-route-card', route.archived && 'archived')} key={route.id}><div className="ops-route-card-top"><StatusPill value={route.archived ? 'Archived' : 'Active'} /><span>Version {route.version}</span></div><h2>{route.name}</h2><p>{route.notes || 'No route notes.'}</p><div className="ops-route-stats"><div><strong>{stops.length}</strong><span>Stops</span></div><div><strong>{stops.reduce((sum, stop) => sum + stop.propertyCount, 0)}</strong><span>Properties</span></div><div><strong>{formatMinutes(minutes)}</strong><span>Baseline · 2 people</span></div></div><div className="ops-route-actions">{!route.archived && <button className="ops-button ops-button-primary" onClick={() => navigate(`/ops/start?route=${route.id}`)}>Use route</button>}{user.admin && <>{!route.archived ? <><button className="ops-button ops-button-secondary" onClick={() => navigate(`/ops/routes/builder?route=${route.id}`)}>Edit</button><button className="ops-button ops-button-quiet" onClick={() => perform('archiveRoute', { routeId: route.id, reason: 'Archived by administrator' })}>Archive</button></> : <><button className="ops-button ops-button-secondary" onClick={() => perform('restoreRoute', { routeId: route.id, reason: 'Restored by administrator' })}>Restore</button><button className="ops-button ops-button-danger" onClick={() => setDeleteTarget({ type: 'Route', id: route.id, name: route.name })}>Delete Permanently</button></>}</>}</div></article>
    })}</div>
    {user.admin && <section className="ops-panel"><div className="ops-panel-heading"><div><span>Admin reusable Stop management</span><h2>Reusable Stops</h2></div></div><div className="ops-reusable-stop-list">{reusableStops.map((stop) => <article key={stop.id}><div><strong>{stop.name}</strong><span>{stop.propertyCount} {stop.propertyCount === 1 ? 'property' : 'properties'} · {stop.archived ? 'Archived' : 'Active'}</span></div><div className="ops-heading-actions"><button onClick={() => perform(stop.archived ? 'restoreStop' : 'archiveStop', { stopId: stop.id, reason: stop.archived ? 'Restored by administrator' : 'Archived by administrator' })}>{stop.archived ? 'Restore' : 'Archive'}</button>{stop.archived && <button className="ops-button ops-button-danger" onClick={() => setDeleteTarget({ type: 'Stop', id: stop.id, name: stop.name })}>Delete Permanently</button>}</div></article>)}</div></section>}
    {deleteTarget && <PermanentDeleteForm target={deleteTarget} onClose={() => setDeleteTarget(null)} onSubmit={async (values) => { await perform(deleteTarget.type === 'Route' ? 'deleteArchivedRoute' : 'deleteArchivedStop', { [deleteTarget.type === 'Route' ? 'routeId' : 'stopId']: deleteTarget.id, ...values }); setDeleteTarget(null) }} />}
  </>
}

function PermanentDeleteForm({ target, onClose, onSubmit }) {
  const [reason, setReason] = useState('')
  const [confirmation, setConfirmation] = useState('')
  return <Modal title={`Permanently delete ${target.name}?`} onClose={onClose}><form className="ops-stack-form" onSubmit={(event) => { event.preventDefault(); onSubmit({ reason: reason.trim(), confirmation }) }}><div className="ops-warning-panel"><strong>This cannot be recovered.</strong><p>The archived reusable {target.type} and its template relationships will be permanently deleted. Historical dependencies will cause the backend to block deletion.</p></div><label className="ops-field">Required reason<textarea required value={reason} onChange={(event) => setReason(event.target.value)} /></label><label className="ops-field">Type <strong>Delete permanently</strong><input required value={confirmation} onChange={(event) => setConfirmation(event.target.value)} /></label><button className="ops-button ops-button-danger ops-button-large" disabled={!reason.trim() || confirmation !== 'Delete permanently'}>Delete Permanently</button></form></Modal>
}

function RouteBuilder({ data, navigate, perform }) {
  const query = new URLSearchParams(window.location.search)
  const existing = data.routes.find((route) => route.id === query.get('route'))
  const [name, setName] = useState(existing?.name || '')
  const [search, setSearch] = useState('')
  const [stopSearch, setStopSearch] = useState('')
  const [truckFilter, setTruckFilter] = useState('')
  const [selectedPropertyIds, setSelectedPropertyIds] = useState([])
  const [groupName, setGroupName] = useState('')
  const [plannedItems, setPlannedItems] = useState(() => existing?.stops.map((routeStop, index) => {
    const stop = data.stops.find((item) => item.id === routeStop.stopId)
    if (stop?.propertyIds.length === 1) return { key: `property-${stop.propertyIds[0]}-${index}`, kind: 'property', propertyId: stop.propertyIds[0] }
    return { key: `stop-${routeStop.stopId}-${index}`, kind: 'stop', stopId: routeStop.stopId }
  }) || [])
  const truckCategories = availableTruckCategories(data.properties)
  const usedPropertyIds = new Set(plannedItems.flatMap((item) => {
    if (item.kind === 'property') return [item.propertyId]
    if (item.kind === 'group') return item.propertyIds
    return data.stops.find((stop) => stop.id === item.stopId)?.propertyIds || []
  }))
  const visibleProperties = data.properties.filter((property) => {
    const sourceTruck = rawTruckValue(property.truck)
    const searchable = `${property.name} ${property.address} ${property.day || ''} ${sourceTruck}`.toLowerCase()
    const matchesTruck = truckFilter === '' || sourceTruck === truckFilter
    return property.active && matchesTruck && searchable.includes(search.toLowerCase())
  })
  const reusableStops = data.stops.filter((stop) => {
    if (stop.archived || !stop.active || stop.propertyIds.length < 2 || stop.propertyIds.some((id) => usedPropertyIds.has(id))) return false
    const propertyNames = stop.propertyIds.map((id) => data.properties.find((property) => property.id === id)?.name || '').join(' ')
    return `${stop.name} ${propertyNames}`.toLowerCase().includes(stopSearch.toLowerCase())
  })
  const addProperty = (propertyId) => {
    if (usedPropertyIds.has(propertyId)) return
    setPlannedItems((items) => [...items, { key: crypto.randomUUID(), kind: 'property', propertyId }])
    setSelectedPropertyIds((items) => items.filter((id) => id !== propertyId))
  }
  const toggleProperty = (propertyId) => setSelectedPropertyIds((items) => items.includes(propertyId) ? items.filter((id) => id !== propertyId) : [...items, propertyId])
  const groupSelected = () => {
    const propertyIds = selectedPropertyIds.filter((id) => !usedPropertyIds.has(id))
    if (propertyIds.length < 2) return
    const defaultName = propertyIds.map((id) => data.properties.find((property) => property.id === id)?.name).filter(Boolean).join(' + ')
    setPlannedItems((items) => [...items, { key: crypto.randomUUID(), kind: 'group', propertyIds, name: groupName.trim() || defaultName }])
    setSelectedPropertyIds([])
    setGroupName('')
  }
  const addExistingStop = (stop) => {
    if (stop.propertyIds.some((id) => usedPropertyIds.has(id))) return
    setPlannedItems((items) => [...items, { key: crypto.randomUUID(), kind: 'stop', stopId: stop.id }])
  }
  const move = (index, direction) => { const next = [...plannedItems]; const target = index + direction; if (target < 0 || target >= next.length) return; [next[index], next[target]] = [next[target], next[index]]; setPlannedItems(next) }
  const save = async () => {
    const items = plannedItems.map((item) => {
      if (item.kind === 'property') return { propertyId: item.propertyId }
      if (item.kind === 'group') return { propertyIds: item.propertyIds, name: item.name }
      return { stopId: item.stopId }
    })
    const route = { id: existing?.id, name: name.trim() || 'Untitled Route', notes: existing?.notes || '', items }
    await perform('saveRoute', { route })
    navigate('/ops/routes')
  }
  return <>
    <PageHeading eyebrow="Admin route management" title={existing ? `Edit ${existing.name}` : 'Build a shared route'} copy="Add properties directly, group nearby properties when they should share one timed visit, and arrange the route in order." actions={<button className="ops-button ops-button-quiet" onClick={() => navigate('/ops/routes')}>Cancel</button>} />
    <div className="ops-builder-layout">
      <section className="ops-panel ops-builder-source"><label className="ops-field">Route name<input value={name} onChange={(event) => setName(event.target.value)} placeholder="Example: Monday" /></label><div className="ops-property-filters"><label className="ops-search"><span>⌕</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name, address, day, or truck category" /></label><label className="ops-field">Truck category<select value={truckFilter} onChange={(event) => setTruckFilter(event.target.value)}><option value="">All categories</option>{truckCategories.map((category) => <option key={category} value={category}>{category}</option>)}</select></label></div><div className="ops-builder-tabs"><strong>Properties</strong><span>{visibleProperties.length} active</span></div><div className="ops-property-picker">{visibleProperties.map((property) => { const added = usedPropertyIds.has(property.id); const selected = selectedPropertyIds.includes(property.id); return <article className={cx(added && 'added', selected && 'selected')} key={property.id}><label className="ops-property-select"><input type="checkbox" disabled={added} checked={selected} onChange={() => toggleProperty(property.id)} /><span>Select</span></label><div><strong>{property.name}</strong><span>{property.address}</span><small>{property.day} · Truck category: {rawTruckValue(property.truck) || 'Not assigned'} · {property.serviceType}</small></div><button disabled={added} onClick={() => addProperty(property.id)}>{added ? 'Added' : 'Add to route'}</button></article> })}</div></section>
      <section className="ops-builder-canvas"><div className="ops-group-selection"><div><span>Group properties into one timed visit</span><strong>{selectedPropertyIds.length} selected</strong></div><p>Select two or more properties on the left, then group them into a reusable Stop.</p><div className="ops-create-stop"><input aria-label="Grouped Stop name" placeholder="Group name (optional)" value={groupName} onChange={(event) => setGroupName(event.target.value)} /><button disabled={selectedPropertyIds.length < 2} onClick={groupSelected}>Group into Stop</button></div></div><div className="ops-reusable-stops"><div className="ops-builder-list-heading"><div><span>Reusable groups</span><h2>Existing multi-property Stops</h2></div></div><label className="ops-search"><span>⌕</span><input value={stopSearch} onChange={(event) => setStopSearch(event.target.value)} placeholder="Search grouped Stops" /></label><div className="ops-reusable-stop-list">{reusableStops.map((stop) => { const properties = stop.propertyIds.map((id) => data.properties.find((property) => property.id === id)).filter(Boolean); return <article key={stop.id}><div><strong>{stop.name}</strong><span>{properties.map((property) => property.name).join(' + ')}</span></div><button onClick={() => addExistingStop(stop)}>Add group</button></article> })}{!reusableStops.length && <p>No available grouped Stops match this search.</p>}</div></div><div className="ops-builder-list-heading"><div><span>Planned route</span><h2>{plannedItems.length} {plannedItems.length === 1 ? 'visit' : 'visits'}</h2></div></div><div className="ops-sortable-list">{plannedItems.map((item, index) => { const stop = item.kind === 'stop' ? data.stops.find((candidate) => candidate.id === item.stopId) : null; const propertyIds = item.kind === 'property' ? [item.propertyId] : item.kind === 'group' ? item.propertyIds : stop?.propertyIds || []; const properties = propertyIds.map((id) => data.properties.find((property) => property.id === id)).filter(Boolean); const title = item.kind === 'property' ? properties[0]?.name : item.kind === 'group' ? item.name : stop?.name; return <article key={item.key}><span className="ops-order-number">{index + 1}</span><div><strong>{title || 'Route visit'}</strong><span>{item.kind === 'property' ? properties[0]?.address : properties.map((property) => property.name).join(' + ')}</span><small>{propertyIds.length === 1 ? 'Individual property' : `${propertyIds.length} properties · grouped Stop`}</small></div><div className="ops-reorder"><button disabled={index === 0} onClick={() => move(index, -1)}>↑</button><button disabled={index === plannedItems.length - 1} onClick={() => move(index, 1)}>↓</button><button aria-label={`Remove ${title || 'visit'}`} onClick={() => setPlannedItems((items) => items.filter((candidate) => candidate.key !== item.key))}>×</button></div></article> })}{!plannedItems.length && <div className="ops-drop-empty"><strong>No route visits yet</strong><p>Add a property directly or add a reusable grouped Stop.</p></div>}</div><button className="ops-button ops-button-primary ops-button-large" disabled={!plannedItems.length} onClick={save}>Save shared route</button></section>
    </div>
  </>
}

function StartRoute({ data, user, onCreate, onCreateLive }) {
  const query = new URLSearchParams(window.location.search)
  const truckCategories = availableTruckCategories(data.properties)
  const [mode, setMode] = useState('existing')
  const [routeId, setRouteId] = useState(query.get('route') || data.routes.find((route) => !route.archived)?.id || '')
  const [truck, setTruck] = useState(truckCategories[0] || '')
  const [crewCount, setCrewCount] = useState(2)
  const [liveName, setLiveName] = useState('Live Route')
  const route = data.routes.find((item) => item.id === routeId)
  const routeStops = route?.stops.map((item) => data.stops.find((stop) => stop.id === item.stopId)).filter(Boolean) || []
  const baseline = routeStops.reduce((total, stop) => total + stop.propertyCount * (crewCount === 1 ? 60 : crewCount === 2 ? 30 : crewCount === 3 ? 20 : 15), 0)
  const historical = routeStops.reduce((total, stop) => total + (stop.propertyCount === 2 ? 52 : 28), 0)
  return <>
    <PageHeading eyebrow="Daily route run" title="Start today’s work" copy="Use an established route or begin empty and add each property or grouped Stop as you reach it." />
    <div className="ops-mode-picker"><button className={mode === 'existing' ? 'active' : ''} onClick={() => setMode('existing')}><strong>Existing Route</strong><span>Start from a saved route template.</span></button><button className={mode === 'live' ? 'active' : ''} onClick={() => setMode('live')}><strong>Build as You Go</strong><span>Start empty and construct today’s route live.</span></button></div>
    <div className="ops-start-layout"><section className="ops-panel ops-start-form">{mode === 'existing' ? <label className="ops-field">Shared route<select value={routeId} onChange={(event) => setRouteId(event.target.value)}>{data.routes.filter((item) => item.active && !item.archived).map((item) => <option key={item.id} value={item.id}>{item.name} · v{item.version}</option>)}</select></label> : <label className="ops-field">Working name<input value={liveName} onChange={(event) => setLiveName(event.target.value)} /></label>}<label className="ops-field">Truck/category<input list="ops-truck-categories" value={truck} required onChange={(event) => setTruck(event.target.value)} placeholder="Enter the source category" /><datalist id="ops-truck-categories">{truckCategories.map((category) => <option key={category} value={category} />)}</datalist></label><div className="ops-field"><span>Route leader</span><div className="ops-readonly-field"><span className="ops-avatar small">{user.name[0]}</span><strong>{user.name}</strong></div></div><fieldset className="ops-crew-picker"><legend>Starting crew count</legend><div>{[1, 2, 3, 4].map((count) => <button className={crewCount === count ? 'selected' : ''} type="button" key={count} onClick={() => setCrewCount(count)}><strong>{count}</strong><span>{count === 1 ? 'person' : 'people'}</span></button>)}</div></fieldset><button className="ops-button ops-button-primary ops-button-large" onClick={() => mode === 'live' ? onCreateLive({ name: liveName, routeLeaderUserId: user.id, crewCount, truck }) : onCreate({ routeId, routeLeaderUserId: user.id, crewCount, truck })}>{mode === 'live' ? 'Start empty live route' : 'Create route run'}</button></section><aside className="ops-start-summary"><span>{mode === 'live' ? 'Live route' : 'Run preview'}</span><h2>{mode === 'live' ? liveName : route?.name || 'Choose a route'}</h2><p>{mode === 'live' ? 'No Stops yet. Add the first property when you arrive.' : route?.notes}</p>{mode === 'existing' && <><div><article><span>Stops</span><strong>{routeStops.length}</strong></article><article><span>Properties</span><strong>{routeStops.reduce((sum, stop) => sum + stop.propertyCount, 0)}</strong></article><article><span>Baseline estimate</span><strong>{formatMinutes(baseline)}</strong></article><article><span>Historical estimate</span><strong>{formatMinutes(historical)}</strong></article></div><ol>{routeStops.map((stop, index) => <li key={stop.id}><span>{index + 1}</span>{stop.name}</li>)}</ol></>}</aside></div>
  </>
}

function StopPropertyCard({ property, issues, onReport }) {
  return <article className="ops-property-card"><div className="ops-property-card-top"><div><span>{property.serviceType || 'Service'}</span><h3>{property.name}</h3><p>{property.address}</p></div><button onClick={() => onReport(property.id)}>Report issue</button></div>{property.notes && <div className="ops-property-note"><strong>Property note</strong><p>{property.notes}</p></div>}{issues.map((issue) => <div className={`ops-inline-alert ${issue.severity.toLowerCase()}`} key={issue.id}><StatusPill value={issue.severity} /><div><strong>{issue.issueType}</strong><p>{issue.description}</p></div></div>)}</article>
}

function AddRunStopModal({ data, run, onClose, onAdd }) {
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState([])
  const [name, setName] = useState('')
  const [persistToRoute, setPersistToRoute] = useState(false)
  const used = new Set(run.stops.flatMap((runStop) => data.stops.find((stop) => stop.id === runStop.stopId)?.propertyIds || []))
  const properties = data.properties.filter((property) => property.active && !used.has(property.id) && `${property.name} ${property.address} ${property.truck}`.toLowerCase().includes(search.toLowerCase()))
  const submit = () => {
    if (!selected.length) return
    onAdd({ propertyIds: selected, name: name.trim(), persistToRoute })
  }
  return <Modal title="Add the next Stop" onClose={onClose}><div className="ops-live-stop-form"><label className="ops-search"><span>⌕</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search synced properties" /></label><div className="ops-live-property-list">{properties.map((property) => <label key={property.id}><input type="checkbox" checked={selected.includes(property.id)} onChange={() => setSelected((items) => items.includes(property.id) ? items.filter((id) => id !== property.id) : [...items, property.id])} /><span><strong>{property.name}</strong><small>{property.address} · Truck {property.truck}</small></span></label>)}</div>{selected.length > 1 && <label className="ops-field">Grouped Stop name (optional)<input value={name} onChange={(event) => setName(event.target.value)} placeholder="Example: Oak Street group" /></label>}{run.routeId && <label className="ops-check-field"><input type="checkbox" checked={persistToRoute} onChange={(event) => setPersistToRoute(event.target.checked)} /><span><strong>Add to reusable route too</strong><small>Leave unchecked to change today’s run only.</small></span></label>}<button className="ops-button ops-button-primary ops-button-large" disabled={!selected.length} onClick={submit}>{selected.length === 1 ? 'Add as next stop' : `Group ${selected.length} properties and add`}</button></div></Modal>
}

function RecapPanel({ recap, onClose }) {
  return <Modal title="End-of-day recap" onClose={onClose}><div className="ops-recap"><div className="ops-recap-scores"><article><span>Property Work Efficiency</span><strong>{recap.propertyWorkEfficiency == null ? '—' : `${recap.propertyWorkEfficiency}%`}</strong></article><article><span>Whole Day Efficiency</span><strong>{recap.wholeDayEfficiency == null ? '—' : `${recap.wholeDayEfficiency}%`}</strong></article></div><dl>{[['Properties completed', recap.propertiesCompleted], ['Stops completed', recap.stopsCompleted], ['Active property work', formatMinutes(recap.activeWorkMinutes)], ['Raw travel', formatMinutes(recap.rawTravelMinutes)], ['Adjusted travel', formatMinutes(recap.adjustedTravelMinutes)], ['Logged delays', formatMinutes(recap.delayMinutes)], ['Paused time', formatMinutes(recap.pausedMinutes)], ['Total route duration', formatMinutes(recap.totalRouteMinutes)], ['Baseline expected work', formatMinutes(recap.expectedBaselineMinutes)], ['Historical expected work', formatMinutes(recap.historicalExpectedMinutes)]].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl><p>Mixed-crew Stops use the stored segment crew counts to weight the baseline. Segment data is preserved exactly.</p></div></Modal>
}

function expectedServiceMinutes(history, service) {
  const runStop = history.runStops.find((item) => item.dailyServiceId === service.id)
  const propertyCount = runStop?.propertyCount || 0
  const segments = history.segments.filter((segment) => segment.dailyServiceId === service.id && segment.minutes > 0)
  const total = segments.reduce((sum, segment) => sum + segment.minutes, 0)
  if (!total) return runStop?.baselineEstimateMinutes || 0
  return segments.reduce((sum, segment) => sum + (segment.minutes / total) * propertyCount * (60 / Math.max(1, segment.crewCount)), 0)
}

function RunView({ data, run, navigate, perform, openIssue, mutationState }) {
  const [selectedStopId, setSelectedStopId] = useState(run.stops.find((stop) => ['Active', 'Paused', 'Stopped for Day'].includes(stop.status))?.id || run.stops.find((stop) => stop.status !== 'Completed')?.id || run.stops[0]?.id)
  const [showDelay, setShowDelay] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [showAddStop, setShowAddStop] = useState(false)
  const [showSaveRoute, setShowSaveRoute] = useState(false)
  const [showAbortStop, setShowAbortStop] = useState(false)
  const [showAbortRoute, setShowAbortRoute] = useState(false)
  const [showPause, setShowPause] = useState(false)
  const [showStopForDay, setShowStopForDay] = useState(false)
  const [showRunInterruption, setShowRunInterruption] = useState(false)
  const [showReturnStop, setShowReturnStop] = useState(false)
  const selected = run.stops.find((stop) => stop.id === selectedStopId) || run.stops.find((stop) => !['Completed', 'Aborted — Partial Work', 'Voided', 'Not Serviced — Route Aborted'].includes(stop.status)) || run.stops[0]
  const templateStop = data.stops.find((stop) => stop.id === selected?.stopId)
  const properties = templateStop?.propertyIds.map((id) => data.properties.find((property) => property.id === id)).filter(Boolean) || []
  const completed = run.stops.filter((stop) => stop.status === 'Completed').length
  const currentOther = run.stops.find((stop) => stop.id !== selected?.id && ['Active', 'Paused'].includes(stop.status))
  const selectedMutationPending = mutationState.active?.payload?.runStopId === selected?.id
  const controlsLocked = mutationState.locked || selectedMutationPending
  const action = (name, extra = {}) => {
    if (!selected) return Promise.resolve()
    return perform(name, { runId: run.id, runStopId: selected.id, at: new Date().toISOString(), ...extra }).catch(() => {})
  }
  const activeRouteStop = run.stops.find((stop) => ['Active', 'Paused'].includes(stop.status) && (stop.participantStatus === 'Joined' || Number(stop.actualOrder) > 0))
  const selectedHasWork = Boolean(selected?.firstWorkStartedAt || Number(selected?.activeWorkMinutes) > 0)
  const selectedCanAbort = selected && !['Completed', 'Aborted — Partial Work', 'Voided', 'Not Serviced — Route Aborted'].includes(selected.status)

  const primaryAction = () => {
    if (!selected) return [null, null]
    if (selected.status === 'Returned') return ['Start Return Work', () => action('startWork')]
    if (!selected.arrivedAt) return ['Arrive', () => action('arriveStop')]
    if (!selected.firstWorkStartedAt) return ['Start Work', () => action('startWork')]
    if (selected.shared && ['Active', 'Paused', 'Stopped for Day'].includes(selected.status) && selected.participantStatus !== 'Joined') return ['Join Stop', () => action('joinStop')]
    if (selected.status === 'Paused' || selected.status === 'Stopped for Day') return ['Resume Work', () => action('resumeStop')]
    if (selected.status === 'Active' && selected.participantStatus === 'Joined') return ['Complete Stop', () => action('completeStop')]
    if (selected.status === 'Completed' && !selected.departedAt) return ['Depart', () => action('departStop')]
    if (selected.status === 'Completed' && selected.departedAt) return ['Return to Stop', () => setShowReturnStop(true)]
    return [null, null]
  }
  const [primaryLabel, primaryHandler] = primaryAction()

  return <>
    <button className="ops-back" onClick={() => navigate('/ops')}>← Dashboard</button>
    <section className="ops-run-header"><div><span>{run.runDate} · {run.truck}</span><h1>{run.routeName}</h1><div className="ops-run-meta"><StatusPill value={run.status} /><span>{run.startingCrewCount} people</span><span>Route v{run.routeVersion}</span></div></div><div className="ops-heading-actions"><button className="ops-button ops-button-secondary" disabled={controlsLocked} onClick={() => setShowAddStop(true)}>Add next Stop</button>{!run.routeId && run.stops.length > 0 && <button className="ops-button ops-button-secondary" disabled={controlsLocked} onClick={() => setShowSaveRoute(true)}>Save as reusable route</button>}{run.status === 'Not Started' ? <button className="ops-button ops-button-primary ops-button-large" disabled={controlsLocked} onClick={() => perform('startRun', { runId: run.id, at: new Date().toISOString() }).catch(() => {})}>Start Route</button> : <><button className="ops-button ops-button-secondary" disabled={controlsLocked || !run.stops.length || completed !== run.stops.length} title={completed !== run.stops.length ? 'Complete every stop first' : ''} onClick={() => perform('completeRun', { runId: run.id, at: new Date().toISOString() }).catch(() => {})}>Complete route</button><button className="ops-button ops-button-danger" disabled={controlsLocked} onClick={() => setShowAbortRoute(true)}>Abort Route</button></>}</div></section>
    <ProgressBar value={run.stops.length ? completed / run.stops.length * 100 : 0} label={`${completed} of ${run.stops.length} stops complete`} />
    <div className="ops-heading-actions"><button className="ops-button ops-button-secondary" disabled={controlsLocked} onClick={() => setShowRunInterruption(true)}>Log travel / route interruption</button></div>
    <div className="ops-run-layout"><aside className="ops-stop-list"><div className="ops-stop-list-heading"><span>Route stops</span><strong>Choose any outstanding stop</strong></div>{run.stops.map((stop) => <button className={cx(selected?.id === stop.id && 'selected', stop.status === 'Completed' && 'complete')} key={stop.id} onClick={() => setSelectedStopId(stop.id)}><span className="ops-stop-order">{stop.actualOrder || stop.plannedOrder}</span><div><strong>{stop.stopName}</strong><small>Planned: {ordinal(stop.plannedOrder)}{stop.actualOrder ? ` · Serviced: ${ordinal(stop.actualOrder)}` : ''}</small></div><StatusPill value={stop.status} /></button>)}</aside>
      {selected && <section className="ops-current-stop"><header><div><span>Selected stop{selected.shared ? ' · Shared daily job' : ''}</span><h2>{selected.stopName}</h2><p>{selected.propertyCount} {selected.propertyCount === 1 ? 'property' : 'properties'}{selected.shared ? ` · Current combined crew ${selected.dailyService?.currentCrewCount || 0}` : ''}</p></div><StatusPill value={selected.status} /></header>
        {selectedMutationPending && <div className="ops-mutation-saving" role="status"><span className="ops-saving-spinner" /><div><strong>{mutationState.active.label}</strong><p>Waiting for the Operations backend. Stop actions are temporarily locked.</p></div></div>}
        {currentOther && currentOther.id !== selected.id && selected.status === 'Not Started' && <div className="ops-switch-warning"><div><strong>{currentOther.stopName} is unfinished.</strong><p>Switching preserves its progress and begins this stop next.</p></div><button disabled={controlsLocked} onClick={() => perform('switchStop', { runId: run.id, runStopId: currentOther.id, nextRunStopId: selected.id, at: new Date().toISOString() }).catch(() => {})}>Switch here</button></div>}
        <div className="ops-stop-metrics"><article><span>Baseline</span><strong>{formatMinutes(selected.baselineEstimateMinutes)}</strong></article><article><span>Historical</span><strong>{formatMinutes(selected.historicalAverageMinutes)}</strong></article><article><span>Active work</span><strong>{formatMinutes(selected.activeWorkMinutes)}</strong></article><article><span>Excluded pause</span><strong>{formatMinutes(selected.excludedPauseMinutes)}</strong></article></div>
        <div className="ops-timeline"><div className={selected.arrivedAt ? 'done' : ''}><i />Arrived<strong>{formatTime(selected.arrivedAt)}</strong></div><div className={selected.firstWorkStartedAt ? 'done' : ''}><i />Work started<strong>{formatTime(selected.firstWorkStartedAt)}</strong></div><div className={selected.completedAt ? 'done' : ''}><i />Completed<strong>{formatTime(selected.completedAt)}</strong></div><div className={selected.departedAt ? 'done' : ''}><i />Departed<strong>{formatTime(selected.departedAt)}</strong></div></div>
        {run.status !== 'Not Started' && <div className="ops-field-actions">{primaryLabel && <button className="ops-button ops-button-primary ops-button-xl" disabled={controlsLocked || (selected.status === 'Not Started' && currentOther)} onClick={primaryHandler}>{primaryLabel}</button>}{selected.status === 'Active' && selected.firstWorkStartedAt && selected.participantStatus === 'Joined' && <><button className="ops-button ops-button-secondary ops-button-large" disabled={controlsLocked} onClick={() => setShowPause(true)}>Pause</button>{selected.shared && <button className="ops-button ops-button-secondary ops-button-large" disabled={controlsLocked} onClick={() => action('leaveStop')}>Leave Stop</button>}<button className="ops-button ops-button-secondary ops-button-large" disabled={controlsLocked} onClick={() => setShowStopForDay(true)}>Stop for Day</button></>}{selectedCanAbort && <button className="ops-button ops-button-danger" disabled={controlsLocked} onClick={() => setShowAbortStop(true)}>Abort Stop</button>}<button className="ops-button ops-button-quiet" disabled={controlsLocked} onClick={() => setShowDelay(true)}>Log travel delay</button><button className="ops-button ops-button-quiet" disabled={controlsLocked} onClick={() => setShowHistory(true)}>Edit times</button></div>}
        <div className="ops-stop-crew"><span>Crew working this stop</span><div>{[1, 2, 3, 4].map((count) => <button className={selected.crewCount === count ? 'selected' : ''} disabled={controlsLocked} key={count} onClick={() => action('updateStopCrewCount', { crewCount: count })}>{count}</button>)}</div></div>
        <div className="ops-property-stack">{properties.map((property) => <StopPropertyCard key={property.id} property={property} issues={data.propertyIssues.filter((issue) => issue.propertyId === property.id && issue.status === 'Open')} onReport={(propertyId) => openIssue('property', { propertyId, runId: run.id, runStopId: selected.id })} />)}</div>
      </section>}
    </div>
    {showDelay && <Modal title="Log excluded travel delay" onClose={() => setShowDelay(false)}><SimpleForm fields={[['reason', 'Reason', 'text'], ['minutes', 'Excluded minutes', 'number']]} submitLabel="Save delay" onSubmit={async (values) => { await perform('addTravelDelay', { runId: run.id, ...values, at: new Date().toISOString() }); setShowDelay(false) }} /></Modal>}
    {showHistory && selected && <Modal title="Correct a timestamp" onClose={() => setShowHistory(false)}><TimestampForm stop={selected} onSubmit={async (values) => { await perform('editTimestamp', { runId: run.id, runStopId: selected.id, ...values }); setShowHistory(false) }} /></Modal>}
    {showAddStop && <AddRunStopModal data={data} run={run} onClose={() => setShowAddStop(false)} onAdd={async (values) => { await perform('addRunStop', { runId: run.id, ...values }); setShowAddStop(false) }} />}
    {showSaveRoute && <Modal title="Save today as a reusable route" onClose={() => setShowSaveRoute(false)}><SimpleForm fields={[["name", "Route name", "text"], ["notes", "Notes", "textarea"]]} submitLabel="Save reusable route" onSubmit={async (values) => { await perform('saveRunAsRoute', { runId: run.id, ...values }); setShowSaveRoute(false) }} /></Modal>}
    {showAbortStop && selected && <AbortStopForm stop={selected} hasWork={selectedHasWork} onClose={() => setShowAbortStop(false)} onSubmit={async (mode, reason) => { await perform('abortStop', { runId: run.id, runStopId: selected.id, mode, reason, at: new Date().toISOString() }); setShowAbortStop(false) }} />}
    {showAbortRoute && <AbortRouteForm activeStop={activeRouteStop} onClose={() => setShowAbortRoute(false)} onResolveStop={() => { setSelectedStopId(activeRouteStop.id); setShowAbortRoute(false); setShowAbortStop(true) }} onStopForDay={() => { setSelectedStopId(activeRouteStop.id); setShowAbortRoute(false); setShowStopForDay(true) }} onSubmit={async (reason) => { await perform('abortRoute', { runId: run.id, reason, at: new Date().toISOString() }); setShowAbortRoute(false); navigate('/ops') }} />}
    {showPause && selected && <InterruptionReasonForm title="Pause work" copy="Pause is a temporary interruption. Add a short note if it will be useful later." submitLabel="Pause" prominent={false} onClose={() => setShowPause(false)} onSubmit={async (reason) => { await perform('pauseStop', { runId: run.id, runStopId: selected.id, reason, at: new Date().toISOString() }); setShowPause(false) }} />}
    {showStopForDay && selected && <InterruptionReasonForm title="Stop for Day" copy="This Stop is unfinished and is expected to be resumed later. Add a note explaining why work stopped." submitLabel="Stop for Day" prominent onClose={() => setShowStopForDay(false)} onSubmit={async (reason) => { await perform('stopForDay', { runId: run.id, runStopId: selected.id, reason, at: new Date().toISOString() }); setShowStopForDay(false) }} />}
    {showRunInterruption && <Modal title="Log route interruption" onClose={() => setShowRunInterruption(false)}><SimpleForm fields={[["reason", "Reason / note", "textarea"], ["minutes", "Minutes", "number"]]} submitLabel="Save interruption" onSubmit={async (values) => { await perform('logRunInterruption', { runId: run.id, ...values, at: new Date().toISOString() }); setShowRunInterruption(false) }} /><p className="ops-form-help">During travel this becomes an excluded Travel Delay. Between Stops it becomes other route downtime. Active property work must use Pause.</p></Modal>}
    {showReturnStop && selected && <ReturnStopForm stop={selected} onClose={() => setShowReturnStop(false)} onSubmit={async (reason) => { await perform('returnStop', { runId: run.id, runStopId: selected.id, reason, at: new Date().toISOString() }); setShowReturnStop(false) }} />}
  </>
}

function ReturnStopForm({ stop, onClose, onSubmit }) {
  const [reason, setReason] = useState('')
  return <Modal title={`Return to ${stop.stopName}`} onClose={onClose}><form className="ops-stack-form" onSubmit={(event) => { event.preventDefault(); onSubmit(reason.trim()) }}><div className="ops-warning-panel"><strong>The original completion stays preserved.</strong><p>This starts a return visit on the same daily service. Additional work will be recorded in new work segments.</p></div><label className="ops-field">Reason for return<textarea required value={reason} onChange={(event) => setReason(event.target.value)} /></label><button className="ops-button ops-button-primary ops-button-large" disabled={!reason.trim()}>Return to Stop</button></form></Modal>
}

function InterruptionReasonForm({ title, copy, submitLabel, prominent, onClose, onSubmit }) {
  const [reason, setReason] = useState('')
  return <Modal title={title} onClose={onClose}><form className="ops-stack-form" onSubmit={(event) => { event.preventDefault(); onSubmit(reason.trim()) }}>{prominent && <div className="ops-warning-panel"><strong>Work remains unfinished.</strong><p>{copy}</p></div>}{!prominent && <p className="ops-form-help">{copy}</p>}<label className="ops-field">Reason / note <small>Optional</small><textarea value={reason} maxLength="500" onChange={(event) => setReason(event.target.value)} /></label><button className="ops-button ops-button-primary ops-button-large">{submitLabel}</button></form></Modal>
}

function AbortStopForm({ stop, hasWork, onClose, onSubmit }) {
  const [reason, setReason] = useState('')
  return <Modal title={`Abort ${stop.stopName}`} onClose={onClose}><form className="ops-stack-form" onSubmit={(event) => event.preventDefault()}><div className="ops-warning-panel"><strong>This is not the same as Stop for Day.</strong><p>Stop for Day preserves an unfinished visit so work can resume. Aborting closes this route’s attempt.</p></div><label className="ops-field">Required reason<textarea required value={reason} onChange={(event) => setReason(event.target.value)} /></label>{hasWork && <button type="button" className="ops-button ops-button-secondary ops-button-large" disabled={!reason.trim()} onClick={() => onSubmit('partial', reason)}>Abort &amp; Keep Partial Work</button>}<button type="button" className="ops-button ops-button-danger ops-button-large" disabled={!reason.trim()} onClick={() => onSubmit('discard', reason)}>Abort &amp; Discard This Attempt</button><p className="ops-form-help">Discard hides this attempt from normal History, recaps, search, and efficiency averages. The audit record remains available to administrators.</p></form></Modal>
}

function AbortRouteForm({ activeStop, onClose, onResolveStop, onStopForDay, onSubmit }) {
  const [reason, setReason] = useState('')
  if (activeStop) return <Modal title="Resolve active work first" onClose={onClose}><div className="ops-stack-form"><div className="ops-warning-panel"><strong>{activeStop.stopName} has unfinished work.</strong><p>The route cannot be aborted while this Stop is active or paused. Preserve active work with Stop for Day or resolve that Stop as aborted.</p></div>{activeStop.status === 'Active' && <button className="ops-button ops-button-secondary ops-button-large" onClick={onStopForDay}>Stop for Day</button>}<button className="ops-button ops-button-danger ops-button-large" onClick={onResolveStop}>Abort Stop</button></div></Modal>
  return <Modal title="Abort this route" onClose={onClose}><form className="ops-stack-form" onSubmit={(event) => { event.preventDefault(); onSubmit(reason) }}><div className="ops-warning-panel"><strong>Remaining Stops will be marked Not Serviced.</strong><p>Completed and preserved partial work stays in the recap. This route will have the distinct status Aborted.</p></div><label className="ops-field">Required reason<textarea required value={reason} onChange={(event) => setReason(event.target.value)} /></label><button className="ops-button ops-button-danger ops-button-large">Abort Route</button></form></Modal>
}

function Modal({ title, onClose, children }) {
  const panel = useRef(null)
  useEffect(() => { panel.current?.focus() }, [])
  return <div className="ops-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}><section className="ops-modal" role="dialog" aria-modal="true" aria-label={title} tabIndex="-1" ref={panel}><header><h2>{title}</h2><button onClick={onClose} aria-label="Close">×</button></header>{children}</section></div>
}

function SimpleForm({ fields, submitLabel, onSubmit, initial = {} }) {
  const [values, setValues] = useState(initial)
  return <form className="ops-stack-form" onSubmit={(event) => { event.preventDefault(); onSubmit(values) }}>{fields.map(([name, label, type, options]) => <label className="ops-field" key={name}>{label}{type === 'select' ? <select value={values[name] || ''} required onChange={(event) => setValues({ ...values, [name]: event.target.value })}><option value="">Choose…</option>{options.map((option) => <option key={option}>{option}</option>)}</select> : type === 'textarea' ? <textarea value={values[name] || ''} required onChange={(event) => setValues({ ...values, [name]: event.target.value })} /> : <input type={type} value={values[name] || ''} required onChange={(event) => setValues({ ...values, [name]: event.target.value })} />}</label>)}<button className="ops-button ops-button-primary ops-button-large">{submitLabel}</button></form>
}

function TimestampForm({ stop, onSubmit }) {
  const [field, setField] = useState('arrivedAt')
  const value = stop[field] ? new Date(stop[field]).toISOString().slice(0, 16) : ''
  const [dateValue, setDateValue] = useState(value)
  const [reason, setReason] = useState('')
  const changeField = (nextField) => {
    setField(nextField)
    setDateValue(stop[nextField] ? new Date(stop[nextField]).toISOString().slice(0, 16) : '')
  }
  return <form className="ops-stack-form" onSubmit={(event) => { event.preventDefault(); onSubmit({ field, value: new Date(dateValue).toISOString(), reason }) }}><label className="ops-field">Timestamp<select value={field} onChange={(event) => changeField(event.target.value)}><option value="arrivedAt">Arrived</option><option value="firstWorkStartedAt">First work started</option><option value="completedAt">Completed</option><option value="departedAt">Departed</option></select></label><label className="ops-field">Correct date and time<input type="datetime-local" required value={dateValue} onChange={(event) => setDateValue(event.target.value)} /></label><label className="ops-field">Reason for correction<textarea required value={reason} onChange={(event) => setReason(event.target.value)} /></label><p className="ops-form-help">The backend will audit the previous value, new value, reason, user, and timestamp.</p><button className="ops-button ops-button-primary ops-button-large">Save correction</button></form>
}

function IssuesPage({ data, user, openIssue, perform }) {
  const [filter, setFilter] = useState('Open')
  const issues = [
    ...data.propertyIssues.map((item) => ({ ...item, category: 'Property', label: data.properties.find((property) => property.id === item.propertyId)?.name || item.propertyId })),
    ...data.machineIssues.map((item) => ({ ...item, category: 'Equipment', label: item.machineId })),
    ...data.runIssues.map((item) => ({ ...item, category: 'Route', label: item.issueType || 'Route issue' })),
  ].filter((issue) => filter === 'All' || issue.status === filter)
  return <><PageHeading eyebrow="Operational records" title="Issues" copy="Property damage, route complications, and equipment concerns stay visible until they are resolved." actions={<div className="ops-split-actions"><button className="ops-button ops-button-primary" onClick={() => openIssue('property')}>Report property issue</button><button className="ops-button ops-button-secondary" onClick={() => openIssue('machine')}>Report equipment issue</button></div>} /><div className="ops-filter-row">{['Open', 'Resolved', 'All'].map((item) => <button className={filter === item ? 'active' : ''} key={item} onClick={() => setFilter(item)}>{item}</button>)}</div><div className="ops-issue-table">{issues.map((issue) => <article key={issue.id}><div className="ops-issue-icon">{issue.category === 'Property' ? '⌂' : issue.category === 'Equipment' ? '⚙' : '!'}</div><div className="ops-issue-main"><div><span>{issue.category} · {issue.label}</span><StatusPill value={issue.severity} /></div><h2>{issue.issueType || issue.description.slice(0, 56)}</h2><p>{issue.description}</p><small>Reported {new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', dateStyle: 'medium' }).format(new Date(issue.reportedAt || issue.startedAt))}</small></div>{user.admin && issue.status === 'Open' && issue.category !== 'Route' ? <button className="ops-button ops-button-secondary" onClick={() => perform(issue.category === 'Property' ? 'resolvePropertyIssue' : 'resolveMachineIssue', { issueId: issue.id, outcome: 'Resolved', notes: 'Resolved in Operations.', at: new Date().toISOString() })}>Resolve</button> : <StatusPill value={issue.status} />}</article>)}{!issues.length && <div className="ops-drop-empty"><strong>No {filter.toLowerCase()} issues</strong><p>Issues matching this filter will appear here.</p></div>}</div></>
}

function MachinesPage({ data, openIssue }) {
  return <><PageHeading eyebrow="Company equipment" title="Machine status" copy="Permanent Machine IDs connect field reporting to future maintenance records." actions={<button className="ops-button ops-button-primary" onClick={() => openIssue('machine')}>Report equipment issue</button>} /><div className="ops-machine-grid">{data.machines.map((machine) => { const open = data.machineIssues.filter((issue) => issue.machineId === machine.id && issue.status === 'Open'); return <article key={machine.id}><div className="ops-machine-top"><span className="ops-machine-id">{machine.id}</span><StatusPill value={machine.status} /></div><h2>{machine.machineType}</h2><p>{machine.description}</p><dl><div><dt>Serial</dt><dd>{machine.serialNumber}</dd></div><div><dt>Open issues</dt><dd>{open.length}</dd></div></dl>{machine.notes && <div className="ops-machine-note">{machine.notes}</div>}<button onClick={() => openIssue('machine', { machineId: machine.id })}>Report issue for {machine.id}</button></article> })}</div></>
}

function historyDate(value, includeTime = false) {
  if (!value) return ''
  const options = includeTime ? { timeZone: 'America/New_York', dateStyle: 'medium', timeStyle: 'short' } : { timeZone: 'America/New_York', dateStyle: 'long' }
  return new Intl.DateTimeFormat('en-US', options).format(new Date(value.length === 10 ? `${value}T12:00:00` : value))
}

function HistoryRemovalModal({ target, onClose, onSubmit }) {
  const [reason, setReason] = useState('')
  return <Modal title={target.modalTitle || 'Remove from History?'} onClose={onClose}><form className="ops-stack-form" onSubmit={(event) => { event.preventDefault(); onSubmit(reason.trim()) }}><div className="ops-warning-panel"><strong>{target.title}</strong>{target.subtitle && <p>{target.subtitle}</p>}</div><p className="ops-form-help">{target.explanation || 'This record will disappear from normal History and statistics. The underlying data and an administrator audit record will remain.'}</p><label className="ops-field">Reason<textarea required value={reason} onChange={(event) => setReason(event.target.value)} /></label><div className="ops-confirm-actions"><button type="button" className="ops-button ops-button-secondary" onClick={onClose}>Cancel</button><button className="ops-button ops-button-danger" disabled={!reason}>Remove from History</button></div></form></Modal>
}

function HistoryPage({ perform }) {
  const [history, setHistory] = useState(null)
  const [error, setError] = useState('')
  const [tab, setTab] = useState('runs')
  const [search, setSearch] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [leaderFilter, setLeaderFilter] = useState('')
  const [truckFilter, setTruckFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [crewFilter, setCrewFilter] = useState('')
  const [removalTarget, setRemovalTarget] = useState(null)
  const [showAdvancedRemoval, setShowAdvancedRemoval] = useState(false)
  const load = async () => { try { setError(''); setHistory(await operationsApi.getHistory({ from, to })) } catch (nextError) { setError(nextError.message) } }
  useEffect(() => {
    let active = true
    operationsApi.getHistory({}).then((result) => { if (active) setHistory(result) }).catch((nextError) => { if (active) setError(nextError.message) })
    return () => { active = false }
  }, [])
  if (error) return <OperationsError message={error} onRetry={load} onSignOut={() => window.location.reload()} />
  if (!history) return <LoadingScreen />
  const query = search.toLowerCase()
  const matchingRuns = history.runs.filter((run) => `${run.date} ${run.routeName} ${run.leaderName} ${run.truck} ${run.status}`.toLowerCase().includes(query) && (!leaderFilter || run.leaderId === leaderFilter) && (!truckFilter || run.truck === truckFilter) && (!statusFilter || run.status === statusFilter) && (!crewFilter || run.startingCrewCount === Number(crewFilter)))
  const serviceRuns = (serviceId) => history.runStops.filter((stop) => stop.dailyServiceId === serviceId).map((stop) => history.runs.find((run) => run.id === stop.runId)?.routeName).filter(Boolean)
  const propertyHistory = history.properties.filter((property) => `${property.id} ${property.name} ${property.address} ${property.truck}`.toLowerCase().includes(query))
  const stopHistory = history.stops.filter((stop) => `${stop.id} ${stop.name}`.toLowerCase().includes(query))
  const allIssues = [...history.propertyIssues.map((issue) => ({ ...issue, category: 'Property' })), ...history.machineIssues.map((issue) => ({ ...issue, category: 'Machine' })), ...history.runIssues.map((issue) => ({ ...issue, category: 'Run' }))].filter((issue) => `${issue.category} ${issue.severity} ${issue.status} ${issue.description || ''} ${issue.issueType || ''}`.toLowerCase().includes(query))
  const days = [...new Set(history.runs.map((run) => run.date))].sort().reverse()
  const removeRecord = async (reason) => { await perform('removeFromHistory', { entityType: removalTarget.entityType, entityId: removalTarget.entityId, reason, at: new Date().toISOString() }); setRemovalTarget(null); await load() }
  return <><PageHeading eyebrow="Operational records" title="History" copy="Browse runs, unique daily services, properties, grouped Stops, issues, equipment, and audited corrections without opening raw Sheets." actions={<button className="ops-button ops-button-secondary" onClick={load}>Refresh</button>} /><div className="ops-history-filters"><label>From<input type="date" value={from} onChange={(event) => setFrom(event.target.value)} /></label><label>To<input type="date" value={to} onChange={(event) => setTo(event.target.value)} /></label><button onClick={load}>Apply dates</button><label>Leader<select value={leaderFilter} onChange={(event) => setLeaderFilter(event.target.value)}><option value="">All</option>{[...new Map(history.runs.map((run) => [run.leaderId, run.leaderName])).entries()].map(([id, name]) => <option key={id} value={id}>{name}</option>)}</select></label><label>Truck/category<select value={truckFilter} onChange={(event) => setTruckFilter(event.target.value)}><option value="">All</option>{[...new Set(history.runs.map((run) => run.truck))].map((value) => <option key={value}>{value}</option>)}</select></label><label>Status<select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option value="">All</option>{[...new Set(history.runs.map((run) => run.status))].map((value) => <option key={value}>{value}</option>)}</select></label><label>Crew<select value={crewFilter} onChange={(event) => setCrewFilter(event.target.value)}><option value="">All</option>{[...new Set(history.runs.map((run) => run.startingCrewCount))].sort().map((value) => <option key={value}>{value}</option>)}</select></label><label className="ops-search"><span>⌕</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search current section" /></label></div><div className="ops-history-tabs">{[['runs','Daily Runs'],['days','Company Day'],['properties','Properties'],['stops','Stops'],['issues','Issues'],['audit','Audit'],['removed','Removed']].map(([id,label]) => <button className={tab === id ? 'active' : ''} key={id} onClick={() => setTab(id)}>{label}</button>)}</div>
    {tab === 'runs' && <div className="ops-history-grid">{matchingRuns.map((run) => { const runPauses = history.pauses.filter((pause) => history.runStops.some((stop) => stop.runId === run.id && stop.dailyServiceId === pause.dailyServiceId)); const runDelays = history.travelDelays.filter((delay) => history.travelLegs.some((leg) => leg.runId === run.id && leg.id === delay.travelLegId)); return <article key={run.id}><div><StatusPill value={run.status} /><span>{run.date}</span></div><h2>{run.routeName}</h2><p>{run.leaderName} · Truck/category {run.truck} · Starting crew {run.startingCrewCount}</p><p>{formatTime(run.startedAt)} → {formatTime(run.endedAt)}</p>{run.recap ? <dl><div><dt>Properties</dt><dd>{run.recap.propertiesCompleted}</dd></div><div><dt>Stops</dt><dd>{run.recap.stopsCompleted}</dd></div><div><dt>Total duration</dt><dd>{formatMinutes(run.recap.totalRouteMinutes)}</dd></div><div><dt>Active work</dt><dd>{formatMinutes(run.recap.activeWorkMinutes)}</dd></div><div><dt>Raw / adjusted travel</dt><dd>{formatMinutes(run.recap.rawTravelMinutes)} / {formatMinutes(run.recap.adjustedTravelMinutes)}</dd></div><div><dt>Pauses / delays</dt><dd>{formatMinutes(run.recap.pausedMinutes)} / {formatMinutes(run.recap.delayMinutes)}</dd></div><div><dt>Expected baseline</dt><dd>{formatMinutes(run.recap.expectedBaselineMinutes)}</dd></div><div><dt>Historical expected</dt><dd>{formatMinutes(run.recap.historicalExpectedMinutes)}</dd></div><div><dt>Work efficiency</dt><dd>{run.recap.propertyWorkEfficiency}%</dd></div><div><dt>Whole day</dt><dd>{run.recap.wholeDayEfficiency}%</dd></div></dl> : <p>Run is not complete.</p>}<ol>{history.runStops.filter((stop) => stop.runId === run.id).sort((a,b) => (a.actualOrder || a.plannedOrder) - (b.actualOrder || b.plannedOrder)).map((stop) => <li key={stop.id}><span>{stop.actualOrder || '—'} / {stop.plannedOrder}</span>{stop.stopName}{stop.shared ? ' · Shared' : ''} · {stop.status} · {formatTime(stop.arrivedAt)}–{formatTime(stop.departedAt)} · {formatMinutes(stop.activeWorkMinutes)}</li>)}</ol>{(runPauses.length > 0 || runDelays.length > 0) && <small>{runPauses.map((pause) => `${pause.type}: ${formatMinutes(pause.minutes)}${pause.reason ? ` (${pause.reason})` : ''}`).concat(runDelays.map((delay) => `Travel delay: ${formatMinutes(delay.minutes)}${delay.reason ? ` (${delay.reason})` : ''}`)).join(' · ')}</small>}<button className="ops-button ops-button-danger ops-history-remove" onClick={() => setRemovalTarget({ entityType: 'Route Run', entityId: run.id, modalTitle: 'Remove this Route Run from History?', title: run.routeName, subtitle: `${historyDate(run.date)} · ${run.leaderName}`, explanation: 'This run and its related operational records will be removed from normal History, reports, averages, and efficiency calculations. An admin audit record will remain.' })}>Remove from History</button></article> })}</div>}
    {tab === 'days' && <div className="ops-history-grid">{days.map((date) => { const runs = matchingRuns.filter((run) => run.date === date); if (!runs.length) return null; const ids = new Set(runs.map((run) => run.id)); const services = history.dailyServices.filter((service) => history.runStops.some((stop) => ids.has(stop.runId) && stop.dailyServiceId === service.id)); const uniqueProperties = new Set(services.flatMap((service) => history.stops.find((stop) => stop.id === service.stopId)?.propertyIds || [])); const active = services.reduce((sum, service) => sum + service.activeWorkMinutes, 0); const expected = services.reduce((sum, service) => sum + expectedServiceMinutes(history, service), 0); const duration = runs.reduce((sum, run) => sum + (run.recap?.totalRouteMinutes || 0), 0); const legs = history.travelLegs.filter((leg) => ids.has(leg.runId)); const delays = history.travelDelays.filter((delay) => legs.some((leg) => leg.id === delay.travelLegId)); return <article key={date}><h2>{date}</h2><p>{runs.length} routes · {services.length} unique Stops · {uniqueProperties.size} unique properties</p><dl><div><dt>Active work</dt><dd>{formatMinutes(active)}</dd></div><div><dt>Adjusted travel</dt><dd>{formatMinutes(legs.reduce((sum, leg) => sum + leg.adjustedMinutes, 0))}</dd></div><div><dt>Travel delays</dt><dd>{formatMinutes(delays.reduce((sum, delay) => sum + delay.minutes, 0))}</dd></div><div><dt>Combined route duration</dt><dd>{formatMinutes(duration)}</dd></div><div><dt>Shared Stops</dt><dd>{services.filter((service) => serviceRuns(service.id).length > 1).length}</dd></div><div><dt>Issues</dt><dd>{allIssues.filter((issue) => runs.some((run) => run.id === issue.runId)).length}</dd></div><div><dt>Property-work efficiency</dt><dd>{active ? `${Math.round(expected / active * 100)}%` : '—'}</dd></div><div><dt>Whole-day efficiency</dt><dd>{duration ? `${Math.round(expected / duration * 100)}%` : '—'}</dd></div></dl><small>Unique shared services are counted once. Combined duration is the sum of each route’s elapsed day.</small></article> })}</div>}
    {tab === 'properties' && <div className="ops-history-grid">{propertyHistory.map((property) => { const memberships = history.stops.filter((stop) => stop.propertyIds.includes(property.id)); const services = history.dailyServices.filter((service) => memberships.some((stop) => stop.id === service.stopId)); const issues = history.propertyIssues.filter((issue) => issue.propertyId === property.id); return <article key={property.id}><div><StatusPill value={property.active ? 'Active' : 'Inactive'} /><span>{property.id}</span></div><h2>{property.name}</h2><p>{property.address}</p><p>{property.serviceType} · Truck/category {property.truck}</p><dl><div><dt>Services</dt><dd>{services.length}</dd></div><div><dt>Stop configurations</dt><dd>{memberships.length}</dd></div><div><dt>Open / resolved issues</dt><dd>{issues.filter((issue) => issue.status === 'Open').length} / {issues.filter((issue) => issue.status === 'Resolved').length}</dd></div></dl>{services.length > 0 && <ol>{services.slice().sort((a, b) => b.serviceDate.localeCompare(a.serviceDate)).slice(0, 12).map((service) => <li key={service.id}><span>{service.serviceDate}</span>{history.stops.find((stop) => stop.id === service.stopId)?.name || service.stopId} · {service.status} · {formatMinutes(service.activeWorkMinutes)}</li>)}</ol>}{issues.length > 0 && <small>{issues.map((issue) => `${issue.status} ${issue.severity}: ${issue.issueType || issue.description}`).join(' · ')}</small>}{property.notes && <small>{property.notes}</small>}</article> })}</div>}
    {tab === 'stops' && <div className="ops-history-grid">{stopHistory.map((stop) => { const services = history.dailyServices.filter((service) => service.stopId === stop.id); const segments = history.segments.filter((segment) => services.some((service) => service.id === segment.dailyServiceId)); return <article key={stop.id}><div><StatusPill value={stop.archived ? 'Archived' : 'Active'} /><span>{stop.id}</span></div><h2>{stop.name}</h2><p>{stop.propertyIds.map((id) => history.properties.find((property) => property.id === id)?.name || id).join(' + ')}</p><dl><div><dt>Services</dt><dd>{services.length}</dd></div><div><dt>Shared occurrences</dt><dd>{services.filter((service) => serviceRuns(service.id).length > 1).length}</dd></div><div><dt>Recorded work</dt><dd>{formatMinutes(segments.reduce((sum, segment) => sum + segment.minutes, 0))}</dd></div></dl><ol>{services.slice().sort((a, b) => b.serviceDate.localeCompare(a.serviceDate)).slice(0, 12).map((service) => { const ownSegments = history.segments.filter((segment) => segment.dailyServiceId === service.id); const relatedStops = history.runStops.filter((item) => item.dailyServiceId === service.id); return <li key={service.id}><span>{service.serviceDate}</span>{formatMinutes(service.activeWorkMinutes)} · {ownSegments.map((segment) => `${formatMinutes(segment.minutes)} @ ${segment.crewCount}`).join(', ') || 'No work segments'} · {relatedStops.map((item) => history.runs.find((run) => run.id === item.runId)?.routeName).filter(Boolean).join(' + ')}<button className="ops-history-inline-remove" onClick={() => setRemovalTarget({ entityType: 'Daily Service', entityId: service.id, modalTitle: 'Remove this Stop visit from History?', title: stop.name, subtitle: `${historyDate(service.serviceDate)} · ${relatedStops.map((item) => history.runs.find((run) => run.id === item.runId)?.routeName).filter(Boolean).join(' + ')}`, explanation: 'This Stop visit and its related route occurrences, work, pause, participant, and completion records will be removed from normal History and calculations. An admin audit record will remain.' })}>Remove from History</button></li> })}</ol><small>{[...new Set(segments.map((segment) => `${segment.crewCount} crew`))].join(' · ')}</small></article> })}</div>}
    {tab === 'issues' && <div className="ops-issue-table">{allIssues.map((issue) => <article key={`${issue.category}-${issue.id}`}><div className="ops-issue-icon">!</div><div className="ops-issue-main"><div><span>{issue.category}</span><StatusPill value={issue.severity} /></div><h2>{issue.issueType || issue.machineId || issue.propertyId || 'Operational issue'}</h2><p>{issue.description}</p><small>{issue.resolutionNotes || issue.resolution || issue.resolutionOutcome || 'No resolution recorded.'}</small></div><div className="ops-history-issue-actions"><StatusPill value={issue.status} /><button className="ops-button ops-button-danger" onClick={() => setRemovalTarget({ entityType: issue.category === 'Property' ? 'Property Issue' : issue.category === 'Machine' ? 'Machine Issue' : 'Run Issue', entityId: issue.id, modalTitle: 'Remove this Issue from History?', title: issue.issueType || issue.machineId || issue.propertyId || 'Operational issue', subtitle: `${issue.category} issue · ${historyDate(issue.reportedAt || issue.startedAt)}`, explanation: 'This issue will be removed from normal History and reporting. An administrator audit record will remain.' })}>Remove from History</button></div></article>)}</div>}
    {tab === 'audit' && <div className="ops-audit-list">{history.audit.filter((item) => `${item.entityType} ${item.entityId} ${item.action} ${item.reason}`.toLowerCase().includes(query)).map((item) => <article key={item.id}><time>{item.timestamp}</time><strong>{item.entityType} · {item.action}</strong><span>{item.entityId}</span><p>{item.oldValue} → {item.newValue}</p><small>{item.reason} · {item.source}</small></article>)}</div>}
    {tab === 'removed' && <><div className="ops-removed-heading"><div><strong>Removed History</strong><span>One entry is shown for each administrator removal action.</span></div><button className="ops-button ops-button-secondary" onClick={() => setShowAdvancedRemoval(true)}>Advanced removal</button></div><div className="ops-removed-list">{(history.removalActions || []).filter((item) => `${item.title} ${item.subtitle} ${item.actionLabel} ${item.reason} ${item.removedByName}`.toLowerCase().includes(query)).map((item) => <article key={item.id}><div><strong>{item.title}</strong><span>{item.actionLabel}{item.subtitle ? ` · ${item.subtitle}` : ''}</span></div><p><b>Reason:</b> {item.reason}</p><small>Removed by {item.removedByName} · {historyDate(item.removedAt, true)}</small>{item.relatedCount > 0 && <details><summary>{item.relatedCount} related record{item.relatedCount === 1 ? '' : 's'} removed with this action</summary><ul>{item.affectedRecords.map((record) => <li key={`${record.entityType}-${record.entityId}`}><span>{record.entityType}</span>{record.entityId}</li>)}</ul></details>}</article>)}</div></>}
    {tab === 'audit' && <section className="ops-panel"><div className="ops-panel-heading"><div><span>Persisted timing notes</span><h2>Interruptions and return completions</h2></div></div><div className="ops-audit-list">{(history.runPauses || []).map((item) => <article key={item.id}><time>{item.startedAt}</time><strong>{item.phase}</strong><span>{formatMinutes(item.minutes)}</span><p>{item.reason || 'No reason entered.'}</p></article>)}{(history.completionEvents || []).map((item) => <article key={item.id}><time>{item.completedAt}</time><strong>{item.type}</strong><span>{item.runStopId}</span><p>{item.reason || 'Completion recorded.'}</p></article>)}</div></section>}
    {showAdvancedRemoval && <HistoryRemovalForm history={history} onClose={() => setShowAdvancedRemoval(false)} onSubmit={async (values) => { await perform('removeFromHistory', { ...values, at: new Date().toISOString() }); setShowAdvancedRemoval(false); await load() }} />}
    {removalTarget && <HistoryRemovalModal target={removalTarget} onClose={() => setRemovalTarget(null)} onSubmit={removeRecord} />}
  </>
}

function HistoryRemovalForm({ history, onClose, onSubmit }) {
  const groups = {
    'Route Run': history.runs.map((item) => ({ id: item.id, label: `${item.date} · ${item.routeName}` })),
    'Run Stop': history.runStops.map((item) => ({ id: item.id, label: `${item.stopName} · ${item.status}` })),
    'Daily Service': history.dailyServices.map((item) => ({ id: item.id, label: `${item.serviceDate} · ${history.stops.find((stop) => stop.id === item.stopId)?.name || 'Stop service'}` })),
    'Work Segment': history.segments.map((item) => ({ id: item.id, label: `${formatTime(item.startedAt)} · ${formatMinutes(item.minutes)} work` })),
    'Stop Pause': history.pauses.map((item) => ({ id: item.id, label: `${item.type} · ${formatMinutes(item.minutes)}` })),
    'Travel Leg': history.travelLegs.map((item) => ({ id: item.id, label: `${formatTime(item.departedAt)} · ${formatMinutes(item.adjustedMinutes)}` })),
    'Travel Delay': history.travelDelays.map((item) => ({ id: item.id, label: `${item.reason || 'Delay'} · ${formatMinutes(item.minutes)}` })),
    'Property Issue': history.propertyIssues.map((item) => ({ id: item.id, label: item.description })),
    'Machine Issue': history.machineIssues.map((item) => ({ id: item.id, label: item.description })),
    'Run Issue': history.runIssues.map((item) => ({ id: item.id, label: item.description })),
  }
  const groupLabels = { 'Route Run': 'Route run', 'Run Stop': 'Stop visit', 'Daily Service': 'Stop service occurrence', 'Work Segment': 'Work timing segment', 'Stop Pause': 'Stop pause', 'Travel Leg': 'Travel timing', 'Travel Delay': 'Travel delay', 'Property Issue': 'Property issue', 'Machine Issue': 'Equipment issue', 'Run Issue': 'Route issue' }
  const [entityType, setEntityType] = useState('Route Run')
  const [entityId, setEntityId] = useState('')
  const [reason, setReason] = useState('')
  const records = groups[entityType] || []
  return <Modal title="Advanced History removal" onClose={onClose}><form className="ops-stack-form" onSubmit={(event) => { event.preventDefault(); onSubmit({ entityType, entityId, reason }) }}><div className="ops-warning-panel"><strong>This does not delete the underlying data.</strong><p>The record disappears from normal History, recaps, search, and calculations but remains in the administrator-only Removed and Audit views.</p></div><label className="ops-field">Record type<select value={entityType} onChange={(event) => { setEntityType(event.target.value); setEntityId('') }}>{Object.keys(groups).map((type) => <option key={type} value={type}>{groupLabels[type]}</option>)}</select></label><label className="ops-field">Record<select required value={entityId} onChange={(event) => setEntityId(event.target.value)}><option value="">Choose…</option>{records.map((record) => <option key={record.id} value={record.id}>{record.label || 'Historical record'}</option>)}</select></label><label className="ops-field">Required reason<textarea required value={reason} onChange={(event) => setReason(event.target.value)} /></label><button className="ops-button ops-button-danger ops-button-large">Remove from History</button></form></Modal>
}

function UsersPage({ data, perform }) {
  const [showCreate, setShowCreate] = useState(false)
  const [resetUser, setResetUser] = useState(null)
  const users = data.users || []
  return <><PageHeading eyebrow="Administrator access" title="Operations users" copy="Create real accounts, reset passwords, and revoke persistent sessions. Password hashes never leave Apps Script." actions={<button className="ops-button ops-button-primary" onClick={() => setShowCreate(true)}>Create user</button>} /><div className="ops-user-list">{users.map((user) => <article key={user.id}><div className="ops-avatar">{user.name.slice(0,1)}</div><div><h2>{user.name}</h2><p>@{user.username}</p><div className="ops-user-roles">{user.admin && <span>Admin</span>}{user.routeLeader && <span>Route leader</span>}<StatusPill value={user.active ? 'Active' : 'Inactive'} /></div></div><div className="ops-user-admin-actions"><button className="ops-button ops-button-secondary" onClick={() => setResetUser(user)}>Reset password</button><button className="ops-button ops-button-quiet" onClick={() => perform('revokeSessions', { userId: user.id })}>Log out all devices</button></div></article>)}</div>{showCreate && <Modal title="Create Operations user" onClose={() => setShowCreate(false)}><CreateUserForm onSubmit={async (values) => { await perform('createUser', values); setShowCreate(false) }} /></Modal>}{resetUser && <Modal title={`Reset password for ${resetUser.name}`} onClose={() => setResetUser(null)}><SimpleForm fields={[["password", "New password (12+ characters)", "password"], ["reason", "Reason", "textarea"]]} submitLabel="Reset password and revoke sessions" onSubmit={async (values) => { await perform('resetPassword', { ...values, userId: resetUser.id }); setResetUser(null) }} /></Modal>}</>
}

function CreateUserForm({ onSubmit }) {
  const [values, setValues] = useState({ name: '', username: '', password: '', admin: false, routeLeader: true })
  return <form className="ops-stack-form" onSubmit={(event) => { event.preventDefault(); onSubmit(values) }}><label className="ops-field">Name<input required value={values.name} onChange={(event) => setValues({ ...values, name: event.target.value })} /></label><label className="ops-field">Username<input required autoCapitalize="none" value={values.username} onChange={(event) => setValues({ ...values, username: event.target.value })} /></label><label className="ops-field">Temporary password<input required minLength="12" type="password" value={values.password} onChange={(event) => setValues({ ...values, password: event.target.value })} /></label><label className="ops-check-field"><input type="checkbox" checked={values.routeLeader} onChange={(event) => setValues({ ...values, routeLeader: event.target.checked })} /><span><strong>Route leader</strong><small>Can operate assigned route runs and report issues.</small></span></label><label className="ops-check-field"><input type="checkbox" checked={values.admin} onChange={(event) => setValues({ ...values, admin: event.target.checked })} /><span><strong>Administrator</strong><small>Can manage routes, users, corrections, and issue resolution.</small></span></label><button className="ops-button ops-button-primary ops-button-large">Create secure account</button></form>
}

function IssueModal({ type, defaults, data, onClose, onSubmit }) {
  const propertyOptions = data.properties.filter((item) => item.active).map((item) => item.id)
  const machineOptions = data.machines.filter((item) => item.active).map((item) => item.id)
  const fields = type === 'property' ? [['propertyId', 'Property', 'select', propertyOptions], ['severity', 'Severity', 'select', ['Informational', 'Important', 'Critical']], ['issueType', 'Issue type', 'text'], ['description', 'Description', 'textarea']] : [['machineId', 'Machine ID', 'select', machineOptions], ['severity', 'Severity', 'select', ['Issue', 'Critical Issue', 'Down']], ['description', 'Description', 'textarea']]
  return <Modal title={type === 'property' ? 'Report property issue' : 'Report equipment issue'} onClose={onClose}><SimpleForm fields={fields} initial={defaults} submitLabel="Submit issue" onSubmit={onSubmit} /></Modal>
}

function LoadingScreen() {
  return <div className="ops-loading"><img src={logo} alt="" /><span>Loading Operations…</span></div>
}

function OperationsError({ message, onRetry, onSignOut }) {
  return <div className="ops-login-shell"><main className="ops-login-card"><div className="ops-login-brand"><img src={logo} alt="" /><div><strong>E.T. Operations</strong><span>Connection problem</span></div></div><div className="ops-login-heading"><span>Operations unavailable</span><h1>We could not load your work.</h1><p>{message}</p></div><div className="ops-error-actions"><button className="ops-button ops-button-primary ops-button-large" onClick={onRetry}>Try again</button><button className="ops-button ops-button-secondary ops-button-large" onClick={onSignOut}>Sign out</button></div></main></div>
}

class OperationsErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('[E.T. Operations] Unexpected render failure.', error, info)
  }

  render() {
    if (!this.state.error) return this.props.children
    return <div className="ops-login-shell"><main className="ops-login-card"><div className="ops-login-brand"><img src={logo} alt="" /><div><strong>E.T. Operations</strong><span>Display problem</span></div></div><div className="ops-login-heading"><span>Recovery available</span><h1>Something went wrong displaying Operations.</h1><p>The error was written to the browser console for troubleshooting. Reload to restore the latest saved server state.</p></div><button className="ops-button ops-button-primary ops-button-large" onClick={() => window.location.reload()}>Reload Operations</button></main></div>
  }
}

function OpsAppContent() {
  const { path, navigate } = useOpsNavigation()
  const [session, setSession] = useState(() => { try { return JSON.parse(localStorage.getItem(SESSION_KEY)) } catch { return null } })
  const [data, setData] = useState(null)
  const [loginError, setLoginError] = useState('')
  const [loginPending, setLoginPending] = useState(false)
  const [online, setOnline] = useState(navigator.onLine)
  const [pendingMutations, setPendingMutations] = useState([])
  const [failedMutations, setFailedMutations] = useState([])
  const [syncing, setSyncing] = useState(false)
  const [busy, setBusy] = useState(false)
  const busyRef = useRef(false)
  const [activeMutation, setActiveMutation] = useState(null)
  const [issueModal, setIssueModal] = useState(null)
  const [loadError, setLoadError] = useState('')
  const [loadRevision, setLoadRevision] = useState(0)
  const [completedRecap, setCompletedRecap] = useState(null)

  useEffect(() => {
    document.title = 'E.T. Operations'
    let robots = document.querySelector('meta[name="robots"]')
    if (!robots) { robots = document.createElement('meta'); robots.name = 'robots'; document.head.appendChild(robots) }
    robots.content = 'noindex, nofollow'
    let manifest = document.querySelector('link[rel="manifest"]')
    if (!manifest) { manifest = document.createElement('link'); manifest.rel = 'manifest'; document.head.appendChild(manifest) }
    manifest.href = ROOT_DEPLOYMENT ? '/manifest.webmanifest' : '/ops-manifest.webmanifest'
    if ('serviceWorker' in navigator) navigator.serviceWorker.register(ROOT_DEPLOYMENT ? '/sw.js' : '/ops-sw.js', { scope: ROOT_DEPLOYMENT ? '/' : '/ops/' }).catch(() => {})
  }, [])

  useEffect(() => {
    const updateOnline = () => setOnline(navigator.onLine)
    window.addEventListener('online', updateOnline)
    window.addEventListener('offline', updateOnline)
    opsDb.getMutations().then(setPendingMutations).catch(() => {})
    return () => { window.removeEventListener('online', updateOnline); window.removeEventListener('offline', updateOnline) }
  }, [])

  useEffect(() => {
    if (!session) return
    operationsApi.setSessionToken(session.sessionToken)
    let active = true
    setLoadError('')
    const load = async () => {
      const cached = await opsDb.getCache('bootstrap').catch(() => null)
      if (!navigator.onLine) {
        if (active && cached) setData(cached)
        else if (active) setLoadError('This device is offline and no saved route data is available yet.')
        return
      }
      try {
        const fresh = await operationsApi.getBootstrapData()
        if (!active) return
        setData(fresh)
        await opsDb.setCache('bootstrap', fresh).catch(() => {})
      } catch (error) {
        if (!active) return
        if (error.code === 'SESSION_INVALID' || error.code === 'SESSION_EXPIRED') {
          localStorage.removeItem(SESSION_KEY)
          operationsApi.setSessionToken('')
          setSession(null)
          setData(null)
          setLoginError('Your session expired. Please sign in again.')
          return
        }
        setLoadError(error.message)
      }
    }
    load()
    return () => { active = false }
  }, [session, loadRevision])

  useEffect(() => {
    if (!session || !online) return undefined
    const timer = window.setInterval(() => setLoadRevision((value) => value + 1), 60000)
    return () => window.clearInterval(timer)
  }, [session, online])

  const syncQueue = async () => {
    if (!navigator.onLine || syncing || busyRef.current) return
    const queued = await opsDb.getMutations()
    if (!queued.length) { setPendingMutations([]); return }
    setSyncing(true)
    const failures = []
    for (const mutation of queued) {
      setActiveMutation({ ...mutation, label: `Syncing queued change — ${savingLabel(mutation.action).replace('Saving ', '').replace('…', '')}…`, source: 'offline-queue', stopStateAction: STOP_STATE_ACTIONS.has(mutation.action) })
      try {
        const result = await operationsApi.mutate(mutation.action, mutation.payload, mutation)
        if (result.recap) setCompletedRecap(result.recap)
        if (result.state) { setData(result.state); await opsDb.setCache('bootstrap', result.state).catch(() => {}) }
        await opsDb.removeMutation(mutation.mutationId)
      } catch (error) {
        const failure = { ...mutation, message: error.message, error: error.message, code: error.code, status: error.status, details: error.details, onlineFailure: true }
        failures.push(failure)
        console.error('[E.T. Operations] Queued mutation failed while online.', failure)
        try {
          const authoritative = await operationsApi.getBootstrapData()
          setData(authoritative)
          await opsDb.setCache('bootstrap', authoritative).catch(() => {})
        } catch (reconciliationError) {
          console.error('[E.T. Operations] Failed to reload authoritative state after mutation failure.', reconciliationError)
        }
        break
      }
    }
    setFailedMutations(failures)
    setPendingMutations(await opsDb.getMutations())
    setActiveMutation(null)
    setSyncing(false)
  }

  // Connectivity changes are the trigger; queue changes during the sync must not retrigger it.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (online && pendingMutations.length) syncQueue() }, [online])

  const login = async (username, password) => {
    setLoginPending(true); setLoginError('')
    try { const next = await operationsApi.login(username, password, navigator.userAgent.slice(0, 160)); setSession(next); localStorage.setItem(SESSION_KEY, JSON.stringify(next)); navigate('/ops') } catch (error) { setLoginError(error.message) } finally { setLoginPending(false) }
  }
  const logout = async () => { try { await operationsApi.logout() } catch { /* Local sign-out must still succeed offline. */ } finally { operationsApi.setSessionToken(''); localStorage.removeItem(SESSION_KEY); setSession(null); setData(null); navigate('/ops/login') } }

  const perform = async (action, payload) => {
    if (busyRef.current) {
      const error = new Error('Wait for the current change to finish syncing.')
      error.code = 'MUTATION_IN_PROGRESS'
      throw error
    }
    const mutation = { mutationId: crypto.randomUUID(), clientTimestamp: new Date().toISOString(), action, entityType: payload.runId ? 'RouteRun' : action.includes('Issue') ? 'Issue' : 'Route', entityId: payload.runId || payload.issueId || payload.routeId || '', payload }
    const dataBeforeMutation = data
    busyRef.current = true
    setBusy(true)
    setActiveMutation({ ...mutation, label: savingLabel(action), source: navigator.onLine ? 'online' : 'offline', stopStateAction: STOP_STATE_ACTIONS.has(action) })
    const optimistic = applyOptimisticAction(data, action, payload)
    setData(optimistic)
    await opsDb.setCache('bootstrap', optimistic).catch(() => {})
    await opsDb.putMutation(mutation).catch(() => {})
    setPendingMutations(await opsDb.getMutations().catch(() => [mutation]))
    if (!navigator.onLine) {
      setActiveMutation(null)
      busyRef.current = false
      setBusy(false)
      return optimistic
    }
    try {
      const result = await operationsApi.mutate(action, payload, mutation)
      if (result.recap) setCompletedRecap(result.recap)
      if (result.state) { setData(result.state); await opsDb.setCache('bootstrap', result.state).catch(() => {}) }
      else if (action === 'createRun') {
        const fresh = await operationsApi.getBootstrapData()
        setData(fresh)
        await opsDb.setCache('bootstrap', fresh).catch(() => {})
      }
      await opsDb.removeMutation(mutation.mutationId).catch(() => {})
      setPendingMutations(await opsDb.getMutations().catch(() => []))
      setFailedMutations((items) => items.filter((item) => !(item.action === action && item.payload?.runStopId === payload.runStopId)))
      return result
    } catch (error) {
      setData(dataBeforeMutation)
      await opsDb.setCache('bootstrap', dataBeforeMutation).catch(() => {})
      await opsDb.removeMutation(mutation.mutationId).catch(() => {})
      setPendingMutations(await opsDb.getMutations().catch(() => []))
      const failure = { ...mutation, message: error.message, error: error.message, code: error.code, status: error.status, details: error.details, onlineFailure: true }
      setFailedMutations((items) => [...items.filter((item) => item.mutationId !== mutation.mutationId), failure])
      console.error('[E.T. Operations] Online backend mutation failed.', failure)
      throw error
    } finally {
      setActiveMutation(null)
      busyRef.current = false
      setBusy(false)
    }
  }

  const resolveMutationFailure = async (failure) => {
    await opsDb.removeMutation(failure.mutationId).catch(() => {})
    setFailedMutations((items) => items.filter((item) => item.mutationId !== failure.mutationId))
    setPendingMutations(await opsDb.getMutations().catch(() => []))
  }

  const retryMutationFailure = async (failure) => {
    if (!navigator.onLine || busyRef.current) return
    await resolveMutationFailure(failure)
    try { await perform(failure.action, failure.payload) } catch { /* Persistent banner contains the exact retry error. */ }
  }

  const createRun = async (payload) => {
    if (!navigator.onLine) throw new Error('A new route run must be created while online.')
    const run = await perform('createRun', payload)
    navigate(`/ops/run/${run.id}`)
  }

  const createLiveRun = async (payload) => {
    if (!navigator.onLine) throw new Error('A live route must be created while online.')
    const result = await perform('createLiveRun', payload)
    const run = result?.run || result
    if (run?.id) navigate(`/ops/run/${run.id}`)
  }

  const submitIssue = async (values) => {
    const type = issueModal.type
    await perform(type === 'property' ? 'reportPropertyIssue' : 'reportMachineIssue', { ...issueModal.defaults, ...values, at: new Date().toISOString() })
    setIssueModal(null)
  }

  if (!session) return <Login onLogin={login} pending={loginPending} error={loginError} />
  if (loadError) return <OperationsError message={loadError} onRetry={() => setLoadRevision((value) => value + 1)} onSignOut={logout} />
  if (!data) return <LoadingScreen />

  let page
  if (path === '/ops/login') page = <Dashboard data={data} user={session.user} navigate={navigate} />
  else if (path === '/ops/routes') page = <RouteLibrary data={data} user={session.user} navigate={navigate} perform={perform} />
  else if (path === '/ops/routes/builder') page = session.user.admin ? <RouteBuilder data={data} navigate={navigate} perform={perform} /> : <Dashboard data={data} user={session.user} navigate={navigate} />
  else if (path === '/ops/start') page = <StartRoute data={data} user={session.user} onCreate={createRun} onCreateLive={createLiveRun} />
  else if (path.startsWith('/ops/run/')) { const run = data.activeRuns.find((item) => item.id === path.slice('/ops/run/'.length)); page = run ? <RunView data={data} run={run} navigate={navigate} perform={perform} openIssue={(type, defaults = {}) => setIssueModal({ type, defaults })} mutationState={{ active: activeMutation, locked: busy || syncing }} /> : <Dashboard data={data} user={session.user} navigate={navigate} /> }
  else if (path === '/ops/issues') page = <IssuesPage data={data} user={session.user} openIssue={(type, defaults = {}) => setIssueModal({ type, defaults })} perform={perform} />
  else if (path === '/ops/machines') page = <MachinesPage data={data} openIssue={(type, defaults = {}) => setIssueModal({ type, defaults })} />
  else if (path === '/ops/history' && session.user.admin) page = <HistoryPage perform={perform} />
  else if (path === '/ops/users' && session.user.admin) page = <UsersPage data={data} perform={perform} />
  else page = <Dashboard data={data} user={session.user} navigate={navigate} />

  return <Shell user={session.user} path={path} navigate={navigate} onLogout={logout} sync={{ online, syncing, pendingCount: pendingMutations.length, failedCount: failedMutations.length, activeMutation }} mutationFailure={failedMutations[failedMutations.length - 1]} onRetryMutation={retryMutationFailure} onResolveMutation={resolveMutationFailure}>{page}{issueModal && <IssueModal type={issueModal.type} defaults={issueModal.defaults} data={data} onClose={() => setIssueModal(null)} onSubmit={submitIssue} />}{completedRecap && <RecapPanel recap={completedRecap} onClose={() => { setCompletedRecap(null); navigate('/ops') }} />}{<MutationBlockingOverlay mutation={activeMutation} />}</Shell>
}

export default function OpsApp() {
  return <OperationsErrorBoundary><OpsAppContent /></OperationsErrorBoundary>
}
