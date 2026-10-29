export const mockUsers = [
  { id: 'USR-001', name: 'Tyler', username: 'tyler', admin: true, routeLeader: true },
  { id: 'USR-002', name: 'John', username: 'john', admin: false, routeLeader: true },
]

export const mockProperties = [
  { id: 'MORRI-112OAKS', day: 'Monday', truck: '1', name: 'Morrison Residence', address: '112 Oak Street, Neptune Beach', serviceType: 'Full Service', notes: 'Back gate opens inward. Keep discharge away from pool screen.', active: true },
  { id: 'RIVER-118OAKS', day: 'Monday', truck: '1', name: 'Rivera Residence', address: '118 Oak Street, Neptune Beach', serviceType: 'Basic Service', notes: 'Dog may be outside. Confirm gate is latched before leaving.', active: true },
  { id: 'COAST-4023RDS', day: 'Monday', truck: '1', name: 'Coastal Dental', address: '402 3rd Street South, Jacksonville Beach', serviceType: 'Commercial', notes: 'Complete storefront blowing before 10:00 AM.', active: true },
  { id: 'CHRIS-8153RDS', day: 'Monday', truck: '1', name: 'Chris K Tire Plus', address: '815 3rd Street South, Jacksonville Beach', serviceType: 'Commercial', notes: 'Watch parked vehicles near the north curb.', active: true },
  { id: 'HARRI-71PINES', day: 'Tuesday', truck: '2', name: 'Harris Residence', address: '71 Pine Avenue, Atlantic Beach', serviceType: 'Full Service', notes: 'Use push mower inside fenced side yard.', active: true },
  { id: 'OCEAN-940BEAC', day: 'Tuesday', truck: '2', name: 'Oceanview Condos', address: '940 Beach Boulevard, Jacksonville Beach', serviceType: 'Commercial', notes: 'Avoid blower use near east entrance between noon and 1 PM.', active: true },
  { id: 'MILLER-24PALMS', day: 'Tuesday', truck: '2', name: 'Miller Residence', address: '24 Palm Lane, Ponte Vedra Beach', serviceType: 'Basic Service', notes: 'Low irrigation head near mailbox.', active: true },
  { id: 'BAKER-802CEDA', day: 'Wednesday', truck: '12', name: 'Baker Residence', address: '802 Cedar Court, Jacksonville', serviceType: 'Full Service', notes: '', active: true },
  { id: 'OLDCL-19MARSH', day: 'Friday', truck: '1', name: 'Old Client Archive', address: '19 Marsh Road, Jacksonville', serviceType: 'Basic Service', notes: 'Inactive historical property.', active: false },
]

export const mockStops = [
  { id: 'STP-001', name: 'Oak Street Pair', propertyIds: ['MORRI-112OAKS', 'RIVER-118OAKS'], propertyCount: 2, active: true, archived: false },
  { id: 'STP-002', name: 'Coastal Dental', propertyIds: ['COAST-4023RDS'], propertyCount: 1, active: true, archived: false },
  { id: 'STP-003', name: 'Chris K Tire Plus', propertyIds: ['CHRIS-8153RDS'], propertyCount: 1, active: true, archived: false },
  { id: 'STP-004', name: 'Harris Residence', propertyIds: ['HARRI-71PINES'], propertyCount: 1, active: true, archived: false },
  { id: 'STP-005', name: 'Oceanview + Miller', propertyIds: ['OCEAN-940BEAC', 'MILLER-24PALMS'], propertyCount: 2, active: true, archived: false },
  { id: 'STP-006', name: 'Baker Residence', propertyIds: ['BAKER-802CEDA'], propertyCount: 1, active: true, archived: false },
  { id: 'STP-099', name: 'Archived Marsh Stop', propertyIds: ['OLDCL-19MARSH'], propertyCount: 1, active: false, archived: true },
]

export const mockRoutes = [
  { id: 'RTE-MON', name: 'Monday', version: 4, active: true, archived: false, notes: 'Beach route. Start commercial work early.', stops: [{ stopId: 'STP-002', plannedOrder: 1 }, { stopId: 'STP-003', plannedOrder: 2 }, { stopId: 'STP-001', plannedOrder: 3 }] },
  { id: 'RTE-TUE', name: 'Tuesday', version: 2, active: true, archived: false, notes: 'Ponte Vedra and Atlantic Beach.', stops: [{ stopId: 'STP-004', plannedOrder: 1 }, { stopId: 'STP-005', plannedOrder: 2 }] },
  { id: 'RTE-RAIN', name: 'Rain Route', version: 1, active: true, archived: false, notes: 'Properties suitable for wet-weather service.', stops: [{ stopId: 'STP-002', plannedOrder: 1 }, { stopId: 'STP-006', plannedOrder: 2 }] },
  { id: 'RTE-OLD', name: 'Friday Legacy', version: 7, active: false, archived: true, notes: 'Archived route retained for historical runs.', stops: [{ stopId: 'STP-099', plannedOrder: 1 }] },
]

