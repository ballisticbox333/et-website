/**
 * E.T. Operations Apps Script API
 * Deploy as a standalone Web App executed as the owner.
 * The public Web App is protected by API_SHARED_SECRET and is intended to be
 * called only through the Cloudflare Worker at ops.etcustomlandscaping.com.
 */

const OPS = Object.freeze({
  API_VERSION: '2026-10-04-history-ux-v4',
  DEFAULT_SPREADSHEET_ID: '1l_YSkxPa2c4JrEXcH0jeXm-DwepUjrxbQwPbBxGn2ms',
  TIME_ZONE: 'America/New_York',
  SESSION_DAYS: 90,
  PASSWORD_ITERATIONS: 12000,
  PASSWORD_BYTES: 32,
  SALT_BYTES: 16,
  LOGIN_FAILURE_LIMIT: 10,
  LOGIN_FAILURE_SECONDS: 900,
  LAST_SEEN_WRITE_MINUTES: 15,
  TABLES: Object.freeze({
    properties: ['Property Sync', ['Property ID', 'Day', 'Truck', 'Name', 'Property / Address', 'Service Type', 'Notes', 'Active', 'Source Updated At']],
    users: ['Users', ['User ID', 'Name', 'Username', 'Active', 'Admin', 'Route Leader', 'Password Hash', 'Password Updated At', 'Session Version', 'Notes']],
    sessions: ['Sessions', ['Session ID Hash', 'User ID', 'Created At', 'Last Seen At', 'Expires At', 'Revoked', 'Device Label']],
    machines: ['Machines', ['Machine ID', 'Serial Number', 'Machine Type', 'Description', 'Active', 'Status', 'Notes', 'Updated At']],
    stops: ['Stops', ['Stop ID', 'Stop Name', 'Configuration Key', 'Active', 'Archived', 'Archive Reason', 'Replaces Stop ID', 'Property Count', 'Created At', 'Created By User ID', 'Archived At', 'Updated At']],
    stopProperties: ['Stop Properties', ['Stop ID', 'Property ID', 'Display Order', 'Added At']],
    routes: ['Routes', ['Route ID', 'Route Name', 'Version', 'Active', 'Archived', 'Archive Reason', 'Created At', 'Created By User ID', 'Updated At', 'Notes']],
    routeStops: ['Route Stops', ['Route ID', 'Stop ID', 'Planned Order', 'Added At']],
    routeRuns: ['Route Runs', ['Run ID', 'Route ID', 'Route Name Snapshot', 'Route Version', 'Run Date', 'Truck', 'Route Leader User ID', 'Status', 'Started At', 'Ended At', 'Starting Crew Count', 'Baseline Estimate Minutes', 'Historical Estimate Minutes', 'Notes', 'Created At', 'Updated At']],
    runStops: ['Run Stops', ['Run Stop ID', 'Run ID', 'Stop ID', 'Stop Name Snapshot', 'Planned Order', 'Actual Order', 'Status', 'Crew Count', 'Property Count Snapshot', 'Arrived At', 'First Work Started At', 'Completed At', 'Departed At', 'Active Work Minutes', 'Excluded Pause Minutes', 'Baseline Estimate Minutes', 'Historical Average Minutes', 'Notes', 'Updated At', 'Daily Service ID', 'Shared']],
    workSegments: ['Stop Work Segments', ['Segment ID', 'Run Stop ID', 'Started At', 'Ended At', 'Work Minutes', 'End Reason', 'Reason / Notes', 'Created By User ID', 'Updated At', 'Daily Service ID', 'Crew Count']],
    stopPauses: ['Stop Pauses', ['Pause ID', 'Run Stop ID', 'Pause Type', 'Started At', 'Ended At', 'Excluded Minutes', 'Reason', 'Created By User ID', 'Updated At', 'Daily Service ID']],
    dailyServices: ['Daily Services', ['Daily Service ID', 'Service Date', 'Stop ID', 'Status', 'Current Crew Count', 'Arrived At', 'First Work Started At', 'Completed At', 'Departed At', 'Active Work Minutes', 'Excluded Pause Minutes', 'Created At', 'Updated At']],
    dailyParticipants: ['Daily Service Participants', ['Participant ID', 'Daily Service ID', 'Run ID', 'Run Stop ID', 'Crew Count', 'Status', 'Joined At', 'Left At', 'Updated At']],
    travelLegs: ['Travel Legs', ['Travel Leg ID', 'Run ID', 'From Run Stop ID', 'To Run Stop ID', 'Departed At', 'Arrived At', 'Raw Travel Minutes', 'Excluded Delay Minutes', 'Adjusted Travel Minutes', 'Notes', 'Updated At']],
    travelDelays: ['Travel Delays', ['Delay ID', 'Travel Leg ID', 'Started At', 'Ended At', 'Excluded Minutes', 'Reason', 'Created By User ID', 'Updated At']],
    runPauses: ['Run Pauses', ['Run Pause ID', 'Run ID', 'Phase', 'Started At', 'Ended At', 'Excluded Minutes', 'Reason', 'Created By User ID', 'Updated At']],
    completionEvents: ['Stop Completion Events', ['Completion Event ID', 'Daily Service ID', 'Run Stop ID', 'Completed At', 'Completion Type', 'Created By User ID', 'Reason / Notes']],
    runIssues: ['Run Issues', ['Issue ID', 'Run ID', 'Run Stop ID', 'Severity', 'Issue Type', 'Description', 'Started At', 'Resolved At', 'Status', 'Resolution', 'Created By User ID', 'Updated At']],
    propertyIssues: ['Property Issues', ['Issue ID', 'Property ID', 'Run ID', 'Run Stop ID', 'Reported At', 'Severity', 'Issue Type', 'Description', 'Status', 'Resolution Outcome', 'Resolution Notes', 'Resolved At', 'Resolved By User ID', 'Attachment URLs', 'Created By User ID', 'Updated At']],
    machineIssues: ['Machine Issues', ['Issue ID', 'Machine ID', 'Run ID', 'Run Stop ID', 'Reported At', 'Severity', 'Description', 'Status', 'Resolution Outcome', 'Resolution Notes', 'Resolved At', 'Resolved By User ID', 'Maintenance Record ID', 'Attachment URLs', 'Created By User ID', 'Updated At']],
    stopAverages: ['Stop Averages', ['Stop ID', 'Crew Count', 'Sample Count', 'Average Work Minutes', 'Last Calculated At']],
    settings: ['Settings', ['Key', 'Value', 'Description']],
    audit: ['Audit Log', ['Audit ID', 'Timestamp', 'User ID', 'Entity Type', 'Entity ID', 'Field / Action', 'Old Value', 'New Value', 'Reason', 'Source']],
    historyRemovals: ['History Removals', ['Removal ID', 'Entity Type', 'Entity ID', 'Reason', 'Removed At', 'Removed By User ID']],
    mutations: ['Mutation Log', ['Mutation ID', 'User ID', 'Received At', 'Client Timestamp', 'Action', 'Entity Type', 'Entity ID', 'Result', 'Error', 'Processed At']]
  })
});

let OPS_SPREADSHEET_CACHE_ = null;
const OPS_TABLE_INFO_CACHE_ = {};
let OPS_HISTORY_REMOVALS_CACHE_ = null;

function doGet() {
  return json_({ ok: true, data: apiInfo_() });
}

function doPost(e) {
  try {
    const request = parseRequest_(e);
    assertApiSecret_(request.apiSecret);
    const action = text_(request.action);
    if (!action) fail_('INVALID_REQUEST', 'Action is required.');

    if (action === 'getApiInfo') return json_({ ok: true, data: apiInfo_() });
    if (action === 'login') return json_({ ok: true, data: login_(request.payload || {}) });

    const context = validateSession_(request.sessionToken);
    if (action === 'logout') return json_({ ok: true, data: logout_(request.sessionToken, context) });
    if (action === 'getCurrentUser') return json_({ ok: true, data: sessionPayload_(context.user) });
    if (action === 'bootstrap') { archiveInactivePropertyStops_(); return json_({ ok: true, data: bootstrapData_(context) }); }
    if (action === 'getHistory') return json_({ ok: true, data: historyData_(request.payload || {}, context) });

    if (isMutationAction_(action)) {
      const data = processMutation_(request, context);
      return json_({ ok: true, data: data });
    }

    fail_('UNKNOWN_ACTION', 'Unknown Operations action.');
  } catch (error) {
    console.error(error && error.stack ? error.stack : error);
    return json_({
      ok: false,
      code: error && error.code ? error.code : 'SERVER_ERROR',
      message: error && (error.publicMessage || error.message) ? (error.publicMessage || error.message) : 'The Operations request could not be completed.'
    });
  }
}

function parseRequest_(e) {
  const raw = e && e.postData && e.postData.contents ? e.postData.contents : '{}';
  try { return JSON.parse(raw); } catch (error) { fail_('INVALID_JSON', 'The request body is invalid.'); }
}

function assertApiSecret_(provided) {
  const expected = PropertiesService.getScriptProperties().getProperty('API_SHARED_SECRET');
  if (!expected || !provided || !constantTimeEqual_(String(provided), expected)) fail_('UNAUTHORIZED', 'Request authentication failed.');
}

function isMutationAction_(action) {
  return mutationActions_().indexOf(action) !== -1;
}

function mutationActions_() {
  return [
    'createUser', 'resetPassword', 'revokeSessions', 'saveRoute', 'createRoute', 'updateRoute', 'archiveRoute', 'restoreRoute', 'deleteArchivedRoute',
    'createStop', 'updateStop', 'archiveStop', 'restoreStop', 'deleteArchivedStop', 'createRun', 'createLiveRun', 'addRunStop', 'saveRunAsRoute', 'startRun', 'updateRunCrewCount', 'completeRun',
    'stopRunForDay', 'resumeRun', 'abortRoute', 'arriveStop', 'startWork', 'pauseStop', 'resumeStop', 'stopForDay', 'completeStop', 'abortStop',
    'departStop', 'switchStop', 'updateStopCrewCount', 'joinStop', 'leaveStop', 'editTimestamp', 'returnStop', 'addTravelDelay', 'editTravelDelay', 'logRunInterruption', 'removeFromHistory',
    'reportRunIssue', 'resolveRunIssue', 'reportPropertyIssue', 'resolvePropertyIssue', 'reportMachineIssue', 'resolveMachineIssue'
  ];
}

function apiInfo_(){return{service:'E.T. Operations API',status:'ready',version:OPS.API_VERSION,supportedMutations:mutationActions_()};}

function processMutation_(request, context) {
  const mutationId = text_(request.mutationId);
  if (!mutationId) fail_('MUTATION_ID_REQUIRED', 'A mutation ID is required.');
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(15000)) fail_('BUSY', 'Another update is being processed. Please retry.');
  try {
    const existing = findObject_('mutations', 'Mutation ID', mutationId);
    if (existing) {
      if (existing.object.Error) fail_('MUTATION_PREVIOUSLY_FAILED', text_(existing.object.Error));
      try { return replayMutationResult_(JSON.parse(existing.object.Result), context); } catch (error) { fail_('MUTATION_RESULT_INVALID', 'The previous mutation result is unavailable.'); }
    }

    const receivedAt = new Date();
    const logRow = appendObject_('mutations', {
      'Mutation ID': mutationId,
      'User ID': context.user['User ID'],
      'Received At': receivedAt,
      'Client Timestamp': parseDate_(request.clientTimestamp) || receivedAt,
      'Action': request.action,
      'Entity Type': inferEntityType_(request.action),
      'Entity ID': text_((request.payload || {}).runStopId || (request.payload || {}).runId || (request.payload || {}).issueId || (request.payload || {}).routeId || ''),
      'Result': '', 'Error': '', 'Processed At': ''
    });

    try {
      const result = executeMutation_(request.action, request.payload || {}, context);
      updateObjectRow_('mutations', logRow.rowNumber, { 'Result': JSON.stringify(compactMutationResult_(request.action, result)), 'Processed At': new Date() });
      return result;
    } catch (error) {
      updateObjectRow_('mutations', logRow.rowNumber, { 'Error': error.publicMessage || error.message || 'Mutation failed.', 'Processed At': new Date() });
      throw error;
    }
  } finally {
    lock.releaseLock();
  }
}

function compactMutationResult_(action,result){
  if(action==='createRun')return{type:'createRun',result:result};
  if(action==='createLiveRun')return{type:'createLiveRun',runId:result.run&&result.run.id};
  if(action==='createStop')return{type:'createStop',stopId:result.stop&&result.stop.id,reused:!!result.reused};
  if(action==='createUser')return{type:'createUser',userId:result.userId};
  return{type:'state'};
}

function replayMutationResult_(stored,context){
  if(stored.type==='createRun')return stored.result;
  if(stored.type==='createLiveRun'){const state=bootstrapData_(context);return{run:state.activeRuns.find(function(run){return run.id===stored.runId;}),state:state};}
  if(stored.type==='createStop'){const stop=stops_().find(function(item){return item.id===stored.stopId;});return{stop:stop,reused:stored.reused,state:bootstrapData_(context)};}
  if(stored.type==='createUser')return{userId:stored.userId,state:bootstrapData_(context)};
  return{state:bootstrapData_(context)};
}

function executeMutation_(action, payload, context) {
  if (action === 'createUser') return createUser_(payload, context);
  if (action === 'resetPassword') return resetPassword_(payload, context);
  if (action === 'revokeSessions') return revokeSessions_(payload, context);
  if (['saveRoute', 'createRoute', 'updateRoute'].indexOf(action) !== -1) return saveRoute_(payload.route || payload, context);
  if (action === 'archiveRoute') return archiveRestoreRoute_(payload.routeId, true, payload.reason, context);
  if (action === 'restoreRoute') return archiveRestoreRoute_(payload.routeId, false, payload.reason, context);
  if (action === 'deleteArchivedRoute') return deleteArchivedRoute_(payload, context);
  if (action === 'createStop') return createStop_(payload, context);
  if (action === 'updateStop') return updateStop_(payload, context);
  if (action === 'archiveStop') return archiveRestoreStop_(payload.stopId, true, payload.reason, context);
  if (action === 'restoreStop') return archiveRestoreStop_(payload.stopId, false, payload.reason, context);
  if (action === 'deleteArchivedStop') return deleteArchivedStop_(payload, context);
  if (action === 'createRun') return createRun_(payload, context);
  if (action === 'createLiveRun') return createLiveRun_(payload, context);
  if (action === 'addRunStop') return addRunStop_(payload, context);
  if (action === 'saveRunAsRoute') return saveRunAsRoute_(payload, context);
  if (action === 'abortRoute') return abortRoute_(payload, context);
  if (action === 'abortStop') return abortStop_(payload, context);
  if (action === 'returnStop') return returnStop_(payload, context);
  if (action === 'removeFromHistory') return removeFromHistory_(payload, context);
  if (['startRun', 'updateRunCrewCount', 'completeRun', 'stopRunForDay', 'resumeRun'].indexOf(action) !== -1) return mutateRun_(action, payload, context);
  if (['arriveStop', 'startWork', 'pauseStop', 'resumeStop', 'stopForDay', 'completeStop', 'departStop', 'switchStop', 'updateStopCrewCount', 'joinStop', 'leaveStop', 'editTimestamp'].indexOf(action) !== -1) return mutateRunStop_(action, payload, context);
  if (action === 'addTravelDelay' || action === 'editTravelDelay') return mutateTravelDelay_(action, payload, context);
  if (action === 'logRunInterruption') return logRunInterruption_(payload, context);
  if (action === 'reportRunIssue' || action === 'resolveRunIssue') return mutateRunIssue_(action, payload, context);
  if (action === 'reportPropertyIssue' || action === 'resolvePropertyIssue') return mutatePropertyIssue_(action, payload, context);
  if (action === 'reportMachineIssue' || action === 'resolveMachineIssue') return mutateMachineIssue_(action, payload, context);
  fail_('UNKNOWN_ACTION', 'Unknown mutation action.');
}

// ---------- Authentication ----------

