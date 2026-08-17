/* =============================================================================
 * ppq-login.js — estate shared sign-in + attempt pulse for ppqviewer pages
 * (QoderWork 2026-07-22)
 *
 * Adopts the estate's shared login verbatim (EdTech packet:
 * "shared_login_and_pulse_adoption", as first built by Linguics pulse.js):
 *   - ONE shared Apps Script endpoint, ONE workbook; each POST carries a
 *     `project` tag and the script routes it to its own tab automatically.
 *     Adding a page needs NO redeploy.
 *   - identity SHARED with the physics drillers via localStorage key
 *     smithics_fields_identity_v1 (anonymous_id + display_name common), so a
 *     pupil signs in once across the estate and their name prefills here;
 *   - cohort SCOPED per page: held under the page's OWN key, never written into
 *     the shared object (that holds the physics class), sent as `cohort` on
 *     every POST (a pupil may be in a different class per subject);
 *   - class comes from a supplied DROPDOWN list (interim hardcoded until
 *     TeacherViewer milestone M2 ships the single-source doGet);
 *   - fail-soft everywhere: a pulse must never break the viewer.
 *
 * This is the lightweight bridge login, NOT the real account tier: the estate's
 * long-run FastAPI-plus-OAuth accounts remain the destination (ppqviewer d008).
 * google_email stays empty for now, estate-wide.
 * ========================================================================== */
