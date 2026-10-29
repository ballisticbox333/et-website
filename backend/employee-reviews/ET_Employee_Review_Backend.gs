/**
 * E.T. Custom Landscaping - Employee Review System
 * Backend v1: access codes + publish/archive workflow.
 *
 * Current live sheet schema (Employee Reviews, A:Z):
 * A Employee Name
 * B Access Code
 * C Hire Date
 * D Active
 * E Role
 * F Push Mower
 * G Grand Stand
 * H Blower
 * I Edger
 * J Hedge Trimmer
 * K Weedeater
 * L Work Quality
 * M Productivity
 * N Reliability
 * O Teamwork / Cooperation
 * P Professional Conduct
 * Q Responsibility / Initiative
 * R Coachability
 * S Average Rating (formula)
 * T Strengths
 * U Areas to Improve
 * V Expectations Before Next Review
 * W Reviewer
 * X Manager Notes (Internal)
 * Y Review Date
 * Z Published
 */

const REVIEW_CONFIG = Object.freeze({
  MAIN_SHEET: 'Employee Reviews',
  HISTORY_SHEET: '_ReviewHistory',
  ACCESS_CODE_LENGTH: 16,
  MAIN_HEADERS: [
    'Employee Name',
    'Access Code',
    'Hire Date',
    'Active',
    'Role',
    'Push Mower',
    'Grand Stand',
    'Blower',
    'Edger',
    'Hedge Trimmer',
    'Weedeater',
    'Work Quality',
    'Productivity',
    'Reliability',
    'Teamwork / Cooperation',
    'Professional Conduct',
    'Responsibility / Initiative',
    'Coachability',
    'Average Rating',
    'Strengths',
    'Areas to Improve',
    'Expectations Before Next Review',
    'Reviewer',
    'Manager Notes (Internal)',
    'Review Date',
    'Published'
  ],
  HISTORY_HEADERS: [
    'Review ID',
    'Employee Name',
    'Access Code',
    'Role',
    'Push Mower',
    'Grand Stand',
    'Blower',
    'Edger',
    'Hedge Trimmer',
    'Weedeater',
    'Work Quality',
    'Productivity',
    'Reliability',
    'Teamwork / Cooperation',
    'Professional Conduct',
    'Responsibility / Initiative',
    'Coachability',
    'Average Rating',
    'Strengths',
    'Areas to Improve',
    'Expectations Before Next Review',
    'Reviewer',
    'Manager Notes (Internal)',
    'Review Date',
    'Published At'
  ]
});

const COL = Object.freeze({
  EMPLOYEE_NAME: 1,
  ACCESS_CODE: 2,
  HIRE_DATE: 3,
  ACTIVE: 4,
  ROLE: 5,
  PUSH_MOWER: 6,
  GRAND_STAND: 7,
  BLOWER: 8,
  EDGER: 9,
  HEDGE_TRIMMER: 10,
  WEEDEATER: 11,
  WORK_QUALITY: 12,
  PRODUCTIVITY: 13,
  RELIABILITY: 14,
  TEAMWORK: 15,
  PROFESSIONAL_CONDUCT: 16,
  RESPONSIBILITY: 17,
  COACHABILITY: 18,
  AVERAGE: 19,
  STRENGTHS: 20,
  AREAS_TO_IMPROVE: 21,
  EXPECTATIONS: 22,
  REVIEWER: 23,
  MANAGER_NOTES: 24,
  REVIEW_DATE: 25,
  PUBLISHED: 26
});

/**
 * Creates the Reviews menu whenever the spreadsheet opens.
 */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Reviews')
    .addItem('Setup / repair review system', 'setupReviewSystem')
    .addItem('Publish selected employee row', 'publishSelectedRow')
    .addSeparator()
    .addItem('Show review history', 'showReviewHistory')
    .addItem('Hide review history', 'hideReviewHistory')
    .addToUi();
}

/**
 * Simple edit trigger. No installable trigger is required.
 *
 * - Generates a permanent random access code when an employee row gets a name.
 * - Keeps Average Rating formula-owned.
 * - Publishes a review when the Published checkbox is checked.
 */