function login_(payload) {
  const username = text_(payload.username).toLowerCase();
  const password = String(payload.password || '');
  if (!username || !password) fail_('LOGIN_FAILED', 'Incorrect username or password.');
  const cache = CacheService.getScriptCache();
  const failureKey = 'login:' + digestText_(username);
  const failures = Number(cache.get(failureKey) || 0);
  if (failures >= OPS.LOGIN_FAILURE_LIMIT) fail_('LOGIN_THROTTLED', 'Too many login attempts. Please wait and try again.');

  const userEntry = readTable_('users').find(function(entry) { return text_(entry.object.Username).toLowerCase() === username; });
  if (!userEntry || !bool_(userEntry.object.Active) || !verifyPassword_(password, userEntry.object['Password Hash'])) {
    cache.put(failureKey, String(failures + 1), OPS.LOGIN_FAILURE_SECONDS);
    fail_('LOGIN_FAILED', 'Incorrect username or password.');
  }
  cache.remove(failureKey);

  const version = number_(userEntry.object['Session Version'], 1);
  const token = version + '.' + randomToken_();
  const now = new Date();
  const expires = new Date(now.getTime() + OPS.SESSION_DAYS * 86400000);
  appendObject_('sessions', {
    'Session ID Hash': digestText_(token), 'User ID': userEntry.object['User ID'], 'Created At': now,
    'Last Seen At': now, 'Expires At': expires, 'Revoked': false, 'Device Label': text_(payload.deviceLabel).slice(0, 160)
  });
  const response = sessionPayload_(userEntry.object);
  response.sessionToken = token;
  return response;
}

function validateSession_(token) {
  token = String(token || '');
  if (!token) fail_('SESSION_INVALID', 'Please sign in.');
  const tokenHash = digestText_(token);
  const sessionEntry = readTable_('sessions').find(function(entry) { return constantTimeEqual_(text_(entry.object['Session ID Hash']), tokenHash); });
  if (!sessionEntry || bool_(sessionEntry.object.Revoked)) fail_('SESSION_INVALID', 'Please sign in again.');
  const expires = parseDate_(sessionEntry.object['Expires At']);
  if (!expires || expires.getTime() <= Date.now()) fail_('SESSION_EXPIRED', 'Your session expired. Please sign in again.');
  const userEntry = findObject_('users', 'User ID', sessionEntry.object['User ID']);
  if (!userEntry || !bool_(userEntry.object.Active)) fail_('SESSION_INVALID', 'Please sign in again.');
  const tokenVersion = Number(token.split('.')[0]);
  if (tokenVersion !== number_(userEntry.object['Session Version'], 1)) fail_('SESSION_INVALID', 'Please sign in again.');

  const lastSeen = parseDate_(sessionEntry.object['Last Seen At']);
  if (!lastSeen || Date.now() - lastSeen.getTime() > OPS.LAST_SEEN_WRITE_MINUTES * 60000) updateObjectRow_('sessions', sessionEntry.rowNumber, { 'Last Seen At': new Date() });
  return { user: userEntry.object, userRow: userEntry.rowNumber, session: sessionEntry.object, sessionRow: sessionEntry.rowNumber };
}

function logout_(token, context) {
  updateObjectRow_('sessions', context.sessionRow, { Revoked: true, 'Last Seen At': new Date() });
  return { loggedOut: true };
}

function sessionPayload_(user) {
  return {
    user: { id: text_(user['User ID']), name: text_(user.Name), username: text_(user.Username), admin: bool_(user.Admin), routeLeader: bool_(user['Route Leader']) },
    capabilities: bool_(user.Admin)
      ? ['operate-runs', 'view-runs', 'manage-routes', 'manage-stops', 'manage-users', 'edit-history', 'resolve-issues']
      : ['operate-runs', 'view-runs', 'report-issues']
  };
}

function createUser_(payload, context) {
  requireAdmin_(context);
  const username = text_(payload.username).toLowerCase();
  if (!username || !payload.password || !text_(payload.name)) fail_('INVALID_USER', 'Name, username, and password are required.');
  if (readTable_('users').some(function(entry) { return text_(entry.object.Username).toLowerCase() === username; })) fail_('USERNAME_EXISTS', 'That username already exists.');
  const id = id_('USR');
  appendObject_('users', { 'User ID': id, Name: text_(payload.name), Username: username, Active: payload.active !== false, Admin: bool_(payload.admin), 'Route Leader': payload.routeLeader !== false, 'Password Hash': hashPassword_(String(payload.password)), 'Password Updated At': new Date(), 'Session Version': 1, Notes: text_(payload.notes) });
  audit_(context, 'User', id, 'Create user', '', username, text_(payload.reason), 'Admin');
  return { userId: id, state: bootstrapData_(context) };
}

function resetPassword_(payload, context) {
  requireAdmin_(context);
  if (!payload.password) fail_('PASSWORD_REQUIRED', 'A new password is required.');
  const user = requiredObject_('users', 'User ID', payload.userId, 'USER_NOT_FOUND');
  const version = number_(user.object['Session Version'], 1) + 1;
  updateObjectRow_('users', user.rowNumber, { 'Password Hash': hashPassword_(String(payload.password)), 'Password Updated At': new Date(), 'Session Version': version });
  revokeUserSessions_(payload.userId);
  audit_(context, 'User', payload.userId, 'Reset password', '', 'Password updated; sessions revoked', text_(payload.reason), 'Admin');
  return { reset: true, state: bootstrapData_(context) };
}

function revokeSessions_(payload, context) {
  requireAdmin_(context);
  revokeUserSessions_(payload.userId);
  const user = requiredObject_('users', 'User ID', payload.userId, 'USER_NOT_FOUND');
  updateObjectRow_('users', user.rowNumber, { 'Session Version': number_(user.object['Session Version'], 1) + 1 });
  return { revoked: true, state: bootstrapData_(context) };
}

function revokeUserSessions_(userId) {
  readTable_('sessions').forEach(function(entry) { if (text_(entry.object['User ID']) === text_(userId) && !bool_(entry.object.Revoked)) updateObjectRow_('sessions', entry.rowNumber, { Revoked: true }); });
}

// Run this ONCE from the Apps Script editor after setting the bootstrap Script Properties.
function bootstrapFirstAdmin() {
  const props = PropertiesService.getScriptProperties();
  const username = text_(props.getProperty('BOOTSTRAP_ADMIN_USERNAME')).toLowerCase();
  const password = String(props.getProperty('BOOTSTRAP_ADMIN_PASSWORD') || '');
  const name = text_(props.getProperty('BOOTSTRAP_ADMIN_NAME')) || 'Operations Admin';
  if (!username || password.length < 12) throw new Error('Set BOOTSTRAP_ADMIN_USERNAME and a BOOTSTRAP_ADMIN_PASSWORD of at least 12 characters.');
  if (readTable_('users').some(function(entry) { return bool_(entry.object.Admin); })) throw new Error('An admin already exists. Bootstrap is disabled.');
  appendObject_('users', { 'User ID': id_('USR'), Name: name, Username: username, Active: true, Admin: true, 'Route Leader': true, 'Password Hash': hashPassword_(password), 'Password Updated At': new Date(), 'Session Version': 1, Notes: 'Initial administrator' });
  props.deleteProperty('BOOTSTRAP_ADMIN_PASSWORD');
  props.deleteProperty('BOOTSTRAP_ADMIN_USERNAME');
  props.deleteProperty('BOOTSTRAP_ADMIN_NAME');
  console.log('Initial administrator created. Bootstrap password properties were deleted.');
}

// ---------- Data serialization ----------

function historyRemovals_(){if(OPS_HISTORY_REMOVALS_CACHE_)return OPS_HISTORY_REMOVALS_CACHE_;OPS_HISTORY_REMOVALS_CACHE_=readTable_('historyRemovals').map(function(entry){const r=entry.object;return{id:text_(r['Removal ID']),entityType:text_(r['Entity Type']),entityId:text_(r['Entity ID']),reason:text_(r.Reason),removedAt:iso_(r['Removed At']),removedByUserId:text_(r['Removed By User ID'])};});return OPS_HISTORY_REMOVALS_CACHE_;}
function removalKey_(type,id){return text_(type)+'|'+text_(id);}
function removalIndex_(){const index={};historyRemovals_().forEach(function(item){index[removalKey_(item.entityType,item.entityId)]=item;});return index;}
function isRemoved_(index,type,id){return !!index[removalKey_(type,id)];}

function bootstrapData_(context) {
  const data = {
    properties: properties_(), stops: stops_(), routes: routes_(), machines: machines_(),
    activeRuns: activeRuns_(context), propertyIssues: propertyIssues_(), machineIssues: machineIssues_(), runIssues: runIssues_(), settings: settings_()
  };
  if (bool_(context.user.Admin)) data.users = users_();
  return data;
}

function users_(){return readTable_('users').filter(function(e){return text_(e.object['User ID']);}).map(function(e){const r=e.object;return{id:text_(r['User ID']),name:text_(r.Name),username:text_(r.Username),active:bool_(r.Active),admin:bool_(r.Admin),routeLeader:bool_(r['Route Leader']),passwordUpdatedAt:iso_(r['Password Updated At']),notes:text_(r.Notes)};});}

function properties_() {
  return readTable_('properties').filter(function(entry) { return text_(entry.object['Property ID']); }).map(function(entry) {
    const row = entry.object;
    return { id: text_(row['Property ID']), day: text_(row.Day), truck: row.Truck == null ? '' : String(row.Truck), name: text_(row.Name), address: text_(row['Property / Address']), serviceType: text_(row['Service Type']), notes: text_(row.Notes), active: bool_(row.Active), sourceUpdatedAt: iso_(row['Source Updated At']) };
  });
}

function stops_() {
  const membership = {};
  readTable_('stopProperties').forEach(function(entry) { const row = entry.object; const id = text_(row['Stop ID']); if (!membership[id]) membership[id] = []; membership[id].push({ id: text_(row['Property ID']), order: number_(row['Display Order'], 9999) }); });
  return readTable_('stops').filter(function(entry) { return text_(entry.object['Stop ID']); }).map(function(entry) {
    const row = entry.object; const id = text_(row['Stop ID']); const propertyIds = (membership[id] || []).sort(function(a,b){return a.order-b.order;}).map(function(item){return item.id;});
    return { id: id, name: text_(row['Stop Name']), propertyIds: propertyIds, propertyCount: number_(row['Property Count'], propertyIds.length), active: bool_(row.Active), archived: bool_(row.Archived), archiveReason: text_(row['Archive Reason']) };
  });
}

function routes_() {
  const memberships = {};
  readTable_('routeStops').forEach(function(entry) { const row = entry.object; const id = text_(row['Route ID']); if (!memberships[id]) memberships[id] = []; memberships[id].push({ stopId: text_(row['Stop ID']), plannedOrder: number_(row['Planned Order'], 0) }); });
  return readTable_('routes').filter(function(entry) { return text_(entry.object['Route ID']); }).map(function(entry) { const row = entry.object; const id = text_(row['Route ID']); return { id: id, name: text_(row['Route Name']), version: number_(row.Version, 1), active: bool_(row.Active), archived: bool_(row.Archived), archiveReason: text_(row['Archive Reason']), notes: text_(row.Notes), stops: (memberships[id] || []).sort(function(a,b){return a.plannedOrder-b.plannedOrder;}) }; });
}

function machines_() { return readTable_('machines').filter(function(entry){return text_(entry.object['Machine ID']);}).map(function(entry){const row=entry.object;return{id:text_(row['Machine ID']),serialNumber:text_(row['Serial Number']),machineType:text_(row['Machine Type']),description:text_(row.Description),active:bool_(row.Active),status:text_(row.Status),notes:text_(row.Notes)};}); }

function activeRuns_(context) {
  const removals=removalIndex_(),runStops = readTable_('runStops'),users=users_(),services={},participants={};
  readTable_('dailyServices').forEach(function(entry){services[text_(entry.object['Daily Service ID'])]=dailyServiceObject_(entry);});
  readTable_('dailyParticipants').forEach(function(entry){participants[text_(entry.object['Run Stop ID'])]={status:text_(entry.object.Status),joinedAt:iso_(entry.object['Joined At']),leftAt:iso_(entry.object['Left At']),crewCount:number_(entry.object['Crew Count'],0)};});
  return readTable_('routeRuns').filter(function(entry){const status=text_(entry.object.Status),id=text_(entry.object['Run ID']);return status && ['Completed','Canceled','Aborted'].indexOf(status)===-1&&!isRemoved_(removals,'Route Run',id);}).filter(function(entry){return bool_(context.user.Admin)||bool_(context.user['Route Leader']);}).map(function(entry){
    const row=entry.object,id=text_(row['Run ID']);
    const leaderId=text_(row['Route Leader User ID']),leader=users.find(function(user){return user.id===leaderId;});
    const stops=runStops.filter(function(item){return text_(item.object['Run ID'])===id&&!isRemoved_(removals,'Run Stop',item.object['Run Stop ID']);}).map(function(item){const result=runStopObject_(item),participant=participants[result.id]||{};result.dailyService=services[result.dailyServiceId]||null;result.participantStatus=participant.status||'Pending';result.participantJoinedAt=participant.joinedAt;result.participantLeftAt=participant.leftAt;result.participantCrewCount=participant.crewCount||result.crewCount;return result;}).sort(function(a,b){return a.plannedOrder-b.plannedOrder;});
    return{id:id,routeId:text_(row['Route ID']),routeName:text_(row['Route Name Snapshot']),routeVersion:number_(row['Route Version'],1),runDate:dateOnly_(row['Run Date']),truck:row.Truck==null?'':String(row.Truck),routeLeaderUserId:leaderId,routeLeaderName:leader?leader.name:leaderId,status:text_(row.Status),startedAt:iso_(row['Started At']),endedAt:iso_(row['Ended At']),startingCrewCount:number_(row['Starting Crew Count'],1),baselineEstimateMinutes:number_(row['Baseline Estimate Minutes'],0),historicalEstimateMinutes:numberOrNull_(row['Historical Estimate Minutes']),notes:text_(row.Notes),stops:stops};
  });
}

function runStopObject_(entry){const row=entry.object;return{id:text_(row['Run Stop ID']),runId:text_(row['Run ID']),stopId:text_(row['Stop ID']),stopName:text_(row['Stop Name Snapshot']),plannedOrder:number_(row['Planned Order'],0),actualOrder:numberOrNull_(row['Actual Order']),status:text_(row.Status),crewCount:number_(row['Crew Count'],1),propertyCount:number_(row['Property Count Snapshot'],0),arrivedAt:iso_(row['Arrived At']),firstWorkStartedAt:iso_(row['First Work Started At']),completedAt:iso_(row['Completed At']),departedAt:iso_(row['Departed At']),activeWorkMinutes:number_(row['Active Work Minutes'],0),excludedPauseMinutes:number_(row['Excluded Pause Minutes'],0),baselineEstimateMinutes:number_(row['Baseline Estimate Minutes'],0),historicalAverageMinutes:numberOrNull_(row['Historical Average Minutes']),notes:text_(row.Notes),dailyServiceId:text_(row['Daily Service ID']),shared:bool_(row.Shared)};}
function dailyServiceObject_(entry){const r=entry.object;return{id:text_(r['Daily Service ID']),serviceDate:dateOnly_(r['Service Date']),stopId:text_(r['Stop ID']),status:text_(r.Status),currentCrewCount:number_(r['Current Crew Count'],0),arrivedAt:iso_(r['Arrived At']),firstWorkStartedAt:iso_(r['First Work Started At']),completedAt:iso_(r['Completed At']),departedAt:iso_(r['Departed At']),activeWorkMinutes:number_(r['Active Work Minutes'],0),excludedPauseMinutes:number_(r['Excluded Pause Minutes'],0)};}
function propertyIssues_(){const removed=removalIndex_();return readTable_('propertyIssues').filter(function(e){return text_(e.object['Issue ID'])&&!isRemoved_(removed,'Property Issue',e.object['Issue ID']);}).map(function(e){const r=e.object;return{id:text_(r['Issue ID']),propertyId:text_(r['Property ID']),runId:text_(r['Run ID']),runStopId:text_(r['Run Stop ID']),reportedAt:iso_(r['Reported At']),severity:text_(r.Severity),issueType:text_(r['Issue Type']),description:text_(r.Description),status:text_(r.Status),resolutionOutcome:text_(r['Resolution Outcome']),resolutionNotes:text_(r['Resolution Notes']),resolvedAt:iso_(r['Resolved At'])};});}
function machineIssues_(){const removed=removalIndex_();return readTable_('machineIssues').filter(function(e){return text_(e.object['Issue ID'])&&!isRemoved_(removed,'Machine Issue',e.object['Issue ID']);}).map(function(e){const r=e.object;return{id:text_(r['Issue ID']),machineId:text_(r['Machine ID']),runId:text_(r['Run ID']),runStopId:text_(r['Run Stop ID']),reportedAt:iso_(r['Reported At']),severity:text_(r.Severity),description:text_(r.Description),status:text_(r.Status),resolutionOutcome:text_(r['Resolution Outcome']),resolutionNotes:text_(r['Resolution Notes']),resolvedAt:iso_(r['Resolved At'])};});}
function runIssues_(){const removed=removalIndex_();return readTable_('runIssues').filter(function(e){return text_(e.object['Issue ID'])&&!isRemoved_(removed,'Run Issue',e.object['Issue ID']);}).map(function(e){const r=e.object;return{id:text_(r['Issue ID']),runId:text_(r['Run ID']),runStopId:text_(r['Run Stop ID']),severity:text_(r.Severity),issueType:text_(r['Issue Type']),description:text_(r.Description),startedAt:iso_(r['Started At']),resolvedAt:iso_(r['Resolved At']),status:text_(r.Status),resolution:text_(r.Resolution)};});}
function settings_(){const out={};readTable_('settings').forEach(function(e){if(text_(e.object.Key))out[text_(e.object.Key)]=e.object.Value;});return out;}

