/* ppqviewer, the estate's shared past-paper-question viewer engine.
   Neutral home: C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\
   Owned by no subject. Consumers supply only a config object and their questions.

   Design (see DESIGN.md / DECISIONS.md):
   - Option A (d003, q02): the engine builds ALL on-screen furniture into one mount.
     Consumers ship a single div plus config + data, nothing visual.
   - Embed-safe (d009): everything scoped to the passed-in root, held on the instance,
     no global element IDs, no reliance on owning body. Standalone page OR bolt-on.
   - Storage (d001, d002): flat attempts log + scores map, keyed off a REQUIRED
     namespaced config.storageKey. Dashboard derived from the log.
   - Self-report (d006): 1-to-6 is the DEFAULT, defined in config.selfReport.
   - Prefetch (d005): one parametrised function, depth config.prefetchAhead, answer
     image warmed separately.

   v0.2 (Phase 3) adds the pluggable question-type system and chemistry's modules:
   - questionType(q): "imageSelfMark" (ESAT default) | "mcq" | "flashcard"
   - module referenceBooklet: data-booklet/reference-page deep-link
   - module structuredPaper: multi-part navigator, whole-question vs part-by-part
     modes, original-page peek-back heuristic
   - module math: KaTeX/mhchem rendering
   - dashboardLayout "split": chemistry's two-column syllabus dashboard

   Usage:  const viewer = PPQViewer.mount(rootElement, { config, questions, meta });
*/
window.PPQViewer = (function () {
  "use strict";

  const DEFAULT_RAMP = { 1: "229,62,62", 2: "221,107,32", 3: "214,158,46", 4: "72,187,120", 5: "56,161,105", 6: "47,133,90" };

  /* QoderWork 2026-07-22: canonical meaning of each point on the 1-6 self-report
     scale, as defined by Smith. Surfaced as a tooltip on each scale button plus a
     legend beneath the scale (d006). Consumers may override via
     config.selfReport.meanings. */
  const DEFAULT_SCALE_MEANINGS = [
    "No idea",
    "Don't fully understand",
    "Got it wrong, but now I've seen the answer I get it",
    "Got it right, but it's not stable — I might miss it tomorrow",
    "Got it — strong and comfortable",
    "Trivial — never need to see this again"
  ];

  function el(tag, attrs, html) {
    const n = document.createElement(tag);
    if (attrs) for (const k in attrs) {
      if (k === "class") n.className = attrs[k];
      else if (k === "style") n.style.cssText = attrs[k];
      else if (k.slice(0, 5) === "data-") n.setAttribute(k, attrs[k]);
      else n[k] = attrs[k];
    }
    if (html != null) n.innerHTML = html;
    return n;
  }
  function esc(s) { return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
  /* Analysis records deliberately use a lightweight, tool-friendly maths notation
     such as sqrt(2), 4sqrt(2) and p^2q^2. Keep that authoring format in the JSON,
     but do not expose it to pupils. This formatter is text-only: it introduces
     Unicode maths characters, then escapes the whole result before it reaches
     innerHTML. */
  function analysisMathEsc(s) {
    const superscript = {
      "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴",
      "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹",
      "+": "⁺", "-": "⁻"
    };
    let text = String(s == null ? "" : s);
    /* Simple numeric or one-letter radicands lose redundant brackets; longer
       expressions retain them. A non-letter prefix allows 4sqrt(2), while avoiding
       accidental rewrites inside ordinary words such as mysqrt2. Running the two
       parenthesised passes in this order also handles a simple nested root. */
    text = text.replace(/(^|[^A-Za-z_])sqrt\s*\(\s*([A-Za-z]|\d+(?:\.\d+)?)\s*\)/gi,
      function (_, prefix, radicand) { return prefix + "√" + radicand; });
    text = text.replace(/(^|[^A-Za-z_])sqrt\s*\(\s*([^()]+?)\s*\)/gi,
      function (_, prefix, radicand) { return prefix + "√(" + radicand + ")"; });
    text = text.replace(/(^|[^A-Za-z_])sqrt\s*([A-Za-z]+|\d+(?:\.\d+)?)/gi,
      function (_, prefix, radicand) {
        return prefix + "√" + (/^[A-Za-z]$|^\d/.test(radicand) ? radicand : "(" + radicand + ")");
      });
    text = text.replace(/\^([+-]?\d+)/g, function (_, power) {
      return power.split("").map(function (ch) { return superscript[ch] || ch; }).join("");
    });
    return esc(text);
  }
  function shuffleInPlace(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

  // ------------------------------------------------------------------ Viewer
  function Viewer(root, config, questions, meta, report) {
    this.root = root;
    this.cfg = this._withDefaults(config);
    this.questions = questions || [];
    this.meta = meta || {};
    /* QoderWork 2026-07-22: optional report callback, fired on every attempt
       and self-rating. Payload matches the estate teacher-tracking.gs schema
       (project, timestamp, item_id, topic, qtype, status, picked_id, extra_json).
       The hosting page supplies the callback + identity; the engine stays
       transport-agnostic. */
    this.report = typeof report === "function" ? report : null;
    this._sessionId = "ppq_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

    this.view = [];
    this.idx = -1;
    this.cur = null;
    this.answered = false;
    this.shownAt = 0;
    this.groupFilter = null;
    this._answerLabels = [];
    this._curType = "imageSelfMark";
    this._attemptId = ""; /* QoderWork 2026-07-22 (analyst handoff): per-displayed-attempt id */
    this._preGuessDeclaration = null; /* QoderWork 2026-07-22 (analyst handoff): pre-answer guess snapshot */
    this._answerRevealPending = false;

    this.byId = {};
    const idOf = this.cfg.idOf;
    this.questions.forEach((q) => { this.byId[idOf(q)] = q; });

    this.store = this._loadStore();
    // structured-paper viewing mode, remembered per consumer (d006 spirit: remember choices)
    this._structMode = localStorage.getItem(this.cfg.storageKey + "_structmode") || "whole";
  }

  Viewer.prototype._withDefaults = function (c) {
    if (!c || !c.storageKey) throw new Error("PPQViewer: config.storageKey is required and must be unique (d002). Refusing to run with a bare/absent key.");
    const cfg = Object.assign({}, c);
    cfg.title = cfg.title || "Past-paper viewer";
    cfg.versionLabel = cfg.versionLabel || "";
    cfg.appVersion = cfg.appVersion || "ppqviewer-0";
    cfg.learnerId = cfg.learnerId || "local";
    cfg.timingMode = cfg.timingMode || "none";
    cfg.showTimerUI = !!cfg.showTimerUI;
    cfg.prefetchAhead = cfg.prefetchAhead == null ? 3 : cfg.prefetchAhead;
    cfg.filters = cfg.filters || [];
    cfg.dashboardLayout = cfg.dashboardLayout || "single";
    cfg.dashboardColumns = cfg.dashboardColumns || null;
    cfg.dashboardTitle = cfg.dashboardTitle || "Mastery";
    /* Optional scope counter: keep the ordinary shown count, but compare it with
       the same active view before one or more launch filters are applied. This is
       useful when a safe default (for example, in-spec only) would otherwise look
       as though questions had disappeared from the estate. */
    cfg.counterScope = cfg.counterScope || null;
    /* Opt in when the analysis side sheet hides the dashboard: its sticky bar can
       retain the current broad-group label without imposing that wording on every
       consumer of the shared engine. */
    cfg.analysisReminderGroup = !!cfg.analysisReminderGroup;
    cfg.optionsLeft = !!cfg.optionsLeft; /* QoderWork 2026-07-22: letter picker in a left rail (MCQ subjects) */
    /* QoderWork 2026-07-22: optional exam timer. Silent capture (time_ms on every
       attempt) is ALWAYS on; this gates the VISIBLE clock, time-banking, and the
       time-pressure context that lets a fast answer be told apart from a guess
       (Smith: a pupil only answers in 8s if they truly had 8s left). prominence is
       the "in-your-face-ness" axis — "hidden" records quietly with no clock shown. */
    if (cfg.timer) {
      const tt = cfg.timer;
      cfg.timer = {
        mode: tt.mode === "up" ? "up" : "down",
        perQuestionSec: tt.perQuestionSec || 90,
        banking: !!tt.banking,
        bankSec: tt.bankSec || 0,
        prominence: (tt.prominence === "hidden" || tt.prominence === "prominent") ? tt.prominence : "subtle",
        pressureSec: tt.pressureSec == null ? 10 : tt.pressureSec
      };
    } else { cfg.timer = null; }
    cfg.modules = cfg.modules || {};
    cfg.idOf = cfg.idOf || function (q) { return q.id; };
    cfg.groupKey = cfg.groupKey || function () { return "ALL"; };
    cfg.groupLabel = cfg.groupLabel || function () { return "All"; };
    cfg.isUntagged = cfg.isUntagged || function (k) { return String(k).indexOf("UT_") === 0; };
    const sr = cfg.selfReport || {};
    cfg.selfReport = { levels: sr.levels || 6, prompt: sr.prompt || "How did that feel? (1 = lost, 6 = easy)", labels: sr.labels || null, meanings: sr.meanings || DEFAULT_SCALE_MEANINGS, ramp: sr.ramp || DEFAULT_RAMP };
    cfg.options = cfg.options || { mode: "labels" };
    // per-question hooks
    cfg.cropsOf = cfg.cropsOf || function (q) { return q.crops || (q.crop_url ? [q.crop_url] : []); };
    cfg.correctOf = cfg.correctOf || function (q) { return (q.correct_answer || q.answer_key || "").toString(); };
    cfg.metaLine = cfg.metaLine || function (q) { return cfg.idOf(q); };
    cfg.tagsOf = cfg.tagsOf || function () { return []; };
    cfg.attemptFields = cfg.attemptFields || function () { return {}; };
    cfg.answerUrlOf = cfg.answerUrlOf || function (q) { return q.answer_url || null; };
    cfg.stemUrlOf = cfg.stemUrlOf || function (q) { return q.page_url || null; };
    // v0.2 question-type + module hooks
    cfg.questionType = cfg.questionType || function () { return "imageSelfMark"; };
    cfg.questionTextOf = cfg.questionTextOf || function (q) { return q.question_text || ""; };
    cfg.choicesOf = cfg.choicesOf || function (q) { return q.choices || []; };
    cfg.answerKeyOf = cfg.answerKeyOf || function (q) { return q.answer_key; };
    cfg.markschemeOf = cfg.markschemeOf || function (q) { return q.markscheme_text || ""; };
    cfg.examinerOf = cfg.examinerOf || function (q) { return q.examiner_report || ""; };
    cfg.blockKeyOf = cfg.blockKeyOf || function (q) { return String(cfg.idOf(q)).split("(")[0].trim(); };
    cfg.paperCodeOf = cfg.paperCodeOf || function (q) { return String(cfg.idOf(q)).split(" ")[0]; };
    /* QoderWork 2026-07-22: optional post-question interrogation (postQuestionReview
       module). The hosting page supplies analysisOf(q) returning an analysis record
       (ESAT d028 shape: probe, options, methods, self_report_prompts, feedback) or
       null when a question has no authored analysis. A null record still receives
       the generic guess, feedback and rating flow. */
    cfg.analysisOf = cfg.analysisOf || function () { return null; };
    cfg.feedbackStatusOf = cfg.feedbackStatusOf || null;
    /* VSAFE-01 (Claude 2026-07-28): content-safety gate. A damaged analysis
       record must not render merely because it exists. `withheld` maps record
       id -> reason (the consumer's explicit suppression list); `heuristics`
       (default ON) runs the deterministic damage scan over each record's
       pupil-facing text. Unsafe records fall back to the generic feedback
       shell and can never present as Full or Provisional. */
    const csIn = cfg.contentSafety || {};
    cfg.contentSafety = {
      withheld: csIn.withheld || {},
      heuristics: csIn.heuristics !== false
    };
    cfg.classificationsOf = cfg.classificationsOf || null;
    cfg.questionFinder = !!cfg.questionFinder;
    return cfg;
  };

  Viewer.prototype._loadStore = function () {
    /* VF-07 (Claude 2026-07-28): `flags` — question id -> flagged-at timestamp —
       joins attempts and scores as first-class persisted store state. */
    try { const raw = localStorage.getItem(this.cfg.storageKey); if (raw) { const o = JSON.parse(raw); return { attempts: o.attempts || [], scores: o.scores || {}, flags: o.flags || {} }; } }
    catch (e) { /* corrupt or absent */ }
    // one-time migration from a prior storage shape (e.g. chemistry's two flat maps),
    // so pupils keep their history when a subject moves onto the shared engine.
    if (typeof this.cfg.migrate === "function") {
      try { const seeded = this.cfg.migrate(localStorage); if (seeded) return { attempts: seeded.attempts || [], scores: seeded.scores || {}, flags: seeded.flags || {} }; }
      catch (e) { /* migration is best-effort */ }
    }
    return { attempts: [], scores: {}, flags: {} };
  };
  Viewer.prototype._saveStore = function () { localStorage.setItem(this.cfg.storageKey, JSON.stringify(this.store)); this.renderDashboard(); };

  /* QoderWork 2026-07-22: fire the optional report callback with a payload
     shaped for the estate's shared teacher-tracking.gs endpoint. */
  Viewer.prototype._fireReport = function (partial) {
    if (!this.report) return;
    var cfg = this.cfg;
    var payload = {
      timestamp: new Date().toISOString(),
      session_id: this._sessionId,
      item_id: this.cur ? cfg.idOf(this.cur) : "",
      topic: this.cur ? (cfg.groupKey(this.cur) || "") : "",
      qtype: this._curType || "",
      mode: "ppq_viewer",
      level: "",
      status: "",
      picked_id: "",
      misconception_id: "",
      extra_json: ""
    };
    if (partial) for (var k in partial) payload[k] = partial[k];
    try { this.report(payload); } catch (e) { /* reporting is best-effort */ }
  };

  // ---------------------------------------------------------------- init/DOM
  Viewer.prototype.init = function () { this._buildDom(); this._bindGlobalKeys(); this.filterQuestions(); this.renderDashboard(); this._fireReport({ status: "session_start" }); return this; };
  Viewer.prototype.q = function (sel) { return this.root.querySelector(sel); };
  Viewer.prototype.qa = function (sel) { return Array.prototype.slice.call(this.root.querySelectorAll(sel)); };

  Viewer.prototype._buildDom = function () {
    const cfg = this.cfg;
    this.root.classList.add("ppq");
    this.root.innerHTML = "";

    const header = el("div", { class: "ppq-header" });
    header.appendChild(el("div", { class: "ppq-title" }, esc(cfg.title) + (cfg.versionLabel ? ' <span class="ppq-ver">' + esc(cfg.versionLabel) + "</span>" : "")));
    const filters = el("div", { class: "ppq-filters" });
    if (cfg.headerButtons) cfg.headerButtons.forEach((hb, i) => {
      const b = el("button", { class: "ppq-btn-mini ppq-headbtn", "data-hb": i }, esc(hb.label));
      filters.appendChild(b);
    });
    this._multiSel = {}; /* QoderWork 2026-07-22: per-filter multi-select state (null = all) */
    cfg.filters.forEach((f, i) => {
      if (f.multi) {
        /* QoderWork 2026-07-22: multi-select dropdown filter (Smith: "make the
           standard to be maths and physics… and make it possible to choose the
           other two from the dropdown"). f.default lists the pre-ticked values. */
        this._multiSel[i] = f.default ? new Set(f.default.map(String)) : null;
        const wrap = el("div", { class: "ppq-multifilter", "data-fidx": i });
        wrap.appendChild(el("button", { class: "ppq-multi-btn", type: "button" }));
        wrap.appendChild(el("div", { class: "ppq-multi-panel", style: "display:none;" }));
        filters.appendChild(wrap);
        return;
      }
      const sel = el("select", { class: "ppq-select", "data-fidx": i });
      sel.appendChild(el("option", { value: "ALL" }, esc(f.allLabel || ("All " + (f.label || f.field)))));
      filters.appendChild(sel);
    });
    if (cfg.questionFinder) {
      const finder = el("div", { class: "ppq-finder" });
      finder.appendChild(el("input", {
        class: "ppq-find-input",
        type: "search",
        placeholder: "Find question…",
        ariaLabel: "Find a specific question",
        autocomplete: "off"
      }));
      finder.appendChild(el("div", {
        class: "ppq-find-results",
        role: "listbox",
        style: "display:none;"
      }));
      filters.appendChild(finder);
    }
    const orderSel = el("select", { class: "ppq-select ppq-order" });
    orderSel.appendChild(el("option", { value: "order" }, "In order"));
    orderSel.appendChild(el("option", { value: "shuffle" }, "Shuffle"));
    if (cfg.defaultOrder === "shuffle") orderSel.value = "shuffle"; /* QoderWork 2026-07-22: Smith: "make the standard to be shuffle" */
    filters.appendChild(orderSel);
    filters.appendChild(el("input", { class: "ppq-start", type: "number", min: "1", placeholder: "Start #", style: "display:none;" }));
    /* VF-07 (Claude 2026-07-28): flagged-questions filter toggle. Lives with the
       interrogation module, whose pop-up owns the flag control; hidden until the
       pupil has flagged something. */
    if (cfg.modules.postQuestionReview) {
      filters.appendChild(el("button", {
        class: "ppq-btn-mini ppq-flagged-toggle",
        type: "button",
        style: "display:none;",
        title: "Show only the questions you have flagged"
      }, "Flagged"));
    }
    filters.appendChild(el("span", { class: "ppq-counter" }));
    header.appendChild(filters);
    this.root.appendChild(header);

    const layout = el("div", { class: "ppq-layout" });
    const centre = el("div", { class: "ppq-centre" });
    const card = el("div", { class: "ppq-card", style: "display:none;" });
    card.appendChild(el("div", { class: "ppq-meta" },
      '<span class="ppq-qid"></span><span class="ppq-feedback-status"></span>' +
      '<span class="ppq-tags"></span><span class="ppq-classification-details"></span>'));
    /* QoderWork 2026-07-23: Previous at the TOP — Smith: "there's often a lot of
       white space at the bottom of these questions." The bottom controls stay too. */
    card.appendChild(el("button", { class: "ppq-btn ppq-prev ppq-prev-top", type: "button" }, "← Previous"));
    /* QoderWork 2026-07-22: exam timer display (config.timer). Hidden unless the
       timer module is on and its prominence is not "hidden". */
    card.appendChild(el("div", { class: "ppq-timer", style: "display:none;" }));

    const drawControls = el("div", { class: "ppq-draw-controls" });
    drawControls.innerHTML =
      '<button class="ppq-btn-mini ppq-draw-undo">Undo</button>' +
      '<button class="ppq-btn-mini ppq-draw-clear">Clear</button>' +
      '<span class="ppq-color active" data-color="black"></span><span class="ppq-color" data-color="red"></span>' +
      '<span class="ppq-color" data-color="blue"></span><span class="ppq-color" data-color="green"></span>' +
      '<input type="range" class="ppq-draw-thick" min="1" max="10" value="2">';
    card.appendChild(drawControls);

    const drawContainer = el("div", { class: "ppq-draw-container" });
    drawContainer.appendChild(el("canvas", { class: "ppq-canvas", style: "display:none;" }));
    drawContainer.appendChild(el("div", { class: "ppq-stem" }));

    /* QoderWork 2026-07-22: optional left options rail (config.optionsLeft). For
       multiple-choice subjects (ESAT) the letter buttons sit in a sticky rail to the
       LEFT of the question, so there is no long scroll down to answer. The question
       crop already shows the printed options; the rail is just the picker. Off by
       default so other consumers keep the stacked layout. */
    const optionsEl = el("div", { class: "ppq-options" });
    if (cfg.optionsLeft) {
      const qarea = el("div", { class: "ppq-qarea" });
      qarea.appendChild(optionsEl);
      qarea.appendChild(drawContainer);
      card.appendChild(qarea);
      card.appendChild(el("div", { class: "ppq-struct" }));
    } else {
      card.appendChild(drawContainer);
      card.appendChild(el("div", { class: "ppq-struct" }));   // structured-paper nav + whole-question
      card.appendChild(optionsEl);
    }
    /* QoderWork 2026-07-22 (analyst handoff): pre-answer guess declaration. The
       panel is built per-question by the shared _buildGuessPicker so percentages
       stay OPTIONAL and the same picker powers the post-answer correction inside
       the modal. Label comes from analysis v2 interaction_defaults ("I'm guessing"). */
    const guessDeclare = el("div", { class: "ppq-guess", style: "display:none;" });
    guessDeclare.appendChild(el("button", { class: "ppq-guess-btn", type: "button" }, "I'm guessing"));
    guessDeclare.appendChild(el("div", { class: "ppq-guess-panel", style: "display:none;" }));
    card.appendChild(guessDeclare);

    /* QoderWork 2026-07-22: answer line + the "actually, I wasn't sure" option sit
       on one row (Smith: the option goes "to the right of that"). Tapping it opens
       letter chips so the pupil can say which options they were torn between
       ("I thought it was B or D") — logged, so a lucky right answer can be told
       apart from a confident one. Hidden until the question is answered. */
    const answerRow = el("div", { class: "ppq-answer-row" });
    answerRow.appendChild(el("div", { class: "ppq-answer-line" }));
    const unsure = el("div", { class: "ppq-unsure", style: "display:none;" });
    unsure.innerHTML =
      '<button class="ppq-unsure-btn" type="button">Actually, I wasn\'t sure</button>' +
      '<div class="ppq-unsure-pick" style="display:none;">' +
      '<span class="ppq-unsure-q">I thought it was…</span><span class="ppq-unsure-letters"></span>' +
      '<button class="ppq-unsure-done" type="button">Done</button></div>';
    answerRow.appendChild(unsure);
    card.appendChild(answerRow);

    const controls = el("div", { class: "ppq-controls" });
    controls.innerHTML =
      '<button class="ppq-btn ppq-prev">Previous (←)</button>' +
      '<button class="ppq-btn ppq-reveal">Reveal (Enter)</button>' +
      '<button class="ppq-btn ppq-skip">Skip (S)</button>';
    card.appendChild(controls);

    const answerPanel = el("div", { class: "ppq-answer-panel" });
    answerPanel.innerHTML =
      '<div class="ppq-ms-header"><strong>Markscheme</strong></div>' +
      '<div class="ppq-markscheme"></div>' +
      '<div class="ppq-examiner"><div class="ppq-examiner-title">Examiner report</div><div class="ppq-examiner-body"></div></div>';
    card.appendChild(answerPanel);

    const comp = el("div", { class: "ppq-competence" });
    comp.appendChild(el("div", { class: "ppq-competence-prompt" }, esc(cfg.selfReport.prompt)));
    const scale = el("div", { class: "ppq-scale" });
    const meanings = cfg.selfReport.meanings || [];
    for (let v = 1; v <= cfg.selfReport.levels; v++) {
      const lbl = cfg.selfReport.labels ? cfg.selfReport.labels[v - 1] : String(v);
      const meaning = meanings[v - 1] || "";
      scale.appendChild(el("button", { class: "ppq-scale-btn", "data-val": String(v), title: meaning ? (v + " — " + meaning) : "" }, esc(lbl)));
    }
    comp.appendChild(scale);
    /* QoderWork 2026-07-22: legend labelling what each point on the scale means */
    if (meanings.length) {
      comp.appendChild(el("div", { class: "ppq-scale-legend" }, meanings.map(function (m, i) { return '<span class="ppq-scale-legend-item"><b>' + (i + 1) + "</b> " + esc(m) + "</span>"; }).join("")));
    }
    comp.appendChild(el("button", { class: "ppq-btn ppq-primary ppq-next", style: "display:none;" }, "Next (Enter)"));
    card.appendChild(comp);

    card.appendChild(el("div", { class: "ppq-kb-hint" }));
    centre.appendChild(card);
    centre.appendChild(el("div", { class: "ppq-empty" }, "<h2>Loading questions…</h2>"));

    /* QoderWork 2026-07-22: a split dashboard renders as three columns — left
       mastery panel, centre question, right mastery panel — matching the original
       Chemistry viewer, rather than stacking both columns in one right sidebar. */
    const isSplit = cfg.dashboardLayout === "split" && cfg.dashboardColumns && cfg.dashboardColumns.length >= 2;
    const makeDashPanel = function (col, sideClass) {
      const p = el("div", { class: "ppq-dash ppq-dash-split-panel " + sideClass });
      p.appendChild(el("h3", null, esc(col.title)));
      p.appendChild(el("div", { class: "ppq-dash-sub" }, "Click a group to filter."));
      p.appendChild(el("div", { class: "ppq-dash-content" }));
      return p;
    };
    if (isSplit) {
      layout.classList.add("ppq-layout-split");
      layout.appendChild(makeDashPanel(cfg.dashboardColumns[0], "ppq-dash-left"));
      layout.appendChild(centre);
      layout.appendChild(makeDashPanel(cfg.dashboardColumns[1], "ppq-dash-right"));
    } else {
      layout.appendChild(centre);
      const dash = el("div", { class: "ppq-dash" });
      dash.appendChild(el("h3", null, esc(cfg.dashboardTitle)));
      dash.appendChild(el("div", { class: "ppq-dash-sub" }, "Recent ticks/crosses and your self-rating spread, per group. Click a group to filter."));
      dash.appendChild(el("div", { class: "ppq-dash-content" }));
      layout.appendChild(dash);
    }
    this.root.appendChild(layout);

    const toolbar = el("div", { class: "ppq-toolbar" });
    toolbar.innerHTML = '<button class="ppq-btn-mini ppq-draw-toggle">Draw</button><button class="ppq-btn-mini ppq-reset">Reset progress</button>';
    this.root.appendChild(toolbar);

    const modal = el("div", { class: "ppq-modal" });
    /* QoderWork 2026-07-24 (handoff #1): the pop-up is minimisable so the pupil can
       shrink it to a slim bar and still see the question, diagram, options and their
       answer behind it. The top bar carries a reminder (question + chosen option),
       a minimise/restore button and the close button. */
    modal.innerHTML = '<div class="ppq-modal-content"><div class="ppq-modal-topbar"><span class="ppq-modal-reminder"></span><span class="ppq-modal-feedback-status" style="display:none" aria-live="polite"></span><button class="ppq-modal-min" type="button" title="Minimise — see the question">—</button><button class="ppq-modal-close" type="button" title="Close">×</button></div><div class="ppq-modal-body"></div></div>';
    this.root.appendChild(modal);

    this._fillFilterOptions();
    this._wireControls();
    this._initDrawState();
  };

  Viewer.prototype._fillFilterOptions = function () {
    const cfg = this.cfg;
    cfg.filters.forEach((f, i) => {
      if (f.multi) { this._buildMultiFilter(i); return; }
      this._fillSingleFilterOptions(i);
    });
  };

  /* A dependent filter is populated from the questions that survive one parent
     field (for ESAT: pick a broad topic, then see only that topic's provisional
     subtopics). hideUntilParent avoids a huge flat taxonomy menu when the parent
     is still "All". The capability is generic and opt-in; existing consumers are
     unchanged. */
  Viewer.prototype._filterValue = function (q, f) {
    return Object.prototype.hasOwnProperty.call(f, "valueOf") && typeof f.valueOf === "function"
      ? f.valueOf(q)
      : q[f.field];
  };
  Viewer.prototype._filterValues = function (q, f) {
    const value = this._filterValue(q, f);
    if (value == null || value === "") return [];
    return (Array.isArray(value) ? value : [value]).map(String).filter(Boolean);
  };
  /* A dependent, array-valued filter may opt into an in-place dashboard
     drill-down. The parent filter remains the single source of truth: choosing a
     broad dashboard group and choosing the same broad topic in the header lead to
     exactly the same view. Consumers without dashboardFacet are unchanged. */
  Viewer.prototype._dashboardFacet = function () {
    const cfg = this.cfg;
    for (let i = 0; i < cfg.filters.length; i++) {
      const filter = cfg.filters[i];
      if (!filter || !filter.dashboardFacet || !filter.dependsOn || filter.multi) continue;
      for (let p = 0; p < cfg.filters.length; p++) {
        if (cfg.filters[p].field === filter.dependsOn && !cfg.filters[p].multi) {
          return { filter: filter, filterIndex: i, parent: cfg.filters[p], parentIndex: p };
        }
      }
    }
    return null;
  };
  Viewer.prototype._activeDashboardFacet = function () {
    const facet = this._dashboardFacet();
    if (!facet) return null;
    const parentSel = this.q('.ppq-select[data-fidx="' + facet.parentIndex + '"]');
    if (!parentSel || !parentSel.value || parentSel.value === "ALL") return null;
    facet.parentValue = String(parentSel.value);
    return facet;
  };
  Viewer.prototype._parentFilterValue = function (f) {
    if (!f.dependsOn) return "ALL";
    const cfg = this.cfg;
    let parentIndex = -1;
    for (let i = 0; i < cfg.filters.length; i++) {
      if (cfg.filters[i].field === f.dependsOn) { parentIndex = i; break; }
    }
    if (parentIndex < 0) return "ALL";
    const parent = cfg.filters[parentIndex];
    if (parent.multi) {
      const set = this._multiSel[parentIndex];
      return set && set.size === 1 ? Array.from(set)[0] : "ALL";
    }
    const sel = this.q('.ppq-select[data-fidx="' + parentIndex + '"]');
    return sel ? (sel.value || "ALL") : "ALL";
  };
  Viewer.prototype._fillSingleFilterOptions = function (i) {
    const cfg = this.cfg, f = cfg.filters[i];
    const sel = this.q('.ppq-select[data-fidx="' + i + '"]');
    if (!sel) return;
    const firstFill = sel.dataset.ppqFilled !== "1";
    const oldValue = sel.value || "ALL";
    const parentValue = this._parentFilterValue(f);
    sel.innerHTML = "";
    sel.appendChild(el("option", { value: "ALL" }, esc(f.allLabel || ("All " + (f.label || f.field)))));

    if (f.dependsOn && f.hideUntilParent && parentValue === "ALL") {
      sel.value = "ALL";
      sel.disabled = true;
      sel.style.display = "none";
      return;
    }
    sel.disabled = false;
    sel.style.display = "";

    let source = this.questions;
    if (f.dependsOn && parentValue !== "ALL") {
      let parent = null;
      for (let p = 0; p < cfg.filters.length; p++) {
        if (cfg.filters[p].field === f.dependsOn) { parent = cfg.filters[p]; break; }
      }
      if (parent) source = source.filter((q) => this._filterValues(q, parent).indexOf(String(parentValue)) >= 0);
    }

    const observed = {};
    source.forEach((q) => {
      this._filterValues(q, f).forEach((value) => { observed[value] = true; });
    });
    let values = typeof f.values === "function" ? f.values(source, parentValue) : f.values;
    if (values) values = values.map(String).filter((value) => observed[value]);
    else values = Object.keys(observed).sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }));
    values.forEach((value) => {
      const label = (f.friendlyLabels && f.friendlyLabels[value]) || value;
      sel.appendChild(el("option", { value: value }, esc(label)));
    });
    const preferred = firstFill && f.default != null ? String(f.default) : oldValue;
    sel.value = values.indexOf(preferred) >= 0 ? preferred : "ALL";
    sel.dataset.ppqFilled = "1";
    this._syncSingleFilterStyle(i);
  };
  Viewer.prototype._syncSingleFilterStyle = function (i) {
    const f = this.cfg.filters[i];
    const sel = this.q('.ppq-select[data-fidx="' + i + '"]');
    if (!sel) return;
    const positive = (f.positiveValues || []).map(String);
    sel.classList.toggle("ppq-select-positive", positive.indexOf(String(sel.value)) >= 0);
  };
  Viewer.prototype._refreshDependentFilters = function (changedField) {
    const cfg = this.cfg;
    cfg.filters.forEach((f, i) => {
      if (!f.multi && f.dependsOn === changedField) this._fillSingleFilterOptions(i);
    });
  };
  Viewer.prototype._refreshAllDependentFilters = function () {
    const cfg = this.cfg;
    cfg.filters.forEach((f, i) => {
      if (!f.multi && f.dependsOn) this._fillSingleFilterOptions(i);
    });
  };

  /* QoderWork 2026-07-22: dropdown-checklist filter (multi:true). State lives in
     this._multiSel[fidx]: null = All, else a Set of ticked values. Ticking every
     value collapses back to All. */
  Viewer.prototype._buildMultiFilter = function (i) {
    const cfg = this.cfg, self = this;
    const f = cfg.filters[i];
    const wrap = this.q('.ppq-multifilter[data-fidx="' + i + '"]');
    const btn = wrap.querySelector(".ppq-multi-btn");
    const panel = wrap.querySelector(".ppq-multi-panel");
    let values = f.values;
    if (!values) {
      const seen = {};
      this.questions.forEach((qq) => {
        this._filterValues(qq, f).forEach((v) => { seen[v] = true; });
      });
      values = Object.keys(seen);
    }
    const labelOf = (v) => (f.friendlyLabels && f.friendlyLabels[v]) || v;
    const allRow = el("label", { class: "ppq-multi-row ppq-multi-all" });
    allRow.appendChild(el("input", { type: "checkbox", value: "ALL" }));
    allRow.appendChild(el("span", null, esc(f.allLabel || ("All " + (f.label || f.field)))));
    panel.appendChild(allRow);
    values.forEach((v) => {
      const row = el("label", { class: "ppq-multi-row" });
      row.appendChild(el("input", { type: "checkbox", value: v }));
      row.appendChild(el("span", null, esc(labelOf(v))));
      panel.appendChild(row);
    });
    this._syncMultiFilter(i);
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const wasOpen = panel.style.display !== "none";
      self.qa(".ppq-multi-panel").forEach((p) => { p.style.display = "none"; });
      panel.style.display = wasOpen ? "none" : "block";
    });
    panel.addEventListener("click", (e) => { e.stopPropagation(); });
    panel.addEventListener("change", (e) => {
      const cb = e.target;
      const allCbs = Array.prototype.slice.call(panel.querySelectorAll(".ppq-multi-row:not(.ppq-multi-all) input"));
      const allVals = allCbs.map((x) => x.value);
      let set = self._multiSel[i];
      if (cb.value === "ALL") {
        set = cb.checked ? null : new Set(allVals); /* un-ticking All keeps everything explicit */
      } else {
        if (set == null) set = new Set(allVals); /* was All; now going explicit */
        if (cb.checked) set.add(cb.value); else set.delete(cb.value);
        if (set.size === allVals.length) set = null; /* everything ticked = All */
      }
      self._multiSel[i] = set;
      self._syncMultiFilter(i);
      self.groupFilter = null;
      self.filterQuestions();
      self.renderDashboard();
    });
    /* clicking anywhere outside closes the panel */
    document.addEventListener("click", () => { self.qa(".ppq-multi-panel").forEach((p) => { p.style.display = "none"; }); });
  };
  Viewer.prototype._syncMultiFilter = function (i) {
    const f = this.cfg.filters[i];
    const wrap = this.q('.ppq-multifilter[data-fidx="' + i + '"]');
    if (!wrap) return;
    const set = this._multiSel[i];
    const labelOf = (v) => (f.friendlyLabels && f.friendlyLabels[v]) || v;
    const chosen = [];
    wrap.querySelectorAll(".ppq-multi-row input").forEach((cb) => {
      if (cb.value === "ALL") { cb.checked = (set == null); }
      else {
        const on = set == null || set.has(cb.value);
        cb.checked = on;
        if (set != null && on) chosen.push(labelOf(cb.value));
      }
    });
    wrap.querySelector(".ppq-multi-btn").textContent = (set == null ? (f.allLabel || ("All " + (f.label || f.field))) : chosen.join(" + ")) + " ▾";
  };

  Viewer.prototype._wireControls = function () {
    const self = this;
    this.qa(".ppq-select").forEach((s) => {
      if (s.classList.contains("ppq-order")) return;
      s.addEventListener("change", () => {
      const i = parseInt(s.dataset.fidx, 10);
      const f = Number.isNaN(i) ? null : self.cfg.filters[i];
      if (f) self._syncSingleFilterStyle(i);
      if (f) self._refreshDependentFilters(f.field);
      self.groupFilter = null;
      self.filterQuestions();
      self.renderDashboard();
      });
    });
    this.q(".ppq-order").addEventListener("change", (e) => { self.q(".ppq-start").style.display = e.target.value === "order" ? "inline-block" : "none"; self.filterQuestions(); });
    this.q(".ppq-start").addEventListener("change", () => self.filterQuestions());
    /* QoderWork 2026-07-22: the counter's topic-filter chip undoes the stuck filter */
    this.q(".ppq-counter").addEventListener("click", (e) => {
      if (e.target.closest && e.target.closest(".ppq-filterchip")) {
        self.groupFilter = null;
        self._groupFilterLabel = null;
        self.filterQuestions();
        self.renderDashboard();
      }
    });
    /* VF-07 (Claude 2026-07-28): the Flagged view toggle. */
    const flagToggle = this.q(".ppq-flagged-toggle");
    if (flagToggle) {
      flagToggle.addEventListener("click", () => {
        self._flaggedOnly = !self._flaggedOnly;
        self._syncFlaggedToggle();
        self.filterQuestions();
        self.renderDashboard();
      });
      this._syncFlaggedToggle();
    }
    /* QoderWork 2026-07-23: wire ALL .ppq-prev buttons (top + bottom). */
    this.qa(".ppq-prev").forEach((b) => b.addEventListener("click", () => self.prev()));
    this.q(".ppq-skip").addEventListener("click", () => self.skip());
    this.q(".ppq-reveal").addEventListener("click", () => self.reveal());
    this.q(".ppq-next").addEventListener("click", () => self.next());
    this.q(".ppq-reset").addEventListener("click", () => self.reset());
    if (this.cfg.headerButtons) this.qa(".ppq-headbtn").forEach((b) => b.addEventListener("click", () => {
      const hb = self.cfg.headerButtons[parseInt(b.dataset.hb, 10)];
      if (hb && hb.open) self.openModal(hb.open);
    }));
    this.qa(".ppq-scale-btn").forEach((btn) => btn.addEventListener("click", (e) => {
      const val = parseInt(e.target.dataset.val, 10);
      self.qa(".ppq-scale-btn").forEach((b) => b.classList.remove("sel"));
      e.target.classList.add("sel");
      if (self.cur) {
        self.store.scores[self.cfg.idOf(self.cur)] = val; self._saveStore();
        /* QoderWork 2026-07-22: report the self-rating */
        self._fireReport({ status: "rated", qtype: "self_report", extra_json: JSON.stringify({ rating: val }) });
      }
      const nb = self.q(".ppq-next"); nb.style.display = "inline-block"; nb.focus();
    }));
    /* QoderWork 2026-07-22: "Actually, I wasn't sure" — uncertainty confession with
       torn-between letters (Smith: "I thought it was B or D"). Fires qtype:"unsure". */
    this.q(".ppq-unsure-btn").addEventListener("click", () => {
      const btn = self.q(".ppq-unsure-btn");
      const pick = self.q(".ppq-unsure-pick");
      const on = btn.classList.toggle("on");
      if (on) {
        const box = self.q(".ppq-unsure-letters");
        if (!box.childElementCount) {
          (self._answerLabels || []).forEach((L) => {
            L = String(L).toUpperCase();
            if (self._chosenLabel && L === self._chosenLabel) return; /* torn BETWEEN the others */
            box.appendChild(el("button", { class: "ppq-unsure-letter", type: "button", "data-letter": L }, L));
          });
        }
        pick.style.display = "";
      } else { pick.style.display = "none"; }
    });
    this.q(".ppq-unsure-letters").addEventListener("click", (e) => {
      const b = e.target.closest ? e.target.closest(".ppq-unsure-letter") : null;
      if (b) b.classList.toggle("on");
    });
    this.q(".ppq-unsure-done").addEventListener("click", () => {
      const wavering = self.qa(".ppq-unsure-letter.on").map((b) => b.dataset.letter);
      self._fireReport({ status: "interrogation", qtype: "unsure", extra_json: JSON.stringify({ unsure: true, wavering: wavering }) });
      self.q(".ppq-unsure-pick").style.display = "none";
      self.q(".ppq-unsure-btn").textContent = "Wasn't sure ✓";
    });
    /* QoderWork 2026-07-22 (analyst handoff): pre-answer guess toggle. The panel
       contents (checkboxes, optional percentages, validation) are built by the
       shared _buildGuessPicker the first time it is opened for this question. */
    this.q(".ppq-guess-btn").addEventListener("click", () => {
      const panel = self.q(".ppq-guess-panel");
      const btn = self.q(".ppq-guess-btn");
      const showing = panel.style.display !== "none";
      if (!showing && !panel.childElementCount) {
        panel.appendChild(self._buildGuessPicker({
          labels: self._answerLabels || [],
          preselect: [],
          stage: "pre_answer",
          prompt: self._guessPrompt("pre_answer"),
          onDone: (payload) => { self._commitPreGuess(payload); panel.style.display = "none"; btn.classList.remove("open"); },
          onSkip: () => { panel.style.display = "none"; btn.classList.remove("open"); }
        }));
      }
      panel.style.display = showing ? "none" : "";
      btn.classList.toggle("open", !showing);
    });
    this.q(".ppq-draw-toggle").addEventListener("click", () => self.toggleDraw());
    this.q(".ppq-draw-undo").addEventListener("click", () => self.undoDraw());
    this.q(".ppq-draw-clear").addEventListener("click", () => self.clearCanvas());
    this.qa(".ppq-color").forEach((c) => c.addEventListener("click", () => self.setDrawColor(c.dataset.color)));
    this.q(".ppq-draw-thick").addEventListener("change", (e) => self.setDrawThickness(e.target.value));
    if (this.cfg.questionFinder) this._wireQuestionFinder();
    const modal = this.q(".ppq-modal");
    modal.addEventListener("click", (e) => {
      const cls = String((e.target && e.target.className) || "");
      /* QoderWork 2026-07-24 (handoff #1): minimise/restore button. */
      if (cls.indexOf("ppq-modal-min") >= 0) { self.toggleModalMin(); return; }
      if (cls.indexOf("ppq-modal-close") >= 0) { self.closeModal(); return; }
      /* Clicking the slim bar itself (outside the two buttons) restores it. */
      if (modal.classList.contains("minimized") && e.target.closest && e.target.closest(".ppq-modal-content")) { self.toggleModalMin(); return; }
      if (e.target === modal) self.closeModal();
    });
  };

  Viewer.prototype._questionSearchText = function (q) {
    const cfg = this.cfg;
    let classifications = "";
    if (typeof cfg.classificationsOf === "function") {
      try {
        const groups = cfg.classificationsOf(q) || {};
        classifications = Object.keys(groups).map((key) => {
          const value = groups[key];
          return Array.isArray(value) ? value.join(" ") : String(value || "");
        }).join(" ");
      } catch (_) { classifications = ""; }
    }
    return [
      cfg.idOf(q),
      cfg.metaLine(q),
      q.assessment,
      q.year,
      q.slug,
      q.question_number,
      q.part,
      q.subject,
      q.topic_code,
      q.topic,
      (cfg.tagsOf(q) || []).join(" "),
      classifications
    ].filter((v) => v != null && String(v) !== "").join(" ").toLowerCase();
  };
  Viewer.prototype._questionSearchMatches = function (q, rawQuery) {
    const query = String(rawQuery || "").trim().toLowerCase();
    if (!query) return false;
    const text = this._questionSearchText(q);
    const qNumber = query.match(/(?:^|\s)q\s*0*(\d+)(?!\d)/i);
    if (qNumber) {
      const actual = String(parseInt(q.question_number, 10));
      if (actual !== String(parseInt(qNumber[1], 10))) return false;
    }
    return query.split(/\s+/).filter(Boolean).every((token) => {
      if (/^q0*\d+$/i.test(token)) return true;
      return text.indexOf(token) >= 0;
    });
  };
  Viewer.prototype._wireQuestionFinder = function () {
    const self = this;
    const input = this.q(".ppq-find-input");
    const results = this.q(".ppq-find-results");
    if (!input || !results) return;
    function hide() { results.style.display = "none"; results.innerHTML = ""; }
    function show() {
      const query = input.value.trim();
      if (!query) { hide(); return; }
      const matches = self.questions.filter((q) => self._questionSearchMatches(q, query)).slice(0, 15);
      results.innerHTML = matches.length
        ? matches.map((q) => '<button type="button" class="ppq-find-result" role="option" data-id="' +
            esc(self.cfg.idOf(q)) + '"><b>' + esc(self.cfg.metaLine(q)) + '</b><span>' +
            esc((self.cfg.tagsOf(q) || []).slice(0, 3).join(" · ")) + "</span></button>").join("")
        : '<div class="ppq-find-none">No exact question found</div>';
      results.style.display = "";
    }
    input.addEventListener("input", show);
    input.addEventListener("focus", show);
    input.addEventListener("keydown", (e) => {
      if (e.key === "Escape") { hide(); input.blur(); }
      if (e.key === "Enter") {
        const first = results.querySelector(".ppq-find-result");
        if (first) { e.preventDefault(); first.click(); }
      }
    });
    results.addEventListener("click", (e) => {
      const button = e.target.closest ? e.target.closest(".ppq-find-result") : null;
      if (!button) return;
      self._jumpToQuestion(button.dataset.id);
      input.value = self.cfg.metaLine(self.byId[button.dataset.id] || {});
      hide();
    });
    document.addEventListener("click", (e) => {
      if (!e.target.closest || !e.target.closest(".ppq-finder")) hide();
    });
  };
  Viewer.prototype._jumpToQuestion = function (id) {
    const q = this.byId[id];
    if (!q) return false;
    this.groupFilter = null;
    this._groupFilterLabel = null;
    this.qa(".ppq-select").forEach((sel) => {
      if (!sel.classList.contains("ppq-order")) sel.value = "ALL";
    });
    this.cfg.filters.forEach((f, i) => {
      if (f.multi) {
        this._multiSel[i] = null;
        this._syncMultiFilter(i);
      } else {
        this._syncSingleFilterStyle(i);
      }
    });
    this._refreshAllDependentFilters();
    this.q(".ppq-order").value = "order";
    this.q(".ppq-start").style.display = "inline-block";
    this.filterQuestions();
    this.goToId(id);
    const card = this.q(".ppq-card");
    if (card) {
      card.scrollIntoView({ behavior: "smooth", block: "start" });
      card.classList.remove("ppq-question-fired");
      void card.offsetWidth;
      card.classList.add("ppq-question-fired");
      setTimeout(() => card.classList.remove("ppq-question-fired"), 1400);
    }
    return true;
  };

  /* QoderWork 2026-07-22 (analyst handoff): largest-remainder allocation. Spread
     `total` integer units over the slots proportionally to `weights`, each slot
     getting at least `minEach`. Always returns non-negative integers summing to
     exactly `total` (when total >= minEach*n). Replaces the old proportional
     pass that could drive the final option negative. */
  function allocateLargestRemainder(total, weights, minEach) {
    const n = weights.length;
    if (!n) return [];
    minEach = minEach || 0;
    let pool = total - minEach * n;
    if (pool < 0) pool = 0;
    const wSum = weights.reduce((s, w) => s + (w > 0 ? w : 0), 0);
    let alloc;
    if (wSum <= 0) {
      const share = Math.floor(pool / n);
      let rem = pool - share * n;
      alloc = weights.map(() => share);
      for (let i = 0; rem > 0 && i < n; i++) { alloc[i]++; rem--; }
    } else {
      const ideal = weights.map((w) => ((w > 0 ? w : 0) / wSum) * pool);
      alloc = ideal.map((x) => Math.floor(x));
      let rem = pool - alloc.reduce((s, x) => s + x, 0);
      const order = ideal.map((x, i) => ({ i: i, frac: x - Math.floor(x) })).sort((a, b) => b.frac - a.frac);
      for (let k = 0; rem > 0 && k < order.length; k++) { alloc[order[k].i]++; rem--; }
    }
    return alloc.map((x) => x + minEach);
  }

  /* QoderWork 2026-07-23: reworded guess prompts. The "pre_verdict" stage is the
     new first-page-of-the-pop-up guess (asked after answering, before the verdict
     is revealed). Smith: "but reword." — simpler, more natural language. */
  Viewer.prototype._guessPrompt = function (stage) {
    const d = this.cfg.guessDefaults && this.cfg.guessDefaults[stage];
    if (stage === "pre_verdict") return (d && d.candidate_prompt) || "Tick the options you think it could be.";
    if (stage === "pre_answer") return (d && d.candidate_prompt) || "Tick the options you think it could be.";
    return (d && d.candidate_prompt) || "Which options were still in the running?";
  };
  Viewer.prototype._guessLabel = function (stage) {
    const d = this.cfg.guessDefaults && this.cfg.guessDefaults[stage];
    if (stage === "pre_verdict") return (d && d.label) || "Want to declare a bit of a guess?";
    if (stage === "pre_answer") return (d && d.label) || "I'm guessing";
    return (d && d.label) || "Actually, it was a guess";
  };

  /* QoderWork 2026-07-22 (analyst handoff): shared guess picker used by BOTH the
     pre-answer widget and the post-answer correction inside the modal.
     opts: { labels, preselect, stage, prompt, onDone(payload), onSkip() }.
     Percentages are visible and pre-filled beside the selected options; editing
     them is optional. Done validates (>=2 options; each percentage >=1 and total
     exactly 100) and keeps the panel open with an inline message on failure. */
  Viewer.prototype._buildGuessPicker = function (opts) {
    const self = this;
    const MIN_EACH = 1, SUM = 100, MIN_OPTIONS = 2;
    const labels = (opts.labels || []).map(String);
    const panel = el("div", { class: "ppq-gpick" });
    let settled = false;
    panel.appendChild(el("div", { class: "ppq-gpick-prompt" }, esc(opts.prompt || "")));

    const rows = {};
    const optsBox = el("div", { class: "ppq-gpick-options" });
    labels.forEach((L) => {
      const row = el("div", { class: "ppq-gpick-row" });
      const choice = el("label", { class: "ppq-gpick-choice" });
      const cb = el("input", { type: "checkbox", value: L });
      if ((opts.preselect || []).indexOf(L) >= 0) cb.checked = true;
      choice.appendChild(cb);
      choice.appendChild(el("span", { class: "ppq-gpick-letter" }, esc(L)));
      row.appendChild(choice);
      const wrap = el("span", {
        class: "ppq-gpick-pctwrap",
        title: "Optional: tap the percentage if you want to change it"
      });
      const pct = el("input", {
        type: "number",
        class: "ppq-gpick-pct",
        min: String(MIN_EACH),
        max: String(SUM),
        value: "0",
        disabled: "disabled",
        ariaLabel: "Percentage for " + L
      });
      wrap.appendChild(pct);
      wrap.appendChild(el("span", { class: "ppq-gpick-pctsign" }, "%"));
      row.appendChild(wrap);
      optsBox.appendChild(row);
      rows[L] = { cb: cb, pct: pct, wrap: wrap };
    });
    panel.appendChild(optsBox);
    panel.appendChild(el("div", { class: "ppq-gpick-pcthint" },
      "Percentages are filled in for you. Changing them is optional."));

    const msg = el("div", { class: "ppq-gpick-msg", style: "display:none;" });
    panel.appendChild(msg);

    function checked() { return labels.filter((L) => rows[L].cb.checked); }
    function showMsg(text) { msg.textContent = text; msg.style.display = text ? "" : "none"; }
    function refreshPct() {
      labels.forEach((L) => {
        const r = rows[L];
        r.wrap.style.display = "";
        r.pct.disabled = !r.cb.checked;
      });
    }
    function equalSplit() {
      const c = checked();
      const alloc = allocateLargestRemainder(SUM, c.map(() => 1), MIN_EACH);
      labels.forEach((L) => { if (!rows[L].cb.checked) rows[L].pct.value = "0"; });
      c.forEach((L, i) => { rows[L].pct.value = String(alloc[i]); });
      refreshPct();
    }
    function redistributeFrom(changedPct) {
      const c = checked();
      const others = c.filter((L) => rows[L].pct !== changedPct);
      const maxForChanged = SUM - others.length * MIN_EACH;
      let v = parseInt(changedPct.value, 10);
      if (isNaN(v)) v = MIN_EACH;
      v = Math.max(MIN_EACH, Math.min(maxForChanged, v));
      changedPct.value = String(v);
      const remaining = SUM - v;
      const weights = others.map((L) => parseInt(rows[L].pct.value, 10) || 0);
      const alloc = allocateLargestRemainder(remaining, weights, MIN_EACH);
      others.forEach((L, i) => { rows[L].pct.value = String(alloc[i]); });
    }

    optsBox.addEventListener("change", (e) => {
      if (e.target.type !== "checkbox") return;
      showMsg("");
      equalSplit();
    });
    optsBox.addEventListener("input", (e) => {
      if (!e.target.classList.contains("ppq-gpick-pct")) return;
      showMsg("");
      redistributeFrom(e.target);
    });

    const actions = el("div", { class: "ppq-gpick-actions" });
    const done = el("button", { class: "ppq-gpick-done", type: "button" }, "Done");
    const skip = el("button", { class: "ppq-gpick-skip", type: "button" }, "Skip");
    actions.appendChild(done);
    actions.appendChild(skip);
    panel.appendChild(actions);

    function markDone(button, text) {
      button.textContent = text || "Done \u2713";
      button.classList.add("done");
    }
    function submitGuess() {
      if (settled) return true;
      const c = checked();
      if (c.length < MIN_OPTIONS) { showMsg("Pick at least " + MIN_OPTIONS + " options, or Skip."); return false; }
      const payload = {
        guess_declared: true,
        declared_stage: opts.stage,
        candidate_options: c.slice(),
        attempt_id: self._attemptId || ""
      };
      const pcts = {};
      let sum = 0, ok = true;
      c.forEach((L) => {
        let v = parseInt(rows[L].pct.value, 10);
        if (isNaN(v) || v < MIN_EACH) ok = false;
        pcts[L] = isNaN(v) ? 0 : v;
        sum += pcts[L];
      });
      if (!ok || sum !== SUM) { showMsg("Percentages must each be at least " + MIN_EACH + " and total exactly " + SUM + "."); return false; }
      payload.candidate_percentages = pcts;
      showMsg("");
      settled = true;
      markDone(done);
      if (opts.onDone) opts.onDone(payload);
      return true;
    }
    function skipGuess(acknowledgementButton) {
      if (settled) return true;
      showMsg("");
      settled = true;
      const button = acknowledgementButton || skip;
      markDone(button, button === skip ? "Skipped \u2713" : "Done \u2713");
      if (opts.onSkip) opts.onSkip();
      return true;
    }
    function submitOrSkip() {
      return checked().length >= MIN_OPTIONS ? submitGuess() : skipGuess(skip);
    }

    done.addEventListener("click", submitOrSkip);
    skip.addEventListener("click", () => skipGuess(skip));
    panel.addEventListener("keydown", (e) => {
      if (e.key !== "Enter" || e.repeat) return;
      e.preventDefault();
      e.stopPropagation();
      if (e.target === skip) skipGuess(skip);
      else if (e.target === done) submitOrSkip();
      else submitOrSkip();
    });
    /* The full-screen pre-verdict wrapper can call the same behaviour if focus is
       on the page rather than one of the picker controls. */
    panel._ppqSubmitOrSkip = submitOrSkip;

    equalSplit();
    return panel;
  };

  /* QoderWork 2026-07-22 (analyst handoff): store the pre-answer declaration on
     the instance, fire the event, and reflect it on the toggle button. The
     snapshot is later attached to the answer event and the stored attempt. */
  Viewer.prototype._commitPreGuess = function (payload) {
    this._preGuessDeclaration = payload;
    const btn = this.q(".ppq-guess-btn");
    btn.textContent = "Guessing: " + payload.candidate_options.join(", ") + " ✓";
    btn.classList.add("done");
    this._fireReport({ status: "interrogation", qtype: "guess_declaration", extra_json: JSON.stringify(payload) });
  };

  // --------------------------------------------------------------- filtering
  Viewer.prototype._matchesQuestionFilters = function (qq, ignoredFields) {
    const cfg = this.cfg;
    const self = this;
    const ignored = ignoredFields || [];
    for (let i = 0; i < cfg.filters.length; i++) {
      const f = cfg.filters[i];
      if (ignored.indexOf(f.field) >= 0) continue;
      const values = self._filterValues(qq, f);
      if (f.multi) {
        const set = self._multiSel[i];
        if (set && !values.some((value) => set.has(value))) return false;
      } else {
        const v = self.q('.ppq-select[data-fidx="' + i + '"]').value || "ALL";
        if (v !== "ALL" && values.indexOf(v) < 0) return false;
      }
    }
    /* VF-07 (Claude 2026-07-28): the flagged-only view is one more filter every
       question must pass, so the finder, counter scope and dashboard all agree
       with the visible list. */
    if (this._flaggedOnly && !(((this.store || {}).flags) || {})[cfg.idOf(qq)]) return false;
    if (this.groupFilter && cfg.groupKey(qq) !== this.groupFilter) return false;
    return true;
  };

  /* VF-07: the Flagged toggle carries the live count, shows only once something
     is flagged (or the view is active), and reflects its on/off state. */
  Viewer.prototype._syncFlaggedToggle = function () {
    const b = this.q(".ppq-flagged-toggle");
    if (!b) return;
    const n = Object.keys(((this.store || {}).flags) || {}).length;
    b.textContent = "Flagged" + (n ? " (" + n + ")" : "");
    b.classList.toggle("on", !!this._flaggedOnly);
    b.style.display = (n || this._flaggedOnly) ? "" : "none";
  };

  Viewer.prototype.filterQuestions = function () {
    const cfg = this.cfg;
    const self = this;
    const order = this.q(".ppq-order").value || "order";
    const start = parseInt(this.q(".ppq-start").value, 10) || 1;
    this.view = this.questions.filter((qq) => self._matchesQuestionFilters(qq));
    if (order === "shuffle") { shuffleInPlace(this.view); this.idx = -1; }
    else {
      const cmp = cfg.sort || function (a, b) { return String(cfg.idOf(a)).localeCompare(String(cfg.idOf(b)), undefined, { numeric: true, sensitivity: "base" }); };
      this.view.sort(cmp);
      this.idx = (start > 1 && start <= this.view.length) ? start - 2 : -1;
    }
    /* QoderWork 2026-07-22: the active topic filter is shown as a removable chip
       (Smith clicked P3 Mechanics, saw "no questions match", and couldn't see the
       filter was stuck or how to undo it). */
    let counterHtml = this.view.length + " questions";
    const counterScope = cfg.counterScope;
    if (counterScope && Array.isArray(counterScope.ignoreFilterFields) &&
        counterScope.ignoreFilterFields.length) {
      const scopeQuestions = this.questions.filter((qq) =>
        self._matchesQuestionFilters(qq, counterScope.ignoreFilterFields));
      let scopeLabel = counterScope.label || "";
      if (typeof scopeLabel === "function") {
        try { scopeLabel = scopeLabel(scopeQuestions, this) || ""; }
        catch (_) { scopeLabel = ""; }
      }
      counterHtml = this.view.length + " shown / " + scopeQuestions.length +
        (scopeLabel ? " " + esc(scopeLabel) : "");
    }
    if (this.groupFilter) counterHtml += ' · <button class="ppq-filterchip" type="button" title="Clear this topic filter">' + esc(this._groupFilterLabel || this.groupFilter) + " ✕</button>";
    this.q(".ppq-counter").innerHTML = counterHtml;
    this.next();
  };
  Viewer.prototype.setGroupFilter = function (key) {
    const facet = this._dashboardFacet();
    if (facet) {
      const parentSel = this.q('.ppq-select[data-fidx="' + facet.parentIndex + '"]');
      const hasOption = parentSel && Array.prototype.some.call(parentSel.children || [], (option) =>
        String(option.value) === String(key));
      if (hasOption) {
        const next = String(parentSel.value) === String(key) ? "ALL" : String(key);
        parentSel.value = next;
        this.groupFilter = null;
        this._groupFilterLabel = null;
        this._syncSingleFilterStyle(facet.parentIndex);
        this._refreshDependentFilters(facet.parent.field);
        this.filterQuestions();
        this.renderDashboard();
        return;
      }
    }
    this.groupFilter = (this.groupFilter === key) ? null : key;
    if (this.groupFilter) {
      const nameEl = this.q('.ppq-cat[data-key="' + key + '"] .ppq-cat-name');
      this._groupFilterLabel = nameEl ? nameEl.textContent.replace(/\(\d+\)\s*$/, "").trim() : key;
    } else { this._groupFilterLabel = null; }
    this.filterQuestions();
    this.renderDashboard();
  };
  Viewer.prototype._setDashboardFacetValue = function (filterIndex, value) {
    const filter = this.cfg.filters[filterIndex];
    const sel = this.q('.ppq-select[data-fidx="' + filterIndex + '"]');
    if (!filter || !sel) return;
    sel.value = String(sel.value) === String(value) ? "ALL" : String(value);
    this.groupFilter = null;
    this._groupFilterLabel = null;
    this._syncSingleFilterStyle(filterIndex);
    this._refreshDependentFilters(filter.field);
    this.filterQuestions();
    this.renderDashboard();
  };
  Viewer.prototype._clearDashboardFacet = function (clearParent) {
    const facet = this._dashboardFacet();
    if (!facet) return;
    const childSel = this.q('.ppq-select[data-fidx="' + facet.filterIndex + '"]');
    const parentSel = this.q('.ppq-select[data-fidx="' + facet.parentIndex + '"]');
    if (childSel) childSel.value = "ALL";
    if (clearParent && parentSel) parentSel.value = "ALL";
    this.groupFilter = null;
    this._groupFilterLabel = null;
    this._syncSingleFilterStyle(facet.filterIndex);
    this._syncSingleFilterStyle(facet.parentIndex);
    this._refreshDependentFilters(facet.parent.field);
    this.filterQuestions();
    this.renderDashboard();
  };

  // --------------------------------------------------------------- navigation
  Viewer.prototype.next = function () { if (this.view.length === 0) { this._showEmpty("No questions match these filters."); return; } this.idx++; if (this.idx >= this.view.length) this.idx = 0; this.render(); };
  Viewer.prototype.prev = function () { if (this.view.length === 0) return; this.idx--; if (this.idx < 0) this.idx = this.view.length - 1; this.render(); };
  Viewer.prototype.skip = function () { this.next(); };
  Viewer.prototype.goToId = function (id) {
    const i = this.view.findIndex((q) => this.cfg.idOf(q) === id);
    if (i >= 0) { this.idx = i - 1; this.next(); }
    else { const t = this.q('.ppq-wq-part[data-part-id="' + (window.CSS && CSS.escape ? CSS.escape(id) : id) + '"]'); if (t) t.scrollIntoView({ behavior: "smooth", block: "center" }); }
  };
  Viewer.prototype._showEmpty = function (msg) {
    this.q(".ppq-empty").style.display = "block";
    /* QoderWork 2026-07-22: say WHICH filter is stuck and offer one obvious undo
       (Smith: "there's no indication that that should be the case… I don't know
       how to undo it"). */
    let html = "<h2>" + esc(msg) + "</h2>";
    if (this.groupFilter) html += "<p>Topic filter is on: <b>" + esc(this._groupFilterLabel || this.groupFilter) + "</b> — nothing in it matches the other filters.</p>";
    html += '<p><button class="ppq-btn ppq-clear-filters" type="button">Clear all filters</button></p>';
    this.q(".ppq-empty").innerHTML = html;
    this.q(".ppq-card").style.display = "none";
    const self = this;
    const cb = this.q(".ppq-clear-filters");
    if (cb) cb.addEventListener("click", () => self.clearAllFilters());
  };
  Viewer.prototype.clearAllFilters = function () {
    const self = this;
    this.groupFilter = null; this._groupFilterLabel = null;
    this._flaggedOnly = false; /* VF-07 */
    this._syncFlaggedToggle();
    this.cfg.filters.forEach((f, i) => {
      if (f.multi) {
        self._multiSel[i] = f.default ? new Set(f.default.map(String)) : null;
        self._syncMultiFilter(i);
      } else {
        const sel = self.q('.ppq-select[data-fidx="' + i + '"]');
        if (sel) sel.value = f.default != null ? String(f.default) : "ALL";
        self._syncSingleFilterStyle(i);
      }
    });
    this._refreshAllDependentFilters();
    this.filterQuestions();
    this.renderDashboard();
  };

  // --------------------------------------------------------------- prefetch
  Viewer.prototype._preload = function (url) { if (!url) return; if (!this._preloaded) this._preloaded = []; const img = new Image(); img.src = url; this._preloaded.push(img); while (this._preloaded.length > 80) this._preloaded.shift(); };
  Viewer.prototype._prefetch = function (q) {
    if (!q) return;
    this.cfg.cropsOf(q).forEach((s) => this._preload(s));
    this._preload(this.cfg.stemUrlOf(q));
    this._preload(this.cfg.answerUrlOf(q)); // answer warmed separately (Smith 2026-07-01)
    if (this.cfg.modules.structuredPaper) this._blockParts(q).forEach((p) => this.cfg.cropsOf(p).forEach((s) => this._preload(s)));
  };

  // ----------------------------------------------- content safety (VSAFE-01)
  /* Deterministic damage heuristics for authored analysis text. Evidence
     (2026-07-28, 720-record live ESAT bundle): these patterns flag exactly five
     records, every one humanly confirmed corrupt (including two records the
     analysis project's own known-damage list had missed), and zero clean
     records. The failure direction is deliberate: a false positive withholds
     good content behind the generic shell; a false negative shows a pupil
     broken mathematics labelled "Full feedback". Content repair belongs to the
     analysis project; refusal and fallback belong here. */
  /* Self-contained (no free variables) so test harnesses can extract it. */
  function scanAnalysisRecordForDamage(rec) {
    const PATTERNS = [
      [/�/, "replacement character"],
      [/\?\d/, "'?' fused to a digit (lost minus/times/Delta)"],
      [/\d\s+\?\s+\d/, "'?' between numbers (lost operator)"],
      [/\?\?+/, "repeated '?' (lost maths/nuclide notation)"],
      [/[A-Za-z0-9]\?s\b/, "'?s' (lost apostrophe)"],
      [/â€|Ã—|Ã¢/, "UTF-8 mojibake"]
    ];
    const SKIP_KEYS = /crop|url|src|image|path|file|href/i;
    const found = [];
    const seen = {};
    (function walk(node, key) {
      if (node == null || found.length >= 4) return;
      if (typeof node === "string") {
        if (SKIP_KEYS.test(key || "")) return;
        for (let i = 0; i < PATTERNS.length; i++) {
          const label = PATTERNS[i][1];
          if (seen[label]) continue;
          const m = node.match(PATTERNS[i][0]);
          if (m) {
            seen[label] = true;
            const at = Math.max(0, node.indexOf(m[0]) - 12);
            found.push(label + " near “" + node.slice(at, at + 28).replace(/\s+/g, " ") + "”");
          }
        }
        return;
      }
      if (typeof node !== "object") return;
      if (Array.isArray(node)) { for (let i = 0; i < node.length; i++) walk(node[i], key); return; }
      for (const k in node) { if (Object.prototype.hasOwnProperty.call(node, k)) walk(node[k], k); }
    })(rec, null);
    return found;
  }

  /* VSAFE-01: is this record safe to show? Precedence: a safety state declared
     by the content build (`content_safety`), then the consumer's withheld list,
     then the damage heuristics. Memoised per record id — records are static for
     the life of the page. Returns { safe, reasons[] }; reasons are reviewer
     facing (the ?review strip), never shown to pupils. */
  Viewer.prototype._contentSafety = function (q, rec) {
    if (!rec) return { safe: true, reasons: [] };
    const cs = this.cfg.contentSafety || {};
    const id = String((rec.identity && rec.identity.id) || rec.id ||
      (q && typeof this.cfg.idOf === "function" ? this.cfg.idOf(q) : (q && q.id)) || "");
    if (id && this._safetyCache && this._safetyCache[id]) return this._safetyCache[id];
    const reasons = [];
    const declared = rec.content_safety;
    const declaredStatus = declared && (typeof declared === "string" ? declared : declared.status);
    if (declaredStatus && /^(invalid|withheld|unsafe|damaged)$/i.test(String(declaredStatus))) {
      const declaredReasons = (declared && declared.reasons && declared.reasons.length)
        ? ": " + [].concat(declared.reasons).join("; ") : "";
      reasons.push("declared " + String(declaredStatus).toLowerCase() + " by content build" + declaredReasons);
    }
    if (id && cs.withheld && Object.prototype.hasOwnProperty.call(cs.withheld, id)) {
      reasons.push("withheld by consumer: " + (cs.withheld[id] || "no reason recorded"));
    }
    if (cs.heuristics) {
      const scan = scanAnalysisRecordForDamage(rec);
      for (let i = 0; i < scan.length; i++) reasons.push("damage scan: " + scan[i]);
    }
    const result = reasons.length ? { safe: false, reasons: reasons } : { safe: true, reasons: [] };
    if (id) { if (!this._safetyCache) this._safetyCache = {}; this._safetyCache[id] = result; }
    return result;
  };

  // --------------------------------------------------------------- render
  Viewer.prototype._feedbackReadiness = function (q) {
    let rec = null;
    try { rec = this.cfg.analysisOf ? this.cfg.analysisOf(q) : null; }
    catch (_) { rec = null; }
    /* VSAFE-01/02 (Claude 2026-07-28): safety comes first and cannot be
       overridden by any status source — not the explicit feedbackStatusOf hook,
       not a catalogue field, not the bundle's status ledger. The pupil-facing
       label stays "Solution pending" (honest and unalarming); the distinct
       code lets tests, CSS and reviewer surfaces tell withheld from merely
       unauthored. */
    const safety = this._contentSafety(q, rec);
    if (rec && !safety.safe) {
      return {
        code: "withheld",
        label: "Solution pending",
        title: "Question-specific feedback for this question is being repaired; guess, reflection and rating still work.",
        withheldReasons: safety.reasons
      };
    }
    let explicit = null;
    if (typeof this.cfg.feedbackStatusOf === "function") {
      try { explicit = this.cfg.feedbackStatusOf(q, rec); }
      catch (_) { explicit = null; }
    }
    if (explicit && typeof explicit === "object" && explicit.code && explicit.label) {
      /* VSAFE-02: an explicit status object may downgrade freely, but may not
         claim full or provisional feedback without a resolvable record behind
         it. (Unsafe records never reach this point — handled above.) */
      if (!/^(full|provisional)$/.test(explicit.code) || rec) return explicit;
      explicit = null;
    }
    const raw = String(
      explicit ||
      (q && q.feedback_status) ||
      (rec && rec.feedback_status) ||
      (rec && rec.review && rec.review.status) ||
      ""
    ).toLowerCase().replace(/[\s-]+/g, "_");
    /* VSAFE-02: Full and Provisional both require content the viewer actually
       resolves. A ledger row, catalogue field or hook string on its own can
       promote nothing — the 18 held launch-only questions stay Solution
       pending no matter what any status estate says about them. */
    if (rec && /^(reviewed|full|full_feedback|full_review|complete|completed)$/.test(raw)) {
      return {
        code: "full",
        label: "Full feedback",
        title: "This question has detailed feedback that has completed review."
      };
    }
    if (rec && !/^(pending|feedback_pending|none|missing|not_started)$/.test(raw)) {
      return {
        code: "provisional",
        label: "Provisional feedback",
        title: "This question has a useful first-pass solution and prompts; it has not completed review."
      };
    }
    return {
      code: "pending",
      label: "Solution pending",
      title: "Guess, reflection and rating are available; question-specific solution feedback is still being prepared."
    };
  };

  /* Paint either the question-header badge or the sticky analysis badge from the
     same readiness calculation. Keeping the DOM work here prevents the two
     pupil-facing status labels from drifting apart. */
  Viewer.prototype._setFeedbackStatusBadge = function (node, q, extraClass) {
    if (!node) return null;
    const readiness = this._feedbackReadiness(q || this.cur);
    node.className = "ppq-feedback-status" +
      (extraClass ? " " + extraClass : "") +
      " ppq-feedback-status-" + readiness.code;
    node.textContent = readiness.label;
    node.title = readiness.title || "";
    node.style.display = "";
    return readiness;
  };

  Viewer.prototype.render = function () {
    const cfg = this.cfg;
    this.cur = this.view[this.idx];
    this.answered = false;
    this.shownAt = Date.now();
    /* QoderWork 2026-07-22 (analyst handoff): a stable id for THIS displayed
       attempt — session+item is not enough when an item is attempted twice. */
    this._attemptId = "att_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
    this._preGuessDeclaration = null;
    this._startTimer(); /* QoderWork 2026-07-22: exam timer (no-op unless config.timer) */
    if (this._drawOn) this.toggleDraw();
    this.clearCanvas();
    this._curType = cfg.questionType(this.cur) || "imageSelfMark";

    this.q(".ppq-empty").style.display = "none";
    this.q(".ppq-card").style.display = "flex";
    this.q(".ppq-qid").textContent = cfg.metaLine(this.cur);
    this._setFeedbackStatusBadge(this.q(".ppq-feedback-status"), this.cur);
    /* In/out-of-spec status remains visible and semantically coloured. */
    this.q(".ppq-tags").innerHTML = (cfg.tagsOf(this.cur) || []).map((t) => {
      const text = String(t);
      const statusClass = /out of spec/i.test(text)
        ? " ppq-tag-out"
        : (/^in spec$/i.test(text) ? " ppq-tag-in" : "");
      return '<span class="ppq-tag' + statusClass + '">' + esc(text) + "</span>";
    }).join("");
    const classificationDetails = this.q(".ppq-classification-details");
    classificationDetails.innerHTML = "";
    if (typeof cfg.classificationsOf === "function") {
      let groups = null;
      try { groups = cfg.classificationsOf(this.cur); }
      catch (_) { groups = null; }
      if (groups) {
        const sections = [];
        let total = 0;
        const labels = {
          syllabus: "Syllabus links",
          techniques: "Techniques",
          representations: "Representations"
        };
        Object.keys(labels).forEach((key) => {
          const values = (Array.isArray(groups[key]) ? groups[key] : [groups[key]])
            .map((value) => value == null ? "" : String(value)).filter(Boolean);
          if (!values.length) return;
          total += values.length;
          sections.push('<div class="ppq-classification-group"><b>' + labels[key] +
            '</b><span>' + values.map(esc).join(" · ") + "</span></div>");
        });
        if (sections.length) {
          classificationDetails.innerHTML =
            '<details class="ppq-classification-more"><summary>More classifications' +
            (total ? " (" + total + ")" : "") + '</summary><div class="ppq-classification-panel">' +
            sections.join("") + "</div></details>";
        }
      }
    }

    this._renderStem(this.cur);
    this._resetAnswerUi();
    this._renderAnswerArea(this.cur, this._curType);

    // restore prior self-rating
    this.qa(".ppq-scale-btn").forEach((b) => b.classList.remove("sel"));
    const prior = this.store.scores[cfg.idOf(this.cur)];
    if (prior) { const sb = this.q('.ppq-scale-btn[data-val="' + prior + '"]'); if (sb) sb.classList.add("sel"); }

    if (cfg.modules.math) this._applyMath(this.q(".ppq-card"));

    this._prefetch(this.cur);
    for (let k = 1; k <= cfg.prefetchAhead; k++) { const a = this.view[(this.idx + k) % this.view.length]; if (a && a !== this.cur) this._prefetch(a); }
  };

  Viewer.prototype._resetAnswerUi = function () {
    this.q(".ppq-answer-line").className = "ppq-answer-line";
    this.q(".ppq-answer-line").textContent = "";
    this.q(".ppq-answer-panel").className = "ppq-answer-panel";
    this.q(".ppq-competence").className = "ppq-competence";
    this.q(".ppq-competence").style.display = ""; /* QoderWork 2026-07-22: may have been hidden while the pop-up held the 1-6 */
    this.q(".ppq-next").style.display = "none";
    this.q(".ppq-skip").style.display = "inline-block";
    this.q(".ppq-prev").style.display = "inline-block";
    this.q(".ppq-options").innerHTML = "";
    this.q(".ppq-options").style.display = "none";
    this.q(".ppq-reveal").style.display = "none";
    this.q(".ppq-kb-hint").textContent = "";
    /* QoderWork 2026-07-22: reset the "wasn't sure" widget between questions */
    this.q(".ppq-unsure").style.display = "none";
    this.q(".ppq-unsure-pick").style.display = "none";
    this.q(".ppq-unsure-letters").innerHTML = "";
    const ub = this.q(".ppq-unsure-btn"); ub.classList.remove("on"); ub.textContent = "Actually, I wasn't sure";
    /* QoderWork 2026-07-22 (analyst handoff): reset the pre-answer guess widget.
       The picker panel is rebuilt per question on next open. */
    this.q(".ppq-guess").style.display = "none";
    this.q(".ppq-guess-panel").style.display = "none";
    this.q(".ppq-guess-panel").innerHTML = "";
    const gb = this.q(".ppq-guess-btn"); gb.classList.remove("open", "done"); gb.textContent = this._guessLabel("pre_answer");
    this._preGuessDeclaration = null;
    /* QoderWork 2026-07-22: reset the pop-up interrogation between questions */
    this._analysis = null;
    this._analysisSelfReports = {};
    this._chosenLabel = null;
    this._wasRight = null;
    this._answerRevealPending = false;
    this._iqBox = null;
    this._iqOpen = false;
    this.q(".ppq-modal").classList.remove("show", "ppq-modal-analysis");
    this.root.classList.remove("ppq-analysis-open");
    this.q(".ppq-modal-body").innerHTML = "";
  };

  // --------------------------------------------------------------- stem
  Viewer.prototype._renderStem = function (q) {
    const cfg = this.cfg;
    const stem = this.q(".ppq-stem");
    let html = "";
    const text = cfg.questionTextOf(q);
    if (text) html += '<div class="ppq-qtext">' + text + "</div>";
    const crops = cfg.cropsOf(q);
    crops.forEach((s) => { html += '<img src="' + esc(s) + '" loading="lazy" class="ppq-crop" alt="question crop">'; });
    if (!text && !crops.length) html = '<div class="ppq-kb-hint">No stem image on file for this question.</div>';
    stem.innerHTML = html;
    const self = this;
    this.qa(".ppq-crop").forEach((im) => im.addEventListener("click", () => self.openModal(im.getAttribute("src"))));

    // module: structured paper (multi-part)
    const structEl = this.q(".ppq-struct");
    structEl.innerHTML = "";
    if (cfg.modules.structuredPaper) this._renderStructured(q, structEl);

    // module: reference booklet
    if (cfg.modules.referenceBooklet) this._appendReferenceBooklet(q, stem);
  };

  // --------------------------------------------------------------- answer area
  Viewer.prototype._renderAnswerArea = function (q, type) {
    if (type === "mcq") return this._renderMCQ(q);
    if (type === "flashcard") return this._renderFlashcard(q);
    return this._renderImageSelfMark(q);
  };

  Viewer.prototype._renderImageSelfMark = function (q) {
    const grid = this.q(".ppq-options");
    const labels = this._optionLabels(q);
    this._answerLabels = labels.slice();
    const self = this;
    labels.forEach((L) => { const b = el("button", { class: "ppq-option", "data-label": L }, esc(L)); b.addEventListener("click", () => self.selectOption(L)); grid.appendChild(b); });
    grid.style.display = labels.length ? "flex" : "none";
    this.q(".ppq-reveal").style.display = labels.length ? "inline-block" : "none";
    this.q(".ppq-kb-hint").textContent = labels.length ? ("Pick " + labels[0] + "–" + labels[labels.length - 1] + " to self-mark · Enter reveal · S skip · ← previous") : "Enter reveal · S skip · ← previous";
    /* QoderWork 2026-07-23: pre-answer guess panel retired — the guess declaration
       is now the FIRST PAGE of the post-answer pop-up (before the verdict). The
       below-question panel is never shown. DOM retained for reversibility. */
    this.q(".ppq-guess").style.display = "none";
  };

  Viewer.prototype._renderMCQ = function (q) {
    const grid = this.q(".ppq-options");
    const choices = this.cfg.choicesOf(q) || [];
    const labels = "ABCDEFGH".slice(0, choices.length).split("");
    this._answerLabels = labels.slice();
    const self = this;
    choices.forEach((txt, i) => {
      const b = el("button", { class: "ppq-option ppq-option-mcq", "data-label": labels[i] }, '<span class="ppq-key">' + labels[i] + "</span> <span>" + (txt || "") + "</span>");
      b.addEventListener("click", () => self.selectMCQ(labels[i]));
      grid.appendChild(b);
    });
    grid.style.display = "flex";
    this.q(".ppq-reveal").style.display = "none";
    this.q(".ppq-kb-hint").textContent = "Press 1–" + labels.length + " or A–" + labels[labels.length - 1] + " to answer · S skip · ← previous";
    /* QoderWork 2026-07-23: pre-answer guess panel retired (now in the pop-up). */
    this.q(".ppq-guess").style.display = "none";
  };

  Viewer.prototype._renderFlashcard = function (q) {
    this._answerLabels = [];
    this.q(".ppq-options").style.display = "none";
    this.q(".ppq-reveal").style.display = "inline-block";
    this.q(".ppq-kb-hint").textContent = "Enter/R to reveal the markscheme · S skip · ← previous";
  };

  Viewer.prototype._optionLabels = function (q) {
    const o = this.cfg.options;
    if (q.option_labels && q.option_labels.length) return q.option_labels;
    if (q.option_count) return "ABCDEFGHIJ".slice(0, q.option_count).split("");
    if (o.labels && o.labels.length) return o.labels;
    if (o.count) return "ABCDEFGHIJ".slice(0, o.count).split("");
    return [];
  };

  // --------------------------------------------------------------- marking
  Viewer.prototype.selectOption = function (label) {
    if (this.answered) return;
    this.answered = true;
    this._commitTimer(); /* QoderWork 2026-07-22: freeze the clock + time-pressure context */
    const correct = this.cfg.correctOf(this.cur).toUpperCase();
    const isRight = label.toUpperCase() === correct;
    this._chosenLabel = label.toUpperCase(); this._wasRight = isRight;
    /* Keep the question neutral until the pupil has declared or skipped the guess
       page. The selected letter remains visible, but correctness must not leak
       through the transparent analysis sheet behind it. */
    this._answerRevealPending = true;
    this.qa(".ppq-option").forEach((b) => {
      if (b.dataset.label.toUpperCase() === label.toUpperCase()) b.classList.add("chosen");
    });
    this._recordAttempt(label, isRight);
    this._afterAnswer();
  };

  Viewer.prototype.selectMCQ = function (label) {
    if (this.answered) return;
    this.answered = true;
    this._commitTimer(); /* QoderWork 2026-07-22: freeze the clock + time-pressure context */
    const correct = (this.cfg.answerKeyOf(this.cur) || "").toString().toUpperCase();
    const isRight = label.toUpperCase() === correct;
    this._chosenLabel = label.toUpperCase(); this._wasRight = isRight;
    this._answerRevealPending = true;
    this.qa(".ppq-option").forEach((b) => {
      if (b.dataset.label.toUpperCase() === label.toUpperCase()) b.classList.add("chosen");
    });
    this._recordAttempt(label, isRight);
    this._afterAnswer();
  };

  Viewer.prototype._revealCommittedAnswer = function () {
    if (!this.answered || !this._answerRevealPending || !this.cur) return;
    this._answerRevealPending = false;
    const chosen = String(this._chosenLabel || "").toUpperCase();
    const correct = String(this._curType === "mcq"
      ? (this.cfg.answerKeyOf(this.cur) || "")
      : (this.cfg.correctOf(this.cur) || "")).toUpperCase();
    const reveal = this.cfg.revealCorrect !== false;
    this.qa(".ppq-option").forEach((b) => {
      const label = String(b.dataset.label || "").toUpperCase();
      if (label === chosen) b.classList.add("chosen");
      if (!reveal) return;
      if (label === correct) b.classList.add("correct");
      else if (label === chosen) b.classList.add("incorrect");
    });
    if (this._curType === "mcq") {
      this._showExaminer(this.cur);
      return;
    }
    const al = this.q(".ppq-answer-line");
    al.className = "ppq-answer-line show";
    al.textContent = reveal
      ? (this._wasRight ? "Correct, " + correct : "Marked wrong, correct answer is " + correct)
      : "Answer saved.";
  };

  Viewer.prototype.reveal = function () {
    if (this.answered) return;
    if (this._curType === "flashcard") {
      this.answered = true;
      this._commitTimer(); /* QoderWork 2026-07-22: stop the clock on reveal */
      let ms = this._formatMarkscheme(this.cfg.markschemeOf(this.cur));
      const ansImg = this.cfg.answerUrlOf(this.cur);
      // QoderWork 2026-07-22: softened spoiler wording, aligned with the Chemistry viewer
      if (ansImg) ms += '<details class="ppq-ms-full"><summary>Show full markscheme page <span class="ppq-spoiler">(may well contain spoilers for other parts)</span></summary><img src="' + esc(ansImg) + '"></details>';
      this.q(".ppq-markscheme").innerHTML = ms;
      this.q(".ppq-answer-panel").className = "ppq-answer-panel show";
      this._showExaminer(this.cur);
      this.q(".ppq-reveal").style.display = "none";
      if (this.cfg.modules.math) this._applyMath(this.q(".ppq-answer-panel"));
      this._afterAnswer();
    } else {
      // imageSelfMark reveal: show correct, do not lock a graded attempt
      const correct = this.cfg.correctOf(this.cur).toUpperCase();
      this.qa(".ppq-option").forEach((b) => { if (b.dataset.label.toUpperCase() === correct) b.classList.add("correct"); });
      const al = this.q(".ppq-answer-line"); al.className = "ppq-answer-line show"; al.textContent = "Correct answer: " + (correct || "?") + " (not logged)";
    }
  };

  Viewer.prototype._afterAnswer = function () {
    this.q(".ppq-skip").style.display = "none";
    this.q(".ppq-reveal").style.display = "none";
    this.q(".ppq-competence").className = "ppq-competence show";
    /* QoderWork 2026-07-22 (analyst handoff): the outer "Actually, I wasn't sure"
       control is superseded by the post-answer guess correction that now sits
       inside the modal right after the verdict. Keep it hidden (DOM + wiring
       retained so the change stays reversible). */
    this.q(".ppq-unsure").style.display = "none";
    this.q(".ppq-guess").style.display = "none"; /* QoderWork 2026-07-22 (v0.2.6): pre-declare closes once answered */
    this.q(".ppq-kb-hint").textContent = "Self-rate, then Enter for next.";
    /* The post-question feedback flow opens for every question. Authored analysis
       enriches it, but is not required for guess capture, reflection or rating. */
    if (!this._renderInterrogation()) {
      this._revealCommittedAnswer();
      this._firePendingDashboardPulse();
    }
  };

  Viewer.prototype._showExaminer = function (q) {
    const body = this.cfg.examinerOf(q);
    if (!body) return;
    this.q(".ppq-examiner-body").innerHTML = body;
    this.q(".ppq-answer-panel").classList.add("show", "has-examiner");
  };

  Viewer.prototype._formatMarkscheme = function (t) {
    let s = t || "";
    s = s.replace(/✓/g, "✓<br><br>");
    s = s.replace(/\bOR\b/g, "<br>&nbsp;&nbsp;<i>OR</i><br>&nbsp;&nbsp;");
    s = s.replace(/Do not accept/g, "<br><b>Do not accept</b>");
    s = s.replace(/Do not award/g, "<br><b>Do not award</b>");
    s = s.replace(/(?<!Do not )Accept /g, "<br><b>Accept </b>");
    s = s.replace(/(?<!Do not )Award /g, "<br><b>Award </b>");
    return s;
  };

  Viewer.prototype._recordAttempt = function (chosen, isRight) {
    const cfg = this.cfg;
    const row = Object.assign({
      learner_id: cfg.learnerId, id: cfg.idOf(this.cur), chosen_option: chosen, correct: !!isRight, is_correct: isRight ? "right" : "wrong",
      time_ms: Date.now() - this.shownAt, timing_mode: cfg.timingMode, self_report: null, ts: new Date().toISOString(),
      app_version: cfg.appVersion, context: { view: "viewer", id: cfg.idOf(this.cur), type: this._curType },
      attempt_id: this._attemptId || "" /* QoderWork 2026-07-22 (analyst handoff) */
    }, cfg.attemptFields(this.cur));
    /* QoderWork 2026-07-22 (analyst handoff): attach the pre-answer guess snapshot
       so a later correction can be reconciled with what was declared up front. */
    if (this._preGuessDeclaration) row.pre_guess_declaration = this._preGuessDeclaration;
    this.store.attempts.push(row);
    this._pendingDashboardPulse = cfg.groupKey(this.cur);
    this._saveStore();
    /* QoderWork 2026-07-22: report the attempt to the hosting page's callback.
       When the exam timer is on, _commitTimer has stored the time-pressure context
       (time_remaining_ms + time_pressure) so a fast answer can be told apart from a
       guess downstream — fast-with-clock-to-spare vs forced-by-an-expiring-timer. */
    const extra = { correct: !!isRight, time_ms: row.time_ms, attempt_id: this._attemptId || "" };
    if (this._preGuessDeclaration) extra.pre_guess_declaration = this._preGuessDeclaration;
    if (this._timerCtx) {
      if (this._timerCtx.time_remaining_ms != null) extra.time_remaining_ms = this._timerCtx.time_remaining_ms;
      if (this._timerCtx.time_pressure) extra.time_pressure = this._timerCtx.time_pressure;
    }
    this._fireReport({ status: "answered", picked_id: chosen, level: (this.cur && this.cur.level) || "", extra_json: JSON.stringify(extra) });
  };

  // --------------------------------------------------------------- exam timer (module, QoderWork 2026-07-22)
  /* Silent capture (time_ms) is always on; this is the optional visible clock plus
     time-banking plus the time-pressure context. All methods no-op unless
     config.timer is set. NOTE-TO-SELF: per-question allocation is a single
     perQuestionSec for every question — ESAT may want per-subject/per-paper
     budgets; banking is a simple surplus-carries-forward pool (floored at 0). */
  Viewer.prototype._startTimer = function () {
    this._stopTimer();
    const t = this.cfg.timer;
    const tel = this.q(".ppq-timer");
    if (!t) { if (tel) tel.style.display = "none"; return; }
    if (this._timeBankMs == null) this._timeBankMs = (t.bankSec || 0) * 1000;
    const alloc = t.perQuestionSec * 1000;
    this._qBudgetMs = (t.mode === "down") ? alloc + this._timeBankMs : 0;
    this._timerCtx = null;
    if (tel) {
      tel.className = "ppq-timer ppq-timer--" + t.prominence;
      tel.style.display = (t.prominence === "hidden") ? "none" : "";
      tel.textContent = "";
    }
    const self = this;
    this._tickTimer();
    this._timerInterval = setInterval(function () { self._tickTimer(); }, 250);
  };
  Viewer.prototype._stopTimer = function () {
    if (this._timerInterval) { clearInterval(this._timerInterval); this._timerInterval = null; }
  };
  Viewer.prototype._tickTimer = function () {
    const t = this.cfg.timer;
    const tel = this.q(".ppq-timer");
    if (!t || !tel || t.prominence === "hidden") return;
    const elapsed = Date.now() - this.shownAt;
    if (t.mode === "down") {
      const remaining = (this._qBudgetMs || 0) - elapsed;
      tel.textContent = this._fmtClock(Math.max(0, remaining));
      tel.classList.toggle("ppq-timer--forced", remaining <= 0);
      tel.classList.toggle("ppq-timer--tight", remaining > 0 && remaining <= t.pressureSec * 1000);
    } else {
      tel.textContent = this._fmtClock(elapsed);
    }
  };
  Viewer.prototype._fmtClock = function (ms) {
    const s = Math.max(0, Math.floor(ms / 1000));
    const m = Math.floor(s / 60);
    const r = s % 60;
    return m + ":" + (r < 10 ? "0" : "") + r;
  };
  Viewer.prototype._commitTimer = function () {
    this._stopTimer();
    const t = this.cfg.timer;
    if (!t) { this._timerCtx = null; return; }
    const elapsed = Date.now() - this.shownAt;
    const ctx = { time_ms: elapsed };
    if (t.mode === "down") {
      const alloc = t.perQuestionSec * 1000;
      const remaining = (this._qBudgetMs || alloc) - elapsed;
      ctx.time_remaining_ms = Math.max(0, remaining);
      ctx.time_pressure = remaining <= 0 ? "forced" : (remaining <= t.pressureSec * 1000 ? "tight" : "ok");
      /* banking: time saved under the allocation carries forward; overrunning draws
         the bank down (floored at 0). */
      if (t.banking) this._timeBankMs = Math.max(0, (this._timeBankMs || 0) + (alloc - elapsed));
    }
    this._timerCtx = ctx;
  };

  // --------------------------------------------------------------- post-question interrogation (module, HALF-WORKING)
  /* QoderWork 2026-07-22 — v0.2.4/v0.2.5 passes, from Smith's live review:
     - v0.2.5 CORRECTION: the verdict leads. Smith's v0.2.4 remark was that the
       abstract "What this question is really about?" headline was the FIRST thing
       shown — a fault of ORDERING. It was misread as "never tell them right/wrong"
       (he never said that); verdicts are back and the chosen-option block now
       comes before the probe. (The engine keeps an opt-in revealCorrect:false
       switch for a possible future test mode.)
     - method descriptions are set out on MULTIPLE LINES — the single-line algebra
       was "quite hard to read" (Smith).
     - every method gets a little "used it" TICKBOX (multi-select across methods),
       replacing the single 6-state shortcut-awareness ladder and the one green
       "Use this" button ("I don't know why one is green and one's not").
     - "beats the trap" and the "~15s" speed labels are GONE ("I don't know what
       beat the trap means could you please get rid of this 15 second stuff").
     - the 1-6 self-rating now lives INSIDE the pop-up ("that one, two, three,
       four, five, six is back outside. Probably should be inside it there"), with
       its own Next button. Closing the pop-up early restores the outer 1-6 row so
       the pupil is never stranded (see closeModal).
     STILL ROUGH: probe/method/slug wording is analyst-facing (Smith will reword);
     feedback `when` grammar is partial; elimination-chip parse is a stopgap. */
  Viewer.prototype._renderInterrogation = function () {
    const cfg = this.cfg;
    if (!cfg.modules.postQuestionReview || !cfg.analysisOf) return false;
    const authoredRec = cfg.analysisOf(this.cur);
    /* VSAFE-01 (Claude 2026-07-28): the safety gate sits at this single entry
       point. A withheld or damaged record is treated exactly like an absent
       one — the pupil gets the generic guess/feedback/rating shell, with no
       fragment of the unsafe content rendered — and the reason appears only
       in the ?review strip below. */
    const contentSafety = this._contentSafety(this.cur, authoredRec);
    const contentWithheld = !!authoredRec && !contentSafety.safe;
    const hasAuthoredAnalysis = !!authoredRec && !contentWithheld;
    /* Every answered question gets the same feedback shell. This deliberately
       supplies only safe structural defaults: it never invents a method,
       misconception or suggestion when the question has not been analysed yet. */
    const rec = hasAuthoredAnalysis ? authoredRec : {
      schema_version: "viewer-feedback-fallback-v1",
      identity: {
        id: cfg.idOf(this.cur),
        correct_answer: cfg.correctOf(this.cur)
      },
      options: [],
      methods: [],
      self_report_prompts: [],
      feedback: []
    };
    this._analysis = rec;
    this._analysisSelfReports = {};
    this._thingsUsedStates = {};
    /* QoderWork 2026-07-22 (analyst handoff): per-prompt chosen states drive the
       v2 feedback match; the post-answer guess flag gates guess-aware feedback. */
    this._promptStates = {};
    this._postGuessDeclared = false;

    const self = this;
    const isV2 = this._isV2(rec);
    const reviewMode = this._analysisReviewMode();
    const iq = el("div", { class: "ppq-iq" });

    /* --- QoderWork 2026-07-23 (analyst request #4): reviewer-only analysis strip.
       Visible only with ?review in the URL. Distinguishes "the analysts ignored
       this" from "the data contains it but the viewer hid it". --- */
    if (reviewMode) {
      const rv = rec.review || {};
      const srpCount = (rec.self_report_prompts || []).length;
      const pqcCount = ((rec.requirements || {}).post_question_checks || []).length;
      const strip = el("div", { class: "ppq-iq-reviewer-strip" });
      /* VSAFE-01: reviewers see WHY content was withheld (and what its review
         status claimed); pupils never do. */
      const withheldNote = contentWithheld
        ? ("CONTENT WITHHELD (was: " + (((authoredRec || {}).review || {}).status || "no review") + ") — " +
           (contentSafety.reasons.join("; ") || "no reason recorded"))
        : null;
      strip.textContent = [
        (rec.identity && rec.identity.id) || rec.id || "?",
        "schema " + (rec.schema_version || "?"),
        withheldNote || (hasAuthoredAnalysis ? (rv.status || "no review") : "no authored analysis"),
        rv.reviewer ? "by " + rv.reviewer : "",
        rv.crop_checked ? "crop✓" : "crop?",
        rv.answer_checked ? "answer✓" : "answer?",
        srpCount + " srp + " + pqcCount + " pqc"
      ].filter(Boolean).join(" · ");
      iq.appendChild(strip);
      if (isV2) iq.appendChild(this._reviewerDiagnosticsV2(rec));
    }

    const chosen = this._chosenLabel;
    const correctLetter = isV2
      ? String((rec.identity && rec.identity.correct_answer) || "").toUpperCase()
      : (cfg.correctOf(this.cur) || "").toString().toUpperCase();

    /* --- QoderWork 2026-07-23: GUESS PAGE FIRST (before the verdict). The pupil
       answers, the pop-up opens straight onto "Want to declare a bit of a guess?",
       they tick options or press Enter to accept what is already there, and ONLY
       THEN does the verdict appear. A beat of suspense before the reveal. The old
       pre-answer panel below the question and the old post-answer correction are
       both superseded. --- */
    const labels = (this._answerLabels && this._answerLabels.length) ? this._answerLabels : (this._optionLabels(this.cur) || []);
    const guessPage = el("div", { class: "ppq-iq-guesspage" });
    const restPage = el("div", {
      class: "ppq-iq-rest",
      style: "display:none;",
      tabIndex: -1,
      role: "region",
      ariaLabel: "Answer analysis"
    });
    let restRevealPending = false;

    if (labels.length >= 2) {
      guessPage.appendChild(el("div", { class: "ppq-iq-guesspage-heading" }, esc(this._guessLabel("pre_verdict"))));
      const picker = this._buildGuessPicker({
        labels: labels,
        preselect: chosen ? [String(chosen).toUpperCase()] : [],
        stage: "pre_verdict",
        prompt: this._guessPrompt("pre_verdict"),
        onDone: (payload) => { self._commitPreVerdictGuess(payload, chosen, self._wasRight); revealRest(); },
        onSkip: () => { revealRest(); }
      });
      guessPage.appendChild(picker);
      /* Enter accepts the pre-filled percentages when at least two candidates are
         selected; with only the pupil's answer selected it takes the ordinary
         no-guess path. The picker handles control-focused events itself; this is
         the page-level fallback. */
      guessPage.addEventListener("keydown", function handler(e) {
        if (e.key !== "Enter" || e.repeat) return;
        e.preventDefault(); e.stopPropagation();
        const advanced = picker._ppqSubmitOrSkip
          ? picker._ppqSubmitOrSkip()
          : false;
        if (advanced) guessPage.removeEventListener("keydown", handler);
      });
    } else {
      /* QoderWork 2026-07-23: fewer than 2 options — no guess to declare, skip
         straight to the verdict. Feedback rendered after mount (below). */
      guessPage.style.display = "none";
      restPage.style.display = "";
    }

    function revealRest() {
      if (restRevealPending || restPage.style.display !== "none") return;
      restRevealPending = true;
      guessPage.classList.add("ppq-iq-guesspage-leaving");
      /* A short, perceptible beat makes the pupil's Done/Skip action visibly cause
         the verdict rather than swapping a long panel instantaneously. Reset the
         persistent modal scroller as well: a new question must never inherit the
         previous question's halfway-down scroll position. */
      setTimeout(function () {
        if (!iq.isConnected) return;
        const content = self.q(".ppq-modal-content");
        self._revealCommittedAnswer();
        guessPage.style.display = "none";
        restPage.style.display = "";
        restPage.classList.add("ppq-iq-rest-fired");
        if (typeof restPage.focus === "function") {
          try { restPage.focus({ preventScroll: true }); }
          catch (_) { restPage.focus(); }
        }
        if (content) {
          if (typeof content.scrollTo === "function") content.scrollTo({ top: 0, behavior: "smooth" });
          else content.scrollTop = 0;
        }
        self._renderSelectedOptionDiagnosticV2();
        self._renderInterrogationFeedback();
      }, 180);
    }

    /* --- 1. the verdict FIRST within the rest (analyst handoff): the concrete
       "You chose X — the answer is Y" leads. The error_path explanation beneath
       it is optional; the verdict line itself is not. --- */
    restPage.appendChild(this._verdictEl(rec, isV2, chosen, correctLetter, this._wasRight, reviewMode));

    if (isV2) {
      /* The pupil sees only the diagnostic question for the option they chose.
         The full reconstructed distractor table is available in review mode. */
      restPage.appendChild(el("div", { class: "ppq-iq-selected-diagnostic" }));
      /* --- 3. the pupil insight (first_notice / why_it_matters / next_move) --- */
      this._appendInsightV2(restPage, rec);
      /* --- 4. methods + the prompts that sit beside them (handoff #2 + #4) --- */
      const renderedPrompts = this._appendMethodsV2(restPage, rec);
      /* --- 5. remaining self-report: orphan prompts + knowledge checks --- */
      this._appendSelfReportV2(restPage, rec, renderedPrompts);
    } else {
      if (hasAuthoredAnalysis) {
        /* legacy analysis-store path: probe + free-prose methods */
        this._appendProbeLegacy(restPage, rec);
        this._appendMethodsLegacy(restPage, rec, correctLetter);
      } else {
        /* Graceful fallback: retain the useful attempt-feedback controls while
           being explicit that question-specific teaching has not been authored. */
        restPage.appendChild(el("div", { class: "ppq-iq-fallback-note" },
          "Question-specific suggestions are still being prepared."));
      }
    }
    /* This belongs to the attempt-feedback shell, not to any analysis schema.
       Show it exactly once for v2, legacy and no-analysis questions alike. */
    this._appendFreeformReflectionV2(restPage, rec);

    /* --- feedback lands here (reacts to the self-report + guess declaration) --- */
    restPage.appendChild(el("div", { class: "ppq-iq-feedback" }));

    /* --- the 1-6 self-rating, INSIDE the pop-up (was "back outside") --- */
    const rate = el("div", { class: "ppq-iq-rate" });
    rate.appendChild(el("div", { class: "ppq-iq-rate-prompt" }, esc(cfg.selfReport.prompt)));
    const scale = el("div", { class: "ppq-scale ppq-iq-scale" });
    const meanings = cfg.selfReport.meanings || [];
    for (let v = 1; v <= cfg.selfReport.levels; v++) {
      const lbl = cfg.selfReport.labels ? cfg.selfReport.labels[v - 1] : String(v);
      const meaning = meanings[v - 1] || "";
      scale.appendChild(el("button", { class: "ppq-scale-btn ppq-iq-scale-btn", "data-val": String(v), title: meaning ? (v + " — " + meaning) : "" }, esc(lbl)));
    }
    rate.appendChild(scale);
    if (meanings.length) {
      rate.appendChild(el("div", { class: "ppq-scale-legend" }, meanings.map(function (mm, i) { return '<span class="ppq-scale-legend-item"><b>' + (i + 1) + "</b> " + esc(mm) + "</span>"; }).join("")));
    }
    const prior = this.store.scores[cfg.idOf(this.cur)];
    if (prior) { const sb = scale.querySelector('.ppq-iq-scale-btn[data-val="' + prior + '"]'); if (sb) sb.classList.add("sel"); }
    const iqNext = el("button", { class: "ppq-btn ppq-primary ppq-iq-next", type: "button", style: "display:none;" }, "Next question →");
    iqNext.addEventListener("click", () => { self.closeModal(); self.next(); });
    scale.addEventListener("click", (e) => {
      const b = e.target.closest ? e.target.closest(".ppq-iq-scale-btn") : null;
      if (!b) return;
      const val = parseInt(b.dataset.val, 10);
      scale.querySelectorAll(".ppq-iq-scale-btn").forEach((x) => x.classList.remove("sel"));
      b.classList.add("sel");
      if (self.cur) {
        self.store.scores[self.cfg.idOf(self.cur)] = val; self._saveStore();
        self._fireReport({ status: "rated", qtype: "self_report", extra_json: JSON.stringify({ rating: val }) });
      }
      iqNext.style.display = "inline-block"; iqNext.focus();
    });
    rate.appendChild(iqNext);
    restPage.appendChild(rate);

    /* --- VF-07 (Claude 2026-07-28): the flag is REAL now — persisted per
       question in the store and surfaced through the header's Flagged filter.
       The copy is honest: it promises only the list, not a recommender that
       does not exist yet. --- */
    const flagId = cfg.idOf(this.cur);
    const flagCopy = function (on) {
      return on ? "Flagged ✓ — in your flagged list" : "Flag this question — save it to your flagged list";
    };
    const wasFlagged = !!(((this.store || {}).flags) || {})[flagId];
    const flag = el("button", { class: "ppq-iq-flag" + (wasFlagged ? " on" : ""), type: "button" }, flagCopy(wasFlagged));
    flag.addEventListener("click", () => {
      if (!self.store.flags) self.store.flags = {};
      const on = !self.store.flags[flagId];
      if (on) self.store.flags[flagId] = Date.now(); else delete self.store.flags[flagId];
      flag.classList.toggle("on", on);
      flag.textContent = flagCopy(on);
      self._saveStore();
      if (self._syncFlaggedToggle) self._syncFlaggedToggle();
      self._fireReport({ status: "flag_review", qtype: "review_flag", extra_json: JSON.stringify({ flagged: on, question_id: flagId }) });
    });
    restPage.appendChild(flag);

    /* --- QoderWork 2026-07-24 (handoff #5): review status and reviewer are
       REVIEWER-ONLY. The old pupil-facing "Full review · <reviewer>" footer is gone;
       the ?review strip (above) is now the single place status + reviewer appear. --- */

    /* --- mount into the modal shell and open the pop-up. The guess page shows
       first; the rest (verdict onward) is hidden until Done/Skip. While the pop-up
       holds the 1-6, the outer 1-6 row is hidden; closeModal restores it. --- */
    iq.appendChild(guessPage);
    iq.appendChild(restPage);
    const body = this.q(".ppq-modal-body");
    const modalContent = this.q(".ppq-modal-content");
    /* The modal shell is reused between questions, including its scroll position.
       Put every newly answered question at the start before its content appears. */
    if (modalContent) modalContent.scrollTop = 0;
    body.innerHTML = "";
    body.appendChild(iq);
    /* QoderWork 2026-07-24 (handoff #1): the interrogation pop-up is minimisable.
       Show the minimise button and fill the reminder so a shrunk bar still tells the
       pupil which question (and which option they chose) the analysis belongs to. */
    const minBtn = this.q(".ppq-modal-min");
    minBtn.style.display = "";
    const reminderParts = [cfg.metaLine(this.cur) || ""];
    if (cfg.analysisReminderGroup) {
      let groupReminder = "";
      try { groupReminder = cfg.groupLabel(this.cur) || ""; }
      catch (_) { groupReminder = ""; }
      if (groupReminder) reminderParts.push(groupReminder);
    }
    if (chosen) reminderParts.push("you chose " + String(chosen).toUpperCase());
    this.q(".ppq-modal-reminder").textContent = reminderParts.filter(Boolean).join("  ·  ");
    this._setFeedbackStatusBadge(
      this.q(".ppq-modal-feedback-status"),
      this.cur,
      "ppq-modal-feedback-status"
    );
    this.q(".ppq-modal").classList.add("show", "ppq-modal-analysis");
    this.root.classList.add("ppq-analysis-open");
    this._iqBox = iq;
    this._iqOpen = true;
    if (modalContent) modalContent.scrollTop = 0;
    this.q(".ppq-competence").style.display = "none";
    /* QoderWork 2026-07-23: if the rest is already showing (no guess page — fewer
       than 2 options), render feedback now. Otherwise it fires inside revealRest()
       once the guess page is dismissed. */
    if (restPage.style.display !== "none") {
      this._revealCommittedAnswer();
      this._renderSelectedOptionDiagnosticV2();
      this._renderInterrogationFeedback();
    }
    return true;
  };

  /* QoderWork 2026-07-22 (analyst handoff): an analysis-v2 record is detected by
     its identity + pupil_analysis blocks. Legacy analysis-store records have a
     probe + free-prose methods instead. */
  Viewer.prototype._isV2 = function (rec) {
    return !!(rec && rec.identity && rec.pupil_analysis);
  };

  Viewer.prototype._analysisReviewMode = function () {
    return typeof location !== "undefined" && /[?&]review(?:[=&]|$)/.test(location.search || "");
  };

  /* Reviewer-only reconstruction. This makes it possible to distinguish missing
     analysis from pupil-facing projection without exposing the table to pupils. */
  Viewer.prototype._reviewerDiagnosticsV2 = function (rec) {
    const details = el("details", { class: "ppq-iq-reviewer-details" });
    details.appendChild(el("summary", null, "Reviewer analysis payload"));

    const tax = rec.taxonomy || {};
    const taxonomy = el("div", { class: "ppq-iq-reviewer-taxonomy" });
    [
      ["Topic", tax.topic],
      ["Subtopics", (tax.subtopics || []).join(", ")],
      ["Reasoning", (tax.reasoning_tags || []).join(", ")],
      ["Option structure", (tax.option_structure_tags || []).join(", ")]
    ].forEach((row) => {
      if (!row[1]) return;
      const line = el("div", { class: "ppq-iq-reviewer-line" });
      line.appendChild(el("b", null, esc(row[0] + ": ")));
      line.appendChild(el("span", null, analysisMathEsc(row[1])));
      taxonomy.appendChild(line);
    });
    if (taxonomy.children.length) details.appendChild(taxonomy);

    const options = el("div", { class: "ppq-iq-reviewer-options" });
    (rec.options || []).forEach((opt) => {
      const row = el("div", { class: "ppq-iq-reviewer-option", "data-option": String(opt.label || "").toUpperCase() });
      const head = String(opt.label || "?").toUpperCase() +
        (opt.is_correct ? " - correct" : "") +
        (opt.diagnostic_confidence ? " - confidence: " + opt.diagnostic_confidence : "");
      row.appendChild(el("div", { class: "ppq-iq-reviewer-option-head" }, esc(head)));
      if (opt.error_path) row.appendChild(el("div", { class: "ppq-iq-reviewer-error-path" }, analysisMathEsc(opt.error_path)));
      if (opt.bait && opt.bait.length) {
        row.appendChild(el("div", { class: "ppq-iq-reviewer-bait" }, "<b>Bait:</b> " + analysisMathEsc(opt.bait.join(" | "))));
      }
      const tagIds = [];
      (opt.error_tags || []).forEach((tag) => { if (tag && tag.id) tagIds.push(tag.id); });
      if (tagIds.length) {
        row.appendChild(el("div", { class: "ppq-iq-reviewer-tags" }, "<b>Tags:</b> " + esc(tagIds.join(", "))));
      }
      options.appendChild(row);
    });
    if (options.children.length) details.appendChild(options);

    const notes = ((rec.review || {}).notes) || [];
    if (notes.length) {
      const noteBox = el("div", { class: "ppq-iq-reviewer-notes" });
      noteBox.appendChild(el("b", null, "Review notes"));
      const ul = el("ul");
      notes.forEach((note) => ul.appendChild(el("li", null, analysisMathEsc(note))));
      noteBox.appendChild(ul);
      details.appendChild(noteBox);
    }
    return details;
  };

  /* QoderWork 2026-07-22 (analyst handoff): the verdict. ALWAYS rendered — the
     concrete "You chose X — the answer is Y" line leads even when the chosen
     option has no error_path explanation (the explanation is optional, the
     verdict is not). */
  Viewer.prototype._verdictEl = function (rec, isV2, chosen, correctLetter, isRight, reviewMode) {
    const box = el("div", { class: "ppq-iq-verdict" });
    let opt = null;
    if (chosen && rec.options && rec.options.length) {
      opt = rec.options.filter((o) => String(o.label).toUpperCase() === String(chosen).toUpperCase())[0] || null;
    }
    const op = el("div", { class: "ppq-iq-option " + (isRight ? "right" : "wrong") });
    op.appendChild(el("div", { class: "ppq-iq-option-head" },
      "You chose " + esc(chosen || "?") +
      (isRight ? " — the right answer" : (correctLetter ? " — the answer is " + esc(correctLetter) : ""))));
    /* Deep-v2 error_path is a reconstructed reviewer mechanism, not a known pupil
       history. Pupils get the matching conditional feedback question instead. */
    if (opt && opt.error_path && (!isV2 || reviewMode)) {
      op.appendChild(el("div", { class: "ppq-iq-option-path" }, analysisMathEsc(opt.error_path)));
    }
    /* legacy records carry misconception slugs on the option; v2 hides its tags */
    if (!isV2 && opt && opt.misconception_slugs && opt.misconception_slugs.length) {
      const sl = el("div", { class: "ppq-iq-slugs" });
      opt.misconception_slugs.forEach((s) => sl.appendChild(el("span", { class: "ppq-iq-slug" }, esc(s))));
      op.appendChild(sl);
    }
    box.appendChild(op);
    return box;
  };

  Viewer.prototype._feedbackOptionMatchV2 = function (fb, chosen, isRight) {
    const opts = (fb && fb.selected_options) || [];
    if (!opts.length) return { matches: true, specificity: 0 };
    const upper = opts.map((o) => String(o).toUpperCase());
    if (upper.indexOf(String(chosen || "").toUpperCase()) >= 0) {
      return { matches: true, specificity: 2 };
    }
    if (upper.indexOf("ANY_CORRECT") >= 0 && isRight === true) {
      return { matches: true, specificity: 1 };
    }
    if (upper.indexOf("ANY_WRONG") >= 0 && isRight === false) {
      return { matches: true, specificity: 1 };
    }
    return { matches: false, specificity: -1 };
  };

  Viewer.prototype._feedbackGuessMatchesV2 = function (fb) {
    if (!fb || typeof fb.guess_declared !== "boolean") return true;
    const declared = !!(this._postGuessDeclared || this._preGuessDeclaration);
    return fb.guess_declared === declared;
  };

  /* Pick the most specific answer-only feedback row. A letter-specific row beats
     any_wrong/any_correct; an explicit guess condition beats an unconstrained row.
     Source order is retained when specificity is equal. */
  Viewer.prototype._selectedOptionFeedbackV2 = function (rec) {
    const chosen = String(this._chosenLabel || "").toUpperCase();
    let best = null, bestScore = -1;
    (rec.feedback || []).forEach((fb) => {
      if (fb.prompt_id || !fb.selected_options || !fb.selected_options.length) return;
      const match = this._feedbackOptionMatchV2(fb, chosen, this._wasRight);
      if (!match.matches || !this._feedbackGuessMatchesV2(fb)) return;
      const score = match.specificity * 10 + (typeof fb.guess_declared === "boolean" ? 1 : 0);
      if (score > bestScore) { best = fb; bestScore = score; }
    });
    return best;
  };

  Viewer.prototype._selectedDiagnosticCardV2 = function (rec) {
    const self = this;
    const fb = this._selectedOptionFeedbackV2(rec);
    if (!fb) return null;
    const chosen = String(this._chosenLabel || "").toUpperCase();
    const card = el("div", {
      class: "ppq-iq-diagnostic-card",
      "data-feedback-id": fb.id || "",
      "data-selected-option": chosen
    });
    card.appendChild(el("div", { class: "ppq-iq-diagnostic-kicker" }, "About your answer"));
    card.appendChild(el("div", { class: "ppq-iq-diagnostic-text" }, analysisMathEsc(fb.text || "")));

    const correctChoices = [
      ["complete_reason", "I had a complete reason"],
      ["shortcut_or_check", "I used a shortcut or check"],
      ["not_secure", "I was not fully sure"],
      ["guessed", "It was a guess"]
    ];
    const wrongChoices = [
      ["yes_that_was_it", "Yes, that was it"],
      ["something_like_that", "Something like that"],
      ["another_reason", "No, another reason"],
      ["not_sure", "Not sure"]
    ];
    const choices = this._wasRight ? correctChoices : wrongChoices;
    card.appendChild(el("div", { class: "ppq-iq-diagnostic-question" },
      this._wasRight ? "How did you arrive there?" : "Was that what happened?"));
    const controls = el("div", { class: "ppq-iq-diagnostic-controls" });
    choices.forEach((choice) => {
      const btn = el("button", {
        class: "ppq-iq-diagnostic-choice",
        type: "button",
        "data-state": choice[0]
      }, esc(choice[1]));
      btn.addEventListener("click", () => {
        controls.querySelectorAll(".ppq-iq-diagnostic-choice").forEach((b) => b.classList.remove("sel"));
        btn.classList.add("sel");
        self._fireReport({
          status: "interrogation",
          qtype: "answer_diagnostic",
          extra_json: JSON.stringify({
            question_id: self.cur ? self.cfg.idOf(self.cur) : ((rec.identity || {}).id || ""),
            attempt_id: self._attemptId || "",
            selected_option: chosen,
            feedback_id: fb.id || "",
            response_state: choice[0]
          })
        });
        /* This diagnostic already sits beside its explanation, so there is no
           later feedback branch to jump to. Still make the click visibly land:
           after the same short beat used elsewhere, acknowledge it in place. */
        self._interrogationResponseCue(card, "Recorded", 220);
      });
      controls.appendChild(btn);
    });
    card.appendChild(controls);
    return card;
  };

  Viewer.prototype._renderSelectedOptionDiagnosticV2 = function () {
    if (!this._iqBox || !this._iqBox.isConnected || !this._isV2(this._analysis)) return;
    const slot = this._iqBox.querySelector(".ppq-iq-selected-diagnostic");
    if (!slot) return;
    slot.innerHTML = "";
    const card = this._selectedDiagnosticCardV2(this._analysis);
    if (card) slot.appendChild(card);
  };

  /* QoderWork 2026-07-22 (analyst handoff): the OPTIONAL post-answer guess
     correction, placed inside the modal right after the verdict. The chosen
     option stays IN the picker and starts preselected (never removed). Uses the
     shared _buildGuessPicker; Skip keeps it non-blocking. */
  Viewer.prototype._postGuessEl = function (chosen, isRight) {
    const self = this;
    const wrap = el("div", { class: "ppq-iq-postguess" });
    const labels = (this._answerLabels && this._answerLabels.length) ? this._answerLabels : (this._optionLabels(this.cur) || []);
    if (labels.length < 2) return wrap; /* nothing to declare between */
    const btn = el("button", { class: "ppq-iq-postguess-btn", type: "button" }, this._guessLabel("post_answer"));
    const panel = el("div", { class: "ppq-iq-postguess-panel", style: "display:none;" });
    btn.addEventListener("click", () => {
      const showing = panel.style.display !== "none";
      if (!showing && !panel.childElementCount) {
        panel.appendChild(self._buildGuessPicker({
          labels: labels,
          preselect: chosen ? [String(chosen).toUpperCase()] : [],
          stage: "post_answer",
          prompt: self._guessPrompt("post_answer"),
          onDone: (payload) => { self._commitPostGuess(payload, chosen, isRight); panel.style.display = "none"; btn.classList.remove("open"); },
          onSkip: () => { panel.style.display = "none"; btn.classList.remove("open"); }
        }));
      }
      panel.style.display = showing ? "none" : "";
      btn.classList.toggle("open", !showing);
    });
    wrap.appendChild(btn);
    wrap.appendChild(panel);
    return wrap;
  };

  /* QoderWork 2026-07-22 (analyst handoff): record the post-answer declaration.
     It additionally carries the committed option and its result, recorded
     independently of the candidate set. Fires guess_declaration, then re-matches
     feedback so guess-aware text can appear at the right time. */
  Viewer.prototype._commitPostGuess = function (payload, chosen, isRight) {
    payload.chosen_option = String(chosen || "").toUpperCase();
    payload.correct = !!isRight;
    this._postGuessDeclared = true;
    this._postGuessDeclaration = payload;
    const btn = this._iqBox ? this._iqBox.querySelector(".ppq-iq-postguess-btn") : null;
    if (btn) { btn.textContent = "Recorded: " + payload.candidate_options.join(", ") + " ✓"; btn.classList.add("done"); }
    this._fireReport({ status: "interrogation", qtype: "guess_declaration", extra_json: JSON.stringify(payload) });
    this._renderSelectedOptionDiagnosticV2();
    this._renderInterrogationFeedback();
  };

  /* QoderWork 2026-07-23: record the pre-verdict guess (declared on the pop-up's
     first page, AFTER answering but BEFORE seeing the correct answer). Updates the
     already-stored attempt row retroactively (the attempt was committed the moment
     they picked an option, before the modal opened). */
  Viewer.prototype._commitPreVerdictGuess = function (payload, chosen, isRight) {
    payload.chosen_option = String(chosen || "").toUpperCase();
    payload.correct = !!isRight;
    this._postGuessDeclared = true;
    this._preGuessDeclaration = payload;
    /* retroactively attach to the last stored attempt row */
    const attempts = this.store.attempts;
    if (attempts.length) {
      attempts[attempts.length - 1].pre_guess_declaration = payload;
      this._saveStore();
    }
    this._fireReport({ status: "interrogation", qtype: "guess_declaration", extra_json: JSON.stringify(payload) });
  };

  /* QoderWork 2026-07-22 (analyst handoff): the v2 pupil insight, rendered
     faithfully (first_notice / why_it_matters / next_move). Labels are viewer
     chrome; the prose is the analysts' and is not rewritten. */
  Viewer.prototype._appendInsightV2 = function (iq, rec) {
    const pa = rec.pupil_analysis || {};
    if (!pa.first_notice && !pa.why_it_matters && !pa.next_move) return;
    const box = el("div", { class: "ppq-iq-insight" });
    if (pa.first_notice) box.appendChild(this._insightLine("First thing to notice", pa.first_notice));
    if (pa.why_it_matters) box.appendChild(this._insightLine("Why it matters", pa.why_it_matters));
    if (pa.next_move) box.appendChild(this._insightLine("Next move", pa.next_move));
    iq.appendChild(box);
  };
  Viewer.prototype._insightLine = function (label, text) {
    const line = el("div", { class: "ppq-iq-insight-line" });
    line.appendChild(el("span", { class: "ppq-iq-insight-label" }, esc(label)));
    line.appendChild(el("span", { class: "ppq-iq-insight-text" }, analysisMathEsc(text)));
    return line;
  };

  /* QoderWork 2026-07-24 (handoff #2 + #4): v2 methods render in authored order,
     each styled by presentation_kind (route = dependent numbered steps;
     independent_check = unnumbered peer check; synthesis = combining checks). The
     generic "Ways through it" framing and the collecting-alternatives sentence are
     gone. Each self_report_prompt sits beside the method(s) named by its method_refs;
     a prompt that refers to a whole peer group shows once, after the group's last
     member. A method with an authored local prompt loses the generic "used it" tick.
     Returns the set of rendered prompt ids so the self-report section can skip them. */
  Viewer.prototype._appendMethodsV2 = function (iq, rec) {
    const self = this;
    const labels = (rec.identity && rec.identity.option_labels) || this._optionLabels(this.cur) || [];
    const methods = rec.methods || [];
    const rendered = new Set();
    if (!methods.length) return rendered;

    const indexOf = {};
    methods.forEach((m, i) => { indexOf[m.id] = i; });

    /* Which methods carry an authored local prompt? Those lose the generic "used it". */
    const referenced = new Set();
    (rec.self_report_prompts || []).forEach((p) => (p.method_refs || []).forEach((r) => referenced.add(r)));

    /* Group prompts by the index of their LAST referenced method, so a single-method
       prompt sits right after its method and a group prompt (several method_refs)
       shows once, after the group's last member. */
    const afterMethod = {};
    (rec.self_report_prompts || []).forEach((p) => {
      let last = -1;
      (p.method_refs || []).forEach((r) => { if (indexOf[r] !== undefined && indexOf[r] > last) last = indexOf[r]; });
      if (last < 0) return; /* orphan (no matching method) — the self-report section picks it up */
      (afterMethod[last] = afterMethod[last] || []).push(p);
      rendered.add(p.id);
    });

    /* One compact legend naming only the relationships this question actually uses. */
    const legend = this._optionRailLegendEl(methods);
    if (legend) iq.appendChild(legend);

    methods.forEach((m, i) => {
      const block = self._methodBlockV2(m, labels, referenced.has(m.id));
      /* Phase 1.5 (Smith 2026-07-28): a method with an attached authored prompt
         forms ONE visually continuous card with it — read the steps, answer the
         question about them in the same place. */
      if ((afterMethod[i] || []).length) block.classList.add("ppq-iq-method-joined");
      iq.appendChild(block);
      (afterMethod[i] || []).forEach((p) => iq.appendChild(self._promptBlockV2(p, "method", true)));
    });

    return rendered;
  };

  /* QoderWork 2026-07-24 (handoff #2): a single method block, styled by
     presentation_kind. route steps are numbered (each inference relies on the one
     before); independent_check and synthesis steps are unnumbered peers. */
  Viewer.prototype._methodBlockV2 = function (m, labels, hasLocalPrompt) {
    const self = this;
    const kind = m.presentation_kind || "route";
    const md = el("div", {
      class: "ppq-iq-method ppq-iq-kind-" + kind,
      "data-method-id": m.id || ""
    });
    const head = el("div", { class: "ppq-iq-method-head" });
    head.appendChild(el("span", { class: "ppq-iq-method-kind" }, esc(this._methodKindLabel(kind))));
    head.appendChild(el("b", null, analysisMathEsc(m.title || m.id)));
    md.appendChild(head);
    const steps = el("div", { class: "ppq-iq-method-desc" });
    (m.pupil_steps || []).forEach((s, si) => {
      if (kind === "route") {
        const line = el("div", { class: "ppq-iq-method-line numbered" });
        line.appendChild(el("span", { class: "ppq-iq-stepnum" }, String(si + 1)));
        line.appendChild(el("span", { class: "ppq-iq-steptext" }, analysisMathEsc(s)));
        steps.appendChild(line);
      } else {
        steps.appendChild(el("div", { class: "ppq-iq-method-line" }, analysisMathEsc(s)));
      }
    });
    md.appendChild(steps);
    md.appendChild(self._elimChipsV2El(m, labels));
    /* Phase 1.5 (Smith 2026-07-28): the ask sits at the FOOT of the method,
       where the eye lands after reading the steps, as an explicit yes/no pair
       ("as you read it, you go: yes I did that, no I didn't"), replacing the
       small head-corner "used it" tick. Suppressed when an authored local
       prompt follows (that prompt IS the ask; QoderWork handoff #4 rule kept).
       Same event grammar as before: state "used" / "not_used". */
    if (!hasLocalPrompt) {
      const ask = el("div", { class: "ppq-iq-method-ask" });
      ask.appendChild(el("span", { class: "ppq-iq-method-ask-text" }, esc(this._methodAskText(kind))));
      const yes = el("button", { class: "ppq-iq-used yes", type: "button" }, "Yes, I did");
      const no = el("button", { class: "ppq-iq-used no", type: "button" }, "No, I didn't");
      const pick = function (btn, state) {
        yes.classList.remove("on"); no.classList.remove("on");
        btn.classList.add("on");
        if (state === "used") self._analysisSelfReports[m.id] = "used";
        else delete self._analysisSelfReports[m.id];
        self._fireReport({ status: "interrogation", qtype: "self_report", extra_json: JSON.stringify({ method_id: m.id, method_ref: m.id, state: state }) });
      };
      yes.addEventListener("click", () => pick(yes, "used"));
      no.addEventListener("click", () => pick(no, "not_used"));
      ask.appendChild(yes);
      ask.appendChild(no);
      md.appendChild(ask);
    }
    return md;
  };

  /* Phase 1.5: plain-English ask matched to the method's presentation kind. */
  Viewer.prototype._methodAskText = function (kind) {
    if (kind === "independent_check") return "Did you do this check?";
    if (kind === "synthesis") return "Did you put it together like this?";
    return "Did you use this route?";
  };

  Viewer.prototype._methodKindLabel = function (kind) {
    if (kind === "independent_check") return "check";
    if (kind === "synthesis") return "putting it together";
    return "route";
  };

  /* QoderWork 2026-07-24 (handoff #3): a complete fixed-position option rail. Every
     option label (from identity.option_labels) shows in the same position on every
     row, and the LETTER ITSELF is coloured by relationship — no background, pill,
     border or strikethrough. A surviving option is "unaffected", not positive
     evidence. When option_evidence is absent, eliminates / lands_on are projected
     onto the same complete rail. */
  Viewer.prototype._elimChipsV2El = function (m, labels) {
    const wrap = el("div", { class: "ppq-iq-elim" });
    if (!labels.length) return wrap;
    const relClass = {
      directly_identifies: "di", supports: "sup", favours: "fav", unaffected: "un",
      counts_against: "ca", disfavours: "dis", rules_out: "ro"
    };
    const byLabel = {};
    const evidence = m.option_evidence;
    if (evidence && evidence.length) {
      evidence.forEach((e) => { byLabel[String(e.label).toUpperCase()] = e.relationship; });
    } else {
      /* legacy fallback projected onto the full rail: eliminated -> rules_out,
         lands_on -> directly_identifies, everything else stays unaffected. */
      (m.eliminates || []).forEach((L) => { byLabel[String(L).toUpperCase()] = "rules_out"; });
      if (m.lands_on) byLabel[String(m.lands_on).toUpperCase()] = "directly_identifies";
      if (!Object.keys(byLabel).length) return wrap;
    }
    const row = el("div", { class: "ppq-oev-row" });
    labels.forEach((L) => {
      L = String(L).toUpperCase();
      const rel = byLabel[L] || "unaffected";
      row.appendChild(el("span", { class: "ppq-oev " + (relClass[rel] || "un"), title: rel.replace(/_/g, " ") }, L));
    });
    wrap.appendChild(row);
    return wrap;
  };

  /* QoderWork 2026-07-24 (handoff #3): one compact legend naming only the
     relationships this question's methods actually use. Word + colour swatch —
     never A–G letters as the legend key. */
  Viewer.prototype._optionRailLegendEl = function (methods) {
    const present = new Set();
    (methods || []).forEach((m) => {
      if (m.option_evidence && m.option_evidence.length) {
        m.option_evidence.forEach((e) => present.add(e.relationship));
      } else {
        if ((m.eliminates || []).length) present.add("rules_out");
        if (m.lands_on) present.add("directly_identifies");
      }
    });
    if (!present.size) return null;
    const words = {
      rules_out: "rules out", counts_against: "counts against", disfavours: "disfavours",
      unaffected: "no effect", favours: "favours", supports: "supports", directly_identifies: "identifies"
    };
    const relClass = { directly_identifies: "di", supports: "sup", favours: "fav", unaffected: "un", counts_against: "ca", disfavours: "dis", rules_out: "ro" };
    /* semantic order: negative -> neutral -> positive */
    const order = ["rules_out", "counts_against", "disfavours", "unaffected", "favours", "supports", "directly_identifies"];
    const legend = el("div", { class: "ppq-oev-legend" });
    order.forEach((rel) => {
      if (!present.has(rel)) return;
      const item = el("span", { class: "ppq-oev-legend-item" });
      item.appendChild(el("span", { class: "ppq-oev-swatch " + relClass[rel] }));
      item.appendChild(el("span", null, esc(words[rel] || rel.replace(/_/g, " "))));
      legend.appendChild(item);
    });
    return legend;
  };

  /* QoderWork 2026-07-24 (handoff #4): the self-report items that do NOT sit beside
     a method — orphan prompts (no matching method_refs), the knowledge checks
     (requirement_refs, never method_refs) and the plain check_prompt. Prompts already
     rendered inside the methods section arrive in renderedIds and are skipped here;
     there is no longer a generic "More quick checks" bucket. */
  Viewer.prototype._appendSelfReportV2 = function (iq, rec, renderedIds) {
    renderedIds = renderedIds || new Set();
    const srps = rec.self_report_prompts || [];

    srps.filter((p) => !renderedIds.has(p.id)).forEach((p) => iq.appendChild(this._promptBlockV2(p, "method")));

    /* pupil_analysis.check_prompt — a plain string question, no states */
    const cp = (rec.pupil_analysis || {}).check_prompt;
    if (cp) {
      const cpBox = el("div", { class: "ppq-iq-prompt ppq-iq-checkprompt" });
      cpBox.appendChild(el("div", { class: "ppq-iq-prompt-text" }, analysisMathEsc(cp)));
      iq.appendChild(cpBox);
    }
    this._appendThingsUsedV2(iq, rec);
  };

  Viewer.prototype._thingsUsedItemsV2 = function (rec) {
    const req = rec.requirements || {};
    const items = [], seen = {};
    const add = function (item, kind) {
      if (!item) return;
      const statement = String(item.statement || item.prompt || "").trim();
      if (!statement || seen[statement]) return;
      seen[statement] = true;
      items.push({ id: item.id || (kind + "_" + items.length), kind: kind, statement: statement });
    };
    (req.knowledge_atoms || []).forEach((item) => add(item, "knowledge"));
    (req.technique_atoms || []).forEach((item) => add(item, "technique"));
    /* Add only principles that are not restatements of the atom rows above. */
    (req.principles || []).forEach((item) => {
      if (!(item.atom_refs || []).length) add(item, "principle");
    });
    if (!items.length) (req.principles || []).forEach((item) => add(item, "principle"));
    if (!items.length) (req.post_question_checks || []).forEach((item) => add(item, "check"));
    return items;
  };

  Viewer.prototype._thingsUsedStatesV2 = function () {
    return [
      ["secure_before_question", "Known"],
      ["knew_but_did_not_retrieve", "Known, but did not think of it"],
      ["sketchy_on_this", "Sketchy"],
      ["still_unclear", "Not known"]
    ];
  };

  Viewer.prototype._thingsUsedRowV2 = function (item, rec) {
    const self = this;
    const row = el("div", {
      class: "ppq-iq-thing",
      "data-thing-id": item.id,
      "data-thing-kind": item.kind
    });
    row.appendChild(el("div", { class: "ppq-iq-thing-text" }, analysisMathEsc(item.statement)));
    const states = el("div", { class: "ppq-iq-thing-states" });
    this._thingsUsedStatesV2().forEach((state, index) => {
      const btn = el("button", {
        class: "ppq-iq-thing-state" + (index === 0 ? " sel implicit" : ""),
        type: "button",
        "data-state": state[0]
      }, esc(state[1]));
      btn.addEventListener("click", () => {
        states.querySelectorAll(".ppq-iq-thing-state").forEach((b) => b.classList.remove("sel", "implicit"));
        btn.classList.add("sel");
        self._thingsUsedStates[item.id] = state[0];
        self._fireReport({
          status: "interrogation",
          qtype: "things_used",
          extra_json: JSON.stringify({
            question_id: self.cur ? self.cfg.idOf(self.cur) : ((rec.identity || {}).id || ""),
            attempt_id: self._attemptId || "",
            thing_id: item.id,
            thing_kind: item.kind,
            thing_label: item.statement,
            availability_state: state[0]
          })
        });
        /* These knowledge-state rows do not have authored conditional prose, so
           acknowledge the response in place after the same perceptible beat used
           by the method/diagnostic questions. */
        self._interrogationResponseCue(row, "Recorded", 220);
      });
      states.appendChild(btn);
    });
    row.appendChild(states);
    return row;
  };

  Viewer.prototype._appendThingsUsedV2 = function (iq, rec) {
    const self = this;
    const items = this._thingsUsedItemsV2(rec);
    if (!items.length) return;
    const details = el("details", { class: "ppq-iq-things" });
    details.appendChild(el("summary", null, "Things this question used"));
    details.appendChild(el("div", { class: "ppq-iq-things-intro" },
      "Known is shown as the starting point. Change only the things that were not available when you needed them."));
    const rows = el("div", { class: "ppq-iq-things-rows" });
    items.forEach((item) => rows.appendChild(this._thingsUsedRowV2(item, rec)));
    details.appendChild(rows);

    const confirm = el("button", { class: "ppq-iq-things-confirm", type: "button" }, "Confirm: I knew all of these");
    confirm.addEventListener("click", () => {
      const states = {};
      rows.querySelectorAll(".ppq-iq-thing").forEach((row) => {
        const id = row.dataset.thingId;
        row.querySelectorAll(".ppq-iq-thing-state").forEach((b) => {
          b.classList.toggle("sel", b.dataset.state === "secure_before_question");
          b.classList.remove("implicit");
        });
        self._thingsUsedStates[id] = "secure_before_question";
        states[id] = "secure_before_question";
      });
      confirm.textContent = "All confirmed";
      confirm.classList.add("done");
      self._fireReport({
        status: "interrogation",
        qtype: "things_used_confirm_all",
        extra_json: JSON.stringify({
          question_id: self.cur ? self.cfg.idOf(self.cur) : ((rec.identity || {}).id || ""),
          attempt_id: self._attemptId || "",
          states: states
        })
      });
      self._interrogationResponseCue(details, "Recorded", 220);
    });
    details.appendChild(confirm);
    iq.appendChild(details);
  };

  Viewer.prototype._appendFreeformReflectionV2 = function (iq, rec) {
    const self = this;
    const box = el("div", { class: "ppq-iq-reflection" });
    const label = el("label", { class: "ppq-iq-reflection-label" },
      "Where did you go wrong or lose time? <span>Optional</span>");
    const textarea = el("textarea", {
      class: "ppq-iq-reflection-text",
      rows: 3,
      placeholder: "A quick note is enough."
    });
    label.appendChild(textarea);
    box.appendChild(label);
    const save = el("button", { class: "ppq-iq-reflection-save", type: "button" }, "Save note");
    box.appendChild(save);
    let lastSaved = "";
    const commit = function () {
      const text = String(textarea.value || "").trim();
      if (text === lastSaved) return;
      lastSaved = text;
      const attempts = (self.store && self.store.attempts) || [];
      let attempt = null;
      for (let i = attempts.length - 1; i >= 0; i--) {
        if (!self._attemptId || attempts[i].attempt_id === self._attemptId) { attempt = attempts[i]; break; }
      }
      if (attempt) attempt.freeform_reflection = text;
      if (self._saveStore) self._saveStore();
      save.textContent = "Saved";
      self._fireReport({
        status: "interrogation",
        qtype: "freeform_reflection",
        extra_json: JSON.stringify({
          question_id: self.cur ? self.cfg.idOf(self.cur) : ((rec.identity || {}).id || ""),
          attempt_id: self._attemptId || "",
          text: text
        })
      });
    };
    save.addEventListener("click", commit);
    textarea.addEventListener("blur", commit);
    iq.appendChild(box);
  };

  Viewer.prototype._promptBlockV2 = function (p, kind, attached) {
    const self = this;
    /* Phase 1.5: an attached prompt renders as the continuation of the method
       card it asks about (joined borders, shared background), so the question
       is answered where the content was read. */
    const box = el("div", { class: "ppq-iq-prompt" + (attached ? " ppq-iq-prompt-attached" : "") });
    box.appendChild(el("div", { class: "ppq-iq-prompt-text" }, analysisMathEsc(p.prompt || "")));
    const chips = el("div", { class: "ppq-iq-prompt-states" });
    /* QoderWork 2026-07-24 (handoff #4): opt-in multi-select when several authored
       descriptions can all be true (multi_select flag). Single-select otherwise. */
    const multi = !!p.multi_select;
    (p.states || []).forEach((st) => {
      const chip = el("button", { class: "ppq-iq-state", type: "button", "data-state": st }, self._stateLabel(st));
      chip.addEventListener("click", () => {
        if (multi) {
          chip.classList.toggle("sel");
          const sel = Array.prototype.map.call(chips.querySelectorAll(".ppq-iq-state.sel"), (c) => c.dataset.state);
          self._promptStates[p.id] = sel;
          self._fireReport({ status: "interrogation", qtype: "self_report", extra_json: JSON.stringify({ prompt_id: p.id, prompt_kind: kind, states: sel, attempt_id: self._attemptId || "" }) });
        } else {
          chips.querySelectorAll(".ppq-iq-state").forEach((c) => c.classList.remove("sel"));
          chip.classList.add("sel");
          self._promptStates[p.id] = st;
          self._fireReport({ status: "interrogation", qtype: "self_report", extra_json: JSON.stringify({ prompt_id: p.id, prompt_kind: kind, state: st, attempt_id: self._attemptId || "" }) });
        }
        self._renderInterrogationFeedback(box);
      });
      chips.appendChild(chip);
    });
    box.appendChild(chips);
    return box;
  };
  /* QoderWork 2026-07-24 (handoff #4): never show a raw state id. Strip a leading
     proposed__ prefix and turn the remainder into readable text. Presentation only —
     the analysts' prose is never touched. */
  Viewer.prototype._stateLabel = function (st) {
    const settled = {
      secure_before_question: "Known",
      knew_but_did_not_retrieve: "Known, but did not think of it",
      sketchy_on_this: "Sketchy",
      still_unclear: "Not known",
      yes_that_was_it: "Yes, that was it",
      something_like_that: "Something like that",
      another_reason: "No, another reason",
      not_sure: "Not sure"
    };
    const canonical = String(st || "").replace(/^proposed__/, "");
    if (settled[canonical]) return settled[canonical];
    const s = canonical.replace(/_+/g, " ").trim();
    return s.charAt(0).toUpperCase() + s.slice(1);
  };

  /* QoderWork 2026-07-22 (analyst handoff): legacy analysis-store renderers,
     extracted unchanged so the v2 path can branch around them. */
  Viewer.prototype._appendProbeLegacy = function (iq, rec) {
    if (rec.probe && rec.probe.text) {
      const probe = el("div", { class: "ppq-iq-probe" });
      probe.appendChild(el("div", { class: "ppq-iq-probe-text" }, esc(rec.probe.text)));
      const chips = el("div", { class: "ppq-iq-chips" });
      if (rec.probe.difficulty_source) chips.appendChild(el("span", { class: "ppq-iq-chip" }, "difficulty: " + esc(rec.probe.difficulty_source)));
      if (rec.probe.trick_type) chips.appendChild(el("span", { class: "ppq-iq-chip" }, esc(rec.probe.trick_type)));
      probe.appendChild(chips);
      iq.appendChild(probe);
    }
  };
  Viewer.prototype._appendMethodsLegacy = function (iq, rec, correctLetter) {
    const self = this;
    const labels = this._optionLabels(this.cur) || [];
    if (rec.methods && rec.methods.length) {
      iq.appendChild(el("div", { class: "ppq-iq-subhead" }, "Ways through it"));
      iq.appendChild(el("div", { class: "ppq-iq-encourage" }, "Most of these have more than one route through — collecting alternatives is the point."));
      rec.methods.forEach((m) => {
        const md = el("div", { class: "ppq-iq-method" });
        const head = el("div", { class: "ppq-iq-method-head" });
        head.appendChild(el("b", null, esc(m.id)));
        head.appendChild(el("span", { class: "ppq-iq-kind" }, esc(m.kind)));
        const used = el("button", { class: "ppq-iq-used", type: "button" }, "used it");
        used.addEventListener("click", () => {
          const on = used.classList.toggle("on");
          const ref = m.method_ref || m.id;
          if (on) self._analysisSelfReports[ref] = "used"; else delete self._analysisSelfReports[ref];
          self._fireReport({ status: "interrogation", qtype: "self_report", extra_json: JSON.stringify({ method_id: m.id, method_ref: ref, state: on ? "used" : "not_used" }) });
          self._renderInterrogationFeedback(md);
        });
        head.appendChild(used);
        md.appendChild(head);
        md.appendChild(self._methodLinesEl(m.description));
        md.appendChild(self._elimChipsEl(m, labels, correctLetter));
        iq.appendChild(md);
      });
    }
  };

  /* QoderWork 2026-07-22: set a method's description out on MULTIPLE LINES — the
     one-line algebra was hard to read (Smith). Split on commas/semicolons, and
     "=>" becomes a result line ("⇒ …"). Anything that doesn't split stays as one
     line. NOTE-TO-SELF: a real per-method `steps:[…]` field from the analysts
     would beat this regex pass. */
  Viewer.prototype._methodLinesEl = function (desc) {
    const box = el("div", { class: "ppq-iq-method-desc" });
    const raw = String(desc || "").trim();
    const parts = raw.replace(/=>/g, " ⇒ ").split(/[,;]/).map((s) => s.trim()).filter(Boolean);
    if (parts.length <= 1) { box.appendChild(el("div", { class: "ppq-iq-method-line" }, esc(raw))); return box; }
    parts.forEach((p) => box.appendChild(el("div", { class: "ppq-iq-method-line" + (p.charAt(0) === "⇒" ? " result" : "") }, esc(p))));
    return box;
  };

  Viewer.prototype._interrogationResponseCue = function (origin, text, delay) {
    if (!origin || !origin.isConnected) return;
    const old = origin.querySelector(".ppq-iq-response-cue");
    if (old && old.parentNode) old.parentNode.removeChild(old);
    let cueText = text || "Recorded";
    if (/^Recorded$/i.test(cueText)) cueText += " ✓";
    const cue = el("span", { class: "ppq-iq-response-cue" }, esc(cueText));
    const show = function () {
      if (!origin.isConnected) return;
      origin.appendChild(cue);
      origin.classList.add("ppq-iq-response-fired");
      if (typeof origin.scrollIntoView === "function") {
        origin.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      setTimeout(function () {
        origin.classList.remove("ppq-iq-response-fired");
        if (cue.parentNode) cue.parentNode.removeChild(cue);
      }, 1200);
    };
    if (delay) setTimeout(show, delay);
    else show();
  };

  Viewer.prototype._renderInterrogationFeedback = function (origin) {
    if (!this._iqBox || !this._iqBox.isConnected) return; /* pop-up may have been dismissed */
    const fbBox = this._iqBox.querySelector(".ppq-iq-feedback");
    if (!fbBox) return;
    const fb = this._matchInterrogationFeedback();
    const self = this;
    const token = (this._feedbackRenderToken || 0) + 1;
    this._feedbackRenderToken = token;
    fbBox.innerHTML = "";
    fbBox.classList.remove("ppq-iq-feedback-fired");

    const render = function () {
      if (token !== self._feedbackRenderToken || !fbBox.isConnected) return;
      if (!fb) {
        self._interrogationResponseCue(origin, "Recorded ✓");
        return;
      }
      fbBox.appendChild(el("div", { class: "ppq-iq-feedback-text" }, analysisMathEsc(fb.text)));
      if (!origin) return; /* initial render: do not unexpectedly move the panel */
      fbBox.classList.add("ppq-iq-feedback-fired");
      if (typeof fbBox.scrollIntoView === "function") {
        fbBox.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      setTimeout(function () {
        if (fbBox.isConnected) fbBox.classList.remove("ppq-iq-feedback-fired");
      }, 1500);
    };

    /* On an explicit inline response, wait just long enough for cause and effect to
       register. Initial answer/guess rendering stays immediate. */
    if (origin) setTimeout(render, 220);
    else render();
  };

  /* QoderWork 2026-07-22: best-effort parse of a method's free-prose `eliminates`
     field into red (killed options) and green (lands-on option) letter chips.
     NOTE-TO-SELF: this regex pass is a STOPGAP — the analysts need to add a
     structured per-method field (eliminates:[letters], lands_on:letter) so the
     red/green display is reliable. Anything we can't parse falls back to showing
     the raw prose rather than guessing. */
  Viewer.prototype._elimChipsEl = function (m, labels, correctLetter) {
    const wrap = el("div", { class: "ppq-iq-elim" });
    const txt = (m.eliminates || "").toString();
    if (!txt) return wrap;

    /* green = the letter this method lands on / takes you straight to */
    const green = [];
    const gMatch = txt.match(/(?:lands?\s+(?:\w+\s+)?on|(?:goes?|takes?\s+you)?\s*straight\s+to|leav(?:es|ing|e)(?:\s+only)?|down\s+to|narrows?\s+to|everything\s+but|all\s+but|kills?\s+everything\s+but)\s*([A-H])\b/i);
    if (gMatch) green.push(gMatch[1].toUpperCase());

    /* red = letters this method kills: a parenthesised letter list, and/or an
       explicit elimination verb. Never mark a green letter red. */
    const red = [];
    const addRed = (L) => { L = (L || "").toUpperCase(); if (L && red.indexOf(L) < 0 && green.indexOf(L) < 0) red.push(L); };
    (txt.match(/\(([A-H](?:\s*[,\/&]\s*[A-H])*)\)/g) || []).forEach((g) => { (g.match(/[A-H]/g) || []).forEach(addRed); });
    const verbRe = /(?:rules?\s+out|kills?|eliminates?|removes?|discards?|excludes?|cuts?\s+out)\s+([A-H](?:\s*(?:,|\/|&|and)\s*[A-H])*)/gi;
    let vm;
    while ((vm = verbRe.exec(txt)) !== null) { (vm[1].match(/[A-H]/g) || []).forEach(addRed); }

    /* "narrows to one" phrasing means everything not landed-on is killed */
    const narrows = /(?:everything\s+but|all\s+but|leav(?:es|ing|e)\s+only|down\s+to|narrows?\s+to|kills?\s+everything\s+but)/i.test(txt);
    if (narrows && green.length) labels.forEach((L) => addRed(String(L)));

    if (!green.length && !red.length) {
      /* couldn't parse any letters — show the raw prose rather than guess */
      wrap.appendChild(el("div", { class: "ppq-iq-elim-prose" }, "rules out: " + esc(txt)));
      return wrap;
    }
    /* VSAFE-03 (Claude 2026-07-28): legacy eliminations render through the SAME
       full option rail as deep-v2 (coloured letters; no pills, no background
       boxes, no strikethrough). The rejected `.ppq-elim` pill presentation is
       deleted from the stylesheet; do not reintroduce it. Parsed kills project
       to rules_out, the landing letter to directly_identifies, everything else
       stays unaffected — the exact projection `_elimChipsV2El` already defines. */
    const rail = this._elimChipsV2El({ eliminates: red, lands_on: green[0] || null }, labels);
    const railRow = rail && rail.children && rail.children.length ? rail.children[0] : null;
    if (railRow) wrap.appendChild(railRow);
    wrap.appendChild(el("div", { class: "ppq-iq-elim-prose" }, esc(txt)));
    return wrap;
  };

  Viewer.prototype._matchInterrogationFeedback = function () {
    const rec = this._analysis;
    if (!rec || !rec.feedback) return null;
    /* QoderWork 2026-07-22 (analyst handoff): v2 records use the structured
       selected_options / prompt_id / states / guess_declared grammar; legacy
       records keep the old on/when grammar. */
    if (this._isV2(rec)) return this._matchFeedbackV2(rec, true);
    const chosen = this._chosenLabel, isRight = this._wasRight, sr = this._analysisSelfReports;
    for (let i = 0; i < rec.feedback.length; i++) {
      const fb = rec.feedback[i];
      let onOk = false;
      if (fb.on === "any_wrong") onOk = isRight === false;
      else if (fb.on === "any_correct") onOk = isRight === true;
      else if (fb.on && fb.on.indexOf("option:") === 0) onOk = fb.on.slice(7).toUpperCase() === chosen;
      else if (!fb.on) onOk = true;
      if (!onOk) continue;
      if (this._interrogationWhenMatches(fb.when, sr)) return fb;
    }
    return null;
  };

  /* QoderWork 2026-07-22 (analyst handoff): structured v2 feedback match.
     Constraints (all optional, first entry whose constraints all hold wins):
     - selected_options: the committed option must be in the list;
     - guess_declared: true → a guess must have been declared (pre or post),
       false → it must not have been;
     - prompt_id + states: the learner must have answered that self-report
       prompt, and (if states is non-empty) chosen one of those states. */
  Viewer.prototype._matchFeedbackV2 = function (rec, promptOnly) {
    const chosen = String(this._chosenLabel || "").toUpperCase();
    let best = null, bestScore = -1;
    for (let i = 0; i < rec.feedback.length; i++) {
      const fb = rec.feedback[i];
      if (promptOnly && !fb.prompt_id) continue;
      const optionMatch = this._feedbackOptionMatchV2(fb, chosen, this._wasRight);
      if (!optionMatch.matches || !this._feedbackGuessMatchesV2(fb)) continue;
      if (fb.prompt_id) {
        const st = this._promptStates[fb.prompt_id];
        if (!st || (Array.isArray(st) && !st.length)) continue; /* prompt not answered yet — feedback not ready */
        if (fb.states && fb.states.length) {
          /* QoderWork 2026-07-24 (handoff #4): a multi-select prompt stores an array;
             match when ANY chosen state is in the feedback row's states. */
          const chosenStates = Array.isArray(st) ? st : [st];
          if (!chosenStates.some((s) => fb.states.indexOf(s) >= 0)) continue;
        }
      }
      const score = (fb.prompt_id ? 100 : 0) +
        optionMatch.specificity * 10 +
        (typeof fb.guess_declared === "boolean" ? 1 : 0);
      if (score > bestScore) { best = fb; bestScore = score; }
    }
    return best;
  };

  Viewer.prototype._interrogationWhenMatches = function (when, sr) {
    if (!when) return true;
    const ci = when.indexOf(":");
    if (ci > 0) {
      const state = when.slice(0, ci), ref = when.slice(ci + 1);
      /* Direct: the learner's reported state for the prompted method_ref. */
      if (sr[ref] === state) return true;
      /* NOTE-TO-SELF 3 (rough): feedback may reference a method by KIND rather than
         by the prompted method_ref, e.g. when:"used:full_solve". full_solve is the
         default route, so infer it was used when the learner did NOT report taking a
         prompted shortcut. Reconcile with misconceptions_core.yaml, do not keep. */
      const rec = this._analysis;
      if (rec && rec.methods && state === "used" && ref === "full_solve") {
        const isKind = rec.methods.some((m) => m.kind === "full_solve");
        if (isKind) {
          const tookShortcut = Object.keys(sr).some((k) => sr[k] === "used" || sr[k] === "saw_and_used");
          return !tookShortcut;
        }
      }
      return false;
    }
    /* NOTE-TO-SELF 3: bare derived flag (e.g. did_not_sketch). Crude prefix match on
       the state's first two tokens. Replace with misconceptions_core.yaml look-up. */
    for (const ref in sr) {
      const st = sr[ref];
      const prefix = String(st).split("_").slice(0, 2).join("_");
      if (prefix && when.indexOf(prefix) === 0) return true;
    }
    return false;
  };

  // --------------------------------------------------------------- structured paper (module)
  Viewer.prototype._blockParts = function (q) {
    const cfg = this.cfg, block = cfg.blockKeyOf(q);
    if (!block) return [];
    return this.questions.filter((item) => { const id = cfg.idOf(item); return id === block || String(id).indexOf(block + "(") === 0; });
  };
  Viewer.prototype._renderStructured = function (q, container) {
    const cfg = this.cfg, block = cfg.blockKeyOf(q), parts = this._blockParts(q);
    if (parts.length <= 1) return;
    const self = this;
    const partLabel = (p) => String(cfg.idOf(p)).slice(block.length).trim() || "(whole)";
    // mode toggle + chips
    const nav = el("div", { class: "ppq-wq-nav" });
    nav.appendChild(el("span", { class: "ppq-wq-jump" }, "Question " + esc(block) + ", jump to part:"));
    parts.forEach((p) => {
      const cur = cfg.idOf(p) === cfg.idOf(q);
      const chip = el("button", { class: "ppq-part-chip" + (cur ? " current" : ""), "data-id": cfg.idOf(p) }, esc(partLabel(p)));
      chip.addEventListener("click", () => self.goToId(chip.dataset.id));
      nav.appendChild(chip);
    });
    const modeWrap = el("span", { class: "ppq-mode-toggle" });
    ["whole", "part"].forEach((m) => {
      const b = el("button", { class: "ppq-mode-btn" + (this._structMode === m ? " on" : ""), "data-mode": m }, m === "whole" ? "Whole question" : "Part by part");
      b.addEventListener("click", () => { self._structMode = m; localStorage.setItem(cfg.storageKey + "_structmode", m); self.render(); });
      modeWrap.appendChild(b);
    });
    nav.appendChild(modeWrap);
    container.appendChild(nav);

    if (this._structMode === "whole") {
      const details = el("details", { class: "ppq-whole" }); details.open = true;
      details.appendChild(el("summary", null, "Whole question (all " + parts.length + " parts)"));
      const wrap = el("div", { class: "ppq-wq-parts" });
      parts.forEach((p) => {
        const cur = cfg.idOf(p) === cfg.idOf(q);
        const box = el("div", { class: "ppq-wq-part" + (cur ? " current" : ""), "data-part-id": cfg.idOf(p) });
        box.appendChild(el("div", { class: "ppq-wq-part-label" }, "Part " + esc(partLabel(p)) + (cur ? " (you are here)" : "")));
        cfg.cropsOf(p).forEach((s) => box.appendChild(el("img", { src: s, loading: "lazy" })));
        wrap.appendChild(box);
      });
      details.appendChild(wrap);
      container.appendChild(details);
    }

    // original exam page(s), with the G:-copy peek-back heuristic (DECISIONS d001 note)
    let pages = parts.map((p) => cfg.stemUrlOf(p)).filter(Boolean);
    const first = parts[0];
    if (first) {
      const gi = this.questions.indexOf(first);
      if (gi > 0) { const prevQ = this.questions[gi - 1]; if (cfg.paperCodeOf(prevQ) === cfg.paperCodeOf(first) && cfg.stemUrlOf(prevQ)) pages.unshift(cfg.stemUrlOf(prevQ)); }
    }
    pages = pages.filter((v, i, a) => a.indexOf(v) === i);
    if (pages.length) {
      const od = el("details", { class: "ppq-orig-pages" });
      od.appendChild(el("summary", null, "Show original exam page(s)"));
      const opw = el("div", { class: "ppq-op-pages" });
      pages.forEach((p) => opw.appendChild(el("img", { src: p, loading: "lazy" })));
      od.appendChild(opw); container.appendChild(od);
    }
  };

  // --------------------------------------------------------------- reference booklet (module)
  Viewer.prototype._appendReferenceBooklet = function (q, stem) {
    const rb = this.cfg.modules.referenceBooklet;
    if (!rb || !rb.sections) return;
    const text = (this.cfg.questionTextOf(q) || "").toLowerCase();
    const detected = [];
    const m = text.match(/section\s+(\d+)/); if (m) detected.push(parseInt(m[1], 10));
    if (rb.periodicTableSection && text.indexOf("periodic table") >= 0 && detected.indexOf(rb.periodicTableSection) < 0) detected.push(rb.periodicTableSection);
    const prefix = rb.assetPrefix || "assets/";
    const self = this;
    detected.forEach((n) => {
      const pre = String(n).padStart(2, "0");
      const matches = rb.sections.filter((f) => f.indexOf(pre + "_") === 0 || new RegExp("^" + pre + "[a-z]_").test(f));
      if (!matches.length) return;
      const urls = matches.map((mm) => prefix + mm);
      const title = (n === rb.periodicTableSection) ? ("Periodic Table (Section " + n + ")") : ("Section " + n + " of the booklet");
      const btn = el("button", { class: "ppq-btn-mini ppq-booklet" }, "📖 View " + title);
      btn.addEventListener("click", () => self.openModal(urls));
      stem.appendChild(btn);
    });
  };

  // --------------------------------------------------------------- dashboard
  Viewer.prototype._zeroRatings = function () { const r = {}; for (let v = 1; v <= this.cfg.selfReport.levels; v++) r[v] = 0; return r; };
  Viewer.prototype.renderDashboard = function () {
    if (this.cfg.dashboardLayout === "split" && this.cfg.dashboardColumns) return this._renderSplit();
    const facet = this._activeDashboardFacet();
    if (facet) return this._renderDashboardFacet(facet);
    const cfg = this.cfg, groups = {};
    this.questions.forEach((q) => { const k = cfg.groupKey(q); if (!groups[k]) groups[k] = { label: cfg.groupLabel(q), total: 0, marks: [], ratings: this._zeroRatings() }; groups[k].total++; });
    this.store.attempts.forEach((a) => { const q = this.byId[a.id]; if (!q) return; const g = groups[cfg.groupKey(q)]; if (g) g.marks.push(a.correct === true || a.is_correct === "right"); });
    Object.keys(this.store.scores).forEach((id) => { const q = this.byId[id]; if (!q) return; const g = groups[cfg.groupKey(q)]; if (g && g.ratings[this.store.scores[id]] != null) g.ratings[this.store.scores[id]]++; });
    const keys = Object.keys(groups).sort((a, b) => { const ua = cfg.isUntagged(a), ub = cfg.isUntagged(b); if (ua !== ub) return ua ? 1 : -1; return a.localeCompare(b); });
    const content = this.q(".ppq-dash-content");
    const panel = content ? content.parentNode : null;
    const title = panel && panel.querySelector("h3");
    const subtitle = panel && panel.querySelector(".ppq-dash-sub");
    if (title) title.textContent = cfg.dashboardTitle;
    if (subtitle) subtitle.textContent = "Recent ticks/crosses and your self-rating spread, per group. Click a group to filter.";
    content.className = "ppq-dash-content";
    content.innerHTML = keys.map((k) => this._catHtml(k, groups[k], "ribbonHeat")).join("");
    this._wireCats();
  };

  Viewer.prototype._renderDashboardFacet = function (facet) {
    const cfg = this.cfg;
    const filter = facet.filter;
    const childSel = this.q('.ppq-select[data-fidx="' + facet.filterIndex + '"]');
    const content = this.q(".ppq-dash-content");
    if (!childSel || !content) return;
    const panel = content.parentNode;
    const title = panel && panel.querySelector("h3");
    const subtitle = panel && panel.querySelector(".ppq-dash-sub");
    const values = Array.prototype.map.call(childSel.children || [], (option) => String(option.value))
      .filter((value) => value && value !== "ALL");
    const allowed = {};
    values.forEach((value) => { allowed[value] = true; });

    /* Retain every other active filter, including the broad parent, but ignore the
       selected child while counting. This keeps the full family list visible when
       one family is active. */
    const source = this.questions.filter((q) => this._matchesQuestionFilters(q, [filter.field]));
    const sourceIds = {};
    source.forEach((q) => { sourceIds[cfg.idOf(q)] = true; });
    const groups = {};
    values.forEach((value) => {
      groups[value] = {
        label: (filter.friendlyLabels && filter.friendlyLabels[value]) || value,
        total: 0,
        marks: [],
        ratings: this._zeroRatings()
      };
    });
    const memberships = (q) => {
      const seen = {};
      return this._filterValues(q, filter).filter((value) => {
        if (!allowed[value] || seen[value]) return false;
        seen[value] = true;
        return true;
      });
    };
    source.forEach((q) => memberships(q).forEach((value) => { groups[value].total++; }));
    this.store.attempts.forEach((attempt) => {
      const q = this.byId[attempt.id];
      if (!q || !sourceIds[cfg.idOf(q)]) return;
      memberships(q).forEach((value) => {
        groups[value].marks.push(attempt.correct === true || attempt.is_correct === "right");
      });
    });
    Object.keys(this.store.scores).forEach((id) => {
      const q = this.byId[id];
      if (!q || !sourceIds[cfg.idOf(q)]) return;
      memberships(q).forEach((value) => {
        const rating = this.store.scores[id];
        if (groups[value].ratings[rating] != null) groups[value].ratings[rating]++;
      });
    });

    let representative = source[0] || null;
    if (!representative) {
      representative = this.questions.find((q) =>
        this._filterValues(q, facet.parent).indexOf(String(facet.parentValue)) >= 0) || null;
    }
    const parentLabel = representative
      ? cfg.groupLabel(representative)
      : ((facet.parent.friendlyLabels && facet.parent.friendlyLabels[facet.parentValue]) || facet.parentValue);
    if (title) title.textContent = parentLabel + " subtopics";
    if (subtitle) subtitle.textContent = "Click a family to practise it; click it again to show the whole topic.";

    const active = childSel.value || "ALL";
    let html = '<div class="ppq-dash-path"><button class="ppq-dash-back" type="button">All topics</button>' +
      '<span aria-hidden="true">&rsaquo;</span><strong>' + esc(parentLabel) + "</strong></div>" +
      '<div class="ppq-dash-overlap-note"><b>' + source.length +
      " questions.</b> A question may appear in more than one subtopic, so the counts below can overlap.</div>";
    if (active !== "ALL") {
      html += '<button class="ppq-facet-clear" type="button">Show all ' + esc(parentLabel) + "</button>";
    }
    if (values.length) {
      html += values.map((value) =>
        this._catHtml(value, groups[value], "ribbonHeat", {
          filterIndex: facet.filterIndex,
          active: active === value
        })).join("");
    } else {
      html += '<div class="ppq-facet-empty">No reviewed subtopics are available for this topic yet.</div>';
    }
    content.className = "ppq-dash-content ppq-dash-facet-content";
    content.innerHTML = html;
    this._wireCats();
  };

  Viewer.prototype._renderSplit = function () {
    const cfg = this.cfg;
    /* QoderWork 2026-07-22: each column renders into its own flanking panel
       (left = column 0, right = column 1) rather than stacking in one sidebar. */
    const panels = this.qa(".ppq-dash-split-panel");
    cfg.dashboardColumns.forEach((col, i) => {
      const panel = panels[i];
      if (!panel) return;
      const content = panel.querySelector(".ppq-dash-content");
      const groups = {};
      this.questions.forEach((q) => { if (!col.includes(q)) return; const k = col.groupKey(q); if (!groups[k]) groups[k] = { label: col.groupLabel(q), total: 0, marks: [], ratings: this._zeroRatings(), seq: [] }; groups[k].total++; });
      this.store.attempts.forEach((a) => { const q = this.byId[a.id]; if (!q || !col.includes(q)) return; const g = groups[col.groupKey(q)]; if (g) g.marks.push(a.correct === true || a.is_correct === "right"); });
      Object.keys(this.store.scores).forEach((id) => { const q = this.byId[id]; if (!q || !col.includes(q)) return; const g = groups[col.groupKey(q)]; if (g) { if (g.ratings[this.store.scores[id]] != null) g.ratings[this.store.scores[id]]++; g.seq.push(this.store.scores[id]); } });
      const keys = Object.keys(groups).sort();
      content.innerHTML = keys.map((k) => this._catHtml(k, groups[k], col.style)).join("");
    });
    this._wireCats();
  };

  Viewer.prototype._catHtml = function (k, g, style, facet) {
    const cfg = this.cfg, ramp = cfg.selfReport.ramp, levels = cfg.selfReport.levels;
    const active = (facet ? facet.active : this.groupFilter === k) ? " active" : "";
    let inner = '<div class="ppq-cat-name">' + esc(g.label) + ' <span class="ppq-cat-count">(' + g.total + ")</span></div>";
    if (style === "ratingBoxes") {
      const seq = (g.seq || []).slice(-10); let boxes = "";
      for (let i = 0; i < 10; i++) { const v = seq[i]; boxes += '<div class="ppq-lhs-box"' + (v ? ' style="background:rgb(' + (ramp[v] || "128,128,128") + ')"' : "") + "></div>"; }
      inner += '<div class="ppq-lhs-row">' + boxes + "</div>";
    } else {
      const last = g.marks.slice(-10);
      /* QoderWork 2026-07-22: with revealCorrect off, ticks/crosses would leak the
         verdict the app never shows — render a neutral dot per attempt instead. */
      const showMarks = cfg.revealCorrect !== false;
      let ribbon = last.map((ok) => showMarks ? (ok ? '<span class="ppq-tick">✔</span>' : '<span class="ppq-cross">✘</span>') : '<span class="ppq-dot">•</span>').join("");
      if (!ribbon) ribbon = '<span class="ppq-noattempt">no attempts yet</span>';
      let max = 1; for (let v = 1; v <= levels; v++) max = Math.max(max, g.ratings[v] || 0);
      let heat = ""; for (let v = 1; v <= levels; v++) { const c = g.ratings[v] || 0; const op = c > 0 ? (0.2 + 0.8 * c / max) : 0.06; heat += '<div class="ppq-heat" style="background:rgba(' + (ramp[v] || "128,128,128") + "," + op + ');" title="rated ' + v + ": " + c + '"></div>'; }
      inner += '<div class="ppq-ribbon">' + ribbon + '</div><div class="ppq-heatrow">' + heat + "</div>";
    }
    if (facet) {
      const disabled = g.total === 0 ? ' disabled aria-disabled="true"' : "";
      return '<button class="ppq-cat ppq-facet-cat' + active + '" type="button" data-fidx="' +
        facet.filterIndex + '" data-value="' + esc(k) + '"' + disabled + ">" +
        inner + "</button>";
    }
    return '<div class="ppq-cat' + active + '" data-key="' + esc(k) + '">' + inner + "</div>";
  };

  Viewer.prototype._wireCats = function () {
    const self = this;
    this.qa(".ppq-cat").forEach((c) => {
      if (c.classList.contains("ppq-facet-cat")) {
        c.addEventListener("click", () => self._setDashboardFacetValue(parseInt(c.dataset.fidx, 10), c.dataset.value));
      } else {
        c.addEventListener("click", () => self.setGroupFilter(c.dataset.key));
      }
    });
    const back = this.q(".ppq-dash-back");
    if (back) back.addEventListener("click", () => self._clearDashboardFacet(true));
    const clear = this.q(".ppq-facet-clear");
    if (clear) clear.addEventListener("click", () => self._clearDashboardFacet(false));
  };
  Viewer.prototype._firePendingDashboardPulse = function () {
    const key = this._pendingDashboardPulse;
    if (!key) return;
    this._pendingDashboardPulse = null;
    const row = this.qa(".ppq-cat").find((node) => node.dataset.key === String(key));
    if (!row) return;
    setTimeout(function () {
      if (!row.isConnected) return;
      if (typeof row.scrollIntoView === "function") {
        row.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      row.classList.remove("ppq-cat-fired");
      void row.offsetWidth;
      row.classList.add("ppq-cat-fired");
      setTimeout(function () {
        if (row.isConnected) row.classList.remove("ppq-cat-fired");
      }, 1400);
    }, 220);
  };

  Viewer.prototype.reset = function () {
    if (!window.confirm("Clear all your marks and self-ratings on this device? This cannot be undone.")) return;
    this.store.attempts = []; this.store.scores = {}; this._saveStore(); if (this.cur) this.render();
  };

  // --------------------------------------------------------------- math (module)
  Viewer.prototype._applyMath = function (elm) {
    if (!window.renderMathInElement || !elm) return;
    try { window.renderMathInElement(elm, { delimiters: [{ left: "$$", right: "$$", display: true }, { left: "$", right: "$", display: false }, { left: "\\(", right: "\\)", display: false }, { left: "\\[", right: "\\]", display: true }] }); } catch (e) { /* KaTeX not ready */ }
  };

  // --------------------------------------------------------------- modal
  Viewer.prototype.openModal = function (urlOrUrls) {
    const urls = Array.isArray(urlOrUrls) ? urlOrUrls : [urlOrUrls];
    this.q(".ppq-modal-body").innerHTML = urls.map((u) => (String(u).slice(-4) === ".pdf") ? '<iframe src="' + esc(u) + '" class="ppq-modal-pdf"></iframe>' : '<img src="' + esc(u) + '" class="ppq-modal-img">').join("");
    /* QoderWork 2026-07-24 (handoff #1): image/PDF zoom doesn't use the minimise bar. */
    this.q(".ppq-modal").classList.remove("minimized", "ppq-modal-analysis");
    this.root.classList.remove("ppq-analysis-open");
    this.q(".ppq-modal-min").style.display = "none";
    this.q(".ppq-modal-reminder").textContent = "";
    const feedbackStatus = this.q(".ppq-modal-feedback-status");
    if (feedbackStatus) {
      feedbackStatus.className = "ppq-modal-feedback-status";
      feedbackStatus.textContent = "";
      feedbackStatus.title = "";
      feedbackStatus.style.display = "none";
    }
    this.q(".ppq-modal").classList.add("show");
  };
  /* QoderWork 2026-07-24 (handoff #1): toggle the pop-up between full size and a
     slim bar. Minimised, the overlay goes transparent and click-through so the
     question, diagram, options and the pupil's answer show through behind it. */
  Viewer.prototype.toggleModalMin = function () {
    const modal = this.q(".ppq-modal");
    const min = this.q(".ppq-modal-min");
    const on = modal.classList.toggle("minimized");
    this.root.classList.toggle("ppq-analysis-open", !on && modal.classList.contains("ppq-modal-analysis"));
    min.textContent = on ? "▢" : "—";
    min.title = on ? "Restore the analysis" : "Minimise — see the question";
  };
  Viewer.prototype.closeModal = function () {
    /* Closing on the guess page is equivalent to skipping it: never strand an
       answered question with its verdict permanently hidden. */
    if (this._iqOpen) this._revealCommittedAnswer();
    this.q(".ppq-modal").classList.remove("show", "ppq-modal-analysis");
    this.root.classList.remove("ppq-analysis-open");
    /* QoderWork 2026-07-24 (handoff #1): reset the minimise state for next open. */
    this.q(".ppq-modal").classList.remove("minimized");
    this.q(".ppq-modal-min").textContent = "—";
    this.q(".ppq-modal-body").innerHTML = "";
    /* QoderWork 2026-07-22: if the interrogation pop-up was closed early (×,
       Escape, outside click — not its Next button), bring the outer 1-6 row back
       so the pupil is never stranded, syncing any rating chosen inside the pop-up. */
    if (this._iqOpen) {
      this._iqOpen = false;
      this._iqBox = null;
      const comp = this.q(".ppq-competence");
      if (comp) comp.style.display = "";
      if (this.cur && this.answered) {
        const prior = this.store.scores[this.cfg.idOf(this.cur)];
        this.qa(".ppq-scale-btn").forEach((b) => b.classList.remove("sel"));
        if (prior) {
          const sb = this.q('.ppq-competence .ppq-scale-btn[data-val="' + prior + '"]');
          if (sb) sb.classList.add("sel");
          this.q(".ppq-next").style.display = "inline-block";
        }
      }
      this._firePendingDashboardPulse();
    }
  };

  // --------------------------------------------------------------- keyboard
  Viewer.prototype._bindGlobalKeys = function () {
    const self = this;
    this._keyHandler = function (e) {
      if (!self.cur || !self._shouldHandleKey(e)) return;
      if (self.q(".ppq-modal").classList.contains("show") && e.key === "Escape") { self.closeModal(); return; }
      /* QoderWork 2026-07-22: while the interrogation pop-up holds the 1-6, route
         Enter/number keys to the pop-up and close it before arrow-navigating. */
      if (self._iqOpen) {
        if (e.key === "Enter") {
          const guessPage = self._iqBox && self._iqBox.querySelector(".ppq-iq-guesspage");
          const picker = self._iqBox && self._iqBox.querySelector(".ppq-gpick");
          if (guessPage && guessPage.style.display !== "none" &&
              picker && picker._ppqSubmitOrSkip) {
            e.preventDefault();
            picker._ppqSubmitOrSkip();
            return;
          }
          const nb = self._iqBox && self._iqBox.querySelector(".ppq-iq-next");
          if (nb && nb.style.display !== "none") nb.click();
          return;
        }
        if (e.key === "ArrowLeft" || e.key === "ArrowRight") { self.closeModal(); }
      }
      if (e.key === "ArrowLeft") { self.prev(); return; }
      if (e.key === "ArrowRight") { self.next(); return; }
      if (e.key === "s" || e.key === "S") { if (!self.answered) self.skip(); return; }
      if (e.key === "r" || e.key === "R") { if (!self.answered && (self._curType === "flashcard" || self._curType === "imageSelfMark")) self.reveal(); return; }
      if (e.key === "Enter") { if (self.answered) self.next(); else if (self._curType === "flashcard") self.reveal(); return; }
      if (!self.answered) {
        const L = e.key.toUpperCase(), labels = self._answerLabels || [];
        if (labels.indexOf(L) >= 0) { self._pick(L); return; }
        const numMap = { "1": "A", "2": "B", "3": "C", "4": "D", "5": "E", "6": "F", "7": "G", "8": "H" };
        if (numMap[e.key] && labels.indexOf(numMap[e.key]) >= 0) { self._pick(numMap[e.key]); return; }
      } else if (e.key >= "1" && e.key <= String(self.cfg.selfReport.levels)) {
        const scope = (self._iqOpen && self._iqBox) ? self._iqBox : self.root;
        const b = scope.querySelector('.ppq-scale-btn[data-val="' + e.key + '"]'); if (b) b.click();
      }
    };
    document.addEventListener("keydown", this._keyHandler);
  };
  Viewer.prototype._pick = function (L) { if (this._curType === "mcq") this.selectMCQ(L); else this.selectOption(L); };
  Viewer.prototype._shouldHandleKey = function (e) {
    const t = e.target;
    /* QoderWork 2026-07-22 (analyst handoff): while the pupil is editing a field
       (e.g. typing a guess percentage that begins 1-8), do NOT let the global
       answer shortcuts fire. Return false for any editing target, even one inside
       the viewer. */
    if (t && (t.tagName === "INPUT" || t.tagName === "SELECT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return false;
    if (this.root.contains(t)) return true;
    return document.querySelectorAll(".ppq").length <= 1;
  };
  Viewer.prototype.destroy = function () { if (this._keyHandler) document.removeEventListener("keydown", this._keyHandler); if (this._resizeHandler) window.removeEventListener("resize", this._resizeHandler); this._stopTimer(); this.root.innerHTML = ""; this.root.classList.remove("ppq"); };

  // --------------------------------------------------------------- drawing overlay
  Viewer.prototype._initDrawState = function () {
    this._drawOn = false; this._drawing = false; this._ctx = null; this._drawHistory = []; this._drawThickness = 2;
    const self = this;
    this._resizeHandler = function () {
      if (!self._drawOn) return; const canvas = self.q(".ppq-canvas");
      if (canvas.width > 0 && canvas.height > 0) { const data = self._ctx.getImageData(0, 0, canvas.width, canvas.height); self._initCanvas(); self._ctx.putImageData(data, 0, 0); self._drawHistory = [self._ctx.getImageData(0, 0, canvas.width, canvas.height)]; }
      else { self._initCanvas(); }
    };
    window.addEventListener("resize", this._resizeHandler);
    document.addEventListener("keydown", (e) => { if (e.ctrlKey && e.key === "z" && self._drawOn) { self.undoDraw(); e.preventDefault(); } });
  };
  Viewer.prototype.toggleDraw = function () {
    this._drawOn = !this._drawOn; const canvas = this.q(".ppq-canvas");
    this.q(".ppq-draw-controls").classList.toggle("on", this._drawOn);
    this.q(".ppq-draw-toggle").classList.toggle("active", this._drawOn);
    if (this._drawOn) { canvas.style.display = "block"; this._initCanvas(); } else { canvas.style.display = "none"; }
  };
  Viewer.prototype._initCanvas = function () {
    const canvas = this.q(".ppq-canvas"), container = this.q(".ppq-draw-container");
    const dpr = window.devicePixelRatio || 1, rect = container.getBoundingClientRect();
    canvas.width = rect.width * dpr; canvas.height = rect.height * dpr;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    ctx.scale(dpr, dpr); ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.lineWidth = this._drawThickness;
    const active = this.q(".ppq-color.active"); ctx.strokeStyle = active ? active.dataset.color : "black";
    this._ctx = ctx; this._drawHistory = [ctx.getImageData(0, 0, canvas.width, canvas.height)];
    const self = this;
    canvas.onpointerdown = function (e) { self._drawing = true; ctx.beginPath(); const r = e.target.getBoundingClientRect(); ctx.moveTo(e.clientX - r.left, e.clientY - r.top); e.preventDefault(); };
    canvas.onpointermove = function (e) { if (!self._drawing) return; const r = e.target.getBoundingClientRect(); ctx.lineTo(e.clientX - r.left, e.clientY - r.top); ctx.stroke(); e.preventDefault(); };
    canvas.onpointerup = function () { if (!self._drawing) return; self._drawing = false; ctx.closePath(); self._drawHistory.push(ctx.getImageData(0, 0, canvas.width, canvas.height)); };
    canvas.onpointerout = canvas.onpointerup;
  };
  Viewer.prototype.clearCanvas = function () { if (!this._ctx) return; const canvas = this.q(".ppq-canvas"); this._ctx.clearRect(0, 0, canvas.width, canvas.height); this._drawHistory.push(this._ctx.getImageData(0, 0, canvas.width, canvas.height)); };
  Viewer.prototype.undoDraw = function () { if (!this._ctx || this._drawHistory.length <= 1) return; this._drawHistory.pop(); this._ctx.putImageData(this._drawHistory[this._drawHistory.length - 1], 0, 0); };
  Viewer.prototype.setDrawColor = function (color) { if (this._ctx) this._ctx.strokeStyle = color; this.qa(".ppq-color").forEach((b) => b.classList.remove("active")); const c = this.q('.ppq-color[data-color="' + color + '"]'); if (c) c.classList.add("active"); };
  Viewer.prototype.setDrawThickness = function (v) { this._drawThickness = parseInt(v, 10); if (this._ctx) this._ctx.lineWidth = this._drawThickness; };

  return { mount: function (root, opts) { opts = opts || {}; return new Viewer(root, opts.config, opts.questions, opts.meta, opts.report).init(); }, version: "0.5.0" };
})();
// build: 0.3.0, maintained by Codex
