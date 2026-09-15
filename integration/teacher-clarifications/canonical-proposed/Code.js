/**
 * Smithics drillers - shared multi-project tracking endpoint
 * tt-3 DRAFT (TeacherViewer d007): teacher read surface with real Google sign-in.
 * tt-4: pupils roster + classes read path (d011); ticker view (d012).
 * tt-5: owner-run pupil roster HARVEST (d013) that self-populates `pupils` from
 *       identities already received; never in the pupil write path.
 *
 * TWO DEPLOYMENTS of this one script, different jobs, different settings:
 *
 *   1. PUPIL WRITE (already live, DO NOT TOUCH): Execute as Me / access Anyone.
 *      Pupils POST attempts; doPost routes them to per-project tabs. That
 *      deployment stays pinned to its existing version, so pasting this file
 *      changes nothing for pupils until that deployment is deliberately
 *      version-bumped.
 *
 *   2. TEACHER READ (new): Execute as "User accessing the web app" /
 *      access "Anyone with a Google account". A teacher visits this
 *      deployment's URL, Google signs them in as themselves, and doGet
 *      checks their email against the `teachers` tab allowlist. Listed ->
 *      the viewer page, served by the script, with data via google.script.run
 *      (running with the teacher's own view access to the workbook).
 *      Not listed -> refused by name. Signed out -> Google's login wall.
 *      No keys, no secrets, per-teacher revocation.
 *
 * The gate has two layers, both required:
 *   - Drive ACL: the workbook is view-shared ONLY with allowlisted teachers.
 *     A stranger's Google account has no read access, so even a crafted
 *     request gets nothing.
 *   - The `teachers` tab: header row `email` (more columns later for
 *     per-teacher view config). doGet refuses emails not on it.
 *
 * Reserved tabs (never project tabs): `classes`, `teachers`.
 * `google_email` is never included in data served to the page.
 *
 * Updating the PUPIL deployment later: Deploy -> Manage deployments -> pencil
 * on the pupil deployment -> Version: New version -> Deploy (URL survives).
 * Never delete it and never make a fresh deployment for pupils: a fresh one
 * mints a new URL and orphans every driller's REPORT_URL.
 */

// tt-4 (d025). The COMMON SPINE: every row of every project carries these, and
// this is the whole of the consistency. `row_type` blank means `attempt`, so every
// producer written before tt-4 keeps working untouched and unconsulted.
var SPINE = [
  'received_at','timestamp','project','row_type','anonymous_id','display_name',
  'cohort','google_email','session_id','attempt_id'
];

// What a NEW project tab is created with: the spine plus the classic attempt
// columns, so a driller that sends only the old seven-field core still gets a
// tidy tab. Beyond this, columns are minted on demand (mintColumns_).
var COLUMNS = SPINE.concat([
  'item_id','topic','qtype','mode','level','status','picked_id','misconception_id','extra_json'
]);

// Columns never served to the teacher page (they stay in the Sheet).
var PRIVATE_COLUMNS = { google_email: true };

// Tab names that are NOT project response tabs.
var RESERVED_TABS = { ppq_help_requests: true, ppq_help_replies: true, ppq_help_nonces: true, classes: true, teachers: true, pupils: true, projects: true, schema_log: true };

// Where minted columns are recorded, so a producer's typo is an auditable event
// rather than silent sprawl (guard one of the v5 ruling).
var SCHEMA_LOG_TAB = 'schema_log';

// Guard two: transport fields cannot be minted or overwritten as ordinary data.
// The outer extra_json field is accepted only as a legacy object/JSON envelope;
// its contents pass the same reserved-key guard before joining the retained tail.
var REFUSED_KEYS = { extra_json: true, received_at: true };

// A runaway producer must not be able to sprawl a tab to the sheet's column
// limit. Detection (the schema_log) is not prevention, so this is the brake.
var MAX_COLUMNS_PER_TAB = 200;
var MAX_MINTS_PER_POST = 20;

// Tab icon note: Apps Script's setFaviconUrl only accepts a HOSTED raster image
// (png/ico/gif/jpg); an SVG or a data URI throws "favicon icon image type is not
// supported" and takes down doGet. To set the smithics favicon, host
// app/smithics-favicon.png on Pages and add
// .setFaviconUrl('https://physicalsmithness.github.io/.../smithics-favicon.png')
// to the doGet returns below.

/* ------------------------- pupil write path (tt-8) ----------------------- */

// tt-4 (d025): a new top-level SCALAR key becomes a real column on that project's
// tab the first time it is seen, instead of being swept into extra_json. Nested
// objects and arrays still go to extra_json, because a one-to-many fact belongs in
// its own ROW (joined on attempt_id), which is what row_type makes expressible.
//
// The failure this removes: before tt-4 a project had to ask permission to record
// a fact it already had, and Linguics waited 47 days for one column while Smith
// opened the sheet, could not find what pupils had written, and concluded the data
// was not there. It was there, buried mid-extra_json. The schema hid a fact from
// its owner. No project waits on a ruling to record a fact again.
function doPost(e) {
  try {
    var help = helpDoPost_(JSON.parse(e.postData.contents));
    if (help !== null) return jsonOut_(help);
    var raw = JSON.parse(e.postData.contents);
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw new Error('payload must be an object');
    var refused = [];
    var p = normaliseRecordKeys_(raw, refused);
    var tail = Object.create(null);
    if (owns_(p, 'extra_json') && p.extra_json !== '' && p.extra_json != null) {
      var legacy = parseExtraRecord_(p.extra_json);
      if (!legacy) refused.push('extra_json');
      else {
        legacy = normaliseRecordKeys_(legacy, refused);
        Object.keys(legacy).forEach(function (k) {
          if (owns_(REFUSED_KEYS, k)) { refused.push(k); return; }
          tail[k] = legacy[k];
        });
      }
    }
    delete p.extra_json;
    // A typed row sent through an older envelope is still that type. An explicit
    // top-level value, including blank (= attempt), takes precedence.
    if (!owns_(p, 'row_type') && owns_(tail, 'row_type') && typeof tail.row_type !== 'object') {
      p.row_type = tail.row_type;
    }
    if (p.row_type == null || String(p.row_type).trim() === '') p.row_type = 'attempt';

    var sheet = getProjectSheet_(p.project);
    var header = headerOf_(sheet);
    var wanted = [];

    Object.keys(p).forEach(function (key) {
      if (owns_(REFUSED_KEYS, key)) { refused.push(key); return; }
      // Never leave a stale envelope value to contradict an explicit field.
      delete tail[key];
      var v = p[key];
      if (v !== null && typeof v === 'object') { tail[key] = v; return; }  // arrays/objects -> tail
      if (header.indexOf(key) === -1) wanted.push(key);
    });

    if (wanted.length) {
      var mint = mintColumns_(sheet, wanted, p.project, refused);
      // Another writer may have minted every wanted key while we waited, in
      // which case added is empty but the header still changed.
      header = headerOf_(sheet);
      // Anything that could not become a column falls back to the tail. Never dropped.
      mint.tailed.forEach(function (k) { if (header.indexOf(k) === -1) tail[k] = p[k]; });
    }

    var row = header.map(function (c) {
      if (c === 'received_at') return new Date();
      if (c === 'extra_json')  return Object.keys(tail).length ? JSON.stringify(tail) : '';
      var v = p[c];
      if (v === null || v === undefined) return '';
      return (typeof v === 'object') ? '' : v;
    });
    sheet.appendRow(row);

    return jsonOut_(refused.length ? { ok: true, refused_keys: refused } : { ok: true });
  } catch (err) {
    return jsonOut_({ ok: false, error: String(err) });
  }
}