export const mockMachines = [
  { id: 'PM30-1', serialNumber: 'PM30-ET-001', machineType: 'Push Mower', description: '30-inch push mower', active: true, status: 'Available', notes: '' },
  { id: 'GS48-1', serialNumber: 'GS48-ET-014', machineType: 'Grand Stand', description: '48-inch stand-on mower', active: true, status: 'Issue', notes: 'Intermittent deck vibration reported.' },
  { id: 'BL-3', serialNumber: 'BL-ET-003', machineType: 'Blower', description: 'Backpack blower', active: true, status: 'Available', notes: '' },
  { id: 'ED-2', serialNumber: 'ED-ET-002', machineType: 'Edger', description: 'Stick edger', active: true, status: 'Available', notes: '' },
]

const createRunStop = (id, runId, stop, order, crewCount, status = 'Not Started', actualOrder) => ({
  id,
  runId,
  stopId: stop.id,
  stopName: stop.name,
  plannedOrder: order,
  actualOrder,
  status,
  crewCount,
  propertyCount: stop.propertyCount,
  activeWorkMinutes: status === 'Completed' ? 41 : 0,
  excludedPauseMinutes: 0,
  baselineEstimateMinutes: stop.propertyCount * (crewCount === 1 ? 60 : crewCount === 2 ? 30 : crewCount === 3 ? 20 : 15),
  historicalAverageMinutes: stop.propertyCount === 2 ? 52 : 28,
})

export function makeMockRun(route, routeLeaderUserId = 'USR-001', crewCount = 2) {
  const stops = route.stops.map((routeStop, index) => {
    const stop = mockStops.find((item) => item.id === routeStop.stopId)
    return createRunStop(`RUNSTOP-${Date.now()}-${index}`, `RUN-${Date.now()}`, stop, routeStop.plannedOrder, crewCount)
  })
  const runId = stops[0]?.runId || `RUN-${Date.now()}`
  stops.forEach((stop) => { stop.runId = runId })
  return {
    id: runId,
    routeId: route.id,
    routeName: route.name,
    routeVersion: route.version,
    runDate: new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York' }).format(new Date()),
    truck: '1',
    routeLeaderUserId,
    status: 'Not Started',
    startingCrewCount: crewCount,
    baselineEstimateMinutes: stops.reduce((total, stop) => total + stop.baselineEstimateMinutes, 0),
    historicalEstimateMinutes: stops.reduce((total, stop) => total + (stop.historicalAverageMinutes || stop.baselineEstimateMinutes), 0),
    stops,
  }
}

const johnRun = makeMockRun(mockRoutes[1], 'USR-002', 2)
johnRun.status = 'Active'
johnRun.stops[0].status = 'Completed'
johnRun.stops[0].actualOrder = 1
johnRun.stops[0].activeWorkMinutes = 32
johnRun.stops[1].status = 'Active'
johnRun.stops[1].actualOrder = 2
johnRun.stops[1].arrivedAt = new Date(Date.now() - 28 * 60000).toISOString()
johnRun.stops[1].firstWorkStartedAt = new Date(Date.now() - 24 * 60000).toISOString()

export const mockActiveRuns = [johnRun]

export const mockPropertyIssues = [
  { id: 'PI-001', propertyId: 'MORRI-112OAKS', runId: '', runStopId: '', reportedAt: new Date(Date.now() - 86400000 * 5).toISOString(), severity: 'Important', issueType: 'Irrigation', description: 'Sprinkler head sits high near the rear-left mowing line.', status: 'Open', resolutionOutcome: '', resolutionNotes: '' },
]

export const mockMachineIssues = [
  { id: 'MI-001', machineId: 'GS48-1', runId: '', runStopId: '', reportedAt: new Date(Date.now() - 86400000).toISOString(), severity: 'Issue', description: 'Deck vibration noticeable at full throttle.', status: 'Open', resolutionOutcome: '', resolutionNotes: '' },
]

export const mockRunIssues = [
  { id: 'RI-001', runId: johnRun.id, runStopId: '', severity: 'Informational', issueType: 'Weather delay', description: 'Short rain delay earlier this morning.', status: 'Open', startedAt: new Date(Date.now() - 7200000).toISOString() },
]
