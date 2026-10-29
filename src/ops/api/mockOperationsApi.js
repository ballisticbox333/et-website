import {
  makeMockRun,
  mockActiveRuns,
  mockMachineIssues,
  mockMachines,
  mockProperties,
  mockPropertyIssues,
  mockRoutes,
  mockRunIssues,
  mockStops,
  mockUsers,
} from '../data/mockData'

const pause = (milliseconds = 220) => new Promise((resolve) => window.setTimeout(resolve, milliseconds))
const copy = (value) => structuredClone(value)

let state = {
  routes: copy(mockRoutes),
  stops: copy(mockStops),
  properties: copy(mockProperties),
  machines: copy(mockMachines),
  activeRuns: copy(mockActiveRuns),
  propertyIssues: copy(mockPropertyIssues),
  machineIssues: copy(mockMachineIssues),
  runIssues: copy(mockRunIssues),
}

function now() {
  return new Date().toISOString()
}

function findRun(runId) {
  const run = state.activeRuns.find((item) => item.id === runId)
  if (!run) throw new Error('Route run not found.')
  return run
}

function findRunStop(run, runStopId) {
  const stop = run.stops.find((item) => item.id === runStopId)
  if (!stop) throw new Error('Stop not found.')
  return stop
}

function nextActualOrder(run) {
  return Math.max(0, ...run.stops.map((stop) => stop.actualOrder || 0)) + 1
}

