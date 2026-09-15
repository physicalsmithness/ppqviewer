/**
 * Smithics drillers - shared multi-project tracking endpoint
 *
 * Deploy ONCE. Every driller that POSTs a payload with a "project" field is
 * routed to its own tab in this Sheet (tab name = project). All Smithics
 * drillers share the ECM-aligned payload schema, so every tab has the same
 * columns. Reuse this one Web App URL for Trilogy, future topics, anything.
 *
 * One-time setup:
 *   1. Create a Google Sheet (e.g. "Smithics driller responses").
 *   2. Extensions -> Apps Script. Delete the placeholder, paste this whole file, Save.
 *   3. Deploy -> New deployment -> type Web app.
 *        Execute as:     Me
 *        Who has access: Anyone        (required, or pupils cannot POST)
 *      Deploy, authorise, copy the Web app URL (.../exec).
 *   4. Paste that URL into each driller's REPORT_URL. That's it, forever.
 *
 * Updating later: Manage deployments -> edit -> Version: New version -> Deploy
 * (the URL stays the same).
 */

var COLUMNS = [
  'received_at','timestamp','project','anonymous_id','display_name','cohort',
  'google_email','session_id','item_id','topic','qtype','mode','level',
  'status','picked_id','misconception_id','extra_json'
];

function doPost(e) {
  try {
    var p = JSON.parse(e.postData.contents) || {};
    var sheet = getProjectSheet_(p.project);
    var known = {};
    COLUMNS.forEach(function (c) { known[c] = true; });
    var extra = {};
    Object.keys(p).forEach(function (k) { if (!known[k]) extra[k] = p[k]; });

    var row = COLUMNS.map(function (c) {
      if (c === 'received_at') return new Date();
      if (c === 'extra_json')  return Object.keys(extra).length ? JSON.stringify(extra) : '';
      return p[c] != null ? p[c] : '';
    });
    sheet.appendRow(row);
    return jsonOut_({ ok: true });
  } catch (err) {
    return jsonOut_({ ok: false, error: String(err) });
  }
}

function doGet() {
  return ContentService.createTextOutput('Smithics multi-project tracking endpoint is live.')
    .setMimeType(ContentService.MimeType.TEXT);
}

function getProjectSheet_(project) {
  var name = sanitizeTab_(project || 'misc');
  var ss = SpreadsheetApp.getActive();
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(COLUMNS);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, COLUMNS.length).setFontWeight('bold');
  }
  return sheet;
}

// Google Sheets tab names: <=100 chars, cannot contain  [ ] * ? / \ :
function sanitizeTab_(s) {
  return String(s).replace(/[\[\]\*\?\/\\:]/g, '_').slice(0, 100) || 'misc';
}

function jsonOut_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