// ---------- Routes and reusable stops ----------

function createStop_(payload, context) {
  requireAdmin_(context);
  const ensured = ensureStopConfiguration_(payload, context);
  return { stop: ensured.stop, reused: ensured.reused, state: bootstrapData_(context) };
}

function stopResolutionCatalog_() {
  const propertiesById={};
  properties_().forEach(function(property){if(property.active)propertiesById[property.id]=property;});
  const stopObjectsById={};
  stops_().forEach(function(stop){stopObjectsById[stop.id]=stop;});
  const stopsByKey={};
  readTable_('stops').forEach(function(entry){
    const key=text_(entry.object['Configuration Key']),stopId=text_(entry.object['Stop ID']);
    if(key&&!stopsByKey[key])stopsByKey[key]={entry:entry,stop:stopObjectsById[stopId]};
  });
  return{propertiesById:propertiesById,stopsByKey:stopsByKey};
}

function ensureStopConfiguration_(payload, context, catalog) {
  catalog=catalog||stopResolutionCatalog_();
  const propertyIds = uniqueStrings_(payload.propertyIds).sort();
  if (!propertyIds.length) fail_('STOP_PROPERTIES_REQUIRED', 'Choose at least one property.');
  const validProperties = propertyIds.map(function(id){return catalog.propertiesById[id];}).filter(Boolean);
  if (validProperties.length !== propertyIds.length) fail_('PROPERTY_UNAVAILABLE', 'One or more properties are inactive or missing.');
  const key = configurationKey_(propertyIds);
  const existing = catalog.stopsByKey[key];
  if (existing) {
    if (bool_(existing.entry.object.Archived) || !bool_(existing.entry.object.Active)) updateObjectRow_('stops',existing.entry.rowNumber,{Active:true,Archived:false,'Archive Reason':'','Archived At':'','Updated At':new Date()});
    existing.stop.active=true;existing.stop.archived=false;existing.stop.archiveReason='';
    return { stop: existing.stop, reused: true };
  }
  const id = id_('STP'), now = new Date();
  const name=text_(payload.name)||validProperties.map(function(p){return p.name;}).join(' + ');
  const entry=appendObject_('stops', {'Stop ID':id,'Stop Name':name,'Configuration Key':key,Active:true,Archived:false,'Archive Reason':'','Replaces Stop ID':'','Property Count':propertyIds.length,'Created At':now,'Created By User ID':context.user['User ID'],'Archived At':'','Updated At':now});
  propertyIds.forEach(function(propertyId,index){appendObject_('stopProperties',{'Stop ID':id,'Property ID':propertyId,'Display Order':index+1,'Added At':now});});
  const stop={id:id,name:name,propertyIds:propertyIds,propertyCount:propertyIds.length,active:true,archived:false,archiveReason:''};
  catalog.stopsByKey[key]={entry:entry,stop:stop};
  return { stop: stop, reused: false };
}

function updateStop_(payload, context) {
  requireAdmin_(context); const entry=requiredObject_('stops','Stop ID',payload.stopId,'STOP_NOT_FOUND');
  if (payload.propertyIds) {
    const ids=uniqueStrings_(payload.propertyIds).sort(),key=configurationKey_(ids);
    const duplicate=readTable_('stops').find(function(item){return text_(item.object['Configuration Key'])===key&&text_(item.object['Stop ID'])!==text_(payload.stopId)&&!bool_(item.object.Archived);});
    if(duplicate)fail_('STOP_CONFIGURATION_EXISTS','That exact property combination already exists.');
    const oldId=text_(payload.stopId); const replacement=createStop_({name:text_(payload.name)||entry.object['Stop Name'],propertyIds:ids},context);
    archiveRestoreStop_(oldId,true,'Replaced by '+replacement.stop.id,context); return replacement;
  }
  updateObjectRow_('stops',entry.rowNumber,{'Stop Name':text_(payload.name)||entry.object['Stop Name'],'Updated At':new Date()});
  return {state:bootstrapData_(context)};
}

function archiveRestoreStop_(stopId, archive, reason, context){requireAdmin_(context);const e=requiredObject_('stops','Stop ID',stopId,'STOP_NOT_FOUND');updateObjectRow_('stops',e.rowNumber,{Active:!archive,Archived:archive,'Archive Reason':archive?text_(reason):'','Archived At':archive?new Date():'','Updated At':new Date()});return{state:bootstrapData_(context)};}

function deleteArchivedStop_(payload,context){requireAdmin_(context);const stopId=text_(payload.stopId),reason=text_(payload.reason),confirmation=text_(payload.confirmation),stop=requiredObject_('stops','Stop ID',stopId,'STOP_NOT_FOUND');if(!bool_(stop.object.Archived))fail_('ARCHIVE_REQUIRED','Archive this reusable Stop before permanently deleting it.');if(confirmation!=='Delete permanently')fail_('CONFIRMATION_REQUIRED','Type "Delete permanently" to confirm.');if(!reason)fail_('REASON_REQUIRED','Enter a reason for permanently deleting this Stop.');const removed=removalIndex_(),runReference=readTable_('runStops').some(function(entry){return text_(entry.object['Stop ID'])===stopId&&!isRemoved_(removed,'Run Stop',entry.object['Run Stop ID']);}),serviceReference=readTable_('dailyServices').some(function(entry){return text_(entry.object['Stop ID'])===stopId&&!isRemoved_(removed,'Daily Service',entry.object['Daily Service ID']);}),routeReference=readTable_('routeStops').some(function(entry){return text_(entry.object['Stop ID'])===stopId;});if(runReference||serviceReference||routeReference)fail_('STOP_HAS_HISTORY','This Stop cannot be permanently deleted because a Route, Route Run, or service history still references it. Keep it archived instead.');audit_(context,'Reusable Stop',stopId,'Delete permanently','Archived','Deleted',reason,'Administrator');deleteRowsByValue_('stopProperties','Stop ID',stopId);deleteRowsByValue_('stopAverages','Stop ID',stopId);deleteRowsByValue_('stops','Stop ID',stopId);return{state:bootstrapData_(context)};}

function saveRoute_(route, context) {
  requireRouteLeader_(context); const now=new Date(); let routeId=text_(route.id); let entry=routeId?findObject_('routes','Route ID',routeId):null;
  const requestedItems=Array.isArray(route.items)?route.items:route.stops;
  if(!route.name||!Array.isArray(requestedItems)||!requestedItems.length)fail_('INVALID_ROUTE','Route name and at least one property or grouped Stop are required.');
  const stopCatalog=stopResolutionCatalog_();
  const resolvedStops=requestedItems.map(function(item){
    if(item.stopId){
      const existingStop=requiredObject_('stops','Stop ID',item.stopId,'STOP_NOT_FOUND');
      if(bool_(existingStop.object.Archived)||!bool_(existingStop.object.Active))fail_('STOP_UNAVAILABLE','One of the selected Stops is no longer active.');
      return{stopId:text_(item.stopId)};
    }
    const propertyIds=item.propertyId?[item.propertyId]:item.propertyIds;
    const ensured=ensureStopConfiguration_({name:text_(item.name),propertyIds:propertyIds},context,stopCatalog);
    return{stopId:ensured.stop.id};
  });
  if(entry){updateObjectRow_('routes',entry.rowNumber,{'Route Name':text_(route.name),Version:number_(entry.object.Version,1)+1,'Updated At':now,Notes:text_(route.notes)});deleteRowsByValue_('routeStops','Route ID',routeId);}
  else{routeId=id_('RTE');appendObject_('routes',{'Route ID':routeId,'Route Name':text_(route.name),Version:1,Active:true,Archived:false,'Archive Reason':'','Created At':now,'Created By User ID':context.user['User ID'],'Updated At':now,Notes:text_(route.notes)});}
  resolvedStops.forEach(function(item,index){appendObject_('routeStops',{'Route ID':routeId,'Stop ID':item.stopId,'Planned Order':index+1,'Added At':now});});
  return{routeId:routeId,state:bootstrapData_(context)};
}

function archiveRestoreRoute_(routeId,archive,reason,context){requireAdmin_(context);const e=requiredObject_('routes','Route ID',routeId,'ROUTE_NOT_FOUND');updateObjectRow_('routes',e.rowNumber,{Active:!archive,Archived:archive,'Archive Reason':archive?text_(reason):'','Updated At':new Date()});return{state:bootstrapData_(context)};}

function deleteArchivedRoute_(payload,context){requireAdmin_(context);const routeId=text_(payload.routeId),reason=text_(payload.reason),confirmation=text_(payload.confirmation),route=requiredObject_('routes','Route ID',routeId,'ROUTE_NOT_FOUND');if(!bool_(route.object.Archived))fail_('ARCHIVE_REQUIRED','Archive this reusable Route before permanently deleting it.');if(confirmation!=='Delete permanently')fail_('CONFIRMATION_REQUIRED','Type "Delete permanently" to confirm.');if(!reason)fail_('REASON_REQUIRED','Enter a reason for permanently deleting this Route.');const removed=removalIndex_(),historicalReference=readTable_('routeRuns').some(function(entry){return text_(entry.object['Route ID'])===routeId&&!isRemoved_(removed,'Route Run',entry.object['Run ID']);});if(historicalReference)fail_('ROUTE_HAS_HISTORY','This Route cannot be permanently deleted because normal Route Run history still references it. Remove those runs from History first or keep the Route archived.');audit_(context,'Reusable Route',routeId,'Delete permanently','Archived','Deleted',reason,'Administrator');deleteRowsByValue_('routeStops','Route ID',routeId);deleteRowsByValue_('routes','Route ID',routeId);return{state:bootstrapData_(context)};}

function archiveInactivePropertyStops_(){
  const lock=LockService.getScriptLock();
  if(!lock.tryLock(1000))return;
  try{
    const active={};properties_().forEach(function(property){if(property.active)active[property.id]=true;});
    const membership={};readTable_('stopProperties').forEach(function(entry){const stopId=text_(entry.object['Stop ID']);if(!membership[stopId])membership[stopId]=[];membership[stopId].push(text_(entry.object['Property ID']));});
    readTable_('stops').forEach(function(entry){const stopId=text_(entry.object['Stop ID']);if(bool_(entry.object.Archived))return;const ids=membership[stopId]||[];if(ids.some(function(id){return !active[id];})){const now=new Date();updateObjectRow_('stops',entry.rowNumber,{Active:false,Archived:true,'Archive Reason':'Contains inactive property','Archived At':now,'Updated At':now});appendObject_('audit',{'Audit ID':id_('AUD'),Timestamp:now,'User ID':'SYSTEM','Entity Type':'Stop','Entity ID':stopId,'Field / Action':'Auto archive','Old Value':'Active','New Value':'Archived',Reason:'Contains inactive property',Source:'Property Sync'});}});
  }finally{lock.releaseLock();}
}

// ---------- Route runs and timing ----------

function createRun_(payload, context) {
  requireRouteLeader_(context); const route=requiredObject_('routes','Route ID',payload.routeId,'ROUTE_NOT_FOUND');
  if(bool_(route.object.Archived)||!bool_(route.object.Active))fail_('ROUTE_UNAVAILABLE','That route is not active.');
  const crew=crewCount_(payload.crewCount),runId=id_('RUN'),now=new Date(),settings=settings_();
  const routeStopRows=readTable_('routeStops').filter(function(e){return text_(e.object['Route ID'])===text_(payload.routeId);}).sort(function(a,b){return number_(a.object['Planned Order'],0)-number_(b.object['Planned Order'],0);});
  let baselineTotal=0,historicalTotal=0;
  const runStopData=routeStopRows.map(function(routeStop){const stop=requiredObject_('stops','Stop ID',routeStop.object['Stop ID'],'STOP_NOT_FOUND').object;const propertyCount=number_(stop['Property Count'],0);const baseline=baselineMinutes_(propertyCount,crew,settings);const historical=historicalAverage_(stop['Stop ID'],crew);baselineTotal+=baseline;historicalTotal+=historical==null?baseline:historical;return{stop:stop,planned:number_(routeStop.object['Planned Order'],0),propertyCount:propertyCount,baseline:baseline,historical:historical};});
  const leaderId=bool_(context.user.Admin)&&payload.routeLeaderUserId?payload.routeLeaderUserId:context.user['User ID'];
  appendObject_('routeRuns',{'Run ID':runId,'Route ID':payload.routeId,'Route Name Snapshot':route.object['Route Name'],'Route Version':number_(route.object.Version,1),'Run Date':parseDate_(payload.runDate)||now,'Truck':payload.truck==null?'':String(payload.truck),'Route Leader User ID':leaderId,Status:'Not Started','Started At':'','Ended At':'','Starting Crew Count':crew,'Baseline Estimate Minutes':baselineTotal,'Historical Estimate Minutes':historicalTotal,Notes:text_(payload.notes),'Created At':now,'Updated At':now});
  runStopData.forEach(function(item){attachStopToRun_(runId,item.stop,item.planned,crew,parseDate_(payload.runDate)||now,item.baseline,item.historical,false);});
  return activeRuns_(context).find(function(run){return run.id===runId;});
}

function createLiveRun_(payload,context){
  requireRouteLeader_(context);const now=new Date(),runId=id_('RUN'),crew=crewCount_(payload.crewCount),leaderId=bool_(context.user.Admin)&&payload.routeLeaderUserId?payload.routeLeaderUserId:context.user['User ID'];
  appendObject_('routeRuns',{'Run ID':runId,'Route ID':'','Route Name Snapshot':text_(payload.name)||'Live Route','Route Version':0,'Run Date':parseDate_(payload.runDate)||now,'Truck':payload.truck==null?'':String(payload.truck),'Route Leader User ID':leaderId,Status:'Active','Started At':now,'Ended At':'','Starting Crew Count':crew,'Baseline Estimate Minutes':0,'Historical Estimate Minutes':0,Notes:'Build as You Go','Created At':now,'Updated At':now});
  const state=bootstrapData_(context);return{run:state.activeRuns.find(function(run){return run.id===runId;}),state:state};
}

function addRunStop_(payload,context){
  const run=requiredRun_(payload.runId,context),catalog=stopResolutionCatalog_(),ensured=payload.stopId?{stop:stops_().find(function(stop){return stop.id===text_(payload.stopId);})}:ensureStopConfiguration_({name:payload.name,propertyIds:payload.propertyId?[payload.propertyId]:payload.propertyIds},context,catalog);
  if(!ensured.stop)fail_('STOP_NOT_FOUND','The selected Stop was not found.');
  const duplicate=readTable_('runStops').find(function(entry){return text_(entry.object['Run ID'])===text_(payload.runId)&&text_(entry.object['Stop ID'])===ensured.stop.id;});
  if(duplicate)return{run:activeRuns_(context).find(function(item){return item.id===text_(payload.runId);}),state:bootstrapData_(context),reused:true};
  const order=readTable_('runStops').filter(function(entry){return text_(entry.object['Run ID'])===text_(payload.runId);}).length+1,crew=number_(run.object['Starting Crew Count'],1),settings=settings_(),baseline=baselineMinutes_(ensured.stop.propertyCount,crew,settings),historical=historicalAverage_(ensured.stop.id,crew);
  attachStopToRun_(payload.runId,{'Stop ID':ensured.stop.id,'Stop Name':ensured.stop.name,'Property Count':ensured.stop.propertyCount},order,crew,run.object['Run Date'],baseline,historical,true);
  if(bool_(payload.persistToRoute)&&text_(run.object['Route ID']))appendStopToRoute_(run.object['Route ID'],ensured.stop.id,context);
  updateRunEstimates_(payload.runId);
  return{run:activeRuns_(context).find(function(item){return item.id===text_(payload.runId);}),state:bootstrapData_(context),reused:!!ensured.reused};
}