function owns_(obj, key) { return Object.prototype.hasOwnProperty.call(obj, key); }

// Trim once, before both discovery and lookup. Exact spellings win collisions;
// refused aliases are reported rather than silently writing a blank new column.
// Null-prototype maps also allow ordinary custom keys such as `constructor`.
function normaliseRecordKeys_(raw, refused) {
  var out = Object.create(null);
  Object.keys(raw).forEach(function (k) {
    var key = String(k).trim();
    if (!key) { refused.push(k); return; }
    if ((key !== k && owns_(raw, key)) || owns_(out, key)) { refused.push(k); return; }
    out[key] = raw[k];
  });
  return out;
}

function parseExtraRecord_(value) {
  try {
    var parsed = typeof value === 'string' ? JSON.parse(value) : value;
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : null;
  } catch (e) { return null; }
}

// Old writers may retain an entire extra wrapper, including private fields.
// Remove named private fields at every nesting level, including JSON text stored
// inside another envelope. Keep the original string/object shape where possible.
function publicExtraValue_(value, isEnvelope) {
  if (typeof value === 'string') {
    if (!/^\s*[\[{]/.test(value)) return isEnvelope ? '' : value;
    try { return JSON.stringify(publicExtraValue_(JSON.parse(value))); }
    // A malformed envelope cannot be safely served as a payload. Ordinary pupil
    // text within a valid envelope, such as "[my working]", must stay intact.
    catch (e) { return isEnvelope ? '' : value; }
  }
  if (!value || typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.map(function (v) { return publicExtraValue_(v); });
  var out = Object.create(null);
  Object.keys(value).forEach(function (k) {
    if (!owns_(PRIVATE_COLUMNS, String(k).trim().toLowerCase())) out[k] = publicExtraValue_(value[k]);
  });
  return out;
}

function headerOf_(sheet) {
  var last = sheet.getLastColumn();
  if (last < 1) return [];
  return sheet.getRange(1, 1, 1, last).getValues()[0]
    .map(function (h) { return String(h).trim(); });
}

/**
 * Append new columns to a project tab, under a document lock so two simultaneous
 * posts cannot clobber each other's header write, and re-reading the header inside
 * the lock so the second post sees the first one's columns. Returns the keys minted;
 * `refusedInto` carries keys that hit a cap and must fall back to extra_json rather
 * than be dropped.
 */
function mintColumns_(sheet, wanted, project, refused) {
  var result = { added: [], tailed: [] };

  var lock = LockService.getDocumentLock();
  try { lock.waitLock(15000); }
  catch (e) {
    // Another write holds the lock. Tail the keys rather than wait or drop: the
    // pupil's row still lands, complete, and the column is minted on a later post.
    result.tailed = wanted.slice();
    return result;
  }

  try {
    var header = headerOf_(sheet);                 // re-read INSIDE the lock
    var room = Math.max(0, MAX_COLUMNS_PER_TAB - header.length);
    wanted.forEach(function (k) {
      if (header.indexOf(k) !== -1) return;        // a concurrent post already minted it
      if (result.added.length >= MAX_MINTS_PER_POST || result.added.length >= room) {
        result.tailed.push(k);
        return;
      }
      result.added.push(k);
    });
    if (result.added.length) {
      sheet.getRange(1, header.length + 1, 1, result.added.length)
        .setValues([result.added]).setFontWeight('bold');
    }
    if (result.added.length || (refused && refused.length) || result.tailed.length) {
      logSchema_(project, result.added, refused, result.tailed);
    }
    return result;
  } finally {
    try { lock.releaseLock(); } catch (e2) {}
  }
}

/** Guard one: every minted column is an auditable event (date, project, key). */
function logSchema_(project, added, refused, capped) {
  try {
    var ss = SpreadsheetApp.getActive();
    var sh = ss.getSheetByName(SCHEMA_LOG_TAB);
    if (!sh) {
      sh = ss.insertSheet(SCHEMA_LOG_TAB);
      sh.appendRow(['when', 'project', 'event', 'key']);
      sh.setFrozenRows(1);
      sh.getRange(1, 1, 1, 4).setFontWeight('bold');
    }
    var now = new Date(), rows = [];
    (added || []).forEach(function (k) { rows.push([now, project, 'column_minted', k]); });
    (refused || []).forEach(function (k) { rows.push([now, project, 'key_refused', k]); });
    (capped || []).forEach(function (k) { rows.push([now, project, 'cap_reached_to_extra_json', k]); });
    if (rows.length) sh.getRange(sh.getLastRow() + 1, 1, rows.length, 4).setValues(rows);
  } catch (e) { /* logging must never break a pupil's write */ }
}

/* ------------------------- teacher read path (tt-3) ---------------------- */

function doGet(e) {
  var help = helpPublicGetOutput_(e && e.parameter || {});
  if (help !== null) return help;
  var email = signedInEmail_();

  // Anonymous GET: this is the pupil deployment (or a signed-out visitor on
  // a stale link). Keep the historical banner; serve no data.
  if (!email) {
    return ContentService.createTextOutput('Smithics multi-project tracking endpoint is live.')
      .setMimeType(ContentService.MimeType.TEXT);
  }

  if (!isAllowlisted_(email)) {
    return HtmlService.createHtmlOutput(
      '<p style="font-family:sans-serif;max-width:34em">Signed in as <b>' + esc_(email) +
      '</b>, which is not on the TeacherViewer allowlist. If it should be, ask Smith to add it to the ' +
      'workbook’s <code>teachers</code> tab.</p>'
    ).setTitle('TeacherViewer: not authorised');
  }

  // Serve the real viewer (app/teacherviewer.html pasted into the Apps Script
  // project). Either file name works, so a rename never breaks the surface;
  // with neither present, the diagnostic shell below.
  try {
    return HtmlService.createHtmlOutputFromFile('teacherviewer').setTitle('TeacherViewer');
  } catch (e1) {
    try {
      return HtmlService.createHtmlOutputFromFile('viewer').setTitle('TeacherViewer');
    } catch (e2) {
      return HtmlService.createHtmlOutput(viewerShellHtml_(email)).setTitle('TeacherViewer');
    }
  }
}

// Server functions callable from the served page via google.script.run.
// They execute as the signed-in teacher (view access via the workbook share),
// and re-check the allowlist on every call (fail closed, cheap).

function tvListProjects() {
  requireAllowlisted_();
  var reg = registryMap_();
  var scope = teacherScope_(signedInEmail_());
  return SpreadsheetApp.getActive().getSheets()
    .filter(function (s) { return !RESERVED_TABS[s.getName()]; })
    .map(function (s) {
      var id = s.getName(), r = reg[id] || {};
      return { project: id, rows: Math.max(0, s.getLastRow() - 1),
        label: r.label || prettyLabel_(id), subject: r.subject || '', active: isActive_(r.active),
        catalogue_url: r.catalogue_url || '' };
    })
    .filter(function (p) {
      if (!scope.projects) return true;  // null = every app
      return scope.projects.indexOf(String(p.project).toLowerCase()) !== -1 ||
             (p.subject && scope.projects.indexOf(String(p.subject).toLowerCase()) !== -1);
    });
}

// rowType (tt-4, optional): which row_type to serve. Defaults to 'attempt', which
// is what every existing view wants; '*' serves every row for a view that needs the
// one-to-many facts (markpoint, misconception, orthography) joined on attempt_id.
function tvGetRows(project, since, rowType) {
  requireAllowlisted_();
  if (!project) throw new Error('tvGetRows needs a project');
  if (/^ppq_help_(requests|replies|nonces)$/.test(sanitizeTab_(project).toLowerCase())) throw new Error('Use the authorised clarification queue.');
  var wantType = String(rowType || 'attempt').trim().toLowerCase();
  var scope = teacherScope_(signedInEmail_());
  // Per-teacher app scoping (tt-7): refuse a project this teacher may not see.
  if (scope.projects) {
    var reg = registryMap_();
    var subj = String((reg[project] || {}).subject || '').toLowerCase();
    if (scope.projects.indexOf(String(project).toLowerCase()) === -1 &&
        !(subj && scope.projects.indexOf(subj) !== -1)) return [];
  }
  var sheet = SpreadsheetApp.getActive().getSheetByName(sanitizeTab_(project));
  if (!sheet) return [];
  var visible = visibleCohortsFor_(signedInEmail_());  // null = all cohorts
  var roster = rosterMaps_();                          // null if no pupils tab
  // pid -> lowercased class list, for per-teacher class scoping (tt-7).
  var pidClasses = null;
  if (roster && scope.classes) {
    pidClasses = {};
    roster.list.forEach(function (p) {
      pidClasses[p.pid] = (p.classes || []).map(function (c) { return String(c).toLowerCase(); });
    });
  }
  var values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];
  var header = values[0].map(function (h) { return String(h).trim(); });
  var out = [];
  for (var i = 1; i < values.length; i++) {
    var obj = Object.create(null), rawEmail = '';
    for (var j = 0; j < header.length; j++) {
      var h = header[j], v = values[i][j];
      if (h.toLowerCase() === 'google_email') { rawEmail = String(v).trim().toLowerCase(); continue; }
      if (owns_(PRIVATE_COLUMNS, h.toLowerCase())) continue;
      // Custom scalar columns can themselves contain JSON text. Apply the same
      // privacy rule there as in the traditional envelopes; ordinary text stays.
      obj[h] = (v instanceof Date) ? v.toISOString() : publicExtraValue_(v, h === 'extra_json');
    }
    // tt-4 (d025): the class matrix, the misconception view and the ticker are all
    // ATTEMPT views. A markpoint or orthography row joined on attempt_id is a fact
    // about an attempt, not a second attempt, and counting it as one would inflate
    // every total on the surface. Older writers left row_type in extra_json;
    // consult that only when the column is blank, then default to attempt.
    var rt = String(obj.row_type == null ? '' : obj.row_type).trim().toLowerCase();
    if (!rt) {
      var extra = parseExtraRecord_(obj.extra_json);
      if (extra && owns_(extra, 'row_type') && extra.row_type != null && typeof extra.row_type !== 'object') {
        rt = String(extra.row_type).trim().toLowerCase();
      }
    }
    obj.row_type = rt || 'attempt';
    if (wantType === '*') { /* caller asked for everything */ }
    else if ((rt || 'attempt') !== wantType) continue;

    // Resolve to a rostered pupil identity (pid: the name today, the email
    // later) by alias (display_name / anonymous_id as pupils typed them) or,
    // once the login route lands, by the captured sign-in email. The
    // google_email column itself still never leaves the server (d014, d011).
    if (roster) {
      var pid = roster.byAlias[normKey_(obj.display_name)] ||
                roster.byAlias[normKey_(obj.anonymous_id)] ||
                (rawEmail ? roster.byEmail[rawEmail] : '') || '';
      if (pid) obj.pupil = pid;
    }
    if (visible && visible.indexOf(String(obj.cohort || '').trim().toLowerCase()) === -1) continue;
    // Per-teacher class scoping (tt-7): keep only rows whose pupil is in one of
    // the teacher's allowed classes. Unrostered pupils are hidden when a class
    // scope is set (membership unprovable), matching the cohort filter.
    if (scope.classes) {
      var pc = obj.pupil ? pidClasses[obj.pupil] : null;
      if (!pc || !pc.some(function (c) { return scope.classes.indexOf(c) !== -1; })) continue;
    }
    // 'since' compares ISO strings; rows with no timestamp are kept.
    if (since && obj.timestamp && String(obj.timestamp) < since) continue;
    out.push(obj);
  }
  return out;
}

// The pupils tab: header row `email | aliases | classes`; one row per received
// NAME. Rows are never merged or deleted on the sheet: the harvest only ever
// appends names it has not seen. Identity key (pid) is the email where Smith
// has typed one, else the pupil's name. Two rows given the SAME email are
// pooled into one pupil at serve time (d015), unioning their names and classes;
// a row with no email stands alone under its name (d014). The pooling is a
// read-time view, not a rewrite, so clearing the email splits them again. Email
// takes over as the key with no reshuffle if/when the login route lands.
function rosterMaps_() {
  var sheet = SpreadsheetApp.getActive().getSheetByName('pupils');
  if (!sheet) return null;
  var values = sheet.getDataRange().getValues();
  if (values.length < 2) return null;
  var header = values[0].map(function (h) { return String(h).trim().toLowerCase(); });
  var cE = header.indexOf('email'), cA = header.indexOf('aliases'), cC = header.indexOf('classes');
  if (cA === -1 && cE === -1) return null;

  // Group rows into identities by pid so rows sharing an email consolidate.
  var byPid = {};
  for (var i = 1; i < values.length; i++) {
    var email = cE === -1 ? '' : String(values[i][cE]).trim().toLowerCase();
    var validEmail = email && email.indexOf('@') > 0;
    var aliases = cA === -1 ? [] : splitList_(values[i][cA]);
    var classes = cC === -1 ? [] : splitList_(values[i][cC]);
    if (!validEmail && !aliases.length) continue;  // empty row
    var pid = validEmail ? email : 'name:' + normKey_(aliases[0]);
    if (!byPid[pid]) byPid[pid] = { email: validEmail ? email : '', aliasOrder: [], aliasSeen: {}, classSeen: {}, label: '' };
    var rec = byPid[pid];
    aliases.forEach(function (a) {
      var k = normKey_(a);
      if (!rec.aliasSeen[k]) { rec.aliasSeen[k] = true; rec.aliasOrder.push(a); }
    });
    classes.forEach(function (c) { rec.classSeen[normKey_(c)] = c; });
    if (!rec.label && aliases.length) rec.label = aliases[0];
  }

  var maps = { byEmail: {}, byAlias: {}, list: [] };
  Object.keys(byPid).forEach(function (pid) {
    var rec = byPid[pid], classList = [];
    Object.keys(rec.classSeen).forEach(function (k) { classList.push(rec.classSeen[k]); });
    if (rec.email) maps.byEmail[rec.email] = pid;
    rec.aliasOrder.forEach(function (a) { maps.byAlias[normKey_(a)] = pid; });
    maps.list.push({ pid: pid, email: rec.email,
      label: rec.label || (rec.email ? rec.email.split('@')[0] : pid),
      aliases: rec.aliasOrder, classes: classList });
  });
  return maps;
}

function normKey_(s) { return String(s == null ? '' : s).trim().toLowerCase(); }

function tvGetRoster() {
  requireAllowlisted_();
  var roster = rosterMaps_();
  if (!roster) return [];
  var scope = teacherScope_(signedInEmail_());
  if (!scope.classes) return roster.list;
  return roster.list.filter(function (p) {
    return (p.classes || []).some(function (c) { return scope.classes.indexOf(String(c).toLowerCase()) !== -1; });
  });
}

// Per-teacher cohort visibility (d009, the loose model Smith asked for):
// on the teachers tab, the cell to the RIGHT of a teacher's email may name
// the cohorts they see, comma-separated (e.g. "12A, 12B"). Blank, "all" or
// "*" means everything. Returns null for everything, else a lowercase list.
// NOTE this is a courtesy filter, not a hard wall: allowlisted teachers hold
// view access to the whole workbook and could open the Sheet directly. That
// matches the commissioned "different teachers see different things, LOOSELY";
// hard walls are the later multi-school security tier.
function visibleCohortsFor_(email) {
  if (!email) return null;
  var sheet = SpreadsheetApp.getActive().getSheetByName('teachers');
  if (!sheet) return null;
  var values = sheet.getDataRange().getValues();
  for (var i = 0; i < values.length; i++) {
    for (var j = 0; j < values[i].length; j++) {
      if (String(values[i][j]).trim().toLowerCase() === email) {
        var spec = String(values[i][j + 1] != null ? values[i][j + 1] : '').trim();
        if (!spec || spec.toLowerCase() === 'all' || spec === '*') return null;
        return spec.split(/[,;]+/).map(function (s) { return s.trim().toLowerCase(); })
                   .filter(function (s) { return s; });
      }
    }
  }
  return null;
}

// Per-teacher scope (tt-7), read from the `teachers` tab by header. Add columns
// `classes` and/or `projects` next to `email`; each cell is a comma-separated
// list, and blank / "all" / "*" means everything. `classes` limits which class
// codes (and thus which pupils' rows) a teacher sees; `projects` limits which
// apps appear in their switcher (a project id OR a subject name). Returns
// {classes, projects} with null meaning no limit. Like the cohort filter this
// is a COURTESY scope inside the viewer, not a hard wall: an allowlisted teacher
// still holds view access to the raw workbook (d009). Hard walls are the later
// multi-school tier.
function teacherScope_(email) {
  var out = { classes: null, projects: null };
  if (!email) return out;
  var sheet = SpreadsheetApp.getActive().getSheetByName('teachers');
  if (!sheet) return out;
  var values = sheet.getDataRange().getValues();
  if (!values.length) return out;
  var header = values[0].map(function (x) { return String(x).trim().toLowerCase(); });
  var cE = header.indexOf('email'), cC = header.indexOf('classes'), cP = header.indexOf('projects');
  if (cE === -1 || (cC === -1 && cP === -1)) return out;  // no scope columns -> everything
  for (var i = 1; i < values.length; i++) {
    if (String(values[i][cE] || '').trim().toLowerCase() === email) {
      if (cC !== -1) out.classes = parseScopeCell_(values[i][cC]);
      if (cP !== -1) out.projects = parseScopeCell_(values[i][cP]);
      return out;
    }
  }
  return out;
}

function parseScopeCell_(v) {
  var s = String(v == null ? '' : v).trim();
  if (!s || s.toLowerCase() === 'all' || s === '*') return null;  // null = everything
  return s.split(/[,;]+/).map(function (x) { return x.trim().toLowerCase(); })
    .filter(function (x) { return x; });
}

function tvGetClasses() {
  requireAllowlisted_();
  var scope = teacherScope_(signedInEmail_());
  var rows = readTabAsObjects_('classes');
  if (!scope.classes) return rows;
  return rows.filter(function (c) {
    return scope.classes.indexOf(String(c['class'] || '').trim().toLowerCase()) !== -1;
  });
}

function tvWhoAmI() {
  var email = signedInEmail_();
  var scope = teacherScope_(email);
  return { email: email, allowlisted: isAllowlisted_(email),
           cohorts: visibleCohortsFor_(email),   // null = all
           classes: scope.classes, projects: scope.projects };  // null = all
}

/* ------------------------- pupil roster harvest (tt-5) -------------------- */
// Smith's commission 2026-07-21: pupils type any name they like; the script
// collects every unique identity it has RECEIVED into the `pupils` roster by
// itself, so Smith opens that tab, finds everyone already listed, and only has
// to set their classes. Keyed on google_email where a driller captured one
// (aliases gathered under it), else on the typed name. It NEVER writes the
// classes column and never removes a human-entered alias.
//
// It runs ONLY as the owner: from the TeacherViewer menu, or an optional
// owner-installed time trigger. It is never in the pupil write path (doPost)
// and never on a teacher read (teachers hold view-only access and cannot
// write), so it can never delay pupils answering, whatever its cadence. The
// auto path self-limits to once per ROSTER_THROTTLE_MIN minutes (Smith's cap);
// the menu button ignores the throttle and runs immediately.

var ROSTER_THROTTLE_MIN = 10;

function onOpen() {
  try {
    SpreadsheetApp.getUi()
      .createMenu('TeacherViewer')
      .addItem('Refresh pupils & projects', 'tvRefreshAll')
      .addItem('Refresh pupils only', 'tvRefreshPupils')
      .addToUi();
  } catch (e) { /* no UI in this context */ }
}

// Menu action: always runs, reports what it found.
function tvRefreshPupils() {
  var s = harvestRoster_(true);
  try {
    SpreadsheetApp.getActive().toast(
      s.added + ' new pupil(s), ' + s.aliasesAdded + ' new alias(es).',
      'TeacherViewer roster', 6);
  } catch (e) {}
  return s;
}

// Menu action: refresh both the pupil roster and the projects registry.
function tvRefreshAll() {
  var p = harvestRoster_(true);
  var projectsAdded = harvestProjects_();
  try {
    SpreadsheetApp.getActive().toast(
      'Pupils: ' + p.added + ' new, ' + p.aliasesAdded + ' new alias(es). Projects: ' + projectsAdded + ' new.',
      'TeacherViewer refresh', 6);
  } catch (e) {}
  return { pupils: p, projectsAdded: projectsAdded };
}

// Optional hands-off entry point: install a time-driven trigger on THIS
// function (Extensions > Apps Script > Triggers). Self-throttled to Smith's cap.
function autoRefreshPupils() {
  return harvestRoster_(false);
}

function harvestRoster_(force) {
  var props = PropertiesService.getScriptProperties();
  if (!force) {
    var last = Number(props.getProperty('rosterLastRun') || 0);
    if (Date.now() - last < ROSTER_THROTTLE_MIN * 60 * 1000) {
      return { added: 0, aliasesAdded: 0, skipped: true };
    }
  }
  var ss = SpreadsheetApp.getActive();

  // 1. Collect identities across every project tab.
  var byEmail = {}, nameOnly = {}, nameHasEmail = {};
  ss.getSheets().forEach(function (sh) {
    if (RESERVED_TABS[sh.getName()]) return;
    var values = sh.getDataRange().getValues();
    if (values.length < 2) return;
    var h = values[0].map(function (x) { return String(x).trim().toLowerCase(); });
    var cE = h.indexOf('google_email'), cN = h.indexOf('display_name'), cAn = h.indexOf('anonymous_id');
    for (var i = 1; i < values.length; i++) {
      var email = cE === -1 ? '' : String(values[i][cE] || '').trim().toLowerCase();
      var name = cN === -1 ? '' : String(values[i][cN] || '').trim();
      if (!name && cAn !== -1) name = String(values[i][cAn] || '').trim();
      if (!name && !email) continue;
      if (email && email.indexOf('@') > 0) {
        if (!byEmail[email]) byEmail[email] = {};
        if (name) { byEmail[email][name] = true; nameHasEmail[normKey_(name)] = true; }
      } else if (name) {
        nameOnly[normKey_(name)] = name;
      }
    }
  });

  // 2. Load or create the pupils tab.
  var sheet = ss.getSheetByName('pupils');
  if (!sheet) sheet = ss.insertSheet('pupils');
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['email', 'aliases', 'classes']);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, 3).setFontWeight('bold');
  }
  var values = sheet.getDataRange().getValues();
  var header = values[0].map(function (x) { return String(x).trim().toLowerCase(); });
  var cE = header.indexOf('email'); if (cE === -1) cE = 0;
  var cA = header.indexOf('aliases'); if (cA === -1) cA = 1;
  var width = Math.max(3, header.length);

  var rowByEmail = {}, aliasSeen = {};
  for (var r = 1; r < values.length; r++) {
    var em = normKey_(values[r][cE]);
    if (em) rowByEmail[em] = r;
    splitList_(values[r][cA]).forEach(function (a) { aliasSeen[normKey_(a)] = true; });
  }

  // 3a. Upsert email-keyed identities (extend aliases on a match, else append).
  var added = 0, aliasesAdded = 0, appends = [];
  Object.keys(byEmail).forEach(function (email) {
    var names = Object.keys(byEmail[email]);
    if (rowByEmail[email] != null) {
      var r = rowByEmail[email], have = {};
      splitList_(values[r][cA]).forEach(function (a) { have[normKey_(a)] = true; });
      var toAdd = names.filter(function (n) { return !have[normKey_(n)]; });
      if (toAdd.length) {
        sheet.getRange(r + 1, cA + 1).setValue(splitList_(values[r][cA]).concat(toAdd).join(', '));
        aliasesAdded += toAdd.length;
        toAdd.forEach(function (n) { aliasSeen[normKey_(n)] = true; });
      }
    } else {
      appends.push(mkRosterRow_(width, cE, cA, email, names.join(', ')));
      names.forEach(function (n) { aliasSeen[normKey_(n)] = true; });
      added++;
    }
  });

  // 3b. Add name-only identities not already represented (blank email for Smith
  //     to fill or merge; classes left blank).
  Object.keys(nameOnly).forEach(function (nk) {
    if (aliasSeen[nk] || nameHasEmail[nk]) return;
    appends.push(mkRosterRow_(width, cE, cA, '', nameOnly[nk]));
    aliasSeen[nk] = true;
    added++;
  });

  if (appends.length) {
    sheet.getRange(sheet.getLastRow() + 1, 1, appends.length, width).setValues(appends);
  }
  props.setProperty('rosterLastRun', String(Date.now()));
  return { added: added, aliasesAdded: aliasesAdded, skipped: false };
}

