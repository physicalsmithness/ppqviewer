/* Shared adapter for the estate's existing append-only attempt logger.
 * Reads only the event's exact attempt; never replays or rewrites local history. */
(function () {
  "use strict";
  var REPORT_URL = "https://script.google.com/macros/s/AKfycbwQ2NxNi-AWGCpBVDa6nT9DDYsS66F53ENZvtZozDwuWkKaivqgLaGUyjSFd_InJ4Kt/exec";
  var owns = function (o, k) { return Object.prototype.hasOwnProperty.call(o, k); };
  function isLive(meta, location) {
    return !!(meta && meta.course === "ib" && meta.release && location &&
      location.protocol === "https:" && location.hostname === "physicalsmithness.github.io" &&
      /^\/ibphysicsppqs(?:\/|$)/.test(location.pathname));
  }
  function create(opts) {
    // Consumers own their live-site enablement and subject identity. Preserve
    // physics defaults for existing pages that use the original adapter name.
    var projectTag = opts.projectTag || "ppqviewer_ibphysics";
    var reportingVersion = opts.reportingVersion || "ibphysics-1";
    function report(event) {
      if (!opts.enabled || !event || !["answered", "rated", "timing_prefs"].includes(event.status)) return;
      var person = opts.identity.current() || {};
      if (!person.signed_in || !person.anonymous_id || !person.display_name || !person.cohort) return;
      var v = opts.viewer(), p = {}, extra = {};
      Object.keys(event || {}).forEach(function (k) { if (k !== "extra_json") p[k] = event[k]; });
      try { extra = typeof event.extra_json === "string" ? JSON.parse(event.extra_json || "{}") : (event.extra_json || {}); } catch (_) { p.extra_raw = String(event.extra_json); }
      if (extra && typeof extra === "object" && !Array.isArray(extra)) Object.keys(extra).forEach(function (k) {
        if (!owns(p, k) && !["__proto__", "constructor", "prototype"].includes(k)) p[k] = extra[k];
      });
      if (event.status === "timing_prefs" && !p.time_discard_retro && !p.time_deleted_historical) return;
      var itemId = String(p.time_deleted_historical ? extra.item_id || "" : p.item_id || ""), attemptId = p.attempt_id || "", row = null;
      var attempts = v && v.store && v.store.attempts || [];
      if (p.status === "rated" && v && v._reviewingAttempt && String(v._reviewingAttempt.id) === itemId) {
        row = v._reviewingAttempt;
      } else {
        if (!attemptId && v && v.cur && String(v.cfg.idOf(v.cur)) === itemId) attemptId = v._attemptId || "";
        if (attemptId) row = attempts.find(function (a) { return a.attempt_id === attemptId && String(a.id) === itemId; });
      }
      // A shared browser may hold another person's work. Never relabel it as
      // the current learner, including a C change made while reviewing it.
      if (row && (!attempts.includes(row) || row.learner_id !== person.anonymous_id)) return;
      if (v && v.cfg.learnerId !== person.anonymous_id) return;
      if (p.status === "answered" && !row) return;
      if (row) {
        p.attempt_id = row.attempt_id;
        p.attempt_timestamp = row.ts;
        ["correct", "time_ms", "time_discarded", "timing_mode", "learner_level", "app_version", "pre_guess_declaration"].forEach(function (k) {
          if (owns(row, k)) p[k] = row[k];
        });
        // Keep ratings as linked judgments, not duplicate scored attempts.
        if (p.status === "answered") {
          ["marks_max", "marks_awarded", "marks_range", "sure"].forEach(function (k) { if (owns(row, k)) p[k] = row[k]; });
          if (!owns(p, "marks_max") && /^[ABCD]$/.test(row.chosen_option || "") && typeof row.correct === "boolean") { p.marks_max = 1; p.marks_awarded = row.correct ? 1 : 0; }
          var scored = Number.isFinite(p.marks_max) && p.marks_max > 0 && Number.isFinite(p.marks_awarded) && p.marks_awarded >= 0 && p.marks_awarded <= p.marks_max;
          p.outcome = owns(p, "marks_range") || !scored ? "unknown" : p.marks_awarded === p.marks_max ? "correct" : p.marks_awarded === 0 ? "wrong" : "half";
        }
      } else {
        // A C judgment before an answer is independent, with no invented attempt.
        delete p.attempt_id;
      }
      if (p.status === "timing_prefs" && !row) return;
      var q = v && v.byId && v.byId[itemId];
      if (!q) q = (opts.questions || []).find(function (question) { return String(question.id) === itemId; });
      if (q) ["source_part_id", "parent_id", "question_number", "label", "topic_codes", "analysis_groups", "analysis_atoms", "analysis_types", "year", "paper", "level", "current_topic_levels"].forEach(function (k) {
        if (owns(q, k)) p[k] = q[k];
      });
      p.project = projectTag;
      p.anonymous_id = person.anonymous_id; p.display_name = person.display_name; p.cohort = person.cohort;
      p.google_email = "";
      p.row_type = p.status === "answered" ? "attempt" : p.status === "rated" ? "rating" : "event";
      p.event_status = event.status;
      p.question_id = itemId;
      // The deployed legacy teacher view counts item-bearing records. Only
      // completed attempts carry item_id; related judgments join by attempt_id.
      p.item_id = p.row_type === "attempt" ? itemId : "";
      if (p.row_type === "attempt") p.status = p.outcome;
      p.timestamp = p.timestamp || new Date().toISOString();
      p.mode = "ppq_viewer";
      p.reporting_version = reportingVersion;
      // The older deployed receiver discards client extra_json. Send details
      // at the top level, matching ESAT/Maths; nested values retain their shape.
      Object.keys(p).forEach(function (k) {
        if (p[k] !== null && typeof p[k] === "object") { p[k + "_json"] = JSON.stringify(p[k]); delete p[k]; }
        else if (p[k] === undefined) delete p[k];
      });
      try {
        return window.fetch(REPORT_URL, { method: "POST", mode: "no-cors", keepalive: true,
          headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(p) }).catch(function () {
          // Local marking already succeeded. Do not retry an ambiguous append
          // or claim the opaque browser response confirms spreadsheet receipt.
        });
      } catch (_) { /* Reporting must not interrupt saved practice. */ }
    }
    return { report: report };
  }
  window.PPQReporting = window.PhysicsReporting = { create: create, isLive: isLive, REPORT_URL: REPORT_URL };
})();