function saveRunAsRoute_(payload,context){
  requireRouteLeader_(context);const run=requiredRun_(payload.runId,context),stops=readTable_('runStops').filter(function(entry){return text_(entry.object['Run ID'])===text_(payload.runId);}).sort(function(a,b){return number_(a.object['Actual Order'],9999)-number_(b.object['Actual Order'],9999)||number_(a.object['Planned Order'],0)-number_(b.object['Planned Order'],0);});
  return saveRoute_({name:text_(payload.name)||text_(run.object['Route Name Snapshot'])||'Saved Live Route',notes:text_(payload.notes),stops:stops.map(function(entry){return{stopId:text_(entry.object['Stop ID'])};})},context);
}

function appendStopToRoute_(routeId,stopId,context){requireRouteLeader_(context);const exists=readTable_('routeStops').some(function(entry){return text_(entry.object['Route ID'])===text_(routeId)&&text_(entry.object['Stop ID'])===text_(stopId);});if(exists)return;const rows=readTable_('routeStops').filter(function(entry){return text_(entry.object['Route ID'])===text_(routeId);});appendObject_('routeStops',{'Route ID':routeId,'Stop ID':stopId,'Planned Order':rows.length+1,'Added At':new Date()});const route=requiredObject_('routes','Route ID',routeId,'ROUTE_NOT_FOUND');updateObjectRow_('routes',route.rowNumber,{Version:number_(route.object.Version,1)+1,'Updated At':new Date()});}

function attachStopToRun_(runId,stop,plannedOrder,crew,serviceDate,baseline,historical,actualNow){
  const stopId=text_(stop['Stop ID']||stop.id),name=text_(stop['Stop Name']||stop.name),count=number_(stop['Property Count']||stop.propertyCount,0),service=getOrCreateDailyService_(serviceDate,stopId),runStopId=id_('RST'),now=new Date(),existingParticipants=readTable_('dailyParticipants').filter(function(entry){return text_(entry.object['Daily Service ID'])===service.id;});
  appendObject_('runStops',{'Run Stop ID':runStopId,'Run ID':runId,'Stop ID':stopId,'Stop Name Snapshot':name,'Planned Order':plannedOrder,'Actual Order':actualNow?nextActualOrder_(runId):'',Status:service.status||'Not Started','Crew Count':crew,'Property Count Snapshot':count,'Arrived At':service.arrivedAt||'','First Work Started At':service.firstWorkStartedAt||'','Completed At':service.completedAt||'','Departed At':service.departedAt||'','Active Work Minutes':service.activeWorkMinutes||0,'Excluded Pause Minutes':service.excludedPauseMinutes||0,'Baseline Estimate Minutes':baseline,'Historical Average Minutes':historical==null?'':historical,Notes:'','Updated At':now,'Daily Service ID':service.id,Shared:existingParticipants.length>0});
  appendObject_('dailyParticipants',{'Participant ID':id_('DSP'),'Daily Service ID':service.id,'Run ID':runId,'Run Stop ID':runStopId,'Crew Count':crew,Status:'Pending','Joined At':'','Left At':'','Updated At':now});
  if(existingParticipants.length)readTable_('runStops').forEach(function(entry){if(text_(entry.object['Daily Service ID'])===service.id)updateObjectRow_('runStops',entry.rowNumber,{Shared:true});});
}

function getOrCreateDailyService_(serviceDate,stopId){const date=dateOnly_(serviceDate),existing=readTable_('dailyServices').find(function(entry){return dateOnly_(entry.object['Service Date'])===date&&text_(entry.object['Stop ID'])===text_(stopId);});if(existing)return dailyServiceObject_(existing);const now=new Date(),id=id_('DSV');appendObject_('dailyServices',{'Daily Service ID':id,'Service Date':date,'Stop ID':stopId,Status:'Not Started','Current Crew Count':0,'Arrived At':'','First Work Started At':'','Completed At':'','Departed At':'','Active Work Minutes':0,'Excluded Pause Minutes':0,'Created At':now,'Updated At':now});return{id:id,serviceDate:date,stopId:stopId,status:'Not Started',currentCrewCount:0,activeWorkMinutes:0,excludedPauseMinutes:0};}

function updateRunEstimates_(runId){const run=requiredObject_('routeRuns','Run ID',runId,'RUN_NOT_FOUND'),stops=readTable_('runStops').filter(function(entry){return text_(entry.object['Run ID'])===text_(runId);});updateObjectRow_('routeRuns',run.rowNumber,{'Baseline Estimate Minutes':stops.reduce(function(sum,e){return sum+number_(e.object['Baseline Estimate Minutes'],0);},0),'Historical Estimate Minutes':stops.reduce(function(sum,e){return sum+number_(e.object['Historical Average Minutes'],number_(e.object['Baseline Estimate Minutes'],0));},0),'Updated At':new Date()});}

function mutateRun_(action,payload,context){const run=requiredRun_(payload.runId,context),now=parseDate_(payload.at)||new Date();const changes={'Updated At':now};
  if(action==='startRun'){if(text_(run.object.Status)!=='Not Started')fail_('INVALID_STATE','This route has already started.');changes.Status='Active';changes['Started At']=now;}
  if(action==='updateRunCrewCount')changes['Starting Crew Count']=crewCount_(payload.crewCount);
  if(action==='stopRunForDay')changes.Status='Stopped for Day';
  if(action==='resumeRun')changes.Status='Active';
  if(action==='completeRun'){const incomplete=readTable_('runStops').some(function(e){return text_(e.object['Run ID'])===text_(payload.runId)&&text_(e.object.Status)!=='Completed';});if(incomplete)fail_('RUN_INCOMPLETE','Complete every stop before completing the route.');changes.Status='Completed';changes['Ended At']=now;}
  updateObjectRow_('routeRuns',run.rowNumber,changes);return{run:activeRuns_(context).find(function(r){return r.id===text_(payload.runId);}),recap:action==='completeRun'?recapForRun_(payload.runId):null,state:bootstrapData_(context)};}

function mutateRunStop_(action,payload,context){
  requiredRun_(payload.runId,context);const stop=requiredObject_('runStops','Run Stop ID',payload.runStopId,'RUN_STOP_NOT_FOUND'),now=parseDate_(payload.at)||new Date();
  if(text_(stop.object['Run ID'])!==text_(payload.runId))fail_('RUN_STOP_NOT_FOUND','Stop not found on this route.');
  const service=requiredObject_('dailyServices','Daily Service ID',stop.object['Daily Service ID'],'DAILY_SERVICE_NOT_FOUND');
  if(action==='arriveStop'){
    updateObjectRow_('dailyServices',service.rowNumber,{Status:'Active','Arrived At':service.object['Arrived At']||now,'Updated At':now});
    updateObjectRow_('runStops',stop.rowNumber,{'Actual Order':stop.object['Actual Order']||nextActualOrder_(payload.runId),'Updated At':now});finishTravelLeg_(payload.runId,payload.runStopId,now);propagateDailyService_(service.object['Daily Service ID']);
  }else if(action==='startWork'||action==='joinStop'){
    if(!service.object['Arrived At'])fail_('INVALID_STATE','Arrive before starting work.');joinDailyService_(service,stop,context,now,text_(payload.reason),action==='startWork');
  }else if(action==='leaveStop'){
    leaveDailyService_(service,stop,context,now,text_(payload.reason));
  }else if(action==='pauseStop'||action==='stopForDay'){
    closeDailyWorkSegment_(service.object['Daily Service ID'],action==='pauseStop'?'Pause':'Stop for Day',payload.reason,now);appendObject_('stopPauses',{'Pause ID':id_('PAU'),'Run Stop ID':payload.runStopId,'Pause Type':action==='pauseStop'?'Pause':'Stop for Day','Started At':now,'Ended At':'','Excluded Minutes':'',Reason:text_(payload.reason),'Created By User ID':context.user['User ID'],'Updated At':now,'Daily Service ID':service.object['Daily Service ID']});updateObjectRow_('dailyServices',service.rowNumber,{Status:action==='pauseStop'?'Paused':'Stopped for Day','Updated At':now});recalculateDailyService_(service.object['Daily Service ID']);
  }else if(action==='resumeStop'){
    closeDailyPause_(service.object['Daily Service ID'],now);const crew=currentDailyCrew_(service.object['Daily Service ID']);openDailyWorkSegment_(service.object['Daily Service ID'],payload.runStopId,crew,context,now,payload.reason);updateObjectRow_('dailyServices',service.rowNumber,{Status:'Active','First Work Started At':service.object['First Work Started At']||now,'Updated At':now});propagateDailyService_(service.object['Daily Service ID']);
  }else if(action==='completeStop'){
    closeDailyWorkSegment_(service.object['Daily Service ID'],'Completed',payload.reason,now);closeDailyPause_(service.object['Daily Service ID'],now);appendCompletionEvent_(service.object['Daily Service ID'],payload.runStopId,now,context,text_(payload.reason));updateObjectRow_('dailyServices',service.rowNumber,{Status:'Completed','Completed At':now,'Current Crew Count':0,'Updated At':now});readTable_('dailyParticipants').forEach(function(entry){if(text_(entry.object['Daily Service ID'])===text_(service.object['Daily Service ID'])&&text_(entry.object.Status)==='Joined')updateObjectRow_('dailyParticipants',entry.rowNumber,{Status:'Completed','Left At':now,'Updated At':now});});recalculateDailyService_(service.object['Daily Service ID']);updateStopAverageForDailyService_(service.object['Daily Service ID'],stop.object['Stop ID']);
  }else if(action==='departStop'){
    if(text_(service.object.Status)!=='Completed')fail_('INVALID_STATE','Complete the stop before departing.');updateObjectRow_('dailyServices',service.rowNumber,{'Departed At':service.object['Departed At']||now,'Updated At':now});propagateDailyService_(service.object['Daily Service ID']);beginTravelLeg_(payload.runId,payload.runStopId,now);
  }else if(action==='switchStop'){
    leaveDailyService_(service,stop,context,now,text_(payload.reason));const next=requiredObject_('runStops','Run Stop ID',payload.nextRunStopId,'RUN_STOP_NOT_FOUND');if(text_(next.object['Run ID'])!==text_(payload.runId))fail_('RUN_STOP_NOT_FOUND','Destination stop is invalid.');updateObjectRow_('runStops',next.rowNumber,{'Actual Order':next.object['Actual Order']||nextActualOrder_(payload.runId),'Updated At':now});
  }else if(action==='updateStopCrewCount'){
    const count=crewCount_(payload.crewCount),participant=participantForRunStop_(payload.runStopId);if(participant&&text_(participant.object.Status)==='Joined')closeDailyWorkSegment_(service.object['Daily Service ID'],'Crew changed','',now);updateObjectRow_('runStops',stop.rowNumber,{'Crew Count':count,'Updated At':now});if(participant)updateObjectRow_('dailyParticipants',participant.rowNumber,{'Crew Count':count,'Updated At':now});if(participant&&text_(participant.object.Status)==='Joined')openDailyWorkSegment_(service.object['Daily Service ID'],payload.runStopId,currentDailyCrew_(service.object['Daily Service ID']),context,now,'Crew changed');propagateDailyService_(service.object['Daily Service ID']);
  }else if(action==='editTimestamp'){
    requireAdmin_(context);const allowed={arrivedAt:'Arrived At',firstWorkStartedAt:'First Work Started At',completedAt:'Completed At',departedAt:'Departed At'},header=allowed[payload.field];if(!header)fail_('INVALID_FIELD','That timestamp cannot be edited.');const old=service.object[header],value=parseDate_(payload.value);if(!value)fail_('INVALID_DATE','Enter a valid date and time.');const changes={'Updated At':now};changes[header]=value;updateObjectRow_('dailyServices',service.rowNumber,changes);propagateDailyService_(service.object['Daily Service ID']);audit_(context,'Daily Service',service.object['Daily Service ID'],header,iso_(old),iso_(value),text_(payload.reason),'Admin correction');
  }
  return{run:activeRuns_(context).find(function(r){return r.id===text_(payload.runId);}),state:bootstrapData_(context)};
}

function isTerminalRunStopDisposition_(status){return ['Aborted — Partial Work','Voided','Not Serviced — Route Aborted'].indexOf(text_(status))!==-1;}

function abortStop_(payload,context){
  const run=requiredRun_(payload.runId,context),stop=requiredObject_('runStops','Run Stop ID',payload.runStopId,'RUN_STOP_NOT_FOUND'),now=parseDate_(payload.at)||new Date(),mode=text_(payload.mode),reason=text_(payload.reason);
  if(text_(stop.object['Run ID'])!==text_(payload.runId))fail_('RUN_STOP_NOT_FOUND','Stop not found on this route.');
  if(['partial','discard'].indexOf(mode)===-1)fail_('ABORT_MODE_REQUIRED','Choose whether to keep partial work or discard this attempt.');
  if(!reason)fail_('REASON_REQUIRED','Enter a reason for aborting this Stop.');
  if(text_(stop.object.Status)==='Completed')fail_('INVALID_STATE','A completed Stop cannot be aborted.');
  if(isTerminalRunStopDisposition_(stop.object.Status))fail_('INVALID_STATE','This Stop has already been resolved.');
  const service=requiredObject_('dailyServices','Daily Service ID',stop.object['Daily Service ID'],'DAILY_SERVICE_NOT_FOUND'),participant=participantForRunStop_(payload.runStopId),wasJoined=participant&&text_(participant.object.Status)==='Joined';
  if(wasJoined&&text_(service.object.Status)==='Active')closeDailyWorkSegment_(service.object['Daily Service ID'],mode==='partial'?'Aborted — Partial Work':'Voided',reason,now);
  if(participant)updateObjectRow_('dailyParticipants',participant.rowNumber,{Status:mode==='partial'?'Aborted':'Voided','Left At':now,'Updated At':now});
  const joinedCrew=currentDailyCrew_(service.object['Daily Service ID']),otherParticipants=readTable_('dailyParticipants').filter(function(entry){return text_(entry.object['Daily Service ID'])===text_(service.object['Daily Service ID'])&&text_(entry.object['Run Stop ID'])!==text_(payload.runStopId)&&['Pending','Joined'].indexOf(text_(entry.object.Status))!==-1;}),otherJoined=otherParticipants.some(function(entry){return text_(entry.object.Status)==='Joined';});
  if(otherJoined&&text_(service.object.Status)==='Active')openDailyWorkSegment_(service.object['Daily Service ID'],otherParticipants.filter(function(entry){return text_(entry.object.Status)==='Joined';})[0].object['Run Stop ID'],joinedCrew,context,now,'Crew continued after another route aborted its participation.');
  const serviceStatus=otherJoined?'Active':otherParticipants.length?'Stopped for Day':mode==='partial'?'Aborted — Partial Work':'Voided';
  updateObjectRow_('dailyServices',service.rowNumber,{Status:serviceStatus,'Current Crew Count':joinedCrew,'Updated At':now});
  recalculateDailyService_(service.object['Daily Service ID']);
  updateObjectRow_('runStops',stop.rowNumber,{Status:mode==='partial'?'Aborted — Partial Work':'Voided','Updated At':now});
  if(mode==='discard'){
    registerHistoryRemoval_('Run Stop',payload.runStopId,reason,context,now);
    if(!otherParticipants.length)registerHistoryRemoval_('Daily Service',service.object['Daily Service ID'],reason,context,now);
  }
  audit_(context,'Run Stop',payload.runStopId,'Abort Stop',text_(stop.object.Status),mode==='partial'?'Aborted — Partial Work':'Voided',reason,'Operations');
  return{run:activeRuns_(context).find(function(item){return item.id===text_(payload.runId);}),state:bootstrapData_(context)};
}

function appendCompletionEvent_(dailyServiceId,runStopId,completedAt,context,reason){
  const count=readTable_('completionEvents').filter(function(entry){return text_(entry.object['Daily Service ID'])===text_(dailyServiceId);}).length;
  appendObject_('completionEvents',{'Completion Event ID':id_('CMP'),'Daily Service ID':dailyServiceId,'Run Stop ID':runStopId,'Completed At':completedAt,'Completion Type':count?'Return Visit':'Initial Completion','Created By User ID':context.user['User ID'],'Reason / Notes':text_(reason)});
}