function onEdit(e) {
  if (!e || !e.range) return;

  const sheet = e.range.getSheet();
  if (sheet.getName() !== REVIEW_CONFIG.MAIN_SHEET) return;
  if (e.range.getRow() < 2) return;

  const startRow = e.range.getRow();
  const endRow = e.range.getLastRow();

  // Support pasted employee names / row edits by repairing each affected row.
  for (let row = startRow; row <= endRow; row++) {
    ensureAccessCode_(sheet, row);
    ensureAverageFormula_(sheet, row);
  }

  // Publishing must be an intentional single-cell check of the Published box.
  if (
    e.range.getNumRows() === 1 &&
    e.range.getNumColumns() === 1 &&
    e.range.getColumn() === COL.PUBLISHED &&
    String(e.value).toUpperCase() === 'TRUE'
  ) {
    const row = e.range.getRow();
    const lock = LockService.getDocumentLock();

    try {
      if (!lock.tryLock(5000)) {
        throw new Error('Another review is being published right now. Try again.');
      }

      const reviewId = publishRow_(sheet, row);
      setPublishSuccess_(sheet, row, reviewId);
    } catch (err) {
      setPublishFailure_(sheet, row, err && err.message ? err.message : String(err));
    } finally {
      try {
        lock.releaseLock();
      } catch (ignore) {}
    }
  }
}

/**
 * Run this once after pasting the script, and any time the sheet structure needs repair.
 * It validates the schemas, ensures the archive exists/hidden, creates missing access
 * codes, and restores all Average Rating formulas.
 */
function setupReviewSystem() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const main = getMainSheet_(ss);
  const history = getOrCreateHistorySheet_(ss);

  assertHeaders_(main, REVIEW_CONFIG.MAIN_HEADERS);
  assertHeaders_(history, REVIEW_CONFIG.HISTORY_HEADERS);

  repairAverageFormulas_(main);
  repairMissingAccessCodes_(main);

  if (!history.isSheetHidden()) {
    history.hideSheet();
  }

  SpreadsheetApp.getUi().alert(
    'Review system ready',
    'The sheet structure is valid, access codes are repaired, and review history is hidden.',
    SpreadsheetApp.getUi().ButtonSet.OK
  );
}

/**
 * Manual backup publishing path from the Reviews menu.
 */
function publishSelectedRow() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getActiveSheet();
  const row = sheet.getActiveRange().getRow();
  const ui = SpreadsheetApp.getUi();

  if (sheet.getName() !== REVIEW_CONFIG.MAIN_SHEET || row < 2) {
    ui.alert('Select an employee row on the Employee Reviews tab first.');
    return;
  }

  const lock = LockService.getDocumentLock();
  try {
    if (!lock.tryLock(5000)) {
      throw new Error('Another review is being published right now. Try again.');
    }

    ensureAccessCode_(sheet, row);
    ensureAverageFormula_(sheet, row);
    const reviewId = publishRow_(sheet, row);
    setPublishSuccess_(sheet, row, reviewId);
    ui.alert('Review published', 'Archived as ' + reviewId + '.', ui.ButtonSet.OK);
  } catch (err) {
    setPublishFailure_(sheet, row, err && err.message ? err.message : String(err));
    ui.alert('Review not published', err && err.message ? err.message : String(err), ui.ButtonSet.OK);
  } finally {
    try {
      lock.releaseLock();
    } catch (ignore) {}
  }
}

function showReviewHistory() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const history = getOrCreateHistorySheet_(ss);
  history.showSheet();
  ss.setActiveSheet(history);
}

function hideReviewHistory() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const history = getOrCreateHistorySheet_(ss);
  const main = getMainSheet_(ss);
  ss.setActiveSheet(main);
  history.hideSheet();
}

/**
 * Archives one completed review, then clears only review-entry fields.
 * Permanent employee info, tool proficiency, access code, Active, Role, and Hire Date
 * remain on the employee row.
 */