function splitList_(v) {
  return String(v == null ? '' : v).split(/[,;]+/)
    .map(function (s) { return s.trim(); }).filter(function (s) { return s; });
}

function mkRosterRow_(width, cE, cA, email, aliases) {
  var row = [];
  for (var i = 0; i < width; i++) row.push('');
  row[cE] = email; row[cA] = aliases;
  return row;
}

/* ------------------------- projects registry (tt-6) ---------------------- */
// The `projects` tab (project_id | subject | label | active) names each driller
// and its subject group, so the viewer's switcher shows friendly labels and a
// class's applies_to can name a subject (d016). Auto-filled from the live tabs
// by harvestProjects_ (a formula cannot read other tabs' names); Smith fills in
// the subject and, if he likes, tweaks the label or sets active to n to hide a
// project. subject/label/active once set are never overwritten.

function harvestProjects_() {
  var ss = SpreadsheetApp.getActive();
  var sheet = ss.getSheetByName('projects');
  if (!sheet) sheet = ss.insertSheet('projects');
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['project_id', 'subject', 'label', 'active', 'catalogue_url']);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, 5).setFontWeight('bold');
  }
  var values = sheet.getDataRange().getValues();
  var h = values[0].map(function (x) { return String(x).trim().toLowerCase(); });
  var cId = h.indexOf('project_id'); if (cId === -1) cId = 0;
  var cL = h.indexOf('label'); if (cL === -1) cL = 2;
  var cAc = h.indexOf('active'); if (cAc === -1) cAc = 3;
  var width = Math.max(4, h.length);
  var have = {};
  for (var r = 1; r < values.length; r++) {
    var id = String(values[r][cId] || '').trim();
    if (id) have[id] = true;
  }
  var appends = [];
  ss.getSheets().forEach(function (s) {
    var n = s.getName();
    if (RESERVED_TABS[n] || have[n]) return;
    var row = [];
    for (var i = 0; i < width; i++) row.push('');
    row[cId] = n;
    if (cL < width) row[cL] = prettyLabel_(n);
    if (cAc < width) row[cAc] = 'y';
    appends.push(row);
  });
  if (appends.length) sheet.getRange(sheet.getLastRow() + 1, 1, appends.length, width).setValues(appends);
  return appends.length;
}