(function () {
  "use strict";

  var REPORT_URL = "https://script.google.com/macros/s/AKfycbwQ2NxNi-AWGCpBVDa6nT9DDYsS66F53ENZvtZozDwuWkKaivqgLaGUyjSFd_InJ4Kt/exec";
  var SHARED_IDENTITY_KEY = "smithics_fields_identity_v1"; /* estate-wide shared identity */

  function uuid() {
    try { return crypto.randomUUID(); } catch (e) {
      return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0; return (c === "x" ? r : (r & 0x3 | 0x8)).toString(16);
      });
    }
  }

  function readShared() {
    try { var o = JSON.parse(localStorage.getItem(SHARED_IDENTITY_KEY)); return (o && typeof o === "object") ? o : {}; }
    catch (e) { return {}; }
  }
  function writeShared(o) { try { localStorage.setItem(SHARED_IDENTITY_KEY, JSON.stringify(o)); } catch (e) {} }

  function sessionId() {
    try { var s = sessionStorage.getItem("ppq_session_id"); if (!s) { s = uuid(); sessionStorage.setItem("ppq_session_id", s); } return s; }
    catch (e) { return "no-session-storage"; }
  }

  /* One login instance is scoped to a single page: one project tag, one cohort
     key, one supplied class list. opts: { projectTag, cohortKey, classes, onStatus } */
  function createLogin(opts) {
    opts = opts || {};
    var projectTag = opts.projectTag || "ppqviewer";
    var cohortKey = opts.cohortKey || (projectTag + "_cohort_v1");
    var classes = opts.classes || [];

    function cohort() { try { return localStorage.getItem(cohortKey) || ""; } catch (e) { return ""; } }
    function current() {
      var sh = readShared();
      return { anonymous_id: sh.anonymous_id || "", display_name: sh.display_name || "", cohort: cohort() };
    }
    function signedIn() { var id = current(); return !!(id.display_name && id.cohort); }

    function flash(msg) { if (opts.onStatus) { try { opts.onStatus(msg); } catch (e) {} } }
    function post(payload) {
      if (!REPORT_URL || REPORT_URL.indexOf("script.google.com") === -1) return;
      try {
        fetch(REPORT_URL, { method: "POST", mode: "no-cors",
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify(payload), keepalive: true })
          .then(function () { flash("sent"); })
          .catch(function () { flash("offline"); });
      } catch (e) { flash("offline"); }
    }

    function basePayload() {
      var id = current();
      return { project: projectTag, timestamp: new Date().toISOString(),
        anonymous_id: id.anonymous_id, display_name: id.display_name, cohort: id.cohort,
        google_email: "", session_id: sessionId() };
    }
    /* The seventeen columns the estate workbook's Apps Script recognises. Any
       OTHER top-level key in the POST body is what the script sweeps into its
       own `extra_json` column: the column is built server-side and a
       client-built `extra_json` field is discarded. */
    var FIXED_COLUMNS = {
      project: 1, timestamp: 1, anonymous_id: 1, display_name: 1, cohort: 1,
      google_email: 1, session_id: 1, item_id: 1, topic: 1, qtype: 1, mode: 1,
      level: 1, status: 1, picked_id: 1, misconception_id: 1, received_at: 1,
      extra_json: 1
    };

    /* Merge identity under the engine's event payload (the engine's fields win),
       then FLATTEN the engine's extra bundle to top-level scalars.

       Why (EdTech Overview packet 2026-08-06, verified in this code): the
       engine stringifies its per-event detail into `extra_json` at 26 firing
       sites, and the deployed script throws that key away, so every rated,
       interrogation, timing_prefs, flag_review and learned_scope row has been
       landing with its entire informational content missing, and every
       answered row losing correct/time_ms/time_pressure. Nothing showed it: a
       no-cors POST resolves on dispatch, so the pill said "sent" when it meant
       "dispatched". Linguics hit the same thing live on 2026-07-21 and fixed
       it the same way; their rows have populated since.

       Three properties this must keep: never shadow a fixed column; pre-
       stringify nested values, because the sweep writes scalars; never lose a
       malformed payload silently. */
    function report(partial) {
      if (!signedIn()) return;
      var p = Object.assign(basePayload(), partial || {});
      var extra = p.extra_json;
      delete p.extra_json;
      if (extra) {
        try {
          var o = (typeof extra === "string") ? JSON.parse(extra) : extra;
          if (o && typeof o === "object") {
            Object.keys(o).forEach(function (k) {
              if (FIXED_COLUMNS[k] || Object.prototype.hasOwnProperty.call(p, k)) return;
              var v = o[k];
              var nested = (v !== null && typeof v === "object");
              p[nested ? (k + "_json") : k] = nested ? JSON.stringify(v) : v;
            });
          } else {
            p.extra_raw = String(extra);
          }
        } catch (e) { p.extra_raw = String(extra); }
      }
      post(p);
    }
    function sendSessionStart() {
      var p = basePayload();
      p.item_id = ""; p.topic = ""; p.qtype = ""; p.mode = "ppq_viewer"; p.level = "";
      p.status = "session_start"; p.picked_id = ""; p.misconception_id = "";
      post(p);
    }

    /* Sign in: PRESERVE every unknown key in the shared object (the physics
       drillers rely on it); never touch shared.cohort (that is the physics
       class); this page's class lives only under cohortKey. */
    function signIn(displayName, cohortVal) {
      var sh = readShared();
      if (!sh.anonymous_id) sh.anonymous_id = uuid();
      sh.display_name = String(displayName || "").trim();
      if (sh.google_email === undefined) sh.google_email = "";
      writeShared(sh);
      try { localStorage.setItem(cohortKey, String(cohortVal || "")); } catch (e) {}
      sendSessionStart();
      return current();
    }
    /* Log out = clear THIS page's class only (the gate reasks; the shared
       name + anonymous_id stay, so the physics drillers are untouched and the
       name prefills next time). */
    function signOut() { try { localStorage.removeItem(cohortKey); } catch (e) {} }

    /* Wire a gate: name input (prefilled from the shared estate identity),
       class <select> built from the supplied list, and a start button.
       els: { name, classSelect, start }; onEnter(identity) fires on success. */
    function wireGate(els, onEnter) {
      els = els || {};
      var sh = readShared();
      if (els.name && sh.display_name) els.name.value = sh.display_name;
      if (els.classSelect) {
        els.classSelect.innerHTML = "";
        var ph = document.createElement("option"); ph.value = ""; ph.textContent = "Choose your class\u2026";
        els.classSelect.appendChild(ph);
        classes.forEach(function (c) {
          var o = document.createElement("option"); o.value = c; o.textContent = c; els.classSelect.appendChild(o);
        });
        var pre = cohort(); if (pre) els.classSelect.value = pre;
      }
      if (els.start) els.start.addEventListener("click", function () {
        var name = els.name ? els.name.value.trim() : "";
        var cls = els.classSelect ? els.classSelect.value : "";
        if (!name) { if (els.name) els.name.focus(); return; }
        if (!cls) { if (els.classSelect) els.classSelect.focus(); return; }
        signIn(name, cls);
        if (onEnter) onEnter(current());
      });
    }

    return { current: current, signedIn: signedIn, signIn: signIn, signOut: signOut,
      report: report, sendSessionStart: sendSessionStart, wireGate: wireGate, classes: classes.slice() };
  }

  /* ---------------------------------------------------------------------
     mountGate: the whole sign-in gate, injected, for consumers that do not
     want to hand-roll it.

     WHY (d024, Smith 2026-08-06, "we must put a sign-in gate in front of
     both"): ESAT's gate is 90 lines of markup, CSS and fallback wiring hand
     written into `esat-compare.html`. Repeating that per consumer is how
     three drillers end up with three subtly different sign-ins and one of
     them silently stops pulsing. IB Maths and Economics use this instead, and
     ESAT can migrate onto it on a later touch; until then `test_pulse.js`
     asserts every gate offers the same fields, so they cannot drift apart
     unnoticed.

     Everything ESAT's hand-rolled gate does, this does:
       - the class dropdown is populated FIRST, before anything that can fail,
         so a pupil is never met with a blank list;
       - if this script did not load at all the consumer falls back to a local
         gate, so nobody is ever locked out (that half stays consumer-side,
         necessarily: this function cannot run if the file is missing);
       - the shared estate name prefills, and the class is scoped to this page
         so it never clobbers a pupil's physics class.

     opts: { title, subtitle, projectTag, cohortKey, classes[], appEl,
             gateEl (optional; created if absent), onStatus, onEnter }
     Returns { report, login, signedIn } — `report` is safe to hand straight
     to PPQViewer.mount even when sign-in never happens. */
  function mountGate(opts) {
    opts = opts || {};
    var doc = window.document;
    var appEl = typeof opts.appEl === "string" ? doc.getElementById(opts.appEl) : opts.appEl;

    if (!doc.getElementById("ppq-gate-style")) {
      var st = doc.createElement("style");
      st.id = "ppq-gate-style";
      st.textContent =
        "#ppq-sign-in-gate{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:80vh;gap:1rem;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif}" +
        "#ppq-sign-in-gate h2{margin:0;color:#1a1a17}" +
        "#ppq-sign-in-gate input,#ppq-sign-in-gate select{padding:.5rem 1rem;font-size:1rem;border:1px solid #ccc;border-radius:6px;width:240px;background:#fff;color:#1a1a17}" +
        "#ppq-sign-in-gate button{padding:.5rem 2rem;font-size:1rem;background:#3182ce;color:#fff;border:none;border-radius:6px;cursor:pointer}" +
        "#ppq-sign-in-gate button:hover{background:#2b6cb0}" +
        "#ppq-sign-in-gate .ppq-gate-hint{font-size:.85rem;color:#8c8579;max-width:26rem;text-align:center}" +
        "#ppq-report-flash{position:fixed;bottom:12px;right:12px;font-size:.75rem;color:#48bb78;opacity:0;transition:opacity .3s}";
      doc.head.appendChild(st);
    }

    var gate = opts.gateEl || doc.getElementById("ppq-sign-in-gate");
    if (!gate) {
      gate = doc.createElement("div");
      gate.id = "ppq-sign-in-gate";
      gate.innerHTML =
        '<h2></h2><input id="ppq-si-name" placeholder="Your name" autocomplete="name">' +
        '<select id="ppq-si-class"></select><button id="ppq-si-start">Start</button>' +
        '<p class="ppq-gate-hint"></p>';
      if (appEl && appEl.parentNode) appEl.parentNode.insertBefore(gate, appEl);
      else doc.body.appendChild(gate);
    }
    gate.querySelector("h2").textContent = opts.title || "Past-Paper Viewer";
    gate.querySelector(".ppq-gate-hint").textContent = opts.subtitle ||
      "Sign in with the same name you use for the other drillers. Your class pulse goes to the shared teacher tracker.";

    var flashEl = doc.getElementById("ppq-report-flash");
    if (!flashEl) {
      flashEl = doc.createElement("div"); flashEl.id = "ppq-report-flash"; doc.body.appendChild(flashEl);
    }
    function flash(msg) {
      flashEl.textContent = msg; flashEl.style.opacity = "1";
      setTimeout(function () { flashEl.style.opacity = "0"; }, 1500);
      if (opts.onStatus) { try { opts.onStatus(msg); } catch (e) {} }
    }

    var nameEl = gate.querySelector("#ppq-si-name");
    var classEl = gate.querySelector("#ppq-si-class");
    var startEl = gate.querySelector("#ppq-si-start");

    /* Populated first, and never left blank. */
    var list = (opts.classes || []).slice();
    classEl.innerHTML = "";
    var ph = doc.createElement("option"); ph.value = ""; ph.textContent = "Choose your class…";
    classEl.appendChild(ph);
    list.forEach(function (c) { var o = doc.createElement("option"); o.value = c; o.textContent = c; classEl.appendChild(o); });

    if (appEl) appEl.style.display = "none";
    function enter() {
      gate.style.display = "none";
      if (appEl) appEl.style.display = "block";
      if (opts.onEnter) { try { opts.onEnter(); } catch (e) {} }
    }

    var login = createLogin({
      projectTag: opts.projectTag, cohortKey: opts.cohortKey,
      classes: list, onStatus: flash
    });
    if (login.signedIn()) enter();
    login.wireGate({ name: nameEl, classSelect: classEl, start: startEl }, enter);

    return {
      login: login,
      signedIn: login.signedIn,
      report: function (partial) { try { login.report(partial); } catch (e) {} }
    };
  }

  window.PPQLogin = { createLogin: createLogin, mountGate: mountGate,
    REPORT_URL: REPORT_URL, SHARED_IDENTITY_KEY: SHARED_IDENTITY_KEY };
})();