function publishRow_(sheet, row) {
  const ss = sheet.getParent();
  const history = getOrCreateHistorySheet_(ss);

  assertHeaders_(sheet, REVIEW_CONFIG.MAIN_HEADERS);
  assertHeaders_(history, REVIEW_CONFIG.HISTORY_HEADERS);

  ensureAccessCode_(sheet, row);
  ensureAverageFormula_(sheet, row);

  const values = sheet.getRange(row, 1, 1, REVIEW_CONFIG.MAIN_HEADERS.length).getValues()[0];

  const employeeName = cleanText_(values[COL.EMPLOYEE_NAME - 1]);
  const accessCode = cleanText_(values[COL.ACCESS_CODE - 1]);
  const role = cleanText_(values[COL.ROLE - 1]);
  const reviewer = cleanText_(values[COL.REVIEWER - 1]);
  const reviewDate = values[COL.REVIEW_DATE - 1];

  const ratingValues = values
    .slice(COL.WORK_QUALITY - 1, COL.COACHABILITY)
    .map(function (value) { return Number(value); });

  const missing = [];
  if (!employeeName) missing.push('Employee Name');
  if (!accessCode) missing.push('Access Code');
  if (!role) missing.push('Role');
  if (!reviewer) missing.push('Reviewer');
  if (!(reviewDate instanceof Date) || isNaN(reviewDate.getTime())) missing.push('Review Date');

  const ratingNames = REVIEW_CONFIG.MAIN_HEADERS.slice(COL.WORK_QUALITY - 1, COL.COACHABILITY);
  ratingValues.forEach(function (rating, index) {
    if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
      missing.push(ratingNames[index]);
    }
  });

  if (missing.length) {
    throw new Error('Complete these required fields before publishing: ' + missing.join(', ') + '.');
  }

  const tz = ss.getSpreadsheetTimeZone() || Session.getScriptTimeZone() || 'America/New_York';
  const dateKey = Utilities.formatDate(reviewDate, tz, 'yyyyMMdd');
  const reviewId = 'REV-' + accessCode + '-' + dateKey;

  if (reviewIdExists_(history, reviewId)) {
    throw new Error(
      'A review for this employee is already archived for ' +
      Utilities.formatDate(reviewDate, tz, 'MM/dd/yyyy') +
      '. Change the Review Date if this is a separate review.'
    );
  }

  const average = Math.round(
    (ratingValues.reduce(function (sum, rating) { return sum + rating; }, 0) / ratingValues.length) * 100
  ) / 100;

  const publishedAt = new Date();
  const archiveRow = [
    reviewId,
    employeeName,
    accessCode,
    role,
    values[COL.PUSH_MOWER - 1],
    values[COL.GRAND_STAND - 1],
    values[COL.BLOWER - 1],
    values[COL.EDGER - 1],
    values[COL.HEDGE_TRIMMER - 1],
    values[COL.WEEDEATER - 1],
    ratingValues[0],
    ratingValues[1],
    ratingValues[2],
    ratingValues[3],
    ratingValues[4],
    ratingValues[5],
    ratingValues[6],
    average,
    cleanText_(values[COL.STRENGTHS - 1]),
    cleanText_(values[COL.AREAS_TO_IMPROVE - 1]),
    cleanText_(values[COL.EXPECTATIONS - 1]),
    reviewer,
    cleanText_(values[COL.MANAGER_NOTES - 1]),
    reviewDate,
    publishedAt
  ];

  const nextHistoryRow = Math.max(history.getLastRow() + 1, 2);
  history.getRange(nextHistoryRow, 1, 1, archiveRow.length).setValues([archiveRow]);
  history.getRange(nextHistoryRow, 24).setNumberFormat('MM/dd/yyyy');
  history.getRange(nextHistoryRow, 25).setNumberFormat('MM/dd/yyyy hh:mm am/pm');

  // Clear only fields that belong to the just-published review. The archive write
  // above has already preserved Review Date before the live cell is cleared.
  sheet.getRange(row, COL.WORK_QUALITY, 1, 7).clearContent();        // L:R ratings
  sheet.getRange(row, COL.STRENGTHS, 1, 5).clearContent();          // T:X text/reviewer/internal notes
  sheet.getRange(row, COL.REVIEW_DATE).clearContent();              // Y review date
  ensureAverageFormula_(sheet, row);                                // S stays formula-owned

  SpreadsheetApp.flush();
  return reviewId;
}