function registryMap_() {
  var sheet = SpreadsheetApp.getActive().getSheetByName('projects');
  if (!sheet) return {};
  var values = sheet.getDataRange().getValues();
  if (values.length < 2) return {};
  var h = values[0].map(function (x) { return String(x).trim().toLowerCase(); });
  var cId = h.indexOf('project_id'); if (cId === -1) cId = 0;
  var cS = h.indexOf('subject'), cL = h.indexOf('label'), cA = h.indexOf('active'), cU = h.indexOf('catalogue_url');
  var map = {};
  for (var i = 1; i < values.length; i++) {
    var id = String(values[i][cId] || '').trim();
    if (!id) continue;
    map[id] = {
      subject: cS === -1 ? '' : String(values[i][cS] || '').trim(),
      label: cL === -1 ? '' : String(values[i][cL] || '').trim(),
      active: cA === -1 ? '' : String(values[i][cA] || '').trim(),
      catalogue_url: cU === -1 ? '' : String(values[i][cU] || '').trim()
    };
  }
  return map;
}

function prettyLabel_(id) {
  return String(id).replace(/[_\-]+/g, ' ').replace(/\s+/g, ' ').trim()
    .replace(/\b\w/g, function (c) { return c.toUpperCase(); });
}

function isActive_(v) {
  var s = String(v == null ? '' : v).trim().toLowerCase();
  if (!s) return true;
  return !(s === 'n' || s === 'no' || s === 'false' || s === '0' || s === 'inactive' || s === 'hidden' || s === 'off');
}