function returnStop_(payload,context){
  requiredRun_(payload.runId,context);const stop=requiredObject_('runStops','Run Stop ID',payload.runStopId,'RUN_STOP_NOT_FOUND'),now=parseDate_(payload.at)||new Date(),reason=text_(payload.reason);
  if(!reason)fail_('REASON_REQUIRED','Enter a reason for returning to this Stop.');
  if(text_(stop.object['Run ID'])!==text_(payload.runId))fail_('RUN_STOP_NOT_FOUND','Stop not found on this route.');
  if(text_(stop.object.Status)!=='Completed')fail_('INVALID_STATE','Only a completed Stop can be returned to.');
  const service=requiredObject_('dailyServices','Daily Service ID',stop.object['Daily Service ID'],'DAILY_SERVICE_NOT_FOUND');
  if(!readTable_('completionEvents').some(function(entry){return text_(entry.object['Daily Service ID'])===text_(service.object['Daily Service ID']);}))appendCompletionEvent_(service.object['Daily Service ID'],payload.runStopId,parseDate_(service.object['Completed At'])||now,context,'Historical completion preserved before return visit.');
  appendObject_('completionEvents',{'Completion Event ID':id_('CMP'),'Daily Service ID':service.object['Daily Service ID'],'Run Stop ID':payload.runStopId,'Completed At':now,'Completion Type':'Return Started','Created By User ID':context.user['User ID'],'Reason / Notes':reason});
  updateObjectRow_('dailyServices',service.rowNumber,{Status:'Returned','Completed At':'','Departed At':'','Current Crew Count':0,'Updated At':now});
  const participant=participantForRunStop_(payload.runStopId);if(participant)updateObjectRow_('dailyParticipants',participant.rowNumber,{Status:'Pending','Joined At':'','Left At':'','Updated At':now});
  updateObjectRow_('runStops',stop.rowNumber,{Status:'Returned','Completed At':'','Departed At':'','Updated At':now});
  audit_(context,'Run Stop',payload.runStopId,'Return to Stop','Completed','Returned',reason,'Operations');
  return{run:activeRuns_(context).find(function(item){return item.id===text_(payload.runId);}),state:bootstrapData_(context)};
}

function abortRoute_(payload,context){
  const run=requiredRun_(payload.runId,context),now=parseDate_(payload.at)||new Date(),reason=text_(payload.reason);
  if(!reason)fail_('REASON_REQUIRED','Enter a reason for aborting this route.');
  if(['Completed','Aborted','Canceled'].indexOf(text_(run.object.Status))!==-1)fail_('INVALID_STATE','This route is already closed.');
  const stops=readTable_('runStops').filter(function(entry){return text_(entry.object['Run ID'])===text_(payload.runId);}),stopIds=stops.map(function(entry){return text_(entry.object['Run Stop ID']);}),openSegments=readTable_('workSegments').filter(function(entry){return stopIds.indexOf(text_(entry.object['Run Stop ID']))!==-1&&!entry.object['Ended At'];}),participants=readTable_('dailyParticipants'),activeUnresolved=stops.filter(function(entry){const participant=participants.find(function(item){return text_(item.object['Run Stop ID'])===text_(entry.object['Run Stop ID']);}),participated=participant&&text_(participant.object.Status)==='Joined',arrivedOnThisRoute=number_(entry.object['Actual Order'],0)>0;return ['Active','Paused'].indexOf(text_(entry.object.Status))!==-1&&(participated||arrivedOnThisRoute);});
  if(openSegments.length||activeUnresolved.length)fail_('ACTIVE_STOP_REQUIRES_RESOLUTION','Resolve active Stop work first: use Stop for Day, Abort Stop, or Leave Stop, then abort the route.');
  stops.forEach(function(entry){const status=text_(entry.object.Status);if(status==='Completed'||isTerminalRunStopDisposition_(status))return;updateObjectRow_('runStops',entry.rowNumber,{Status:'Not Serviced — Route Aborted','Updated At':now});const participant=participantForRunStop_(entry.object['Run Stop ID']);if(participant&&['Completed','Aborted','Voided','Left'].indexOf(text_(participant.object.Status))===-1)updateObjectRow_('dailyParticipants',participant.rowNumber,{Status:'Route Aborted','Left At':now,'Updated At':now});});
  updateObjectRow_('routeRuns',run.rowNumber,{Status:'Aborted','Ended At':now,'Updated At':now});
  audit_(context,'Route Run',payload.runId,'Abort Route',text_(run.object.Status),'Aborted',reason,'Operations');
  return{recap:recapForRun_(payload.runId),state:bootstrapData_(context)};
}

function registerHistoryRemoval_(entityType,entityId,reason,context,when){
  const existing=historyRemovals_().find(function(item){return removalKey_(item.entityType,item.entityId)===removalKey_(entityType,entityId);});
  if(existing)return existing;
  const row={id:id_('REM'),entityType:text_(entityType),entityId:text_(entityId),reason:text_(reason),removedAt:iso_(when||new Date()),removedByUserId:text_(context.user['User ID'])};
  appendObject_('historyRemovals',{'Removal ID':row.id,'Entity Type':row.entityType,'Entity ID':row.entityId,Reason:row.reason,'Removed At':when||new Date(),'Removed By User ID':row.removedByUserId});
  OPS_HISTORY_REMOVALS_CACHE_=null;
  return row;
}

function removeFromHistory_(payload,context){
  requireAdmin_(context);const entityType=text_(payload.entityType),entityId=text_(payload.entityId),reason=text_(payload.reason),now=parseDate_(payload.at)||new Date();
  if(!reason)fail_('REASON_REQUIRED','Enter a reason for removing this record from History.');
  const supported={'Route Run':['routeRuns','Run ID'],'Run Stop':['runStops','Run Stop ID'],'Daily Service':['dailyServices','Daily Service ID'],'Daily Participant':['dailyParticipants','Participant ID'],'Work Segment':['workSegments','Segment ID'],'Stop Pause':['stopPauses','Pause ID'],'Run Pause':['runPauses','Run Pause ID'],'Completion Event':['completionEvents','Completion Event ID'],'Travel Leg':['travelLegs','Travel Leg ID'],'Travel Delay':['travelDelays','Delay ID'],'Run Issue':['runIssues','Issue ID'],'Property Issue':['propertyIssues','Issue ID'],'Machine Issue':['machineIssues','Issue ID']},target=supported[entityType];
  if(!target)fail_('INVALID_ENTITY_TYPE','That record type cannot be removed from History.');
  const record=requiredObject_(target[0],target[1],entityId,'HISTORY_RECORD_NOT_FOUND');
  let relatedCount=0;
  if(entityType==='Route Run')relatedCount=cascadeRouteRunRemoval_(entityId,reason,context,now);
  else if(entityType==='Run Stop')relatedCount=cascadeRunStopRemoval_(entityId,reason,context,now);
  else if(entityType==='Daily Service')relatedCount=cascadeDailyServiceRemoval_(entityId,reason,context,now);
  else registerHistoryRemoval_(entityType,entityId,reason,context,now);
  if(entityType==='Work Segment'||entityType==='Stop Pause')recalculateDailyService_(record.object['Daily Service ID']);
  if(entityType==='Travel Delay')recalculateTravelLeg_(record.object['Travel Leg ID']);
  const affected=historyRemovals_().filter(function(item){return item.removedAt===iso_(now)&&item.removedByUserId===text_(context.user['User ID'])&&item.reason===reason;}).map(function(item){return item.entityType+' '+item.entityId;});
  audit_(context,entityType,entityId,'Remove from History','Visible',(relatedCount?'Removed with '+relatedCount+' related record'+(relatedCount===1?'':'s'):'Removed')+(affected.length?' | Affected: '+affected.join(', '):''),reason,'Administrator');
  return{state:bootstrapData_(context)};
}

function cascadeRouteRunRemoval_(runId,reason,context,now){
  const before=historyRemovals_().length;
  registerHistoryRemoval_('Route Run',runId,reason,context,now);
  const stops=readTable_('runStops').filter(function(entry){return text_(entry.object['Run ID'])===text_(runId);}),stopIds=stops.map(function(entry){return text_(entry.object['Run Stop ID']);}),serviceIds=uniqueStrings_(stops.map(function(entry){return text_(entry.object['Daily Service ID']);}));
  stops.forEach(function(entry){registerHistoryRemoval_('Run Stop',entry.object['Run Stop ID'],reason,context,now);});
  readTable_('workSegments').forEach(function(entry){if(stopIds.indexOf(text_(entry.object['Run Stop ID']))!==-1)registerHistoryRemoval_('Work Segment',entry.object['Segment ID'],reason,context,now);});
  readTable_('stopPauses').forEach(function(entry){if(stopIds.indexOf(text_(entry.object['Run Stop ID']))!==-1)registerHistoryRemoval_('Stop Pause',entry.object['Pause ID'],reason,context,now);});
  readTable_('completionEvents').forEach(function(entry){if(stopIds.indexOf(text_(entry.object['Run Stop ID']))!==-1)registerHistoryRemoval_('Completion Event',entry.object['Completion Event ID'],reason,context,now);});
  readTable_('dailyParticipants').forEach(function(entry){if(text_(entry.object['Run ID'])===text_(runId))registerHistoryRemoval_('Daily Participant',entry.object['Participant ID'],reason,context,now);});
  readTable_('runPauses').forEach(function(entry){if(text_(entry.object['Run ID'])===text_(runId))registerHistoryRemoval_('Run Pause',entry.object['Run Pause ID'],reason,context,now);});
  const legs=readTable_('travelLegs').filter(function(entry){return text_(entry.object['Run ID'])===text_(runId);}),legIds=legs.map(function(entry){return text_(entry.object['Travel Leg ID']);});
  legs.forEach(function(entry){registerHistoryRemoval_('Travel Leg',entry.object['Travel Leg ID'],reason,context,now);});
  readTable_('travelDelays').forEach(function(entry){if(legIds.indexOf(text_(entry.object['Travel Leg ID']))!==-1)registerHistoryRemoval_('Travel Delay',entry.object['Delay ID'],reason,context,now);});
  [['runIssues','Run Issue'],['propertyIssues','Property Issue'],['machineIssues','Machine Issue']].forEach(function(spec){readTable_(spec[0]).forEach(function(entry){if(text_(entry.object['Run ID'])===text_(runId))registerHistoryRemoval_(spec[1],entry.object['Issue ID'],reason,context,now);});});
  const removed=removalIndex_();serviceIds.forEach(function(serviceId){const participants=readTable_('dailyParticipants').filter(function(entry){return text_(entry.object['Daily Service ID'])===serviceId;}),hasVisibleOther=participants.some(function(entry){return text_(entry.object['Run ID'])!==text_(runId)&&!isRemoved_(removed,'Route Run',entry.object['Run ID'])&&!isRemoved_(removed,'Daily Participant',entry.object['Participant ID']);});if(!hasVisibleOther)registerHistoryRemoval_('Daily Service',serviceId,reason,context,now);else recalculateDailyService_(serviceId);});
  serviceIds.forEach(function(serviceId){const service=findObject_('dailyServices','Daily Service ID',serviceId);if(service){const stopId=text_(service.object['Stop ID']);[1,2,3,4].forEach(function(crew){updateStopAverage_(stopId,crew);});}});
  return Math.max(0,historyRemovals_().length-before-1);
}

function cascadeRunStopRemoval_(runStopId,reason,context,now){
  const before=historyRemovals_().length,runStop=requiredObject_('runStops','Run Stop ID',runStopId,'RUN_STOP_NOT_FOUND'),serviceId=text_(runStop.object['Daily Service ID']);
  registerHistoryRemoval_('Run Stop',runStopId,reason,context,now);
  readTable_('workSegments').forEach(function(entry){if(text_(entry.object['Run Stop ID'])===text_(runStopId))registerHistoryRemoval_('Work Segment',entry.object['Segment ID'],reason,context,now);});
  readTable_('stopPauses').forEach(function(entry){if(text_(entry.object['Run Stop ID'])===text_(runStopId))registerHistoryRemoval_('Stop Pause',entry.object['Pause ID'],reason,context,now);});
  readTable_('completionEvents').forEach(function(entry){if(text_(entry.object['Run Stop ID'])===text_(runStopId))registerHistoryRemoval_('Completion Event',entry.object['Completion Event ID'],reason,context,now);});
  const participant=participantForRunStop_(runStopId);if(participant)registerHistoryRemoval_('Daily Participant',participant.object['Participant ID'],reason,context,now);
  if(serviceId){
    const removed=removalIndex_(),hasVisibleParticipant=readTable_('dailyParticipants').some(function(entry){return text_(entry.object['Daily Service ID'])===serviceId&&!isRemoved_(removed,'Daily Participant',entry.object['Participant ID'])&&!isRemoved_(removed,'Route Run',entry.object['Run ID']);});
    if(!hasVisibleParticipant)registerHistoryRemoval_('Daily Service',serviceId,reason,context,now);else recalculateDailyService_(serviceId);
    const service=findObject_('dailyServices','Daily Service ID',serviceId);if(service){const stopId=text_(service.object['Stop ID']);[1,2,3,4].forEach(function(crew){updateStopAverage_(stopId,crew);});}
  }
  return Math.max(0,historyRemovals_().length-before-1);
}

function cascadeDailyServiceRemoval_(dailyServiceId,reason,context,now){
  const before=historyRemovals_().length,service=requiredObject_('dailyServices','Daily Service ID',dailyServiceId,'DAILY_SERVICE_NOT_FOUND');
  registerHistoryRemoval_('Daily Service',dailyServiceId,reason,context,now);
  readTable_('runStops').forEach(function(entry){if(text_(entry.object['Daily Service ID'])===text_(dailyServiceId))registerHistoryRemoval_('Run Stop',entry.object['Run Stop ID'],reason,context,now);});
  readTable_('workSegments').forEach(function(entry){if(text_(entry.object['Daily Service ID'])===text_(dailyServiceId))registerHistoryRemoval_('Work Segment',entry.object['Segment ID'],reason,context,now);});
  readTable_('stopPauses').forEach(function(entry){if(text_(entry.object['Daily Service ID'])===text_(dailyServiceId))registerHistoryRemoval_('Stop Pause',entry.object['Pause ID'],reason,context,now);});
  readTable_('completionEvents').forEach(function(entry){if(text_(entry.object['Daily Service ID'])===text_(dailyServiceId))registerHistoryRemoval_('Completion Event',entry.object['Completion Event ID'],reason,context,now);});
  readTable_('dailyParticipants').forEach(function(entry){if(text_(entry.object['Daily Service ID'])===text_(dailyServiceId))registerHistoryRemoval_('Daily Participant',entry.object['Participant ID'],reason,context,now);});
  const stopId=text_(service.object['Stop ID']);[1,2,3,4].forEach(function(crew){updateStopAverage_(stopId,crew);});
  return Math.max(0,historyRemovals_().length-before-1);
}