function ensureAccessCode_(sheet, row) {
  if (row < 2) return '';

  const employeeName = cleanText_(sheet.getRange(row, COL.EMPLOYEE_NAME).getValue());
  if (!employeeName) return '';

  const codeCell = sheet.getRange(row, COL.ACCESS_CODE);
  const existingCode = cleanText_(codeCell.getValue());
  if (existingCode) return existingCode;

  const newCode = generateUniqueAccessCode_(sheet);
  codeCell.setNumberFormat('@');
  codeCell.setValue(newCode);
  return newCode;
}

function generateUniqueAccessCode_(sheet) {
  const lastRow = Math.max(sheet.getLastRow(), 2);
  const existingCodes = new Set(
    sheet.getRange(2, COL.ACCESS_CODE, Math.max(lastRow - 1, 1), 1)
      .getDisplayValues()
      .flat()
      .map(function (v) { return String(v).trim(); })
      .filter(Boolean)
  );

  let code = '';
  do {
    code = Utilities.getUuid()
      .replace(/-/g, '')
      .slice(0, REVIEW_CONFIG.ACCESS_CODE_LENGTH)
      .toLowerCase();
  } while (existingCodes.has(code));

  return code;
}

function ensureAverageFormula_(sheet, row) {
  if (row < 2) return;

  const averageCell = sheet.getRange(row, COL.AVERAGE);
  const expectedFormula =
    '=IF(COUNTA(L' + row + ':R' + row + ')=0,"",ROUND(AVERAGE(ARRAYFORMULA(IF(L' + row + ':R' + row + '="","",VALUE(L' + row + ':R' + row + ')))),2))';

  if (averageCell.getFormula() !== expectedFormula) {
    averageCell.setFormula(expectedFormula);
  }
}

function repairAverageFormulas_(sheet) {
  const rowCount = sheet.getMaxRows() - 1;
  if (rowCount <= 0) return;

  const formulas = [];
  for (let row = 2; row <= sheet.getMaxRows(); row++) {
    formulas.push([
      '=IF(COUNTA(L' + row + ':R' + row + ')=0,"",ROUND(AVERAGE(ARRAYFORMULA(IF(L' + row + ':R' + row + '="","",VALUE(L' + row + ':R' + row + ')))),2))'
    ]);
  }

  sheet.getRange(2, COL.AVERAGE, rowCount, 1).setFormulas(formulas);
}

function repairMissingAccessCodes_(sheet) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return;

  for (let row = 2; row <= lastRow; row++) {
    ensureAccessCode_(sheet, row);
  }
}

function reviewIdExists_(history, reviewId) {
  const dataRows = history.getLastRow() - 1;
  if (dataRows <= 0) return false;

  const match = history
    .getRange(2, 1, dataRows, 1)
    .createTextFinder(reviewId)
    .matchEntireCell(true)
    .findNext();

  return Boolean(match);
}

function setPublishSuccess_(sheet, row, reviewId) {
  const cell = sheet.getRange(row, COL.PUBLISHED);
  const ss = sheet.getParent();
  const tz = ss.getSpreadsheetTimeZone() || Session.getScriptTimeZone() || 'America/New_York';
  const stamp = Utilities.formatDate(new Date(), tz, 'MM/dd/yyyy hh:mm a');

  cell.setValue(false);
  cell.setNote('Last published: ' + stamp + '\nReview ID: ' + reviewId);

  try {
    ss.toast('Review archived successfully.', 'Review System', 4);
  } catch (ignore) {}
}