/* ------------------------- helpers --------------------------------------- */

function signedInEmail_() {
  var email = '';
  try { email = Session.getActiveUser().getEmail() || ''; } catch (err) {}
  // An owner-run public endpoint must never authenticate its anonymous visitor as the owner.
  return String(email).trim().toLowerCase();
}

function isAllowlisted_(email) {
  if (!email) return false;
  var sheet = SpreadsheetApp.getActive().getSheetByName('teachers');
  if (!sheet) return false;  // fail closed: no teachers tab, nobody reads
  // Any email address appearing anywhere on the teachers tab is allowlisted
  // (tolerant of header row or none; the tab has one job).
  var values = sheet.getDataRange().getValues();
  for (var i = 0; i < values.length; i++) {
    for (var j = 0; j < values[i].length; j++) {
      var v = String(values[i][j]).trim().toLowerCase();
      if (v && v.indexOf('@') > 0 && v === email) return true;
    }
  }
  return false;
}

function requireAllowlisted_() {
  if (!isAllowlisted_(signedInEmail_())) throw new Error('not authorised');
}

function readTabAsObjects_(name) {
  var sheet = SpreadsheetApp.getActive().getSheetByName(name);
  if (!sheet) return [];
  var values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];
  var header = values[0].map(function (h) { return String(h).trim().toLowerCase(); });
  return values.slice(1).map(function (row) {
    var obj = {};
    header.forEach(function (h, j) {
      obj[h] = (row[j] instanceof Date) ? row[j].toISOString() : row[j];
    });
    return obj;
  });
}

