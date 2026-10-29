const SPREADSHEET_ID = '1LAO1g039vAcn11umpmXsAQi615KgbPQx03_ve3VuTz0';
const SHEET_ID = 0;
const RATE_LIMIT_SECONDS = 60 * 60;
const RESULT_PAGE_URL = 'https://etcustomlandscaping.com/application-result.html';

const FIELD_ORDER = [
  'fullName',
  'phoneNumber',
  'pastMistake',
  'workplaceDisagreement',
  'taskTracking',
  'feedbackPreference',
  'outdoorExperience',
  'workStyle',
  'availability',
  'machineryExperience',
];

function doPost(event) {
  const lock = LockService.getScriptLock();

  try {
    const parameters = event && event.parameter ? event.parameter : {};

    // Bots commonly fill every field. Real applicants never see this field.
    if (cleanValue(parameters.website, 200)) {
      return applicationResponse({ ok: true });
    }

    const startedAt = Number(parameters.formStartedAt || 0);
    if (!startedAt || Date.now() - startedAt < 4000) {
      return applicationResponse({ ok: false, code: 'INVALID', error: 'Submission was completed too quickly.' });
    }

    const values = FIELD_ORDER.map(function (fieldName) {
      const limit = fieldName === 'fullName' ? 120 : fieldName === 'phoneNumber' ? 50 : 5000;
      return cleanValue(parameters[fieldName], limit);
    });

    if (values.some(function (value) { return !value; })) {
      return applicationResponse({ ok: false, code: 'INVALID', error: 'Every application field is required.' });
    }

    const phoneKey = createRateLimitKey(values[1]);
    const cache = CacheService.getScriptCache();
    if (cache.get(phoneKey)) {
      return applicationResponse({ ok: false, code: 'RATE_LIMIT', error: 'Please wait before submitting another application.' });
    }

    lock.waitLock(10000);

    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = spreadsheet.getSheets().find(function (candidate) {
      return candidate.getSheetId() === SHEET_ID;
    });

    if (!sheet) {
      throw new Error('The application sheet tab could not be found.');
    }

    // Column A is generated here on the server. Columns B-K are the form answers.
    sheet.appendRow([new Date()].concat(values));
    const timestampCell = sheet.getRange(sheet.getLastRow(), 1);
    timestampCell.setNumberFormat('M/d/yyyy h:mm:ss AM/PM');

    cache.put(phoneKey, 'submitted', RATE_LIMIT_SECONDS);
    return applicationResponse({ ok: true });
  } catch (error) {
    console.error(error);
    return applicationResponse({ ok: false, code: 'SERVER_ERROR', error: 'The application could not be saved.' });
  } finally {
    if (lock.hasLock()) lock.releaseLock();
  }
}

function cleanValue(value, maximumLength) {
  return String(value || '').trim().slice(0, maximumLength);
}

function createRateLimitKey(phoneNumber) {
  const normalizedPhone = String(phoneNumber || '').replace(/\D/g, '');
  const digest = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, normalizedPhone);
  const hash = digest.map(function (byte) {
    return ('0' + ((byte + 256) % 256).toString(16)).slice(-2);
  }).join('');
  return 'application-' + hash;
}

function applicationResponse(payload) {
  const status = payload.ok
    ? 'success'
    : payload.code === 'RATE_LIMIT'
      ? 'rate-limited'
      : 'error';
  const destination = RESULT_PAGE_URL + '?status=' + encodeURIComponent(status);
  const serializedDestination = JSON.stringify(destination).replace(/</g, '\\u003c');

  return HtmlService
    .createHtmlOutput(
      '<!doctype html><html><head>' +
      '<meta http-equiv="refresh" content="0;url=' + destination + '">' +
      '</head><body><script>' +
      'window.location.replace(' + serializedDestination + ');' +
      '</script></body></html>'
    )
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