function setPublishFailure_(sheet, row, message) {
  const cell = sheet.getRange(row, COL.PUBLISHED);
  cell.setValue(false);
  cell.setNote('Publish blocked: ' + message);

  try {
    sheet.getParent().toast(message, 'Review not published', 7);
  } catch (ignore) {}
}

function getMainSheet_(ss) {
  const sheet = ss.getSheetByName(REVIEW_CONFIG.MAIN_SHEET);
  if (!sheet) {
    throw new Error('Missing required sheet: ' + REVIEW_CONFIG.MAIN_SHEET);
  }
  return sheet;
}

function getOrCreateHistorySheet_(ss) {
  let sheet = ss.getSheetByName(REVIEW_CONFIG.HISTORY_SHEET);

  if (!sheet) {
    sheet = ss.insertSheet(REVIEW_CONFIG.HISTORY_SHEET);
    sheet.getRange(1, 1, 1, REVIEW_CONFIG.HISTORY_HEADERS.length)
      .setValues([REVIEW_CONFIG.HISTORY_HEADERS]);
    sheet.setFrozenRows(1);
    sheet.hideSheet();
  }

  return sheet;
}

function assertHeaders_(sheet, expectedHeaders) {
  const actual = sheet
    .getRange(1, 1, 1, expectedHeaders.length)
    .getDisplayValues()[0]
    .map(function (value) { return String(value).trim(); });

  const mismatches = [];
  expectedHeaders.forEach(function (expected, index) {
    if (actual[index] !== expected) {
      mismatches.push(
        columnLetter_(index + 1) + ' expected "' + expected + '" but found "' + actual[index] + '"'
      );
    }
  });

  if (mismatches.length) {
    throw new Error(
      'Sheet structure changed. Publishing was stopped to protect the archive. ' +
      mismatches.join('; ')
    );
  }
}

function cleanText_(value) {
  if (value === null || value === undefined) return '';
  return String(value).trim();
}

function columnLetter_(column) {
  let result = '';
  let n = column;

  while (n > 0) {
    const remainder = (n - 1) % 26;
    result = String.fromCharCode(65 + remainder) + result;
    n = Math.floor((n - 1) / 26);
  }

  return result;
}

/**
 * Read-only employee portal endpoint.
 * Called only by the Cloudflare server-side proxy.
 * This endpoint never writes to the spreadsheet.
 */
function doPost(e) {
  try {
    const parameters = e && e.parameter ? e.parameter : {};
    if (cleanText_(parameters.action) !== 'getEmployeeReviewPortal') {
      return portalJsonResponse_({ ok: false, code: 'NOT_FOUND' });
    }

    const expectedSecret = PropertiesService.getScriptProperties().getProperty('REVIEW_API_SECRET') || '';
    const suppliedSecret = String(parameters.secret || '');
    if (!expectedSecret || !portalSecretsMatch_(expectedSecret, suppliedSecret)) {
      return portalJsonResponse_({ ok: false, code: 'UNAUTHORIZED' });
    }

    const accessCode = cleanText_(parameters.accessCode);
    if (!/^[A-Za-z0-9_-]{8,128}$/.test(accessCode)) {
      return portalJsonResponse_({ ok: false, code: 'NOT_FOUND' });
    }

    return portalJsonResponse_(getEmployeeReviewPortal_(accessCode));
  } catch (ignore) {
    return portalJsonResponse_({ ok: false, code: 'BACKEND_ERROR' });
  }
}

/**
 * Builds an allowlisted employee response. Manager Notes, Active, Published,
 * Hire Date, access codes, draft ratings, and draft written feedback are never
 * added to this object.
 */