export const operationsApi = {
  mode: 'mock',
  apiUrl: 'local mock',

  setSessionToken() {},

  async login(username, password) {
    await pause()
    if (!username.trim() || !password) throw new Error('Enter your username and password.')
    const user = mockUsers.find((item) => item.username.toLowerCase() === username.trim().toLowerCase()) || mockUsers[0]
    return { user: copy(user), capabilities: user.admin ? ['operate-runs', 'view-runs', 'manage-routes', 'manage-stops', 'edit-history', 'resolve-issues'] : ['operate-runs', 'view-runs', 'report-issues'] }
  },

  async logout() {
    await pause(80)
    return { ok: true }
  },

  async getBootstrapData() {
    await pause()
    return copy(state)
  },

  async getHistory() {
    await pause()
    return { runs: [], runStops: [], dailyServices: [], segments: [], participants: [], pauses: [], travelLegs: [], travelDelays: [], properties: copy(state.properties), stops: copy(state.stops), propertyIssues: copy(state.propertyIssues), machineIssues: copy(state.machineIssues), runIssues: copy(state.runIssues), machines: copy(state.machines), audit: [] }
  },

  async createRun({ routeId, routeLeaderUserId, crewCount, truck }) {
    await pause()
    const route = state.routes.find((item) => item.id === routeId)
    if (!route || route.archived) throw new Error('That route is unavailable.')
    const run = makeMockRun(route, routeLeaderUserId, crewCount)
    run.truck = truck
    state.activeRuns.push(run)
    return copy(run)
  },

  async mutate(action, payload) {
    await pause(140)
    const run = payload.runId ? findRun(payload.runId) : null
    const stop = run && payload.runStopId ? findRunStop(run, payload.runStopId) : null

    switch (action) {
      case 'createRun': {
        const route = state.routes.find((item) => item.id === payload.routeId)
        if (!route || route.archived) throw new Error('That route is unavailable.')
        const createdRun = makeMockRun(route, payload.routeLeaderUserId, payload.crewCount)
        createdRun.truck = payload.truck
        state.activeRuns.push(createdRun)
        return { ...copy(createdRun), state: copy(state) }
      }
      case 'createLiveRun': {
        const liveRun = { id: `RUN-${Date.now()}`, routeId: '', routeName: payload.name || 'Live Route', routeVersion: 0, runDate: new Date().toISOString().slice(0, 10), truck: payload.truck, routeLeaderUserId: payload.routeLeaderUserId, status: 'Active', startedAt: payload.clientTimestamp || now(), startingCrewCount: Number(payload.crewCount), baselineEstimateMinutes: 0, historicalEstimateMinutes: 0, stops: [] }
        state.activeRuns.push(liveRun)
        return { run: copy(liveRun), state: copy(state) }
      }
      case 'addRunStop': {
        const propertyIds = [...new Set(payload.propertyIds || (payload.propertyId ? [payload.propertyId] : []))].sort()
        let template = payload.stopId ? state.stops.find((item) => item.id === payload.stopId) : state.stops.find((item) => [...item.propertyIds].sort().join('|') === propertyIds.join('|'))
        if (!template) { template = { id: `STP-${Date.now()}`, name: payload.name || propertyIds.map((id) => state.properties.find((property) => property.id === id)?.name).join(' + '), propertyIds, propertyCount: propertyIds.length, active: true, archived: false }; state.stops.push(template) }
        const targetRun = findRun(payload.runId)
        targetRun.stops.push({ id: `RST-${Date.now()}`, runId: targetRun.id, stopId: template.id, stopName: template.name, plannedOrder: targetRun.stops.length + 1, actualOrder: targetRun.stops.length + 1, status: 'Not Started', crewCount: targetRun.startingCrewCount, propertyCount: template.propertyCount, activeWorkMinutes: 0, excludedPauseMinutes: 0, baselineEstimateMinutes: template.propertyCount * 30, shared: false, participantStatus: 'Pending' })
        return { run: copy(targetRun), state: copy(state) }
      }
      case 'saveRunAsRoute': {
        const targetRun = findRun(payload.runId)
        state.routes.push({ id: `RTE-${Date.now()}`, name: payload.name, notes: payload.notes, version: 1, active: true, archived: false, stops: targetRun.stops.map((item, index) => ({ stopId: item.stopId, plannedOrder: index + 1 })) })
        return { state: copy(state) }
      }
      case 'startRun':
        run.status = 'Active'
        run.startedAt = payload.at || now()
        break
      case 'updateRunCrewCount':
        run.startingCrewCount = Number(payload.crewCount)
        break
      case 'completeRun':
        run.status = 'Completed'
        run.endedAt = payload.at || now()
        break
      case 'arriveStop':
        stop.status = 'Active'
        stop.arrivedAt = payload.at || now()
        stop.actualOrder ||= nextActualOrder(run)
        break
      case 'startWork':
      case 'joinStop':
      case 'resumeStop':
        stop.status = 'Active'
        stop.participantStatus = 'Joined'
        stop.firstWorkStartedAt ||= payload.at || now()
        stop.activeSegmentStartedAt = payload.at || now()
        break
      case 'leaveStop':
        stop.participantStatus = 'Left'
        break
      case 'pauseStop':
        stop.status = 'Paused'
        stop.pauseStartedAt = payload.at || now()
        break
      case 'stopForDay':
        stop.status = 'Stopped for Day'
        stop.stoppedAt = payload.at || now()
        break
      case 'completeStop':
        stop.status = 'Completed'
        stop.completedAt = payload.at || now()
        stop.activeWorkMinutes = Math.max(stop.activeWorkMinutes || 0, 24)
        break
      case 'departStop':
        stop.departedAt = payload.at || now()
        break
      case 'switchStop': {
        const nextStop = findRunStop(run, payload.nextRunStopId)
        if (stop && stop.status === 'Active') stop.status = 'Paused'
        nextStop.status = 'Active'
        nextStop.arrivedAt ||= payload.at || now()
        nextStop.actualOrder ||= nextActualOrder(run)
        break
      }
      case 'updateStopCrewCount':
        stop.crewCount = Number(payload.crewCount)
        break
      case 'addTravelDelay':
        run.travelDelays = [...(run.travelDelays || []), { id: `TD-${Date.now()}`, reason: payload.reason, excludedMinutes: Number(payload.minutes), startedAt: payload.at || now() }]
        break
      case 'reportPropertyIssue': {
        const issue = { id: `PI-${Date.now()}`, reportedAt: payload.at || now(), status: 'Open', ...payload }
        state.propertyIssues.push(issue)
        return { issue: copy(issue), state: copy(state) }
      }
      case 'reportMachineIssue': {
        const issue = { id: `MI-${Date.now()}`, reportedAt: payload.at || now(), status: 'Open', ...payload }
        state.machineIssues.push(issue)
        const machine = state.machines.find((item) => item.id === payload.machineId)
        if (machine) machine.status = payload.severity
        return { issue: copy(issue), state: copy(state) }
      }
      case 'resolvePropertyIssue': {
        const issue = state.propertyIssues.find((item) => item.id === payload.issueId)
        if (issue) Object.assign(issue, { status: 'Resolved', resolutionOutcome: payload.outcome, resolutionNotes: payload.notes, resolvedAt: payload.at || now() })
        break
      }
      case 'resolveMachineIssue': {
        const issue = state.machineIssues.find((item) => item.id === payload.issueId)
        if (issue) Object.assign(issue, { status: 'Resolved', resolutionOutcome: payload.outcome, resolutionNotes: payload.notes, resolvedAt: payload.at || now() })
        break
      }
      case 'editTimestamp':
        if (stop && payload.field) stop[payload.field] = payload.value
        break
      case 'saveRoute': {
        const route = payload.route
        const requestedItems = route.items || route.stops || []
        const stops = requestedItems.map((item, index) => {
          if (item.stopId) return { stopId: item.stopId, plannedOrder: index + 1 }
          const propertyIds = [...new Set(item.propertyId ? [item.propertyId] : item.propertyIds)].sort()
          let stop = state.stops.find((candidate) => [...candidate.propertyIds].sort().join('|') === propertyIds.join('|'))
          if (stop) Object.assign(stop, { active: true, archived: false, archiveReason: '' })
          if (!stop) {
            const properties = propertyIds.map((id) => state.properties.find((property) => property.id === id)).filter(Boolean)
            stop = { id: `STP-${Date.now()}-${index}`, name: item.name || properties.map((property) => property.name).join(' + '), propertyIds, propertyCount: propertyIds.length, active: true, archived: false }
            state.stops.push(stop)
          }
          return { stopId: stop.id, plannedOrder: index + 1 }
        })
        const nextRoute = { ...route, stops }
        delete nextRoute.items
        const existing = state.routes.find((item) => item.id === route.id)
        if (existing) Object.assign(existing, nextRoute, { version: existing.version + 1 })
        else state.routes.push({ ...nextRoute, id: `RTE-${Date.now()}`, version: 1, active: true, archived: false })
        break
      }
      case 'createStop': {
        const requestedIds = [...new Set(payload.propertyIds)].sort()
        const existingStop = state.stops.find((item) => !item.archived && [...item.propertyIds].sort().join('|') === requestedIds.join('|'))
        if (existingStop) return { stop: copy(existingStop), reused: true, state: copy(state) }
        const createdStop = {
          id: `STP-${Date.now()}`,
          name: payload.name,
          propertyIds: requestedIds,
          propertyCount: requestedIds.length,
          active: true,
          archived: false,
        }
        state.stops.push(createdStop)
        return { stop: copy(createdStop), reused: false, state: copy(state) }
      }
      case 'archiveRoute': {
        const route = state.routes.find((item) => item.id === payload.routeId)
        if (route) Object.assign(route, { archived: true, active: false })
        break
      }
      default:
        throw new Error(`Unknown operation: ${action}`)
    }

    return { run: run ? copy(run) : undefined, state: copy(state) }
  },
}