function participantForRunStop_(runStopId){return readTable_('dailyParticipants').find(function(entry){return text_(entry.object['Run Stop ID'])===text_(runStopId);})||null;}
function currentDailyCrew_(dailyServiceId){return readTable_('dailyParticipants').filter(function(entry){return text_(entry.object['Daily Service ID'])===text_(dailyServiceId)&&text_(entry.object.Status)==='Joined';}).reduce(function(sum,entry){return sum+number_(entry.object['Crew Count'],0);},0);}
function joinDailyService_(service,stop,context,now,reason,startWork){const participant=participantForRunStop_(stop.object['Run Stop ID']);if(!participant)fail_('PARTICIPANT_NOT_FOUND','This route is not attached to the shared Stop.');if(text_(participant.object.Status)==='Joined')return;const wasActive=text_(service.object.Status)==='Active';if(wasActive)closeDailyWorkSegment_(service.object['Daily Service ID'],'Crew joined',reason,now);updateObjectRow_('dailyParticipants',participant.rowNumber,{Status:'Joined','Joined At':participant.object['Joined At']||now,'Left At':'','Updated At':now});const crew=currentDailyCrew_(service.object['Daily Service ID']),beginWork=wasActive||startWork;if(beginWork)openDailyWorkSegment_(service.object['Daily Service ID'],stop.object['Run Stop ID'],crew,context,now,reason);updateObjectRow_('dailyServices',service.rowNumber,{Status:beginWork?'Active':text_(service.object.Status),'Current Crew Count':crew,'First Work Started At':beginWork?(service.object['First Work Started At']||now):service.object['First Work Started At'],'Updated At':now});propagateDailyService_(service.object['Daily Service ID']);}
function leaveDailyService_(service,stop,context,now,reason){const participant=participantForRunStop_(stop.object['Run Stop ID']);if(!participant||text_(participant.object.Status)!=='Joined')return;const wasActive=text_(service.object.Status)==='Active';if(wasActive)closeDailyWorkSegment_(service.object['Daily Service ID'],'Crew left',reason,now);updateObjectRow_('dailyParticipants',participant.rowNumber,{Status:'Left','Left At':now,'Updated At':now});const crew=currentDailyCrew_(service.object['Daily Service ID']);if(wasActive&&crew)openDailyWorkSegment_(service.object['Daily Service ID'],stop.object['Run Stop ID'],crew,context,now,reason);updateObjectRow_('dailyServices',service.rowNumber,{Status:crew?(wasActive?'Active':text_(service.object.Status)):'Paused','Current Crew Count':crew,'Updated At':now});propagateDailyService_(service.object['Daily Service ID']);}
function openDailyWorkSegment_(dailyServiceId,runStopId,crew,context,now,reason){if(!crew)fail_('CREW_REQUIRED','At least one crew must be joined.');const open=readTable_('workSegments').some(function(entry){return text_(entry.object['Daily Service ID'])===text_(dailyServiceId)&&!entry.object['Ended At'];});if(open)fail_('WORK_ALREADY_ACTIVE','Work is already active.');appendObject_('workSegments',{'Segment ID':id_('SEG'),'Run Stop ID':runStopId,'Started At':now,'Ended At':'','Work Minutes':'','End Reason':'','Reason / Notes':text_(reason),'Created By User ID':context.user['User ID'],'Updated At':now,'Daily Service ID':dailyServiceId,'Crew Count':crew});}
function closeDailyWorkSegment_(dailyServiceId,endReason,reason,now){const open=readTable_('workSegments').filter(function(entry){return text_(entry.object['Daily Service ID'])===text_(dailyServiceId)&&!entry.object['Ended At'];}).pop();if(!open)return;updateObjectRow_('workSegments',open.rowNumber,{'Ended At':now,'Work Minutes':minutesBetween_(parseDate_(open.object['Started At']),now),'End Reason':endReason,'Reason / Notes':text_(reason)||open.object['Reason / Notes'],'Updated At':now});}
function closeDailyPause_(dailyServiceId,now){const open=readTable_('stopPauses').filter(function(entry){return text_(entry.object['Daily Service ID'])===text_(dailyServiceId)&&!entry.object['Ended At'];}).pop();if(!open)return;updateObjectRow_('stopPauses',open.rowNumber,{'Ended At':now,'Excluded Minutes':minutesBetween_(parseDate_(open.object['Started At']),now),'Updated At':now});}
function recalculateDailyService_(dailyServiceId){const service=requiredObject_('dailyServices','Daily Service ID',dailyServiceId,'DAILY_SERVICE_NOT_FOUND'),removed=removalIndex_(),work=readTable_('workSegments').filter(function(entry){return text_(entry.object['Daily Service ID'])===text_(dailyServiceId)&&!isRemoved_(removed,'Work Segment',entry.object['Segment ID']);}).reduce(function(sum,entry){return sum+number_(entry.object['Work Minutes'],0);},0),pauses=readTable_('stopPauses').filter(function(entry){return text_(entry.object['Daily Service ID'])===text_(dailyServiceId)&&!isRemoved_(removed,'Stop Pause',entry.object['Pause ID']);}).reduce(function(sum,entry){return sum+number_(entry.object['Excluded Minutes'],0);},0);updateObjectRow_('dailyServices',service.rowNumber,{'Active Work Minutes':work,'Excluded Pause Minutes':pauses,'Updated At':new Date()});propagateDailyService_(dailyServiceId);}
function propagateDailyService_(dailyServiceId){const service=requiredObject_('dailyServices','Daily Service ID',dailyServiceId,'DAILY_SERVICE_NOT_FOUND').object;readTable_('runStops').forEach(function(entry){if(text_(entry.object['Daily Service ID'])!==text_(dailyServiceId)||isTerminalRunStopDisposition_(entry.object.Status))return;if(text_(entry.object.Status)==='Completed'&&text_(service.Status)!=='Completed')return;updateObjectRow_('runStops',entry.rowNumber,{Status:service.Status,'Arrived At':service['Arrived At'],'First Work Started At':service['First Work Started At'],'Completed At':service['Completed At'],'Departed At':service['Departed At'],'Active Work Minutes':service['Active Work Minutes'],'Excluded Pause Minutes':service['Excluded Pause Minutes'],'Updated At':new Date()});});}
function updateStopAverageForDailyService_(dailyServiceId,stopId){const removed=removalIndex_(),service=requiredObject_('dailyServices','Daily Service ID',dailyServiceId,'DAILY_SERVICE_NOT_FOUND');if(text_(service.object.Status)!=='Completed'||isRemoved_(removed,'Daily Service',dailyServiceId))return;const segments=readTable_('workSegments').filter(function(entry){return text_(entry.object['Daily Service ID'])===text_(dailyServiceId)&&entry.object['Ended At'];}),crews=uniqueStrings_(segments.map(function(entry){return text_(entry.object['Crew Count']);}));if(crews.length!==1)return;updateStopAverage_(stopId,number_(crews[0],1));}
function nextActualOrder_(runId){return readTable_('runStops').filter(function(e){return text_(e.object['Run ID'])===text_(runId);}).reduce(function(max,e){return Math.max(max,number_(e.object['Actual Order'],0));},0)+1;}

// ---------- Travel and issues ----------

function beginTravelLeg_(runId,fromRunStopId,departedAt){const open=readTable_('travelLegs').some(function(entry){return text_(entry.object['Run ID'])===text_(runId)&&!entry.object['Arrived At'];});if(open)return;appendObject_('travelLegs',{'Travel Leg ID':id_('LEG'),'Run ID':runId,'From Run Stop ID':fromRunStopId,'To Run Stop ID':'','Departed At':departedAt,'Arrived At':'','Raw Travel Minutes':'','Excluded Delay Minutes':0,'Adjusted Travel Minutes':'',Notes:'','Updated At':new Date()});}
function finishTravelLeg_(runId,toRunStopId,arrivedAt){let leg=readTable_('travelLegs').filter(function(entry){return text_(entry.object['Run ID'])===text_(runId)&&!entry.object['Arrived At'];}).pop();if(!leg){const stops=readTable_('runStops').filter(function(e){return text_(e.object['Run ID'])===text_(runId)&&e.object['Departed At'];}).sort(function(a,b){return parseDate_(b.object['Departed At'])-parseDate_(a.object['Departed At']);});if(!stops.length)return;const from=stops[0],departed=parseDate_(from.object['Departed At']);leg=appendObject_('travelLegs',{'Travel Leg ID':id_('LEG'),'Run ID':runId,'From Run Stop ID':from.object['Run Stop ID'],'To Run Stop ID':toRunStopId,'Departed At':departed,'Arrived At':arrivedAt,'Raw Travel Minutes':minutesBetween_(departed,arrivedAt),'Excluded Delay Minutes':0,'Adjusted Travel Minutes':minutesBetween_(departed,arrivedAt),Notes:'','Updated At':new Date()});return;}const raw=minutesBetween_(parseDate_(leg.object['Departed At']),arrivedAt);updateObjectRow_('travelLegs',leg.rowNumber,{'To Run Stop ID':toRunStopId,'Arrived At':arrivedAt,'Raw Travel Minutes':raw,'Updated At':new Date()});recalculateTravelLeg_(leg.object['Travel Leg ID']);}
function mutateTravelDelay_(action,payload,context){let delay;if(action==='addTravelDelay'){const legs=readTable_('travelLegs').filter(function(e){return text_(e.object['Run ID'])===text_(payload.runId);});if(!legs.length)fail_('TRAVEL_LEG_NOT_FOUND','No travel leg is available for this delay.');const leg=legs[legs.length-1],minutes=Math.max(0,number_(payload.minutes,0)),now=parseDate_(payload.at)||new Date();delay=appendObject_('travelDelays',{'Delay ID':id_('DLY'),'Travel Leg ID':leg.object['Travel Leg ID'],'Started At':now,'Ended At':now,'Excluded Minutes':minutes,Reason:text_(payload.reason),'Created By User ID':context.user['User ID'],'Updated At':now});recalculateTravelLeg_(leg.object['Travel Leg ID']);}else{requireAdmin_(context);delay=requiredObject_('travelDelays','Delay ID',payload.delayId,'TRAVEL_DELAY_NOT_FOUND');updateObjectRow_('travelDelays',delay.rowNumber,{'Excluded Minutes':Math.max(0,number_(payload.minutes,0)),Reason:text_(payload.reason),'Updated At':new Date()});recalculateTravelLeg_(delay.object['Travel Leg ID']);}return{state:bootstrapData_(context)};}
function logRunInterruption_(payload,context){requiredRun_(payload.runId,context);const now=parseDate_(payload.at)||new Date(),minutes=Math.max(0,number_(payload.minutes,0)),reason=text_(payload.reason),runStopIds=readTable_('runStops').filter(function(entry){return text_(entry.object['Run ID'])===text_(payload.runId);}).map(function(entry){return text_(entry.object['Run Stop ID']);}),activeWork=readTable_('workSegments').some(function(entry){return runStopIds.indexOf(text_(entry.object['Run Stop ID']))!==-1&&!entry.object['Ended At'];});if(activeWork)fail_('STOP_PAUSE_REQUIRED','Pause the active Stop instead so property work time remains accurate.');const openLeg=readTable_('travelLegs').filter(function(entry){return text_(entry.object['Run ID'])===text_(payload.runId)&&!entry.object['Arrived At'];}).pop();if(openLeg){const started=new Date(now.getTime()-minutes*60000);appendObject_('travelDelays',{'Delay ID':id_('DLY'),'Travel Leg ID':openLeg.object['Travel Leg ID'],'Started At':started,'Ended At':now,'Excluded Minutes':minutes,Reason:reason,'Created By User ID':context.user['User ID'],'Updated At':now});recalculateTravelLeg_(openLeg.object['Travel Leg ID']);audit_(context,'Travel Leg',openLeg.object['Travel Leg ID'],'Log travel interruption','',minutes+' minutes',reason,'Operations');return{interruptionType:'Travel Delay',state:bootstrapData_(context)};}appendObject_('runPauses',{'Run Pause ID':id_('RPA'),'Run ID':payload.runId,Phase:'Other Route Downtime','Started At':new Date(now.getTime()-minutes*60000),'Ended At':now,'Excluded Minutes':minutes,Reason:reason,'Created By User ID':context.user['User ID'],'Updated At':now});audit_(context,'Route Run',payload.runId,'Log route downtime','',minutes+' minutes',reason,'Operations');return{interruptionType:'Other Route Downtime',state:bootstrapData_(context)};}
function recalculateTravelLeg_(legId){const leg=requiredObject_('travelLegs','Travel Leg ID',legId,'TRAVEL_LEG_NOT_FOUND'),removed=removalIndex_(),excluded=readTable_('travelDelays').filter(function(e){return text_(e.object['Travel Leg ID'])===text_(legId)&&!isRemoved_(removed,'Travel Delay',e.object['Delay ID']);}).reduce(function(s,e){return s+number_(e.object['Excluded Minutes'],0);},0),arrived=parseDate_(leg.object['Arrived At']),departed=parseDate_(leg.object['Departed At']),raw=arrived&&departed?minutesBetween_(departed,arrived):'';updateObjectRow_('travelLegs',leg.rowNumber,{'Raw Travel Minutes':raw,'Excluded Delay Minutes':excluded,'Adjusted Travel Minutes':raw===''?'':Math.max(0,raw-excluded),'Updated At':new Date()});}

function mutateRunIssue_(action,payload,context){if(action==='reportRunIssue'){requireRouteLeader_(context);appendObject_('runIssues',{'Issue ID':id_('RISS'),'Run ID':text_(payload.runId),'Run Stop ID':text_(payload.runStopId),Severity:text_(payload.severity), 'Issue Type':text_(payload.issueType),Description:text_(payload.description),'Started At':parseDate_(payload.at)||new Date(),'Resolved At':'',Status:'Open',Resolution:'','Created By User ID':context.user['User ID'],'Updated At':new Date()});}else{requireAdmin_(context);const e=requiredObject_('runIssues','Issue ID',payload.issueId,'ISSUE_NOT_FOUND'),resolution=text_(payload.notes||payload.outcome);updateObjectRow_('runIssues',e.rowNumber,{Status:'Resolved',Resolution:resolution,'Resolved At':parseDate_(payload.at)||new Date(),'Updated At':new Date()});audit_(context,'Run Issue',payload.issueId,'Resolve issue','Open','Resolved',resolution,'Operations');}return{state:bootstrapData_(context)};}
function mutatePropertyIssue_(action,payload,context){if(action==='reportPropertyIssue'){requireRouteLeader_(context);requiredObject_('properties','Property ID',payload.propertyId,'PROPERTY_NOT_FOUND');appendObject_('propertyIssues',{'Issue ID':id_('PISS'),'Property ID':payload.propertyId,'Run ID':text_(payload.runId),'Run Stop ID':text_(payload.runStopId),'Reported At':parseDate_(payload.at)||new Date(),Severity:text_(payload.severity),'Issue Type':text_(payload.issueType),Description:text_(payload.description),Status:'Open','Resolution Outcome':'','Resolution Notes':'','Resolved At':'','Resolved By User ID':'','Attachment URLs':text_(payload.attachmentUrls),'Created By User ID':context.user['User ID'],'Updated At':new Date()});}else{requireAdmin_(context);const e=requiredObject_('propertyIssues','Issue ID',payload.issueId,'ISSUE_NOT_FOUND');updateObjectRow_('propertyIssues',e.rowNumber,{Status:'Resolved','Resolution Outcome':text_(payload.outcome),'Resolution Notes':text_(payload.notes),'Resolved At':parseDate_(payload.at)||new Date(),'Resolved By User ID':context.user['User ID'],'Updated At':new Date()});audit_(context,'Property Issue',payload.issueId,'Resolve issue','Open','Resolved',text_(payload.notes),'Operations');}return{state:bootstrapData_(context)};}
function mutateMachineIssue_(action,payload,context){if(action==='reportMachineIssue'){requireRouteLeader_(context);const machine=requiredObject_('machines','Machine ID',payload.machineId,'MACHINE_NOT_FOUND');appendObject_('machineIssues',{'Issue ID':id_('MISS'),'Machine ID':payload.machineId,'Run ID':text_(payload.runId),'Run Stop ID':text_(payload.runStopId),'Reported At':parseDate_(payload.at)||new Date(),Severity:text_(payload.severity),Description:text_(payload.description),Status:'Open','Resolution Outcome':'','Resolution Notes':'','Resolved At':'','Resolved By User ID':'','Maintenance Record ID':'','Attachment URLs':text_(payload.attachmentUrls),'Created By User ID':context.user['User ID'],'Updated At':new Date()});updateObjectRow_('machines',machine.rowNumber,{Status:text_(payload.severity),'Updated At':new Date()});}else{requireAdmin_(context);const e=requiredObject_('machineIssues','Issue ID',payload.issueId,'ISSUE_NOT_FOUND');updateObjectRow_('machineIssues',e.rowNumber,{Status:'Resolved','Resolution Outcome':text_(payload.outcome),'Resolution Notes':text_(payload.notes),'Resolved At':parseDate_(payload.at)||new Date(),'Resolved By User ID':context.user['User ID'],'Updated At':new Date()});const machine=requiredObject_('machines','Machine ID',e.object['Machine ID'],'MACHINE_NOT_FOUND');const open=readObjects_('machineIssues').filter(i=>text_(i['Machine ID'])===text_(e.object['Machine ID'])&&text_(i.Status)==='Open'&&text_(i['Issue ID'])!==text_(payload.issueId));const priority={'Down':4,'Critical Issue':3,'Issue':2,'Warning':1};const status=open.reduce((current,item)=>(priority[text_(item.Severity)]||1)>(priority[current]||0)?text_(item.Severity):current,'Available');updateObjectRow_('machines',machine.rowNumber,{Status:status,'Updated At':new Date()});audit_(context,'Machine Issue',payload.issueId,'Resolve issue','Open','Resolved',text_(payload.notes),'Operations');}return{state:bootstrapData_(context)};}