// Minimal authenticated shell proving the whole loop (sign-in, allowlist,
// data read). Milestone 0 replaces this with the real viewer (the generalised
// seed matrix); the server functions above are already its data API.
function viewerShellHtml_(email) {
  return '' +
'<!doctype html><html><head><meta charset="utf-8">' +
'<meta name="viewport" content="width=device-width, initial-scale=1">' +
'<style>body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif;' +
'max-width:44em;margin:2em auto;padding:0 1em;color:#1d1d1f;line-height:1.4}' +
'h1{font-size:1.2em} .muted{color:#666} li{margin:0.2em 0}</style></head><body>' +
'<h1>TeacherViewer <span class="muted">(shell, pre-M0)</span></h1>' +
'<p class="muted">Signed in as ' + esc_(email) + '. The real viewer lands here at milestone 0; ' +
'this shell proves sign-in, the allowlist, and data access.</p>' +
'<p id="status">Loading project tabs…</p><ul id="list"></ul>' +
'<script>' +
'google.script.run.withSuccessHandler(function(ps){' +
'  document.getElementById("status").textContent = ps.length ? "Project tabs:" : "No project tabs found.";' +
'  document.getElementById("list").innerHTML = ps.map(function(p){' +
'    return "<li><b>"+p.project+"</b>: "+p.rows+" rows</li>";}).join("");' +
'}).withFailureHandler(function(e){' +
'  document.getElementById("status").textContent = "Error: "+e.message;' +
'}).tvListProjects();' +
'</script></body></html>';
}

function getProjectSheet_(project) {
  var name = sanitizeTab_(project || 'misc');
  if (RESERVED_TABS[name]) name = 'misc';  // a payload cannot write into classes/teachers
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

function esc_(s) {
  return String(s).replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}

function jsonOut_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}


/* Teacher-reviewed public Q&A. Add beside TeacherViewer's Code.gs.
 * Public request and read routes run only on the dedicated owner deployment.
 * Teacher functions require an actual active Google account, never the owner fallback.
 */
var TV_HELP_OWNER_URL = 'https://script.google.com/macros/s/AKfycbygTx2TEpXvqECcWT0mbVhn_Jc_emoT3tk1iKD3EkmgJAv__vSW_oixb8RAlEFyjpRt/exec';
var TV_HELP_REQUESTS_TAB = 'ppq_help_requests';
var TV_HELP_REPLIES_TAB = 'ppq_help_replies';
var TV_HELP_NONCES_TAB = 'ppq_help_nonces';
var TV_HELP_SECRET_KEY = 'TV_HELP_RELAY_SECRET';
var TV_HELP_STORAGE_SECRET_KEY = 'TV_HELP_STORAGE_SECRET';
var TV_HELP_REQUEST_HEADERS = ['request_id','project','item_id','question_json','source_label_json','source_url','source_context_json','created_at','row_signature'];
var TV_HELP_REPLY_HEADERS = ['id','request_id','project','item_id','question_json','answer_json','published_at','source_label_json','source_url','row_signature'];
var TV_HELP_NONCE_HEADERS = ['nonce','used_at','payload_hash','row_signature'];

function helpDoGet_(params) {
  params = params || {};
  var action = String(params.action || '');
  if (action.indexOf('ppq_help_') !== 0) return null;
  try {
    var project = helpProject_(params.project);
    if (action === 'ppq_help_list') {
      var item = helpItem_(params.item_id);
      return {ok:true,replies:helpPublicReplies_().filter(function(r){return r.project === project && r.item_id === item;})};
    }
    if (action === 'ppq_help_status') {
      var ids = String(params.request_ids || '').split(',');
      if (!ids.length || ids.length > 50) throw new Error('Provide 1 to 50 request IDs.');
      ids = ids.map(helpUuid_).filter(function(id,i,all){return all.indexOf(id) === i;});
      var requests = helpRequestRows_(), replies = helpPublicReplies_();
      return {ok:true,requests:ids.map(function(id){
        var request = requests.filter(function(r){return r.request_id === id && r.project === project;})[0];
        var answered = replies.some(function(r){return r.request_id === id && r.project === project;});
        return {request_id:id,status:request ? (answered ? 'answered' : 'pending') : 'not_found'};
      }),replies:replies.filter(function(r){return r.project === project && ids.indexOf(r.request_id) >= 0;})};
    }
    throw new Error('Unsupported clarification action.');
  } catch (error) { return helpError_(error); }
}

function helpPublicGetOutput_(params) {
  params = params || {};
  if (String(params.action || '').indexOf('ppq_help_') !== 0) return null;
  var callback = params.callback, result;
  if (callback != null && (!/^[A-Za-z_$][A-Za-z0-9_$]{0,63}$/.test(String(callback)) || /^(break|case|catch|class|const|continue|debugger|default|delete|do|else|export|extends|finally|for|function|if|import|in|instanceof|let|new|return|super|switch|this|throw|try|typeof|var|void|while|with|yield|await|enum|null|true|false)$/.test(String(callback)))) {
    return ContentService.createTextOutput(JSON.stringify({ok:false,error:'Invalid callback.'})).setMimeType(ContentService.MimeType.JSON);
  }
  result = helpDoGet_(params);
  var json = JSON.stringify(result).replace(/</g,'\\u003c').replace(/\u2028/g,'\\u2028').replace(/\u2029/g,'\\u2029');
  return ContentService.createTextOutput(callback ? String(callback)+'('+json+');' : json)
    .setMimeType(callback ? ContentService.MimeType.JAVASCRIPT : ContentService.MimeType.JSON);
}

function helpDoPost_(raw) {
  var action = raw && String(raw.action || '');
  if (!action || action.indexOf('ppq_help_') !== 0) return null;
  try {
    if (action === 'ppq_help_request') return helpCreateRequest_(raw);
    if (action === 'ppq_help_publish') return helpReceivePublication_(raw);
    throw new Error('Unsupported clarification action.');
  } catch (error) { return helpError_(error); }
}

