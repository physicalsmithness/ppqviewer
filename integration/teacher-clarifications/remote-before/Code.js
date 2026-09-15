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

var COLUMNS = [
  'received_at','timestamp','project','anonymous_id','display_name','cohort',
  'google_email','session_id','item_id','topic','qtype','mode','level',
  'status','picked_id','misconception_id','extra_json'
];

// Columns never served to the teacher page (they stay in the Sheet).
var PRIVATE_COLUMNS = { google_email: true };

// Tab names that are NOT project response tabs.
var RESERVED_TABS = { classes: true, teachers: true, pupils: true, projects: true };

// Tab icon note: Apps Script's setFaviconUrl only accepts a HOSTED raster image
// (png/ico/gif/jpg); an SVG or a data URI throws "favicon icon image type is not
// supported" and takes down doGet. To set the smithics favicon, host
// app/smithics-favicon.png on Pages and add
// .setFaviconUrl('https://physicalsmithness.github.io/.../smithics-favicon.png')
// to the doGet returns below.

/* ------------------------- pupil write path (unchanged) ------------------ */

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

/* ------------------------- teacher read path (tt-3) ---------------------- */

function doGet() {
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

function tvGetRows(project, since) {
  requireAllowlisted_();
  if (!project) throw new Error('tvGetRows needs a project');
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
  var header = values[0].map(String);
  var out = [];
  for (var i = 1; i < values.length; i++) {
    var obj = {}, rawEmail = '';
    for (var j = 0; j < header.length; j++) {
      var h = header[j], v = values[i][j];
      if (h === 'google_email') { rawEmail = String(v).trim().toLowerCase(); continue; }
      if (PRIVATE_COLUMNS[h]) continue;
      obj[h] = (v instanceof Date) ? v.toISOString() : v;
    }
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
  if (!email) { try { email = Session.getEffectiveUser().getEmail() || ''; } catch (err2) {} }
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