// ---------- Calculations ----------

function baselineMinutes_(propertyCount,crew,settings){crew=Math.max(1,number_(crew,1));const key='Baseline Minutes Per Property - '+crew+' Person'+(crew===1?'':'s');const fallback=60/crew;return propertyCount*number_(settings[key],fallback);}
function historicalAverage_(stopId,crew){const row=readTable_('stopAverages').find(function(e){return text_(e.object['Stop ID'])===text_(stopId)&&number_(e.object['Crew Count'],0)===crew;});return row?number_(row.object['Average Work Minutes'],0):null;}
function updateStopAverage_(stopId,crew){const removed=removalIndex_(),segments=readTable_('workSegments').filter(function(entry){return !isRemoved_(removed,'Work Segment',entry.object['Segment ID']);}),serviceIds=readTable_('dailyServices').filter(function(e){const id=text_(e.object['Daily Service ID']);return text_(e.object['Stop ID'])===text_(stopId)&&text_(e.object.Status)==='Completed'&&!isRemoved_(removed,'Daily Service',id);}).map(function(e){return text_(e.object['Daily Service ID']);}),samples=[];serviceIds.forEach(function(id){const own=segments.filter(function(e){return text_(e.object['Daily Service ID'])===id&&e.object['Ended At'];}),crews=uniqueStrings_(own.map(function(e){return text_(e.object['Crew Count']);}));if(crews.length===1&&number_(crews[0],0)===crew)samples.push(own.reduce(function(sum,e){return sum+number_(e.object['Work Minutes'],0);},0));});const total=samples.reduce(function(sum,value){return sum+value;},0),average=samples.length?total/samples.length:0,existing=readTable_('stopAverages').find(function(e){return text_(e.object['Stop ID'])===text_(stopId)&&number_(e.object['Crew Count'],0)===crew;}),values={'Stop ID':stopId,'Crew Count':crew,'Sample Count':samples.length,'Average Work Minutes':average,'Last Calculated At':new Date()};if(existing)updateObjectRow_('stopAverages',existing.rowNumber,values);else appendObject_('stopAverages',values);}

// For mixed-crew services, expected time is weighted by the share of actual
// segment minutes worked at each crew count. Raw segment data remains intact.
function recapForRun_(runId){
  const run=requiredObject_('routeRuns','Run ID',runId,'RUN_NOT_FOUND').object,removed=removalIndex_(),allStops=readTable_('runStops').filter(function(e){return text_(e.object['Run ID'])===text_(runId);}),runStops=allStops.filter(function(e){const id=text_(e.object['Run Stop ID']),status=text_(e.object.Status);return !isRemoved_(removed,'Run Stop',id)&&['Voided','Not Serviced — Route Aborted'].indexOf(status)===-1;}),serviceIds=uniqueStrings_(runStops.map(function(e){return text_(e.object['Daily Service ID']);})),services=readTable_('dailyServices').filter(function(e){const id=text_(e.object['Daily Service ID']);return serviceIds.indexOf(id)!==-1&&!isRemoved_(removed,'Daily Service',id);}),segments=readTable_('workSegments').filter(function(e){return !isRemoved_(removed,'Work Segment',e.object['Segment ID']);}),settings=settings_();let properties=0,completedStops=0,active=0,expected=0;
  services.forEach(function(service){const id=text_(service.object['Daily Service ID']),related=runStops.filter(function(e){return text_(e.object['Daily Service ID'])===id;}),runStop=related[0],completed=related.some(function(e){return text_(e.object.Status)==='Completed';}),count=number_(runStop&&runStop.object['Property Count Snapshot'],0),own=segments.filter(function(e){return text_(e.object['Daily Service ID'])===id&&e.object['Ended At'];}),minutes=own.reduce(function(sum,e){return sum+number_(e.object['Work Minutes'],0);},0);if(completed){properties+=count;completedStops+=1;}active+=minutes;if(minutes){expected+=own.reduce(function(sum,e){return sum+(number_(e.object['Work Minutes'],0)/minutes)*baselineMinutes_(count,Math.max(1,number_(e.object['Crew Count'],1)),settings);},0);}else if(completed)expected+=number_(runStop&&runStop.object['Baseline Estimate Minutes'],0);});
  const legs=readTable_('travelLegs').filter(function(e){return text_(e.object['Run ID'])===text_(runId)&&!isRemoved_(removed,'Travel Leg',e.object['Travel Leg ID']);}),raw=legs.reduce(function(sum,e){return sum+number_(e.object['Raw Travel Minutes'],0);},0),adjusted=legs.reduce(function(sum,e){return sum+number_(e.object['Adjusted Travel Minutes'],0);},0),delays=legs.reduce(function(sum,e){return sum+number_(e.object['Excluded Delay Minutes'],0);},0),start=parseDate_(run['Started At']),end=parseDate_(run['Ended At']),duration=minutesBetween_(start,end),pauses=services.reduce(function(sum,e){return sum+number_(e.object['Excluded Pause Minutes'],0);},0),otherDowntime=readTable_('runPauses').filter(function(e){return text_(e.object['Run ID'])===text_(runId)&&!isRemoved_(removed,'Run Pause',e.object['Run Pause ID']);}).reduce(function(sum,e){return sum+number_(e.object['Excluded Minutes'],0);},0);
  return{runId:runId,date:dateOnly_(run['Run Date']),routeName:text_(run['Route Name Snapshot']),truck:String(run.Truck||''),startTime:iso_(start),finishTime:iso_(end),propertiesCompleted:properties,stopsCompleted:completedStops,activeWorkMinutes:active,rawTravelMinutes:raw,adjustedTravelMinutes:adjusted,delayMinutes:delays,pausedMinutes:pauses,otherDowntimeMinutes:otherDowntime,totalRouteMinutes:duration,expectedBaselineMinutes:Math.round(expected),historicalExpectedMinutes:Math.round(runStops.reduce(function(sum,entry){return sum+number_(entry.object['Historical Average Minutes'],number_(entry.object['Baseline Estimate Minutes'],0));},0)),propertyWorkEfficiency:active?Math.round(expected/active*100):null,wholeDayEfficiency:duration?Math.round(expected/duration*100):null};
}

function historyRemovalActions_(){
  const removals=historyRemovals_(),users=users_(),groups={},runs=readTable_('routeRuns'),runStops=readTable_('runStops'),services=readTable_('dailyServices'),stops=readTable_('stops'),propertyIssues=readTable_('propertyIssues'),machineIssues=readTable_('machineIssues'),runIssues=readTable_('runIssues');
  removals.forEach(function(item){const key=[item.removedAt,item.removedByUserId,item.reason].join('|');if(!groups[key])groups[key]=[];groups[key].push(item);});
  function raw(table,header,id){const found=table.find(function(entry){return text_(entry.object[header])===text_(id);});return found?found.object:null;}
  return Object.keys(groups).map(function(key){
    const records=groups[key],root=records[0],user=users.find(function(item){return item.id===root.removedByUserId;}),run= root.entityType==='Route Run'?raw(runs,'Run ID',root.entityId):null,runStop=root.entityType==='Run Stop'?raw(runStops,'Run Stop ID',root.entityId):null,service=root.entityType==='Daily Service'?raw(services,'Daily Service ID',root.entityId):null;
    let title=root.entityType,subtitle='',actionLabel=root.entityType+' removed from History';
    if(run){const leader=users.find(function(item){return item.id===text_(run['Route Leader User ID']);});title=text_(run['Route Name Snapshot'])||'Untitled Route';subtitle=[dateOnly_(run['Run Date']),leader?leader.name:'',String(run.Truck||'')?'Truck/category '+String(run.Truck):''].filter(Boolean).join(' · ');actionLabel='Route Run removed from History';}
    else if(runStop){const parent=raw(runs,'Run ID',runStop['Run ID']);title=text_(runStop['Stop Name Snapshot'])||'Stop visit';subtitle=[parent?dateOnly_(parent['Run Date']):'',parent?text_(parent['Route Name Snapshot']):''].filter(Boolean).join(' · ');actionLabel='Removed Stop Visit';}
    else if(service){const stop=raw(stops,'Stop ID',service['Stop ID']);title=stop?text_(stop['Stop Name']):'Stop service';subtitle=dateOnly_(service['Service Date']);actionLabel='Removed Stop Service';}
    else if(root.entityType==='Property Issue'){const issue=raw(propertyIssues,'Issue ID',root.entityId);title=issue?(text_(issue['Issue Type'])||text_(issue.Description)||'Property issue'):'Property issue';subtitle=issue?dateOnly_(issue['Reported At']):'';actionLabel='Property issue removed from History';}
    else if(root.entityType==='Machine Issue'){const issue=raw(machineIssues,'Issue ID',root.entityId);title=issue?(text_(issue.Description)||text_(issue['Machine ID'])||'Equipment issue'):'Equipment issue';subtitle=issue?dateOnly_(issue['Reported At']):'';actionLabel='Equipment issue removed from History';}
    else if(root.entityType==='Run Issue'){const issue=raw(runIssues,'Issue ID',root.entityId);title=issue?(text_(issue['Issue Type'])||text_(issue.Description)||'Route issue'):'Route issue';subtitle=issue?dateOnly_(issue['Started At']):'';actionLabel='Route issue removed from History';}
    return{id:root.id,entityType:root.entityType,entityId:root.entityId,title:title,subtitle:subtitle,actionLabel:actionLabel,reason:root.reason,removedAt:root.removedAt,removedByUserId:root.removedByUserId,removedByName:user?user.name:'Unknown administrator',relatedCount:Math.max(0,records.length-1),affectedRecords:records.map(function(item){return{entityType:item.entityType,entityId:item.entityId};})};
  }).sort(function(a,b){return text_(b.removedAt).localeCompare(text_(a.removedAt));});
}

function historyData_(payload,context){
  requireAdmin_(context);
  const from=parseDate_(payload.from),to=parseDate_(payload.to),users=users_(),properties=properties_(),removed=removalIndex_(),stops=stops_();
  const runs=readTable_('routeRuns').filter(function(entry){const date=parseDate_(entry.object['Run Date']),id=text_(entry.object['Run ID']);return !isRemoved_(removed,'Route Run',id)&&(!from||date>=from)&&(!to||date<=new Date(to.getTime()+86399999));}).slice(-250).map(function(entry){
    const r=entry.object,id=text_(r['Run ID']),leader=users.find(function(user){return user.id===text_(r['Route Leader User ID']);});
    return{id:id,date:dateOnly_(r['Run Date']),routeId:text_(r['Route ID']),routeName:text_(r['Route Name Snapshot']),routeVersion:number_(r['Route Version'],0),leaderId:text_(r['Route Leader User ID']),leaderName:leader?leader.name:'',truck:String(r.Truck||''),status:text_(r.Status),startingCrewCount:number_(r['Starting Crew Count'],1),startedAt:iso_(r['Started At']),endedAt:iso_(r['Ended At']),baselineEstimateMinutes:number_(r['Baseline Estimate Minutes'],0),historicalEstimateMinutes:number_(r['Historical Estimate Minutes'],0),notes:text_(r.Notes),recap:['Completed','Aborted'].indexOf(text_(r.Status))!==-1?recapForRun_(id):null};
  });
  const runIds=runs.map(function(run){return run.id;});
  const runStops=readTable_('runStops').filter(function(entry){const id=text_(entry.object['Run Stop ID']);return runIds.indexOf(text_(entry.object['Run ID']))!==-1&&!isRemoved_(removed,'Run Stop',id)&&text_(entry.object.Status)!=='Voided';}).map(runStopObject_);
  const runStopIds=runStops.map(function(stop){return stop.id;}),serviceIds=uniqueStrings_(runStops.map(function(stop){return stop.dailyServiceId;}));
  const services=readTable_('dailyServices').filter(function(entry){const id=text_(entry.object['Daily Service ID']);return serviceIds.indexOf(id)!==-1&&!isRemoved_(removed,'Daily Service',id)&&text_(entry.object.Status)!=='Voided';}).map(dailyServiceObject_),visibleServiceIds=services.map(function(service){return service.id;});
  const segments=readTable_('workSegments').filter(function(entry){return visibleServiceIds.indexOf(text_(entry.object['Daily Service ID']))!==-1&&!isRemoved_(removed,'Work Segment',entry.object['Segment ID']);}).map(function(entry){const r=entry.object;return{id:text_(r['Segment ID']),dailyServiceId:text_(r['Daily Service ID']),runStopId:text_(r['Run Stop ID']),startedAt:iso_(r['Started At']),endedAt:iso_(r['Ended At']),minutes:number_(r['Work Minutes'],0),crewCount:number_(r['Crew Count'],0),endReason:text_(r['End Reason']),reason:text_(r['Reason / Notes'])};});
  const participants=readTable_('dailyParticipants').filter(function(entry){return visibleServiceIds.indexOf(text_(entry.object['Daily Service ID']))!==-1&&!isRemoved_(removed,'Daily Participant',entry.object['Participant ID']);}).map(function(entry){const r=entry.object;return{id:text_(r['Participant ID']),dailyServiceId:text_(r['Daily Service ID']),runId:text_(r['Run ID']),runStopId:text_(r['Run Stop ID']),crewCount:number_(r['Crew Count'],0),status:text_(r.Status),joinedAt:iso_(r['Joined At']),leftAt:iso_(r['Left At'])};});
  const pauses=readTable_('stopPauses').filter(function(entry){return !isRemoved_(removed,'Stop Pause',entry.object['Pause ID'])&&(visibleServiceIds.indexOf(text_(entry.object['Daily Service ID']))!==-1||runStopIds.indexOf(text_(entry.object['Run Stop ID']))!==-1);}).map(function(entry){const r=entry.object;return{id:text_(r['Pause ID']),dailyServiceId:text_(r['Daily Service ID']),runStopId:text_(r['Run Stop ID']),type:text_(r['Pause Type']),startedAt:iso_(r['Started At']),endedAt:iso_(r['Ended At']),minutes:number_(r['Excluded Minutes'],0),reason:text_(r.Reason)};});
  const travelLegs=readTable_('travelLegs').filter(function(entry){return runIds.indexOf(text_(entry.object['Run ID']))!==-1&&!isRemoved_(removed,'Travel Leg',entry.object['Travel Leg ID']);}).map(function(entry){const r=entry.object;return{id:text_(r['Travel Leg ID']),runId:text_(r['Run ID']),fromRunStopId:text_(r['From Run Stop ID']),toRunStopId:text_(r['To Run Stop ID']),departedAt:iso_(r['Departed At']),arrivedAt:iso_(r['Arrived At']),rawMinutes:number_(r['Raw Travel Minutes'],0),excludedDelayMinutes:number_(r['Excluded Delay Minutes'],0),adjustedMinutes:number_(r['Adjusted Travel Minutes'],0),notes:text_(r.Notes)};});
  const legIds=travelLegs.map(function(leg){return leg.id;});
  const travelDelays=readTable_('travelDelays').filter(function(entry){return legIds.indexOf(text_(entry.object['Travel Leg ID']))!==-1&&!isRemoved_(removed,'Travel Delay',entry.object['Delay ID']);}).map(function(entry){const r=entry.object;return{id:text_(r['Delay ID']),travelLegId:text_(r['Travel Leg ID']),startedAt:iso_(r['Started At']),endedAt:iso_(r['Ended At']),minutes:number_(r['Excluded Minutes'],0),reason:text_(r.Reason)};});
  const runPauses=readTable_('runPauses').filter(function(entry){return runIds.indexOf(text_(entry.object['Run ID']))!==-1&&!isRemoved_(removed,'Run Pause',entry.object['Run Pause ID']);}).map(function(entry){const r=entry.object;return{id:text_(r['Run Pause ID']),runId:text_(r['Run ID']),phase:text_(r.Phase),startedAt:iso_(r['Started At']),endedAt:iso_(r['Ended At']),minutes:number_(r['Excluded Minutes'],0),reason:text_(r.Reason)};});
  const completionEvents=readTable_('completionEvents').filter(function(entry){return visibleServiceIds.indexOf(text_(entry.object['Daily Service ID']))!==-1&&!isRemoved_(removed,'Completion Event',entry.object['Completion Event ID']);}).map(function(entry){const r=entry.object;return{id:text_(r['Completion Event ID']),dailyServiceId:text_(r['Daily Service ID']),runStopId:text_(r['Run Stop ID']),completedAt:iso_(r['Completed At']),type:text_(r['Completion Type']),reason:text_(r['Reason / Notes'])};});
  const audit=readTable_('audit').slice(-500).reverse().map(function(entry){const r=entry.object;return{id:text_(r['Audit ID']),timestamp:iso_(r.Timestamp),userId:text_(r['User ID']),entityType:text_(r['Entity Type']),entityId:text_(r['Entity ID']),action:text_(r['Field / Action']),oldValue:text_(r['Old Value']),newValue:text_(r['New Value']),reason:text_(r.Reason),source:text_(r.Source)};});
  return{runs:runs,runStops:runStops,dailyServices:services,segments:segments,participants:participants,pauses:pauses,runPauses:runPauses,completionEvents:completionEvents,travelLegs:travelLegs,travelDelays:travelDelays,properties:properties,stops:stops,propertyIssues:propertyIssues_(),machineIssues:machineIssues_(),runIssues:runIssues_(),machines:machines_(),audit:audit,removedRecords:historyRemovals_(),removalActions:historyRemovalActions_()};
}