function helpError_(error) { return {ok:false,error:String(error && error.message || error)}; }
function helpKeys_(value, allowed) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Expected an object.');
  Object.keys(value).forEach(function(key){if (allowed.indexOf(key) < 0) throw new Error('Unsupported field: ' + key);});
}
function helpText_(value, max, required) {
  if (typeof value !== 'string' || value.length > max || /[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/.test(value)) throw new Error('Invalid or oversized text.');
  var text = value.replace(/\r\n?/g,'\n').trim();
  if (required && !text) throw new Error('Text is required.');
  return text;
}
function helpProject_(value) {
  if (typeof value !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9_.-]{0,79}$/.test(value)) throw new Error('Invalid project.');
  if ([TV_HELP_REQUESTS_TAB,TV_HELP_REPLIES_TAB,TV_HELP_NONCES_TAB].indexOf(value) >= 0 || (typeof RESERVED_TABS !== 'undefined' && RESERVED_TABS[value])) throw new Error('Reserved project.');
  return value;
}
function helpItem_(value) {
  if (typeof value !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9_.:()@/+\[\]-]{0,239}$/.test(value)) throw new Error('Invalid source item ID.');
  return value;
}
function helpUuid_(value) {
  if (typeof value !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)) throw new Error('Invalid request ID.');
  return value.toLowerCase();
}
function helpUrl_(value, relative) {
  value = helpText_(value == null ? '' : value,2048,false);
  if (!value) return '';
  if (/\s|[<>"'\\]/.test(value)) throw new Error('Invalid source URL.');
  if (/^https:\/\//i.test(value)) {
    var authority = value.slice(8).split(/[/?#]/)[0];
    if (!authority || /@/.test(authority)) throw new Error('Invalid source URL.');
    return value;
  }
  if (relative && /^(?:\.\/)?[A-Za-z0-9_-][A-Za-z0-9_./%()-]*\.(?:png|jpe?g|webp)$/i.test(value) && !/(?:^|\/)\.\.(?:\/|$)/.test(value)) return value;
  throw new Error('A secure source URL is required.');
}
function helpPublicUrl_(url) {
  if (!url) return '';
  var base = url.split(/[?#]/)[0], query = url.indexOf('?') < 0 ? '' : url.split('?')[1].split('#')[0];
  var kept = query.split('&').filter(function(part){
    var eq = part.indexOf('='), key = eq < 0 ? '' : part.slice(0,eq), value = eq < 0 ? '' : part.slice(eq+1);
    return /^(topic|part|id|course)$/.test(key) && /^[A-Za-z0-9_.%:()+-]{1,240}$/.test(value);
  });
  return base + (kept.length ? '?' + kept.join('&') : '');
}
function helpContext_(value) {
  if (value == null) return {};
  var ids = ['id','parent_id','source_part_id','source_group_id'];
  var images = ['question_images','context_images','markscheme_images'];
  helpKeys_(value,ids.concat(images));
  var out = {};
  ids.forEach(function(key){if (value[key] != null && value[key] !== '') out[key] = helpItem_(value[key]);});
  images.forEach(function(key){
    if (value[key] == null) return;
    if (!Array.isArray(value[key]) || value[key].length > 24) throw new Error('Too many source images.');
    out[key] = value[key].map(function(url){return helpUrl_(url,true);});
  });
  if (JSON.stringify(out).length > 24000) throw new Error('Source context is too large.');
  return out;
}
function helpCanonical_(value) {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return '[' + value.map(helpCanonical_).join(',') + ']';
  return '{' + Object.keys(value).sort().map(function(key){return JSON.stringify(key)+':'+helpCanonical_(value[key]);}).join(',') + '}';
}
function helpNow_() { return new Date().toISOString(); }
function helpLock_(run) {
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try { return run(); } finally { lock.releaseLock(); }
}
function helpSheet_(name,headers,create) {
  var ss = SpreadsheetApp.getActive(), sheet = ss.getSheetByName(name);
  if (!sheet && create) { sheet = ss.insertSheet(name); sheet.appendRow(headers); sheet.setFrozenRows(1); }
  if (!sheet) return null;
  var first = sheet.getDataRange().getValues()[0] || [];
  // The pinned legacy writer can append wider rows, padding the header with
  // empty cells. Accept that padding, but never a changed or extended schema.
  if (JSON.stringify(first.slice(0,headers.length)) !== JSON.stringify(headers) || first.slice(headers.length).some(function(value){return value !== '' && value != null;})) throw new Error('Clarification storage headers do not match.');
  return sheet;
}
function helpRows_(name,headers) {
  var sheet = helpSheet_(name,headers,false);
  if (!sheet) return [];
  var secret = PropertiesService.getScriptProperties().getProperty(TV_HELP_STORAGE_SECRET_KEY);
  if (!secret) return [];
  return sheet.getDataRange().getValues().slice(1).filter(function(row){return row[0];}).map(function(row){
    var out = {}; headers.forEach(function(key,i){out[key] = row[i] instanceof Date ? row[i].toISOString() : String(row[i] == null ? '' : row[i]);});
    if (!/^[0-9a-f]{64}$/.test(out.row_signature) || !helpSameSignature_(out.row_signature,helpStorageSignature_(name,headers,out,secret))) return null;
    return out;
  }).filter(function(row){return row !== null;});
}
function helpStorageSignature_(name,headers,record,secret) {
  return helpSignature_({storage_version:1,tab:name,values:headers.filter(function(key){return key !== 'row_signature';}).map(function(key){return String(record[key] == null ? '' : record[key]);})},secret);
}
function helpAppend_(name,headers,record) {
  var secret = PropertiesService.getScriptProperties().getProperty(TV_HELP_STORAGE_SECRET_KEY);
  if (!secret) throw new Error('Clarification storage has not been initialised.');
  record.row_signature = helpStorageSignature_(name,headers,record,secret);
  helpSheet_(name,headers,true).appendRow(headers.map(function(key){return record[key] == null ? '' : record[key];}));
}
function helpInitialiseStorageSecret_() {
  // Called inside the owner request route's lock, after validating a real request.
  // This separate key cannot authorise teacher publication.
  var props = PropertiesService.getScriptProperties();
  if (!props.getProperty(TV_HELP_STORAGE_SECRET_KEY)) props.setProperty(TV_HELP_STORAGE_SECRET_KEY,Utilities.getUuid().replace(/-/g,'')+Utilities.getUuid().replace(/-/g,''));
}
function helpStoredJson_(text) { try { return JSON.parse(text); } catch (_) { throw new Error('Clarification storage contains an unreadable record.'); } }
function helpRequestRows_() {
  return helpRows_(TV_HELP_REQUESTS_TAB,TV_HELP_REQUEST_HEADERS).map(function(row){return {
    request_id:row.request_id,project:row.project,item_id:row.item_id,question:helpStoredJson_(row.question_json),
    source_label:helpStoredJson_(row.source_label_json),source_url:row.source_url,source_context:helpStoredJson_(row.source_context_json),created_at:row.created_at
  };});
}
function helpPublicReplies_() {
  // Explicit projection only. Private request text and all future extra columns
  // are never merged into this public response. Only the latest publication of
  // each request is public: a correction must also remove superseded text.
  var latest = {};
  helpRows_(TV_HELP_REPLIES_TAB,TV_HELP_REPLY_HEADERS).forEach(function(row){latest[row.request_id] = {
    id:row.id,request_id:row.request_id,project:row.project,item_id:row.item_id,
    question:helpStoredJson_(row.question_json),answer:helpStoredJson_(row.answer_json),published_at:row.published_at,
    source_label:helpStoredJson_(row.source_label_json),source_url:row.source_url
  };});
  return Object.keys(latest).map(function(id){return latest[id];});
}
function helpCreateRequest_(raw) {
  helpKeys_(raw,['action','request_id','project','item_id','question','source_label','source_url','source_context']);
  var request = {request_id:helpUuid_(raw.request_id),project:helpProject_(raw.project),item_id:helpItem_(raw.item_id),
    question:helpText_(raw.question,4000,true),source_label:helpText_(raw.source_label || '',400,false),
    source_url:helpUrl_(raw.source_url,false),source_context:helpContext_(raw.source_context)};
  return helpLock_(function(){
    helpInitialiseStorageSecret_();
    var old = helpRequestRows_().filter(function(r){return r.request_id === request.request_id;})[0];
    if (old) {
      var withoutDate = {}; Object.keys(request).forEach(function(key){withoutDate[key] = old[key];});
      if (helpCanonical_(withoutDate) !== helpCanonical_(request)) throw new Error('This request ID already belongs to a different request.');
    } else helpAppend_(TV_HELP_REQUESTS_TAB,TV_HELP_REQUEST_HEADERS,{request_id:request.request_id,project:request.project,item_id:request.item_id,
      question_json:JSON.stringify(request.question),source_label_json:JSON.stringify(request.source_label),source_url:request.source_url,
      source_context_json:helpCanonical_(request.source_context),created_at:helpNow_()});
    var answered = helpPublicReplies_().some(function(r){return r.request_id === request.request_id;});
    return {ok:true,request_id:request.request_id,status:answered ? 'answered' : 'pending'};
  });
}
function helpActiveTeacher_() {
  var email = String(Session.getActiveUser().getEmail() || '').trim().toLowerCase();
  if (!email || !isAllowlisted_(email)) throw new Error('An authorised teacher must sign in.');
  return email;
}
function helpProjectAllowed_(email,project) {
  var scope = teacherScope_(email);
  if (!scope.projects) return true;
  var subject = String((registryMap_()[project] || {}).subject || '').toLowerCase();
  return scope.projects.indexOf(project.toLowerCase()) >= 0 || !!(subject && scope.projects.indexOf(subject) >= 0);
}
function tvHelpInbox() {
  var email = helpActiveTeacher_(), replies = helpPublicReplies_();
  return {ok:true,requests:helpRequestRows_().filter(function(request){return helpProjectAllowed_(email,request.project);}).map(function(request){
    var found = replies.filter(function(reply){return reply.request_id === request.request_id;}), reply = found.length ? found[found.length-1] : null;
    request.status = reply ? 'answered' : 'pending';request.reply = reply;return request;
  })};
}
function helpPublishFields_(value,request) {
  var question = helpText_(value.question,4000,true), answer = helpText_(value.answer,12000,true);
  if (value.reviewed_public_question !== true) throw new Error('Review the public question and answer for pupil names before publishing.');
  return {question:question,answer:answer};
}
function helpSecretForTeacher_() {
  helpActiveTeacher_();
  return helpLock_(function(){
    var props = PropertiesService.getScriptProperties(), secret = props.getProperty(TV_HELP_SECRET_KEY);
    if (!secret) { secret = Utilities.getUuid().replace(/-/g,'') + Utilities.getUuid().replace(/-/g,'');props.setProperty(TV_HELP_SECRET_KEY,secret); }
    return secret;
  });
}
function helpHex_(bytes) { return bytes.map(function(byte){return ('0'+(byte&255).toString(16)).slice(-2);}).join(''); }
function helpSignature_(payload,secret) { return helpHex_(Utilities.computeHmacSha256Signature(helpCanonical_(payload),secret,Utilities.Charset.UTF_8)); }
function helpSameSignature_(a,b) { if (typeof a !== 'string' || a.length !== b.length) return false;var diff = 0;for(var i=0;i<a.length;i++) diff |= a.charCodeAt(i)^b.charCodeAt(i);return diff === 0; }
function tvHelpPublish(input) {
  var email = helpActiveTeacher_();helpKeys_(input,['request_id','question','answer','reviewed_public_question']);
  var id = helpUuid_(input.request_id), request = helpRequestRows_().filter(function(r){return r.request_id === id;})[0];
  if (!request || !helpProjectAllowed_(email,request.project)) throw new Error('This clarification is unavailable.');
  var fields = helpPublishFields_(input,request);
  if (!/^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(TV_HELP_OWNER_URL)) throw new Error('The clarification publisher has not been configured.');
  var payload = {operation:'publish',timestamp:Date.now(),nonce:Utilities.getUuid().toLowerCase(),teacher:email,
    request_id:id,question:fields.question,answer:fields.answer,reviewed_public_question:true};
  var envelope = {action:'ppq_help_publish',payload:payload,signature:helpSignature_(payload,helpSecretForTeacher_())};
  var response = UrlFetchApp.fetch(TV_HELP_OWNER_URL,{method:'post',contentType:'application/json',payload:JSON.stringify(envelope),muteHttpExceptions:true,followRedirects:true});
  var result;try { result = JSON.parse(response.getContentText()); } catch (_) { throw new Error('The publisher returned an unreadable response. Your draft is unchanged.'); }
  if (response.getResponseCode() !== 200 || !result || result.ok !== true || !result.reply) throw new Error(result && result.error || 'The reply could not be published.');
  return {ok:true,reply:result.reply};
}
function helpReceivePublication_(raw) {
  helpKeys_(raw,['action','payload','signature']);
  var payload = raw.payload;helpKeys_(payload,['operation','timestamp','nonce','teacher','request_id','question','answer','reviewed_public_question']);
  var age = Date.now()-payload.timestamp;
  if (payload.operation !== 'publish' || !Number.isInteger(payload.timestamp) || age > 300000 || age < -30000) throw new Error('Expired publication authorisation.');
  helpText_(payload.question,4000,true);helpText_(payload.answer,12000,true);
  helpUuid_(payload.nonce);helpUuid_(payload.request_id);
  if (typeof payload.teacher !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.teacher) || payload.teacher.length > 254) throw new Error('Invalid teacher authorisation.');
  if (typeof raw.signature !== 'string' || !/^[0-9a-f]{64}$/.test(raw.signature)) throw new Error('Invalid publication signature.');
  var secret = PropertiesService.getScriptProperties().getProperty(TV_HELP_SECRET_KEY);
  if (!secret || !helpSameSignature_(raw.signature,helpSignature_(payload,secret))) throw new Error('Invalid publication signature.');
  return helpLock_(function(){
    if (helpRows_(TV_HELP_NONCES_TAB,TV_HELP_NONCE_HEADERS).some(function(row){return row.nonce === payload.nonce;})) throw new Error('Publication authorisation has already been used.');
    var request = helpRequestRows_().filter(function(row){return row.request_id === payload.request_id;})[0];
    if (!request || !isAllowlisted_(payload.teacher) || !helpProjectAllowed_(payload.teacher,request.project)) throw new Error('This clarification is unavailable.');
    var fields = helpPublishFields_(payload,request);
    var existing = helpPublicReplies_().filter(function(reply){return reply.request_id === request.request_id && reply.question === fields.question && reply.answer === fields.answer;});
    var reply = existing.length ? existing[existing.length-1] : {id:Utilities.getUuid().toLowerCase(),request_id:request.request_id,project:request.project,item_id:request.item_id,
      question:fields.question,answer:fields.answer,published_at:helpNow_(),source_label:request.project+' · '+request.item_id,source_url:helpPublicUrl_(request.source_url)};
    if (!existing.length) helpAppend_(TV_HELP_REPLIES_TAB,TV_HELP_REPLY_HEADERS,{id:reply.id,request_id:reply.request_id,project:reply.project,item_id:reply.item_id,
      question_json:JSON.stringify(reply.question),answer_json:JSON.stringify(reply.answer),published_at:reply.published_at,source_label_json:JSON.stringify(reply.source_label),source_url:reply.source_url});
    helpAppend_(TV_HELP_NONCES_TAB,TV_HELP_NONCE_HEADERS,{nonce:payload.nonce,used_at:helpNow_(),payload_hash:helpHex_(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,helpCanonical_(payload),Utilities.Charset.UTF_8))});
    return {ok:true,reply:reply};
  });
}