function getEmployeeReviewPortal_(accessCode) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const main = getMainSheet_(ss);
  const history = ss.getSheetByName(REVIEW_CONFIG.HISTORY_SHEET);

  if (!history) {
    throw new Error('Review history is unavailable.');
  }

  assertHeaders_(main, REVIEW_CONFIG.MAIN_HEADERS);
  assertHeaders_(history, REVIEW_CONFIG.HISTORY_HEADERS);

  const mainRowCount = main.getLastRow() - 1;
  if (mainRowCount <= 0) {
    return { ok: false, code: 'NOT_FOUND' };
  }

  const mainRows = main
    .getRange(2, 1, mainRowCount, REVIEW_CONFIG.MAIN_HEADERS.length)
    .getValues();

  const employeeRow = mainRows.find(function (row) {
    const rowCode = cleanText_(row[COL.ACCESS_CODE - 1]);
    const isActive = row[COL.ACTIVE - 1] === true;
    return rowCode === accessCode && isActive;
  });

  if (!employeeRow) {
    return { ok: false, code: 'NOT_FOUND' };
  }

  const equipmentDefinitions = [
    ['Push Mower', COL.PUSH_MOWER],
    ['Grand Stand', COL.GRAND_STAND],
    ['Blower', COL.BLOWER],
    ['Edger', COL.EDGER],
    ['Hedge Trimmer', COL.HEDGE_TRIMMER],
    ['Weedeater', COL.WEEDEATER]
  ];

  const equipment = equipmentDefinitions.reduce(function (items, definition) {
    const status = cleanText_(employeeRow[definition[1] - 1]);
    if (status) {
      items.push({ name: definition[0], status: status });
    }
    return items;
  }, []);

  const historyRowCount = history.getLastRow() - 1;
  const historyRows = historyRowCount > 0
    ? history.getRange(2, 1, historyRowCount, REVIEW_CONFIG.HISTORY_HEADERS.length).getValues()
    : [];

  const matchingRows = historyRows
    .filter(function (row) {
      return cleanText_(row[2]) === accessCode;
    })
    .sort(function (left, right) {
      const reviewDifference = portalDateValue_(right[23]) - portalDateValue_(left[23]);
      if (reviewDifference !== 0) return reviewDifference;
      return portalDateValue_(right[24]) - portalDateValue_(left[24]);
    });

  const timeZone = ss.getSpreadsheetTimeZone() || Session.getScriptTimeZone() || 'America/New_York';
  const reviews = matchingRows.map(function (row) {
    const publicReview = {
      reviewDate: portalDateString_(row[23], timeZone),
      roleAtReview: cleanText_(row[3]),
      reviewer: cleanText_(row[21]),
      averageRating: Number(row[17]),
      ratings: {
        workQuality: Number(row[10]),
        productivity: Number(row[11]),
        reliability: Number(row[12]),
        teamworkCooperation: Number(row[13]),
        professionalConduct: Number(row[14]),
        responsibilityInitiative: Number(row[15]),
        coachability: Number(row[16])
      }
    };

    const strengths = cleanText_(row[18]);
    const areasToImprove = cleanText_(row[19]);
    const expectations = cleanText_(row[20]);

    if (strengths) publicReview.strengths = strengths;
    if (areasToImprove) publicReview.areasToImprove = areasToImprove;
    if (expectations) publicReview.expectationsBeforeNextReview = expectations;

    return publicReview;
  });

  return {
    ok: true,
    employee: {
      name: cleanText_(employeeRow[COL.EMPLOYEE_NAME - 1]),
      role: cleanText_(employeeRow[COL.ROLE - 1]),
      equipment: equipment
    },
    reviews: reviews
  };
}

function portalDateValue_(value) {
  return value instanceof Date && !isNaN(value.getTime()) ? value.getTime() : 0;
}

function portalDateString_(value, timeZone) {
  if (!(value instanceof Date) || isNaN(value.getTime())) return '';
  return Utilities.formatDate(value, timeZone, 'yyyy-MM-dd');
}

function portalSecretsMatch_(expected, supplied) {
  const expectedText = String(expected || '');
  const suppliedText = String(supplied || '');
  let difference = expectedText.length ^ suppliedText.length;
  const length = Math.max(expectedText.length, suppliedText.length);

  for (let index = 0; index < length; index++) {
    difference |= (expectedText.charCodeAt(index) || 0) ^ (suppliedText.charCodeAt(index) || 0);
  }

  return difference === 0;
}

function portalJsonResponse_(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