// ---------- Sheet and security helpers ----------

function spreadsheet_(){if(!OPS_SPREADSHEET_CACHE_){const id=PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID')||OPS.DEFAULT_SPREADSHEET_ID;OPS_SPREADSHEET_CACHE_=SpreadsheetApp.openById(id);}return OPS_SPREADSHEET_CACHE_;}
function tableInfo_(key){if(OPS_TABLE_INFO_CACHE_[key])return OPS_TABLE_INFO_CACHE_[key];const spec=OPS.TABLES[key];if(!spec)throw new Error('Unknown table '+key);const sheet=spreadsheet_().getSheetByName(spec[0]);if(!sheet)throw new Error('Missing sheet: '+spec[0]);const headers=sheet.getRange(1,1,1,spec[1].length).getDisplayValues()[0];spec[1].forEach(function(expected,index){if(headers[index]!==expected)throw new Error('Unexpected header in '+spec[0]+' column '+(index+1)+'. Expected "'+expected+'" but found "'+headers[index]+'".');});OPS_TABLE_INFO_CACHE_[key]={sheet:sheet,headers:spec[1]};return OPS_TABLE_INFO_CACHE_[key];}
function readTable_(key){const info=tableInfo_(key),last=info.sheet.getLastRow();if(last<2)return[];const values=info.sheet.getRange(2,1,last-1,info.headers.length).getValues();return values.map(function(row,index){const object={};info.headers.forEach(function(header,i){object[header]=row[i];});return{object:object,rowNumber:index+2};});}
function appendObject_(key,object){const info=tableInfo_(key);const row=info.headers.map(function(header){return Object.prototype.hasOwnProperty.call(object,header)?object[header]:'';});info.sheet.appendRow(row);return{object:object,rowNumber:info.sheet.getLastRow()};}
function updateObjectRow_(key,rowNumber,changes){const info=tableInfo_(key),range=info.sheet.getRange(rowNumber,1,1,info.headers.length),values=range.getValues()[0];Object.keys(changes).forEach(function(header){const index=info.headers.indexOf(header);if(index===-1)throw new Error('Unknown '+key+' column: '+header);values[index]=changes[header];});range.setValues([values]);}
function findObject_(key,header,value){return readTable_(key).find(function(entry){return text_(entry.object[header])===text_(value);})||null;}
function requiredObject_(key,header,value,code){const found=findObject_(key,header,value);if(!found)fail_(code||'NOT_FOUND','Requested record was not found.');return found;}
function deleteRowsByValue_(key,header,value){const info=tableInfo_(key);const rows=readTable_(key).filter(function(e){return text_(e.object[header])===text_(value);}).map(function(e){return e.rowNumber;}).sort(function(a,b){return b-a;});rows.forEach(function(row){info.sheet.deleteRow(row);});}
function requiredRun_(runId,context){const run=requiredObject_('routeRuns','Run ID',runId,'RUN_NOT_FOUND');if(!bool_(context.user.Admin)&&text_(run.object['Route Leader User ID'])!==text_(context.user['User ID']))fail_('FORBIDDEN','You cannot modify another route leader’s run.');return run;}
function requireAdmin_(context){if(!bool_(context.user.Admin))fail_('FORBIDDEN','Administrator access is required.');}
function requireRouteLeader_(context){if(!bool_(context.user.Admin)&&!bool_(context.user['Route Leader']))fail_('FORBIDDEN','Route leader access is required.');}
function audit_(context,type,id,action,oldValue,newValue,reason,source){appendObject_('audit',{'Audit ID':id_('AUD'),Timestamp:new Date(),'User ID':context.user['User ID'],'Entity Type':type,'Entity ID':id,'Field / Action':action,'Old Value':oldValue,'New Value':newValue,Reason:reason,Source:source});}
function inferEntityType_(action){if(/Route|Run/.test(action))return'RouteRun';if(/Stop/.test(action))return'RunStop';if(/Issue/.test(action))return'Issue';if(/User|Password|Session/.test(action))return'User';return'Operations';}
function configurationKey_(ids){return digestText_(uniqueStrings_(ids).sort().join('|'));}
function uniqueStrings_(values){const seen={};return(values||[]).map(text_).filter(function(value){if(!value||seen[value])return false;seen[value]=true;return true;});}
function crewCount_(value){const count=Number(value);if(!Number.isInteger(count)||count<1||count>4)fail_('INVALID_CREW_COUNT','Crew count must be between 1 and 4.');return count;}
function minutesBetween_(start,end){if(!start||!end)return 0;return Math.max(0,Math.round((end.getTime()-start.getTime())/60000));}
function id_(prefix){return prefix+'-'+Utilities.getUuid().replace(/-/g,'').slice(0,16).toUpperCase();}
function text_(value){return value===null||value===undefined?'':String(value).trim();}
function bool_(value){return value===true||String(value).toLowerCase()==='true'||String(value)==='1';}
function number_(value,fallback){const number=Number(value);return Number.isFinite(number)?number:fallback;}
function numberOrNull_(value){return value===''||value===null||value===undefined?null:number_(value,null);}
function parseDate_(value){if(value instanceof Date&&!isNaN(value.getTime()))return value;if(!value)return null;const date=new Date(value);return isNaN(date.getTime())?null:date;}
function iso_(value){const date=parseDate_(value);return date?date.toISOString():undefined;}
function dateOnly_(value){const date=parseDate_(value);return date?Utilities.formatDate(date,OPS.TIME_ZONE,'yyyy-MM-dd'):text_(value);}
function json_(payload){return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(ContentService.MimeType.JSON);}
function fail_(code,message){const error=new Error(message);error.code=code;error.publicMessage=message;throw error;}

function digestText_(value){const bytes=Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,String(value),Utilities.Charset.UTF_8);return Utilities.base64EncodeWebSafe(bytes).replace(/=+$/g,'');}
function randomToken_(){const material=Utilities.getUuid()+Utilities.getUuid()+new Date().getTime()+Math.random();return digestText_(material)+digestText_(material+'x');}
function randomBytes_(length){const bytes=Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,Utilities.getUuid()+Utilities.getUuid()+Math.random(),Utilities.Charset.UTF_8);return bytes.slice(0,length).map(function(value){return value<0?value+256:value;});}
function utf8Bytes_(value){return Utilities.newBlob(String(value)).getBytes().map(function(byte){return byte<0?byte+256:byte;});}
function signedBytes_(values){return values.map(function(value){return value>127?value-256:value;});}
function hmac_(key,value){return Utilities.computeHmacSha256Signature(signedBytes_(value),signedBytes_(key)).map(function(byte){return byte<0?byte+256:byte;});}
function pbkdf2_(password,salt,iterations,length){const passwordBytes=utf8Bytes_(password),blocks=Math.ceil(length/32),output=[];for(let block=1;block<=blocks;block++){const suffix=[(block>>>24)&255,(block>>>16)&255,(block>>>8)&255,block&255];let u=hmac_(passwordBytes,salt.concat(suffix)),t=u.slice();for(let i=1;i<iterations;i++){u=hmac_(passwordBytes,u);for(let j=0;j<t.length;j++)t[j]^=u[j];}Array.prototype.push.apply(output,t);}return output.slice(0,length);}
function hashPassword_(password){if(String(password).length<12)fail_('WEAK_PASSWORD','Passwords must be at least 12 characters.');const salt=randomBytes_(OPS.SALT_BYTES),derived=pbkdf2_(String(password),salt,OPS.PASSWORD_ITERATIONS,OPS.PASSWORD_BYTES);return['pbkdf2-sha256',OPS.PASSWORD_ITERATIONS,Utilities.base64EncodeWebSafe(signedBytes_(salt)).replace(/=+$/g,''),Utilities.base64EncodeWebSafe(signedBytes_(derived)).replace(/=+$/g,'')].join('$');}
function verifyPassword_(password,encoded){const parts=String(encoded||'').split('$');if(parts.length!==4||parts[0]!=='pbkdf2-sha256')return false;const iterations=Number(parts[1]);if(!Number.isFinite(iterations)||iterations<1000)return false;try{const salt=Utilities.base64DecodeWebSafe(parts[2]).map(function(b){return b<0?b+256:b;});const expected=Utilities.base64DecodeWebSafe(parts[3]).map(function(b){return b<0?b+256:b;});const actual=pbkdf2_(String(password),salt,iterations,expected.length);return constantTimeBytes_(actual,expected);}catch(error){return false;}}
function constantTimeEqual_(left,right){return constantTimeBytes_(utf8Bytes_(left),utf8Bytes_(right));}
function constantTimeBytes_(left,right){let diff=left.length^right.length;const length=Math.max(left.length,right.length);for(let i=0;i<length;i++)diff|=(left[i%left.length]||0)^(right[i%right.length]||0);return diff===0;}

/** Optional setup check. Run manually before deploying. */
function migrateOperationsForLiveRoutesAndHistory(){
  const spreadsheet=spreadsheet_();
  Object.keys(OPS.TABLES).forEach(function(key){const spec=OPS.TABLES[key],name=spec[0],expected=spec[1];let sheet=spreadsheet.getSheetByName(name);if(!sheet){sheet=spreadsheet.insertSheet(name);sheet.getRange(1,1,1,expected.length).setValues([expected]);return;}const width=Math.max(sheet.getLastColumn(),expected.length),headers=sheet.getRange(1,1,1,width).getDisplayValues()[0];for(let i=0;i<expected.length;i++){if(headers[i]&&headers[i]!==expected[i])throw new Error('Cannot migrate '+name+': column '+(i+1)+' is "'+headers[i]+'" but must be "'+expected[i]+'".');if(!headers[i])sheet.getRange(1,i+1).setValue(expected[i]);}});
  Object.keys(OPS_TABLE_INFO_CACHE_).forEach(function(key){delete OPS_TABLE_INFO_CACHE_[key];});
  const runs={};readTable_('routeRuns').forEach(function(entry){runs[text_(entry.object['Run ID'])]=entry.object;});
  const workSegments=readTable_('workSegments'),stopPauses=readTable_('stopPauses');
  readTable_('runStops').forEach(function(entry){if(text_(entry.object['Daily Service ID']))return;const row=entry.object,run=runs[text_(row['Run ID'])],now=new Date(),serviceId=id_('DSV'),crew=number_(row['Crew Count'],1),status=text_(row.Status)||'Not Started',participating=['Active','Paused','Stopped for Day'].indexOf(status)!==-1;appendObject_('dailyServices',{'Daily Service ID':serviceId,'Service Date':run?run['Run Date']:now,'Stop ID':row['Stop ID'],Status:status,'Current Crew Count':status==='Active'?crew:0,'Arrived At':row['Arrived At'],'First Work Started At':row['First Work Started At'],'Completed At':row['Completed At'],'Departed At':row['Departed At'],'Active Work Minutes':number_(row['Active Work Minutes'],0),'Excluded Pause Minutes':number_(row['Excluded Pause Minutes'],0),'Created At':now,'Updated At':now});updateObjectRow_('runStops',entry.rowNumber,{'Daily Service ID':serviceId,Shared:false});appendObject_('dailyParticipants',{'Participant ID':id_('DSP'),'Daily Service ID':serviceId,'Run ID':row['Run ID'],'Run Stop ID':row['Run Stop ID'],'Crew Count':crew,Status:status==='Completed'?'Completed':participating?'Joined':'Pending','Joined At':row['First Work Started At'],'Left At':row['Completed At'],'Updated At':now});workSegments.forEach(function(segment){if(text_(segment.object['Run Stop ID'])===text_(row['Run Stop ID']))updateObjectRow_('workSegments',segment.rowNumber,{'Daily Service ID':serviceId,'Crew Count':crew});});stopPauses.forEach(function(pause){if(text_(pause.object['Run Stop ID'])===text_(row['Run Stop ID']))updateObjectRow_('stopPauses',pause.rowNumber,{'Daily Service ID':serviceId});});});
  console.log('Live Routes and History migration complete. Existing history was preserved as one daily service per historical Run Stop.');
}
function migrateOperationsForAbortAndHistoryRemoval(){
  migrateOperationsForLiveRoutesAndHistory();
  removeObsoleteTestColumns_();
  validationRules_().forEach(function(item){const info=tableInfo_(item[0]),column=info.headers.indexOf(item[1])+1,rows=Math.max(1,info.sheet.getMaxRows()-1),validation=SpreadsheetApp.newDataValidation().requireValueInList(item[2],true).setAllowInvalid(false).build();info.sheet.getRange(2,column,rows,1).setDataValidation(validation);});
  OPS_HISTORY_REMOVALS_CACHE_=null;
  console.log('Operations state, return visit, interruption, test cleanup, and History removal migration complete. Existing records were preserved.');
}
function validationRules_(){return[
  ['runStops','Status',['Not Started','Arrived','Active','Paused','Stopped for Day','Completed','Returned','Aborted — Partial Work','Voided','Not Serviced — Route Aborted']],
  ['routeRuns','Status',['Not Started','Active','Stopped for Day','Completed','Canceled','Aborted']],
  ['dailyServices','Status',['Not Started','Arrived','Active','Paused','Stopped for Day','Completed','Returned','Aborted — Partial Work','Voided']],
  ['dailyParticipants','Status',['Pending','Joined','Left','Completed','Aborted','Voided','Route Aborted']],
  ['workSegments','End Reason',['Pause','Stop for Day','Completed','Switched Stop','Manual Edit','Aborted — Partial Work','Voided','Crew changed','Crew joined','Crew left']],
  ['stopPauses','Pause Type',['Pause','Stop for Day']],
  ['runPauses','Phase',['Other Route Downtime']],
  ['completionEvents','Completion Type',['Initial Completion','Return Started','Return Visit']],
  ['runIssues','Status',['Open','Resolved']],
  ['propertyIssues','Status',['Open','Resolved']],
  ['machineIssues','Status',['Open','Resolved']]
];}
function removeObsoleteTestColumns_(){['Stops','Routes','Route Runs'].forEach(function(name){const sheet=spreadsheet_().getSheetByName(name);if(!sheet)return;const last=sheet.getLastColumn();if(last<1)return;const headers=sheet.getRange(1,1,1,last).getDisplayValues()[0],index=headers.indexOf('Test Batch ID');if(index!==-1)sheet.deleteColumn(index+1);});Object.keys(OPS_TABLE_INFO_CACHE_).forEach(function(key){delete OPS_TABLE_INFO_CACHE_[key];});}
function verifyOperationsSetup(){Object.keys(OPS.TABLES).forEach(tableInfo_);validationRules_().forEach(function(item){const info=tableInfo_(item[0]),column=info.headers.indexOf(item[1])+1,rule=info.sheet.getRange(2,column).getDataValidation();if(!rule)throw new Error('Missing validation on '+info.sheet.getName()+' → '+item[1]+'. Run migrateOperationsForAbortAndHistoryRemoval().');const criteria=rule.getCriteriaValues(),allowed=criteria&&criteria[0]||[];item[2].forEach(function(value){if(allowed.indexOf(value)===-1)throw new Error('Validation on '+info.sheet.getName()+' → '+item[1]+' is missing "'+value+'". Run migrateOperationsForAbortAndHistoryRemoval().');});});console.log('All Operations tabs, headers, and controlled status values verified.');}
