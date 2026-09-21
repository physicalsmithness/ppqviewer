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
  /* d013/VF-04: the six timing modes (ESAT packet's five plus the pacing ring
     the handoff asked for). Silent capture happens in every one of them. */
  const TIMING_MODES = ["none", "end_only", "per_question", "clock", "ring", "bank"];
  /* VF-04r (Smith 2026-07-29): the modes decompose into INDEPENDENT axes.
     A legacy mode string (consumer defaults, old saved prefs) maps onto them. */
  function timingModeToAxes(mode) {
    switch (mode) {
      case "clock": return { visibility: "show", clock: true, ring: false, bank: false };
      case "ring": return { visibility: "show", clock: false, ring: true, bank: false };
      case "bank": return { visibility: "show", clock: true, ring: false, bank: true };
      case "per_question":
      case "end_only": return { visibility: "reveal_end", clock: true, ring: false, bank: false };
      default: return { visibility: "off", clock: true, ring: false, bank: false };
    }
  }
  /* VF-04r: one formatter for the live clock AND the panel preview. Smith's
     overtime matrix: counting up past a 2:00 allocation shows red "2:01" when
     keeping count, red "+0:01" when starting from zero (the default); counting
     down shows red "−0:01" / "+0:01" respectively. Self-contained. */
  function timingDisplayText(prefs, elapsedMs, targetMs) {
    function fmt(ms) { const s = Math.max(0, Math.floor(ms / 1000)); return Math.floor(s / 60) + ":" + (s % 60 < 10 ? "0" : "") + (s % 60); }
    const hasTarget = targetMs != null && targetMs > 0;
    const over = !!hasTarget && elapsedMs > targetMs;
    let text;
    if (!hasTarget) text = fmt(elapsedMs);
    else if (!over) text = prefs.direction === "down" ? fmt(targetMs - elapsedMs) : fmt(elapsedMs);
    else if (prefs.overtimeReset !== false) text = "+" + fmt(elapsedMs - targetMs);
    else text = prefs.direction === "down" ? ("−" + fmt(elapsedMs - targetMs)) : fmt(elapsedMs);
    return { text: text, over: over };
  }

  /* QoderWork 2026-07-22: canonical meaning of each point on the 1-6 self-report
     scale, as defined by Smith. Surfaced as a tooltip on each scale button plus a
     legend beneath the scale (d006). Consumers may override via
     config.selfReport.meanings. */
  const DEFAULT_SCALE_MEANINGS = [
    "No idea",
    "Don't fully understand",
    "Got it wrong, but now I've seen the answer I get it",
    "Got it right, but it's not stable — I might miss it tomorrow/next week",
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
    // Explicit issue reporting is separate from the optional attempt reporter.
    // The host supplies its real feedback service and source-only context.
    const problemIn = cfg.problemReport;
    cfg.problemReport = problemIn && problemIn.enabled !== false && typeof problemIn.endpoint === "string" && /^https:\/\//.test(problemIn.endpoint) ? {
      endpoint: problemIn.endpoint,
      project: String(problemIn.project || cfg.title),
      sourceLabelOf: typeof problemIn.sourceLabelOf === "function" ? problemIn.sourceLabelOf : function (q) { return cfg.metaLine(q); },
      contextOf: typeof problemIn.contextOf === "function" ? problemIn.contextOf : null,
      /* d031: named reasons, shown as a grid the pupil picks from rather than one
         button leading to a dropdown. A pupil does not know what they do not know, so
         the reasons have to name the fault for them. Consumers that supply none keep
         the single button and the dropdown exactly as before. `detail: "invite"` means
         the report is worthless without words, so the panel asks for them; the default
         means the choice already says it and Send alone is enough. */
      lead: typeof problemIn.lead === "string" ? problemIn.lead : "",
      groupLabels: problemIn.groupLabels && typeof problemIn.groupLabels === "object" ? problemIn.groupLabels : {},
      reasons: (Array.isArray(problemIn.reasons) ? problemIn.reasons : []).filter((r) => r && r.code && r.label).map((r) => ({
        code: String(r.code),
        label: String(r.label),
        hint: typeof r.hint === "string" ? r.hint : "",
        group: String(r.group || "question"),
        detail: r.detail === "invite" ? "invite" : "optional"
      }))
    } : null;
    const teacherHelpIn = cfg.teacherHelp;
    cfg.teacherHelp = teacherHelpIn && teacherHelpIn.enabled !== false && typeof teacherHelpIn.endpoint === "string" && /^https:\/\//.test(teacherHelpIn.endpoint) ? {
      endpoint: teacherHelpIn.endpoint,
      project: String(teacherHelpIn.project || cfg.title),
      label: typeof teacherHelpIn.label === "string" && teacherHelpIn.label.trim() ? teacherHelpIn.label.trim() : "Ask the teacher",
      introduction: typeof teacherHelpIn.introduction === "string" ? teacherHelpIn.introduction : "Ask about this question. A teacher can publish the question and answer for everyone, without your name. Replies are remembered in this browser; keep this browser’s saved data to receive them.",
      receivedText: typeof teacherHelpIn.receivedText === "string" && teacherHelpIn.receivedText.trim() ? teacherHelpIn.receivedText : "Your question has been received. A new-reply notice will appear here when a teacher answers.",
      sourceLabelOf: typeof teacherHelpIn.sourceLabelOf === "function" ? teacherHelpIn.sourceLabelOf : function (q) { return cfg.metaLine(q); },
      sourceUrlOf: typeof teacherHelpIn.sourceUrlOf === "function" ? teacherHelpIn.sourceUrlOf : function () { return window.location.href; },
      contextOf: typeof teacherHelpIn.contextOf === "function" ? teacherHelpIn.contextOf : null
    } : null;
    const ahead = cfg.prefetchAhead == null ? 3 : Number(cfg.prefetchAhead);
    cfg.prefetchAhead = Number.isFinite(ahead) ? Math.max(0, Math.min(12, Math.floor(ahead))) : 3;
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
    // Opt in to overlapping dashboard groups without copying question records
    // or their saved attempts. Existing consumers retain one group per record.
    cfg.groupKeysOf = typeof cfg.groupKeysOf === "function" ? cfg.groupKeysOf : null;
    cfg.groupLabelOf = typeof cfg.groupLabelOf === "function" ? cfg.groupLabelOf : function (key, q) { return cfg.groupLabel(q); };
    cfg.itemNoun = typeof cfg.itemNoun === "string" && cfg.itemNoun.trim() ? cfg.itemNoun.trim() : "question";
    cfg.isUntagged = cfg.isUntagged || function (k) { return String(k).indexOf("UT_") === 0; };
    const sr = cfg.selfReport || {};
    cfg.selfReport = { levels: sr.levels || 6, prompt: sr.prompt || "How did that feel? (1 = lost, 6 = easy)", labels: sr.labels || null, meanings: sr.meanings || DEFAULT_SCALE_MEANINGS, ramp: sr.ramp || DEFAULT_RAMP, autoReveal: sr.autoReveal === true };
    cfg.options = cfg.options || { mode: "labels" };
    // per-question hooks
    cfg.cropsOf = cfg.cropsOf || function (q) { return q.crops || (q.crop_url ? [q.crop_url] : []); };
    cfg.contextCropsOf = typeof cfg.contextCropsOf === "function" ? cfg.contextCropsOf : null;
    cfg.targetPartHeadingOf = typeof cfg.targetPartHeadingOf === "function" ? cfg.targetPartHeadingOf : null;
    cfg.compactQuestionHeader = cfg.compactQuestionHeader === true;
    cfg.questionLoading = { enabled: !!(cfg.questionLoading && cfg.questionLoading.enabled === true) };
    cfg.structuredNavBeforeStem = !!cfg.structuredNavBeforeStem;
    cfg.structuredNavigationOnly = !!cfg.structuredNavigationOnly;
    cfg.structuredQuestionLabelOf = typeof cfg.structuredQuestionLabelOf === "function" ? cfg.structuredQuestionLabelOf : null;
    cfg.questionScrollContainer = typeof cfg.questionScrollContainer === "string" || typeof cfg.questionScrollContainer === "function" ? cfg.questionScrollContainer : null;
    cfg.correctOf = cfg.correctOf || function (q) { return (q.correct_answer || q.answer_key || "").toString(); };
    cfg.metaLine = cfg.metaLine || function (q) { return cfg.idOf(q); };
    cfg.tagsOf = cfg.tagsOf || function () { return []; };
    cfg.searchTermsOf = cfg.searchTermsOf || function () { return []; };
    cfg.attemptFields = cfg.attemptFields || function () { return {}; };
    cfg.answerUrlOf = cfg.answerUrlOf || function (q) { return q.answer_url || null; };
    cfg.stemUrlOf = cfg.stemUrlOf || function (q) { return q.page_url || null; };
    // v0.2 question-type + module hooks
    cfg.questionType = cfg.questionType || function () { return "imageSelfMark"; };
    /* d012 (Claude 2026-07-29): marks-based self-assessment configuration. */
    cfg.marksOf = cfg.marksOf || function (q) { return q.marks; };
    cfg.msCropsOf = cfg.msCropsOf || null;
    cfg.msPagesOf = cfg.msPagesOf || null; /* VF-15: complete markscheme pages behind an expander */
    cfg.msPagesLabelOf = cfg.msPagesLabelOf || null; /* d016: consumer wording when it knows which pages hold the question */
    cfg.msPagesAllOf = cfg.msPagesAllOf || null;     /* d017: the whole document, one click deeper than the narrowed set */
    cfg.msPagesOpenOf = cfg.msPagesOpenOf || null;   /* d017: open the pages unasked when the crop is known to be too short */
    cfg.stemPagesOf = cfg.stemPagesOf || null;       /* d018: the printed question page(s), the only faithful account of a stem */
    /* d020: things a pupil must know BEFORE working, in the consumer's words.
       Each notice is { tone: "info"|"warn", text } and renders above the
       question. Kept general: the maths case is "this is off the current
       syllabus, and here is how to use it anyway", but an era note, a rubric
       change or a withheld-content reason all belong in the same place. */
    cfg.noticesOf = cfg.noticesOf || null;
    /* d020: something to read WITH the markscheme, e.g. that this scheme was
       written under marking conventions since abolished, so it will look wrong
       against a modern one. */
    cfg.markschemeNoteOf = cfg.markschemeNoteOf || null;
    cfg.partLabelOf = cfg.partLabelOf || null;       /* d016: consumer part label for the navigator chips */
    cfg.partMarksOf = cfg.partMarksOf || null;       /* d016: marks per part, shown on the chips */
    const saIn = cfg.selfAssess || {};
    cfg.selfAssess = {
      taxonomy: Array.isArray(saIn.taxonomy) ? saIn.taxonomy : [],
      weakAreasOf: typeof saIn.weakAreasOf === "function" ? saIn.weakAreasOf : null
    };
    /* d013/VF-04 (Claude 2026-07-29): the timing system. The ENGINE owns the
       mechanism, the modes, the time bank, the learner's extra-time preference
       and the silent capture; the SUBJECT supplies only pacing (targetOf, in
       seconds — e.g. uniform section-time/questions for ESAT, marks×90s for IB
       Maths) and the first-run default mode. Guessing is never inferred from
       time. Legacy cfg.timer keeps working for consumers not yet migrated. */
    const tgIn = cfg.timing || null;
    cfg.timing = tgIn ? {
      targetOf: typeof tgIn.targetOf === "function" ? tgIn.targetOf : null,
      description: typeof tgIn.description === "string" ? tgIn.description : "",
      defaultMode: TIMING_MODES.indexOf(tgIn.defaultMode) >= 0 ? tgIn.defaultMode : "none"
    } : null;
    /* VF-14 (Smith 2026-07-29): extra performance axes for the progress page —
       each axis names a label and a valuesOf(q) -> [category values] (multi-value
       welcome: a question counts in every category it belongs to). */
    cfg.progressAxes = (Array.isArray(cfg.progressAxes) ? cfg.progressAxes : [])
      .filter(function (a) { return a && a.label && typeof a.valuesOf === "function"; });
    /* d011 (Smith, "Learned so far"): the learner marks course position on a
       nested tri-state tree; the filters then operate WITHIN it by default.
       tree: [{code,label,children:[{code,label,children:[{code,label}]}]}]
       (leaves are the tickable units); refsOf(q) -> the question's leaf codes.
       A question is in scope only when ALL its refs are learned; a question
       with NO refs is out of scope while the scope is active (it is not part
       of the mapped course). An EMPTY learned set never filters — the scope
       only bites once something is ticked. */
    const lsIn = cfg.learnedScope || null;
    cfg.learnedScope = (lsIn && Array.isArray(lsIn.tree) && typeof lsIn.refsOf === "function") ? {
      tree: lsIn.tree,
      refsOf: lsIn.refsOf,
      label: lsIn.label || "Learned so far"
    } : null;
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
    /* Smith 2026-07-29: a consumer with NO feedback source (no analysis, no
       status ledger) shows no readiness badge at all — "Solution pending" on
       every maths question was noise, not information. */
    cfg._hasFeedbackSource = !!(cfg.analysisOf || cfg.feedbackStatusOf);
    cfg.analysisOf = cfg.analysisOf || function () { return null; };
    cfg.feedbackStatusOf = cfg.feedbackStatusOf || null;
    /* A consumer can flag a defect or ambiguity in the printed source without
       disabling the question. The same advisory is shown before answering and
       inside the completed-question review. */
    cfg.sourceAdvisoryOf = typeof cfg.sourceAdvisoryOf === "function"
      ? cfg.sourceAdvisoryOf
      : null;
    /* Presentation improvements remain opt-in because this engine is shared by
       consumers with different card and marking journeys. */
    const prIn = cfg.presentation || {};
    cfg.presentation = {
      enabled: !!prIn.enabled,
      compactMobileFilters: !!prIn.compactMobileFilters,
      guidedReview: !!prIn.guidedReview,
      compactAlternativeMethods: !!prIn.compactAlternativeMethods,
      collapseKnowledgeChecks: !!prIn.collapseKnowledgeChecks,
      plainGuessLanguage: !!prIn.plainGuessLanguage,
      plainStatusLabels: !!prIn.plainStatusLabels
    };
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
    cfg.classificationLabels = Object.assign({
      relatedFamilies: "Also relevant to",
      relatedTopics: "Related teaching topics",
      syllabus: "Fine topic links",
      techniques: "Ways to solve it",
      representations: "Question format"
    }, cfg.classificationLabels || {});
    cfg.classificationSummaryLabel = cfg.classificationSummaryLabel || "More topic details";
    cfg.questionFinder = !!cfg.questionFinder;
    cfg.finderPreserveFilters = !!cfg.finderPreserveFilters;
    cfg.sideRating = { enabled: !!(cfg.sideRating && cfg.sideRating.enabled) };
    cfg.shuffleGroupKeyOf = typeof cfg.shuffleGroupKeyOf === "function" ? cfg.shuffleGroupKeyOf : null;
    const ah = cfg.attemptHistory || {};
    cfg.attemptHistory = { enabled: ah.enabled === true, defaultVisible: ah.defaultVisible !== false };
    const ps = cfg.practiceSelection || {};
    cfg.practiceSelection = { enabled: ps.enabled === true, defaultMode: ["unattempted", "mix", "errors"].includes(ps.defaultMode) ? ps.defaultMode : "unattempted" };
    const ll = cfg.learnerLevel || {};
    cfg.learnerLevel = { enabled: ll.enabled === true, defaultValue: ll.defaultValue === "SL" ? "SL" : "HL" };
    /* d029 (HL/SL twins): a question printed in both papers is one question, and a
       pupil meets it once, in the printing native to their own level. The consumer
       supplies the grouping and the level, because only it knows which field carries
       the content seat's cross-level id. Consumers that supply neither are untouched
       and every printing keeps being served, which is the behaviour before this. */
    const lt = cfg.levelTwins || {};
    cfg.levelTwins = {
      enabled: lt.enabled === true && typeof lt.keyOf === "function" && typeof lt.levelOf === "function",
      keyOf: typeof lt.keyOf === "function" ? lt.keyOf : null,
      levelOf: typeof lt.levelOf === "function" ? lt.levelOf : null
    };
    cfg.questionBadgesOf = typeof cfg.questionBadgesOf === "function" ? cfg.questionBadgesOf : null;
    /* QoderWork 2026-09-14: an optional per-question "also studied" panel that
       names every topic a part belongs to, main strand first, so a pupil who
       reaches a relativity part through a minor kinematics strand can see what
       else the part really assesses. Consumers that do not supply it are
       untouched: the panel element is never created and no DOM changes. */
    cfg.alsoStudiedOf = typeof cfg.alsoStudiedOf === "function" ? cfg.alsoStudiedOf : null;
    const qt = cfg.questionTools || {};
    cfg.questionTools = { dock: qt.dock === true, resetInPreferences: qt.resetInPreferences === true };
    return cfg;
  };

  Viewer.prototype._loadStore = function () {
    /* VF-07 (Claude 2026-07-28): `flags` — question id -> flagged-at timestamp —
       joins attempts and scores as first-class persisted store state.
       d013 (2026-07-29): `prefs` — per-learner, per-consumer preferences (the
       timing mode and extra-time multiplier live here) — joins them. */
    try { const raw = localStorage.getItem(this.cfg.storageKey); if (raw) { const o = JSON.parse(raw); return { attempts: o.attempts || [], scores: o.scores || {}, flags: o.flags || {}, prefs: o.prefs || {}, learned: o.learned || { set: {}, enabled: true } }; } }
    catch (e) { /* corrupt or absent */ }
    // one-time migration from a prior storage shape (e.g. chemistry's two flat maps),
    // so pupils keep their history when a subject moves onto the shared engine.
    if (typeof this.cfg.migrate === "function") {
      try { const seeded = this.cfg.migrate(localStorage); if (seeded) return { attempts: seeded.attempts || [], scores: seeded.scores || {}, flags: seeded.flags || {}, prefs: seeded.prefs || {} }; }
      catch (e) { /* migration is best-effort */ }
    }
    return { attempts: [], scores: {}, flags: {}, prefs: {}, learned: { set: {}, enabled: true } };
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
  function completedAttempt(row) {
    return row && row.id != null && row.skipped !== true && !/^(skip|skipped)$/i.test(row.status || "");
  }
  function attemptOutcome(row) {
    const number = (v) => v == null || v === "" || !Number.isFinite(Number(v)) ? null : Number(v);
    const max = number(row.marks_max), awarded = number(row.marks_awarded);
    if (max > 0) {
      if (awarded != null && awarded >= 0 && awarded <= max) return { text: awarded + "/" + max, strength: awarded / max, error: awarded < max };
      const range = row.marks_range;
      if (Array.isArray(range) && range.length === 2) {
        const lo = number(range[0]), hi = number(range[1]);
        if (lo != null && hi != null && lo >= 0 && hi >= lo && hi <= max) return { text: lo + "–" + hi + "/" + max, strength: (lo + hi) / (2 * max), error: lo < max };
      }
      return { text: "—", strength: null, error: false };
    }
    const correct = typeof row.correct === "boolean" ? row.correct : row.is_correct === "right" ? true : row.is_correct === "wrong" ? false : null;
    return correct == null ? { text: "—", strength: null, error: false } : { text: correct ? "1/1" : "0/1", strength: correct ? 1 : 0, error: !correct };
  }
  Viewer.prototype._saveRating = function (value) {
    if (!this.cur) return;
    const id = String(this.cfg.idOf(this.cur)), attempts = this.store.attempts || [];
    this.store.scores[id] = value;
    let row = this._reviewingAttempt;
    if (!(row && attempts.includes(row) && String(row.id) === id)) {
      row = this.answered && this._attemptId ? attempts.find((a) => a.attempt_id === this._attemptId && String(a.id) === id) : null;
    }
    if (row) row.self_report = value;
    if (this.cfg.selfReport.autoReveal) this._pendingDashboardPulse = this.cfg.groupKey(this.cur);
    this._saveStore();
    this._renderAttemptHistory();
    if (this.cfg.selfReport.autoReveal) this._firePendingDashboardPulse();
  };
  Viewer.prototype._attemptHistoryVisible = function () {
    const saved = (this.store.prefs || {}).attemptHistory || {};
    return typeof saved.visible === "boolean" ? saved.visible : this.cfg.attemptHistory.defaultVisible;
  };
  Viewer.prototype._learnerLevel = function () {
    const saved = (this.store.prefs || {}).learnerLevel;
    return saved === "HL" || saved === "SL" ? saved : this.cfg.learnerLevel.defaultValue;
  };
  /* d029 (HL/SL twins). Collapses each cross-level group in a candidate list to the
     single printing that matches the learner's saved level. A group is only collapsed
     when it actually spans two levels: same-level members of one group are siblings,
     not twins, and must all survive. The learner's level can change in Preferences,
     and this runs inside filterQuestions, so the served set follows it. */
  Viewer.prototype._collapseLevelTwins = function (list) {
    const cfg = this.cfg, twins = cfg.levelTwins;
    /* A consumer that never declared levelTwins, and any harness context built without
       a normalised cfg, both land here and keep every printing. */
    if (!twins || !twins.enabled) return list;
    const want = this._learnerLevel(), groups = new Map();
    list.forEach((q) => {
      const key = twins.keyOf(q);
      if (key == null || key === "") return;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(q);
    });
    const drop = new Set();
    groups.forEach((members) => {
      if (members.length < 2) return;
      if (new Set(members.map((q) => twins.levelOf(q))).size < 2) return;
      const native = members.filter((q) => twins.levelOf(q) === want);
      const keep = native.length ? native[0] : members[0];
      members.forEach((q) => { if (q !== keep) drop.add(cfg.idOf(q)); });
    });
    return drop.size ? list.filter((q) => !drop.has(cfg.idOf(q))) : list;
  };
  /* d029: the pool a learner can actually reach. Counts a pupil is invited to act on,
     the facet badges and the group dashboards, must describe what clicking will give
     them: a badge reading 8 that opens 5 questions is the fault this fixes. Progress
     REPORT denominators deliberately stay on the whole bank (see _progressStats), and
     byId lookups keep every printing, so a shared link to either twin still opens. */
  Viewer.prototype._availableQuestions = function () {
    const twins = this.cfg.levelTwins;
    if (!twins || !twins.enabled) return this.questions;
    const level = this._learnerLevel();
    if (this._availablePoolLevel !== level || !this._availablePool) {
      this._availablePoolLevel = level;
      this._availablePool = this._collapseLevelTwins(this.questions);
    }
    return this._availablePool;
  };
  Viewer.prototype._renderQuestionBadges = function () {
    const box = this.q(".ppq-question-badges");
    if (!box) return;
    box.innerHTML = "";
    let badges = null;
    /* d029: badges receive the learner's level, so a consumer can say plainly when the
       printing on screen is the other level's. Same context shape as timing.targetOf. */
    const badgeContext = this.cfg.learnerLevel.enabled ? { learnerLevel: this._visitLearnerLevel || this._learnerLevel() } : {};
    try { badges = this.cur && this.cfg.questionBadgesOf(this.cur, badgeContext); } catch (_) { badges = null; }
    (Array.isArray(badges) ? badges : []).forEach((badge) => {
      if (!badge || typeof badge.label !== "string" || !badge.label.trim()) return;
      const span = el("span", { class: "ppq-question-badge" }, esc(badge.label));
      const levelClass = badge.level === "HL" ? "hl" : badge.level === "SL" ? "sl" : badge.level === "HLSL" ? "shared" : null;
      if (levelClass) span.classList.add("ppq-question-badge-" + levelClass);
      if (typeof badge.title === "string") span.title = badge.title;
      box.appendChild(span);
    });
    box.hidden = !box.children.length;
  };
  /* QoderWork 2026-09-14: fill the optional "also studied" panel. It stays
     hidden unless the consumer supplies alsoStudiedOf and the current question
     returns at least one strand, so single-topic parts and other consumers are
     unaffected. Each strand is escaped; the main strand is emphasised. */
  Viewer.prototype._renderAlsoStudied = function () {
    const box = this.q(".ppq-also-studied");
    if (!box) return;
    box.innerHTML = "";
    let data = null;
    try { data = this.cur && typeof this.cfg.alsoStudiedOf === "function" ? this.cfg.alsoStudiedOf(this.cur) : null; }
    catch (_) { data = null; }
    const items = data && Array.isArray(data.items)
      ? data.items.filter((item) => item && typeof item.text === "string" && item.text.trim())
      : [];
    if (!items.length) { box.hidden = true; return; }
    if (data.label) box.appendChild(el("b", { class: "ppq-also-studied-label" }, esc(data.label)));
    items.forEach((item) => {
      const span = el("span", { class: "ppq-also-studied-item" + (item.primary ? " ppq-also-studied-main" : "") }, esc(item.text));
      if (typeof item.title === "string") span.title = item.title;
      box.appendChild(span);
    });
    box.hidden = false;
  };
  Viewer.prototype._renderAttemptHistory = function () {
    const box = this.q(".ppq-attempt-history");
    if (!box) return;
    box.innerHTML = "";
    box.hidden = !this._attemptHistoryVisible() || !this.cur;
    if (box.hidden) return;
    const id = String(this.cfg.idOf(this.cur));
    const rows = (this.store.attempts || []).map((row, index) => ({ row, index })).filter(({row}) => completedAttempt(row) && String(row.id) === id);
    rows.sort((a, b) => { const x = Date.parse(a.row.ts), y = Date.parse(b.row.ts); return Number.isFinite(x) && Number.isFinite(y) && x !== y ? x - y : a.index - b.index; });
    box.appendChild(el("div", { class: "ppq-attempt-history-title" }, rows.some(({row}) => row.attempt_id && row.attempt_id === this._attemptId) ? "Attempts" : "Previous attempts"));
    if (!rows.length) { box.appendChild(el("span", { class: "ppq-attempt-history-empty" }, "None yet")); return; }
    const list = el("div", { class: "ppq-attempt-history-list" });
    rows.forEach(({row}, index) => {
      const result = attemptOutcome(row), rating = row.self_report != null && row.self_report !== "" ? Number(row.self_report) : null;
      const validRating = Number.isInteger(rating) && rating >= 1 && rating <= 6;
      const date = Date.parse(row.ts), when = Number.isFinite(date) ? new Date(date).toLocaleString() : "Date not recorded";
      const description = "Attempt " + (index + 1) + ", " + when + "; result " + (result.text === "—" ? "not recorded" : result.text) + "; C " + (validRating ? rating : "not recorded");
      const column = el("span", { class: "ppq-attempt-history-column", tabIndex: 0, title: description, ariaLabel: description, "data-attempt-id": row.attempt_id || "" });
      if (row.attempt_id && row.attempt_id === this._attemptId) {
        column.classList.add("current");
        column.title = column.ariaLabel = "This attempt; " + description;
      }
      const outcome = el("span", { class: "ppq-attempt-outcome", ariaLabel: "Result " + result.text }, esc(result.text));
      const confidence = el("span", { class: "ppq-attempt-confidence", ariaLabel: "C " + (validRating ? rating : "not recorded") }, validRating ? "C " + rating : "C —");
      if (result.strength != null) outcome.style.setProperty("--ppq-history-strength", String(result.strength));
      else outcome.classList.add("missing");
      if (validRating) confidence.style.setProperty("--ppq-history-strength", String((rating - 1) / 5));
      else confidence.classList.add("missing");
      column.appendChild(outcome); column.appendChild(confidence); list.appendChild(column);
    });
    box.appendChild(list);
  };

  Viewer.prototype.init = function () { this._buildDom(); this._bindGlobalKeys(); this.filterQuestions(); this.renderDashboard(); this._initTeacherHelp(); this._fireReport({ status: "session_start" }); return this; };
  Viewer.prototype.q = function (sel) { return this.root.querySelector(sel); };
  Viewer.prototype.qa = function (sel) { return Array.prototype.slice.call(this.root.querySelectorAll(sel)); };

  Viewer.prototype._buildDom = function () {
    const cfg = this.cfg;
    this.root.classList.add("ppq");
    this.root.classList.toggle("ppq-compact-question-header", cfg.compactQuestionHeader);
    if (cfg.presentation.enabled) this.root.classList.add("ppq-presentation");
    if (cfg.presentation.compactMobileFilters) this.root.classList.add("ppq-compact-mobile-filters");
    if (cfg.presentation.guidedReview) this.root.classList.add("ppq-guided-review");
    this.root.innerHTML = "";

    const header = el("div", { class: "ppq-header" });
    header.appendChild(el("div", { class: "ppq-title" }, esc(cfg.title) + (cfg.versionLabel ? ' <span class="ppq-ver">' + esc(cfg.versionLabel) + "</span>" : "")));
    if (cfg.presentation.compactMobileFilters) {
      header.appendChild(el("button", {
        class: "ppq-filter-toggle",
        type: "button",
        ariaExpanded: false
      }, "Filters and finder"));
    }
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
        if (f.label) wrap.appendChild(el("span", { class: "ppq-filter-label" }, esc(f.label)));
        wrap.appendChild(el("button", { class: "ppq-multi-btn", type: "button" }));
        wrap.appendChild(el("div", { class: "ppq-multi-panel", style: "display:none;" }));
        filters.appendChild(wrap);
        return;
      }
      const wrap = el("label", { class: "ppq-filter-control" });
      if (f.label) wrap.appendChild(el("span", { class: "ppq-filter-label" }, esc(f.label)));
      const sel = el("select", { class: "ppq-select", "data-fidx": i, ariaLabel: f.label || f.field });
      sel.appendChild(el("option", { value: "ALL" }, esc(f.allLabel || ("All " + (f.label || f.field)))));
      wrap.appendChild(sel);
      filters.appendChild(wrap);
    });
    if (cfg.questionFinder) {
      const finder = el("div", { class: "ppq-finder" });
      finder.appendChild(el("input", {
        class: "ppq-find-input",
        type: "search",
        placeholder: "Find " + this._itemNoun(false) + "…",
        ariaLabel: "Find a specific " + this._itemNoun(false),
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
    if (cfg.shuffleGroupKeyOf) {
      orderSel.appendChild(el("option", { value: "shuffle" }, "Shuffle questions; keep parts in order"));
      orderSel.appendChild(el("option", { value: "shuffle-parts" }, "Shuffle all parts"));
      orderSel.appendChild(el("option", { value: "order" }, "In order"));
      orderSel.value = cfg.defaultOrder === "order" || cfg.defaultOrder === "ordered" ? "order" : cfg.defaultOrder === "shuffle-parts" ? "shuffle-parts" : "shuffle";
    } else {
      orderSel.appendChild(el("option", { value: "order" }, "In order"));
      orderSel.appendChild(el("option", { value: "shuffle" }, "Shuffle"));
      if (cfg.defaultOrder === "shuffle") orderSel.value = "shuffle";
    }
    filters.appendChild(orderSel);
    filters.appendChild(el("input", { class: "ppq-start", type: "number", min: "1", placeholder: "Start #", style: "display:none;" }));
    /* VF-02 (Claude 2026-07-29): the pupil's own progress page. */
    filters.appendChild(el("button", {
      class: "ppq-btn-mini ppq-progress-btn",
      type: "button",
      title: "Your attempts, ratings, guesses, time, flags and reflections"
    }, "My progress"));
    /* d011: Learned so far (only when the consumer supplies the tree). */
    if (cfg.learnedScope) {
      filters.appendChild(el("button", {
        class: "ppq-btn-mini ppq-learned-btn",
        type: "button",
        title: "Tick what you've learned; the filters then stay inside it"
      }, esc(cfg.learnedScope.label)));
    }
    /* d013/VF-04: timing preferences (only when the consumer supplies timing). */
    if (cfg.timing || cfg.attemptHistory.enabled || cfg.practiceSelection.enabled || cfg.learnerLevel.enabled || cfg.questionTools.resetInPreferences) {
      filters.appendChild(el("button", {
        class: "ppq-btn-mini ppq-timing-btn",
        type: "button",
        title: cfg.attemptHistory.enabled || cfg.practiceSelection.enabled || cfg.learnerLevel.enabled || cfg.questionTools.resetInPreferences ? "Practice and display preferences" : "Timing: off, reveal, clock, pacing ring or time bank — and your extra time"
      }, cfg.attemptHistory.enabled || cfg.practiceSelection.enabled || cfg.learnerLevel.enabled || cfg.questionTools.resetInPreferences ? "Preferences" : "Timing"));
    }
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
    const questionColumn = cfg.questionTools.dock ? el("div", { class: "ppq-question-column" }) : centre;
    if (questionColumn !== centre) questionColumn.appendChild(centre);
    const card = el("div", { class: "ppq-card", style: "display:none;" });
    const questionMeta = el("div", { class: "ppq-meta" },
      '<span class="ppq-qid"></span><span class="ppq-feedback-status"></span>' +
      '<span class="ppq-tags"></span><span class="ppq-classification-details"></span>');
    if (cfg.attemptHistory.enabled || cfg.questionBadgesOf) {
      const top = el("div", { class: "ppq-question-top" });
      top.appendChild(questionMeta);
      const right = cfg.questionBadgesOf ? el("div", { class: "ppq-question-top-right" }) : top;
      if (cfg.questionBadgesOf) right.appendChild(el("div", { class: "ppq-question-badges", role: "group", ariaLabel: "Question information", hidden: true }));
      if (cfg.attemptHistory.enabled) right.appendChild(el("div", { class: "ppq-attempt-history", role: "group", ariaLabel: "Previous attempts for this question" }));
      if (right !== top) top.appendChild(right);
      card.appendChild(top);
    } else card.appendChild(questionMeta);
    /* QoderWork 2026-09-14: the "also studied" panel exists only for consumers
       that supply alsoStudiedOf, so every other consumer's card DOM is byte for
       byte unchanged. It sits just under the question meta, above the advisory. */
    if (cfg.alsoStudiedOf) card.appendChild(el("div", { class: "ppq-also-studied", role: "note", hidden: true }));
    card.appendChild(el("div", {
      class: "ppq-source-advisory",
      role: "note",
      style: "display:none;"
    }));
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
    const structuredEl = el("div", { class: "ppq-struct" });
    if (cfg.compactQuestionHeader) {
      const targetRow = el("div", { class: "ppq-question-target-row" });
      targetRow.appendChild(el("h2", { class: "ppq-target-part" }));
      targetRow.appendChild(structuredEl);
      card.appendChild(targetRow);
    } else if (cfg.structuredNavBeforeStem) card.appendChild(structuredEl);
    if (cfg.questionLoading.enabled) {
      const loading = el("div", { class: "ppq-question-loading", role: "status", hidden: true });
      loading.setAttribute("aria-live", "polite"); loading.setAttribute("aria-atomic", "true");
      card.appendChild(loading);
    }
    if (cfg.optionsLeft) {
      const qarea = el("div", { class: "ppq-qarea" });
      qarea.appendChild(optionsEl);
      qarea.appendChild(drawContainer);
      card.appendChild(qarea);
      if (!cfg.structuredNavBeforeStem && !cfg.compactQuestionHeader) card.appendChild(structuredEl);
    } else {
      card.appendChild(drawContainer);
      if (!cfg.structuredNavBeforeStem && !cfg.compactQuestionHeader) card.appendChild(structuredEl); // structured-paper nav + whole-question
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
      /* Smith, 2026-08-02: "'reveal' should be show mark scheme anyway." */
      '<button class="ppq-btn ppq-reveal">Show markscheme (Enter)</button>' +
      '<button class="ppq-btn ppq-skip">Skip (S)</button>' +
      '<button class="ppq-btn ppq-review-attempt" style="display:none;" title="Reopen the verdict, guess declaration, responses and analysis from your last attempt">Review your last answer</button>';
    card.appendChild(controls);

    const answerPanel = el("div", { class: "ppq-answer-panel" });
    answerPanel.innerHTML =
      '<div class="ppq-ms-header"><strong>Markscheme</strong></div>' +
      '<div class="ppq-markscheme"></div>' +
      '<div class="ppq-examiner"><div class="ppq-examiner-title">Examiner report</div><div class="ppq-examiner-body"></div></div>';
    card.appendChild(answerPanel);

    const comp = el("div", { class: "ppq-competence" });
    if (cfg.selfReport.autoReveal && !cfg.sideRating.enabled) comp.classList.add("ppq-inline-rating");
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
    centre.appendChild(el("div", { class: "ppq-empty" }, "<h2>Loading " + esc(this._itemNoun(true)) + "…</h2>"));

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
    const appendRightPanel = (dash) => {
      if (!cfg.sideRating.enabled) { layout.appendChild(dash); return; }
      const right = el("div", { class: "ppq-right-column" });
      const rating = el("aside", { class: "ppq-side-rating", hidden: true, ariaLabel: "Confidence rating for the current question" });
      rating.appendChild(el("strong", { class: "ppq-side-rating-current" }));
      const legend = comp.querySelector(".ppq-scale-legend");
      if (legend) {
        const help = el("details", { class: "ppq-side-scale-help" });
        help.appendChild(el("summary", null, "Scale"));
        comp.insertBefore(help, legend);
        help.appendChild(legend);
        const media = typeof window.matchMedia === "function" ? window.matchMedia("(max-width: 820px)") : null;
        help.open = !media || !media.matches;
        if (media) {
          const update = (event) => { help.open = !event.matches; };
          if (media.addEventListener) media.addEventListener("change", update);
          else if (media.addListener) media.addListener(update);
          this._sideRatingMedia = media;
          this._sideRatingMediaHandler = update;
        }
      }
      rating.appendChild(comp); // Move the existing controls: one state and one set of handlers.
      right.appendChild(rating); right.appendChild(dash); layout.appendChild(right);
    };
    if (isSplit) {
      layout.classList.add("ppq-layout-split");
      layout.appendChild(makeDashPanel(cfg.dashboardColumns[0], "ppq-dash-left"));
      layout.appendChild(questionColumn);
      appendRightPanel(makeDashPanel(cfg.dashboardColumns[1], "ppq-dash-right"));
    } else {
      layout.appendChild(questionColumn);
      const dash = el("div", { class: "ppq-dash" });
      dash.appendChild(el("h3", null, esc(cfg.dashboardTitle)));
      dash.appendChild(el("div", { class: "ppq-dash-sub" }, "Recent ticks/crosses and your self-rating spread, per group. Click a group to filter."));
      dash.appendChild(el("div", { class: "ppq-dash-content" }));
      appendRightPanel(dash);
    }
    this.root.appendChild(layout);

    const toolbar = el("div", { class: "ppq-toolbar" });
    /* d031: the reason grid sits between Ask your teacher and Draw, in its own block, so
       it does not read as two more buttons of the same kind. The lead line sits to its
       LEFT rather than above it, because vertical space in this strip is the scarce
       thing. Groups (the question / the app) are headed inside the block. */
    const reasonGrid = cfg.problemReport && cfg.problemReport.reasons.length ? (function () {
      const seen = [], byGroup = {};
      cfg.problemReport.reasons.forEach((r) => { if (!byGroup[r.group]) { byGroup[r.group] = []; seen.push(r.group); } byGroup[r.group].push(r); });
      return '<div class="ppq-report-block">' +
        (cfg.problemReport.lead ? '<p class="ppq-report-lead">' + esc(cfg.problemReport.lead) + '</p>' : '') +
        '<div class="ppq-report-groups">' + seen.map((group) => '<div class="ppq-report-group">' +
          (cfg.problemReport.groupLabels[group] ? '<span class="ppq-report-group-name">' + esc(cfg.problemReport.groupLabels[group]) + '</span>' : '') +
          '<div class="ppq-report-grid">' + byGroup[group].map((r) =>
            '<button class="ppq-report-reason" type="button" data-reason="' + esc(r.code) + '"' +
            (r.hint ? ' title="' + esc(r.hint) + '"' : '') + '>' + esc(r.label) + '</button>').join("") +
          '</div></div>').join("") + '</div></div>';
    })() : (cfg.problemReport ? '<button class="ppq-btn-mini ppq-problem-report" type="button">Report a display problem</button>' : '');
    toolbar.innerHTML = (cfg.teacherHelp ? '<button class="ppq-btn-mini ppq-teacher-help" type="button">' + esc(cfg.teacherHelp.label) + '</button>' : '') +
      reasonGrid +
      '<button class="ppq-btn-mini ppq-draw-toggle" type="button">Draw</button>' +
      (cfg.questionTools.resetInPreferences ? '' : '<button class="ppq-btn-mini ppq-reset" type="button">Reset progress</button>');
    if (cfg.questionTools.dock) {
      toolbar.classList.add("ppq-question-tools");
      questionColumn.appendChild(toolbar);
    } else this.root.appendChild(toolbar);

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
  Viewer.prototype._groupKeys = function (q) {
    if (!this.cfg.groupKeysOf) return [this.cfg.groupKey(q)];
    const keys = this.cfg.groupKeysOf(q);
    return Array.isArray(keys) ? Array.from(new Set(keys.filter((key) => key != null && key !== "").map(String))) : [];
  };
  Viewer.prototype._itemNoun = function (plural, capitalized) {
    const noun = this.cfg.itemNoun + (plural ? "s" : "");
    return capitalized ? noun.charAt(0).toUpperCase() + noun.slice(1) : noun;
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
    const wrap = sel.parentNode && sel.parentNode.classList &&
      sel.parentNode.classList.contains("ppq-filter-control") ? sel.parentNode : null;
    sel.innerHTML = "";
    sel.appendChild(el("option", { value: "ALL" }, esc(f.allLabel || ("All " + (f.label || f.field)))));

    if (f.dependsOn && f.hideUntilParent && parentValue === "ALL") {
      sel.value = "ALL";
      sel.disabled = true;
      sel.style.display = "none";
      if (wrap) wrap.style.display = "none";
      return;
    }
    sel.disabled = false;
    sel.style.display = "";
    if (wrap) wrap.style.display = "";

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
    const filterToggle = this.q(".ppq-filter-toggle");
    if (filterToggle) {
      filterToggle.addEventListener("click", () => {
        const header = self.q(".ppq-header");
        const open = header.classList.toggle("ppq-mobile-filters-open");
        filterToggle.ariaExpanded = String(open);
        filterToggle.textContent = open ? "Hide filters" : "Filters and finder";
      });
    }
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
      if (f && f.focusGuidanceOnSelect) self._focusDashboardGuidance();
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
    /* VF-02 (Claude 2026-07-29): open the progress page. */
    const progressBtn = this.q(".ppq-progress-btn");
    if (progressBtn) progressBtn.addEventListener("click", () => self._renderProgressPage());
    /* d013/VF-04: timing preferences panel. */
    const timingBtn = this.q(".ppq-timing-btn");
    if (timingBtn) timingBtn.addEventListener("click", () => self._openTimingPanel());
    /* d011: the Learned so far panel. */
    const learnedBtn = this.q(".ppq-learned-btn");
    if (learnedBtn) {
      learnedBtn.addEventListener("click", () => self._openLearnedPanel());
      this._syncLearnedButton();
    }
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
    /* VF-03: reopen the last recorded attempt for the question on screen. */
    const reviewBtn = this.q(".ppq-review-attempt");
    if (reviewBtn) reviewBtn.addEventListener("click", () => {
      const row = self._lastAttemptFor(self.cur);
      if (row) self._reopenAttempt(row);
    });
    this.q(".ppq-next").addEventListener("click", () => self.next());
    const resetBtn = this.q(".ppq-reset");
    if (resetBtn) resetBtn.addEventListener("click", () => self.reset());
    const problemBtn = this.q(".ppq-problem-report");
    if (problemBtn) problemBtn.addEventListener("click", () => self._openProblemReport());
    this.qa(".ppq-report-reason").forEach((button) => /* d031 */
      button.addEventListener("click", () => self._openProblemReport(button.dataset.reason)));
    const helpBtn = self.q(".ppq-teacher-help");
    if (helpBtn) helpBtn.addEventListener("click", () => self._openTeacherHelp());
    if (this.cfg.headerButtons) this.qa(".ppq-headbtn").forEach((b) => b.addEventListener("click", () => {
      const hb = self.cfg.headerButtons[parseInt(b.dataset.hb, 10)];
      if (hb && hb.open) self.openModal(hb.open);
    }));
    this.qa(".ppq-scale-btn").forEach((btn) => btn.addEventListener("click", (e) => {
      const val = parseInt(e.target.dataset.val, 10);
      self.qa(".ppq-scale-btn").forEach((b) => b.classList.remove("sel"));
      e.target.classList.add("sel");
      if (self.cur) {
        self._saveRating(val);
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
      (cfg.searchTermsOf(q) || []).join(" "),
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
        : '<div class="ppq-find-none">No exact ' + esc(self._itemNoun(false)) + ' found</div>';
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
    const finderPool = this.cfg.practiceSelection.enabled ? this._practiceBaseView || this.view : this.view;
    const keepFilters = this.cfg.finderPreserveFilters && finderPool.some((item) => this.cfg.idOf(item) === this.cfg.idOf(q));
    if (!keepFilters) {
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
    }
    this.goToId(id);
    const card = this.q(".ppq-card");
    if (card) {
      const header = this.q(".ppq-header");
      const filterToggle = this.q(".ppq-filter-toggle");
      if (header) header.classList.remove("ppq-mobile-filters-open");
      if (filterToggle) {
        filterToggle.ariaExpanded = "false";
        filterToggle.textContent = "Filters and finder";
      }
      if (this.cfg.questionScrollContainer) this._scrollQuestionToTop();
      else card.scrollIntoView({ behavior: "smooth", block: "start" });
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
    if (this.cfg.presentation && this.cfg.presentation.plainGuessLanguage) {
      if (stage === "pre_verdict") return "Tick any other answers you seriously considered. Leave just your answer selected if you were certain.";
      if (stage === "pre_answer") return "Tick the answers you are choosing between.";
      return "Which other answers did you seriously consider?";
    }
    if (stage === "pre_verdict") return (d && d.candidate_prompt) || "Tick the options you think it could be.";
    if (stage === "pre_answer") return (d && d.candidate_prompt) || "Tick the options you think it could be.";
    return (d && d.candidate_prompt) || "Which options were still in the running?";
  };
  Viewer.prototype._guessLabel = function (stage) {
    const d = this.cfg.guessDefaults && this.cfg.guessDefaults[stage];
    if (this.cfg.presentation && this.cfg.presentation.plainGuessLanguage) {
      if (stage === "pre_verdict") return "How certain were you?";
      if (stage === "pre_answer") return "I am choosing between answers";
      return "I was choosing between answers";
    }
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
    const plainGuess = this.cfg.presentation && this.cfg.presentation.plainGuessLanguage;
    const done = el("button", { class: "ppq-gpick-done", type: "button" },
      plainGuess ? "Save uncertainty" : "Done");
    const skip = el("button", { class: "ppq-gpick-skip", type: "button" },
      plainGuess ? "I was certain" : "Skip");
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
      if (c.length < MIN_OPTIONS) {
        showMsg(plainGuess
          ? "Tick at least two answers, or choose “I was certain”."
          : ("Pick at least " + MIN_OPTIONS + " options, or Skip."));
        return false;
      }
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
    /* d011: within-learned scope (only bites once something is ticked). */
    if (this._questionInLearnedScope && !this._questionInLearnedScope(qq)) return false;
    if (this.groupFilter && this._groupKeys(qq).indexOf(this.groupFilter) < 0) return false;
    return true;
  };

  /* ============================== d011: Learned so far =====================
     The learner marks course position on a nested tri-state tree; filters then
     operate within it by default. Engine-owned mechanism; the subject supplies
     the tree and refsOf. Not wired for ESAT (whole-spec test prep). */
  Viewer.prototype._questionInLearnedScope = function (q) {
    const ls = this.cfg.learnedScope;
    if (!ls) return true;
    const learned = ((this.store || {}).learned) || { set: {}, enabled: true };
    if (learned.enabled === false) return true;
    const set = learned.set || {};
    let any = false;
    for (const k in set) { if (set[k]) { any = true; break; } }
    if (!any) return true; /* nothing ticked yet — the scope does not bite */
    let refs = [];
    try { refs = ls.refsOf(q) || []; } catch (_) { refs = []; }
    if (!refs.length) return false; /* unmapped content is not part of the mapped course */
    for (let i = 0; i < refs.length; i++) if (!set[refs[i]]) return false;
    return true;
  };
  Viewer.prototype._learnedScopeBiting = function () {
    const ls = this.cfg.learnedScope;
    if (!ls) return false;
    const learned = ((this.store || {}).learned) || {};
    if (learned.enabled === false) return false;
    const set = learned.set || {};
    for (const k in set) { if (set[k]) return true; }
    return false;
  };
  Viewer.prototype._syncLearnedButton = function () {
    const b = this.q(".ppq-learned-btn");
    if (!b) return;
    const ls = this.cfg.learnedScope;
    if (!ls) { b.style.display = "none"; return; }
    const learned = ((this.store || {}).learned) || { set: {}, enabled: true };
    let n = 0;
    for (const k in (learned.set || {})) { if (learned.set[k]) n++; }
    b.textContent = ls.label + (n ? (learned.enabled === false ? " (off)" : " (" + n + ")") : "");
    b.classList.toggle("on", this._learnedScopeBiting());
  };

  Viewer.prototype._openLearnedPanel = function () {
    const self = this, ls = this.cfg.learnedScope;
    if (!ls) return false;
    const saved = ((this.store || {}).learned) || { set: {}, enabled: true };
    const set = Object.assign({}, saved.set || {});
    let enabled = saved.enabled !== false;

    const page = el("div", { class: "ppq-progress ppq-learned-panel" });
    page.appendChild(el("div", { class: "ppq-progress-title" }, esc(ls.label)));
    const summary = el("div", { class: "ppq-learned-summary" });
    page.appendChild(summary);

    const enableRow = el("label", { class: "ppq-learned-enable" });
    const enableBox = el("input", { type: "checkbox" });
    enableBox.checked = enabled;
    enableBox.addEventListener("change", function () { enabled = !!enableBox.checked; refreshSummary(); });
    enableRow.appendChild(enableBox);
    enableRow.appendChild(el("span", null, "Only show questions fully inside what you've learned (turn off to look ahead)"));
    page.appendChild(enableRow);

    const quick = el("div", { class: "ppq-learned-quick" });
    const tickAll = el("button", { class: "ppq-btn-mini", type: "button" }, "Tick everything");
    const clearAll = el("button", { class: "ppq-btn-mini", type: "button" }, "Clear");
    quick.appendChild(tickAll); quick.appendChild(clearAll);
    page.appendChild(quick);

    const treeBox = el("div", { class: "ppq-learned-tree" });
    page.appendChild(treeBox);

    function setLeaves(node, on) {
      learnedTreeLeaves(node).forEach(function (c) { if (on) set[c] = true; else delete set[c]; });
    }
    function allLeaves() {
      const out = [];
      ls.tree.forEach(function (t) { learnedTreeLeaves(t, out); });
      return out;
    }
    function refreshSummary() {
      let n = 0;
      for (const k in set) { if (set[k]) n++; }
      const total = allLeaves().length;
      let inScope = 0, totalQ = (self.questions || []).length;
      const probe = { cfg: self.cfg, store: { learned: { set: set, enabled: enabled } }, _questionInLearnedScope: self._questionInLearnedScope };
      (self.questions || []).forEach(function (q) { if (probe._questionInLearnedScope(q)) inScope++; });
      summary.textContent = n + " of " + total + " items ticked · " +
        (n === 0 ? "scope not filtering yet (tick what you've learned)" :
          (enabled ? (inScope + " of " + totalQ + " questions in scope") : "scope OFF — showing everything"));
    }
    /* Smith, 2026-07-30: "any tick/untick recollapses the view so unticking
       three in a row is a right pain." Ticking used to rebuild the whole tree,
       which threw away every open <details> and the scroll position. The DOM
       is now built ONCE and a tick only repaints the boxes whose state can
       have changed, so open branches, scroll and focus all survive. */
    const boxes = [];
    function boxTitle(st) {
      return st === "all" ? "Learned; click to clear" :
        (st === "some" ? "Partly learned; click to mark all of this learned" : "Click to mark all of this learned");
    }
    function refreshBoxes() {
      boxes.forEach(function (x) {
        const st = learnedTreeState(x.node, set);
        x.el.className = "ppq-ls-box " + st;
        x.el.title = boxTitle(st);
      });
    }
    function boxFor(node) {
      const st = learnedTreeState(node, set);
      const b = el("button", { class: "ppq-ls-box " + st, type: "button", title: boxTitle(st) });
      boxes.push({ node: node, el: b });
      b.addEventListener("click", function (e) {
        if (e && e.stopPropagation) e.stopPropagation();
        if (e && e.preventDefault) e.preventDefault();
        setLeaves(node, learnedTreeState(node, set) !== "all");
        refreshBoxes();
        refreshSummary();
      });
      return b;
    }
    function renderTree() {
      boxes.length = 0;
      treeBox.innerHTML = "";
      ls.tree.forEach(function (topic) {
        const det = el("details", { class: "ppq-learned-topic" });
        const sum = el("summary");
        sum.appendChild(boxFor(topic));
        sum.appendChild(el("b", null, esc(topic.label || topic.code)));
        det.appendChild(sum);
        (topic.children || []).forEach(function (tp) {
          if (!tp.children || !tp.children.length) {
            const row = el("div", { class: "ppq-learned-leafrow" });
            row.appendChild(boxFor(tp));
            row.appendChild(el("span", null, esc(tp.label || tp.code)));
            det.appendChild(row);
            return;
          }
          const sub = el("details", { class: "ppq-learned-sub" });
          const ssum = el("summary");
          ssum.appendChild(boxFor(tp));
          ssum.appendChild(el("span", null, esc(tp.label || tp.code)));
          sub.appendChild(ssum);
          (tp.children || []).forEach(function (leaf) {
            const row = el("div", { class: "ppq-learned-leafrow" });
            row.appendChild(boxFor(leaf));
            row.appendChild(el("span", null, esc(leaf.label || leaf.code)));
            sub.appendChild(row);
          });
          det.appendChild(sub);
        });
        treeBox.appendChild(det);
      });
    }
    tickAll.addEventListener("click", function () { allLeaves().forEach(function (c) { set[c] = true; }); refreshBoxes(); refreshSummary(); });
    clearAll.addEventListener("click", function () { for (const k in set) delete set[k]; refreshBoxes(); refreshSummary(); });
    renderTree();
    refreshSummary();

    const save = el("button", { class: "ppq-btn ppq-primary ppq-learned-save", type: "button" }, "Save — remembered on this device");
    save.addEventListener("click", function () {
      self.store.learned = { set: set, enabled: enabled };
      self._saveStore();
      self._fireReport({ status: "learned_scope", qtype: "learned", extra_json: JSON.stringify({ ticked: Object.keys(set).length, enabled: enabled }) });
      self.closeModal();
      self._syncLearnedButton();
      self.filterQuestions();
      self.renderDashboard();
    });
    page.appendChild(save);

    const body = this.q(".ppq-modal-body");
    if (!body) return false;
    body.innerHTML = "";
    body.appendChild(page);
    const reminder = this.q(".ppq-modal-reminder");
    if (reminder) reminder.textContent = ls.label;
    const minBtn = this.q(".ppq-modal-min");
    if (minBtn) minBtn.style.display = "none";
    const badge = this.q(".ppq-modal-feedback-status");
    if (badge) badge.style.display = "none";
    this.q(".ppq-modal").classList.add("show", "ppq-modal-progress");
    return true;
  };

  /* VF-14r (Smith 2026-07-29): per-question performance scores from the
     attempts log — right 1, wrong 0, marks attempts their fraction, ranges
     their midpoint; the most recent answer weighs 4× all earlier ones. One
     map, shared by the progress clusters and the dashboard's little question
     boxes. */
  Viewer.prototype._questionScores = function () {
    const values = {};
    (((this.store || {}).attempts) || []).forEach(function (att) {
      let v;
      if (att.marks_max != null && att.marks_max > 0) {
        if (att.marks_awarded != null) v = att.marks_awarded / att.marks_max;
        else if (att.marks_range) v = (att.marks_range[0] + att.marks_range[1]) / 2 / att.marks_max;
        else v = att.correct ? 1 : 0;
      } else {
        v = att.correct ? 1 : 0;
      }
      (values[String(att.id)] = values[String(att.id)] || []).push(v);
    });
    const scores = {};
    for (const qid in values) scores[qid] = questionPerfScore(values[qid]);
    return scores;
  };

  /* VF-02 (Claude 2026-07-29): aggregate the pupil's own record — attempts,
     correctness, ratings, guesses, flags, time, reflections, responses — by
     topic and by day, entirely from the local store. Pure computation, no DOM,
     so it is directly testable. Rated-but-unattempted questions (chemistry
     flashcards) still surface through their scores. */
  Viewer.prototype._progressStats = function () {
    const cfg = this.cfg;
    const store = this.store || {};
    const attempts = store.attempts || [];
    const scores = store.scores || {};
    const flags = store.flags || {};
    const topics = {};
    const days = {};
    const qids = {};
    const totals = { attempts: attempts.length, correct: 0, timeMs: 0, guesses: 0, reflections: 0, responses: 0 };
    const self = this;
    function topicInfo(qid) {
      const q = self._questionById(qid);
      if (q) return { key: String(cfg.groupKey(q)), label: cfg.groupLabel(q) };
      return { key: "GONE", label: "No longer in the bank" };
    }
    function topicFor(info) {
      return topics[info.key] = topics[info.key] ||
        { key: info.key, label: info.label, attempts: 0, correct: 0, timeMs: 0, guesses: 0, flagged: 0, ratingSum: 0, ratingN: 0, qids: {} };
    }
    attempts.forEach(function (row) {
      const t = topicFor(topicInfo(row.id));
      t.attempts++;
      if (row.correct) { t.correct++; totals.correct++; }
      t.timeMs += row.time_ms || 0; totals.timeMs += row.time_ms || 0;
      if (row.pre_guess_declaration || row.post_guess_declaration) { t.guesses++; totals.guesses++; }
      if (row.freeform_reflection) totals.reflections++;
      if (row.responses) { for (const k in row.responses) totals.responses += Object.keys(row.responses[k]).length; }
      t.qids[String(row.id)] = 1; qids[String(row.id)] = 1;
      const day = String(row.ts || "").slice(0, 10);
      if (day) { const d = days[day] = days[day] || { day: day, attempts: 0, correct: 0 }; d.attempts++; if (row.correct) d.correct++; }
    });
    let ratingSum = 0, ratingN = 0;
    for (const qid in scores) {
      const v = scores[qid];
      if (!v) continue;
      ratingSum += v; ratingN++;
      const t = topicFor(topicInfo(qid));
      t.ratingSum += v; t.ratingN++;
    }
    for (const qid in flags) topicFor(topicInfo(qid)).flagged++;
    const topicList = Object.keys(topics).map(function (k) { return topics[k]; });
    topicList.forEach(function (t) {
      t.questions = Object.keys(t.qids).length;
      t.pctCorrect = t.attempts ? Math.round(100 * t.correct / t.attempts) : null;
      t.avgRating = t.ratingN ? t.ratingSum / t.ratingN : null;
      t.avgTimeS = t.attempts ? t.timeMs / t.attempts / 1000 : null;
    });
    topicList.sort(function (a, b) { return b.attempts - a.attempts || String(a.label).localeCompare(String(b.label)); });
    const dayList = Object.keys(days).sort().map(function (k) { return days[k]; });

    /* VF-14r (Smith): per-axis aggregation with a QUESTION CLUSTER per
       category — one little box per available question, neutral until
       attempted, then coloured by the 4×-most-recent performance score. */
    const perQuestionScore = this._questionScores();

    const axes = (cfg.progressAxes || []).map(function (axis) {
      const rowsByValue = {};
      function rowFor(value) {
        return rowsByValue[value] = rowsByValue[value] ||
          { value: value, questions: [], attempts: 0, correct: 0, timeMs: 0, timeN: 0, ratingSum: 0, ratingN: 0 };
      }
      /* one dot per AVAILABLE question, in catalogue order */
      (self.questions || []).forEach(function (q) {
        let values = [];
        try { values = axis.valuesOf(q) || []; } catch (_) { values = []; }
        const qid = String(cfg.idOf(q));
        values.forEach(function (v) {
          if (v == null || v === "") return;
          rowFor(String(v)).questions.push({
            id: qid,
            score: perQuestionScore[qid] != null ? perQuestionScore[qid] : null
          });
        });
      });
      attempts.forEach(function (att) {
        const q = self._questionById(att.id);
        if (!q) return;
        let values = [];
        try { values = axis.valuesOf(q) || []; } catch (_) { values = []; }
        values.forEach(function (v) {
          if (v == null || v === "") return;
          const row = rowFor(String(v));
          row.attempts++;
          if (att.correct) row.correct++;
          if (att.time_ms != null) { row.timeMs += att.time_ms; row.timeN++; }
        });
      });
      for (const qid in scores) {
        const v0 = scores[qid];
        if (!v0) continue;
        const q = self._questionById(qid);
        if (!q) continue;
        let values = [];
        try { values = axis.valuesOf(q) || []; } catch (_) { values = []; }
        values.forEach(function (v) {
          if (v == null || v === "") return;
          const row = rowFor(String(v));
          row.ratingSum += v0; row.ratingN++;
        });
      }
      const rows = Object.keys(rowsByValue).map(function (k) { return rowsByValue[k]; });
      rows.forEach(function (r) {
        r.available = r.questions.length;
        r.tried = r.questions.filter(function (d) { return d.score != null; }).length;
        r.pctCorrect = r.attempts ? Math.round(100 * r.correct / r.attempts) : null;
        r.avgRating = r.ratingN ? r.ratingSum / r.ratingN : null;
        r.avgTimeS = r.timeN ? r.timeMs / r.timeN / 1000 : null;
      });
      rows.sort(function (a, b) { return b.attempts - a.attempts || String(a.value).localeCompare(String(b.value)); });
      return { key: axis.key || axis.label, label: axis.label, labelOf: axis.labelOf || null, rows: rows };
    });

    return {
      axes: axes,
      totals: {
        attempts: totals.attempts,
        questions: Object.keys(qids).length,
        correct: totals.correct,
        pctCorrect: totals.attempts ? Math.round(100 * totals.correct / totals.attempts) : null,
        avgRating: ratingN ? ratingSum / ratingN : null,
        guesses: totals.guesses,
        flags: Object.keys(flags).length,
        timeMs: totals.timeMs,
        reflections: totals.reflections,
        responses: totals.responses
      },
      topics: topicList,
      days: dayList
    };
  };

  /* VF-02: the pupil's own progress page, rendered into the shared modal shell.
     Tables follow the estate data-presentation standard: values centred both
     ways, headings wrapped rather than widening columns, smooth two-tone
     shading anchored white at zero, one hue per class of quantity (counts
     slate, correctness blue, ratings amber, time purple), black text with the
     darkness capped. Flag counts stay unshaded — their range is a thin sliver
     of a zero-anchored scale. */
  Viewer.prototype._renderProgressPage = function () {
    const self = this, cfg = this.cfg;
    const s = this._progressStats();
    const page = el("div", { class: "ppq-progress" });
    page.appendChild(el("div", { class: "ppq-progress-title" }, "My progress"));
    const appendProgressTable = function (table) {
      const scroll = el("div", {
        class: "ppq-progress-table-scroll",
        role: "region",
        tabIndex: 0,
        ariaLabel: "Progress table; scroll sideways for more columns"
      });
      scroll.appendChild(table);
      page.appendChild(scroll);
    };

    function td(text, style, cls) {
      return el("td", { style: style || "", class: cls || "" }, text == null ? "—" : String(text));
    }
    function headerRow(labels) {
      const tr = el("tr");
      labels.forEach(function (h) { tr.appendChild(el("th", null, esc(h))); });
      const thead = el("thead"); thead.appendChild(tr); return thead;
    }

    if (!s.totals.attempts && !s.totals.flags && !s.topics.length) {
      page.appendChild(el("div", { class: "ppq-progress-empty" },
        "Nothing here yet — answer some " + esc(this._itemNoun(true)) + " and this page fills up."));
    } else {
      const fmtTime = function (ms) {
        const m = Math.round(ms / 60000);
        if (m < 1) return Math.round(ms / 1000) + " s";
        return m < 60 ? (m + " min") : (Math.floor(m / 60) + " h " + (m % 60) + " min");
      };
      const strip = el("div", { class: "ppq-progress-totals" });
      [["Attempts", s.totals.attempts],
       [this._itemNoun(true, true) + " tried", s.totals.questions],
       ["Correct", s.totals.pctCorrect != null ? s.totals.pctCorrect + "%" : "—"],
       ["Average rating", s.totals.avgRating != null ? s.totals.avgRating.toFixed(1) + " / 6" : "—"],
       ["Guesses declared", s.totals.guesses],
       ["Flagged", s.totals.flags],
       ["Time practising", fmtTime(s.totals.timeMs)]
      ].forEach(function (pair) {
        const card = el("div", { class: "ppq-progress-stat" });
        card.appendChild(el("b", null, esc(String(pair[1]))));
        card.appendChild(el("span", null, esc(pair[0])));
        strip.appendChild(card);
      });
      page.appendChild(strip);

      if (s.topics.length) {
        page.appendChild(el("div", { class: "ppq-progress-subhead" }, "By topic"));
        const maxAttempts = s.topics.reduce(function (m, t) { return Math.max(m, t.attempts); }, 1);
        const maxTime = s.topics.reduce(function (m, t) { return Math.max(m, t.avgTimeS || 0); }, 1);
        const table = el("table", { class: "ppq-progress-table" });
        table.appendChild(headerRow(["Topic", "Attempts", "Correct %", "Average rating", "Average time (s)", "Flagged"]));
        const tbody = el("tbody");
        s.topics.forEach(function (t) {
          const tr = el("tr");
          tr.appendChild(td(t.label, "", "ppq-progress-topic"));
          tr.appendChild(td(t.attempts, shadeCell("108, 122, 137", t.attempts, maxAttempts)));
          tr.appendChild(td(t.pctCorrect != null ? t.pctCorrect + "%" : null,
            t.pctCorrect != null ? shadeCell("49, 130, 206", t.pctCorrect, 100) : ""));
          tr.appendChild(td(t.avgRating != null ? t.avgRating.toFixed(1) : null,
            t.avgRating != null ? shadeCell("221, 165, 35", t.avgRating, 6) : ""));
          tr.appendChild(td(t.avgTimeS != null ? Math.round(t.avgTimeS) : null,
            t.avgTimeS != null ? shadeCell("128, 90, 213", t.avgTimeS, maxTime) : ""));
          tr.appendChild(td(t.flagged ? t.flagged : ""));
          tbody.appendChild(tr);
        });
        table.appendChild(tbody);
        appendProgressTable(table);
      }

      /* VF-14r: one table per configured axis. Each category carries its
         QUESTION CLUSTER: one small dot per available question (neutral until
         attempted, then the continuous performance colour with pale yellow at
         0.2). Confirmed for ESAT and maths alike. */
      function clusterEl(questionDots) {
        const wrap = el("span", { class: "ppq-qcluster" });
        const cap = 240;
        (questionDots || []).slice(0, cap).forEach(function (d) {
          const attrs = {
            class: "ppq-qdot" + (d.score == null ? " untried" : ""),
            title: d.id + (d.score == null ? " — not tried yet" : " — " + Math.round(d.score * 100) + "%")
          };
          if (d.score != null) attrs.style = "background: " + perfColour(d.score) + ";";
          wrap.appendChild(el("span", attrs));
        });
        if ((questionDots || []).length > cap) {
          wrap.appendChild(el("span", { class: "ppq-qcluster-more" }, "+" + (questionDots.length - cap)));
        }
        return wrap;
      }
      (s.axes || []).forEach(function (axis) {
        if (!axis.rows.length) return;
        page.appendChild(el("div", { class: "ppq-progress-subhead" }, esc(axis.label)));
        const table = el("table", { class: "ppq-progress-table ppq-progress-axis" });
        table.appendChild(headerRow([axis.label.replace(/^By /, ""), self._itemNoun(true, true) + " (tried / available)", "Attempts", "Correct %", "Average rating", "Average time (s)"]));
        const tbody = el("tbody");
        const maxA = axis.rows.reduce(function (m, r) { return Math.max(m, r.attempts); }, 1);
        const maxT = axis.rows.reduce(function (m, r) { return Math.max(m, r.avgTimeS || 0); }, 1);
        const shown = axis.rows.filter(function (r) { return r.attempts > 0 || r.ratingN > 0; }).slice(0, 14);
        shown.forEach(function (r) {
          const tr = el("tr");
          /* An axis may name its values in human words (a syllabus code means
             nothing to a pupil); the raw value stays the key. */
          let rowLabel = r.value;
          if (typeof axis.labelOf === "function") { try { rowLabel = axis.labelOf(r.value) || r.value; } catch (_) { rowLabel = r.value; } }
          tr.appendChild(td(rowLabel, "", "ppq-progress-topic"));
          const dotsTd = el("td", { class: "ppq-progress-dots" });
          dotsTd.appendChild(clusterEl(r.questions));
          dotsTd.appendChild(el("div", { class: "ppq-qcluster-count" }, r.tried + " / " + r.available));
          tr.appendChild(dotsTd);
          tr.appendChild(td(r.attempts || null, r.attempts ? shadeCell("108, 122, 137", r.attempts, maxA) : ""));
          tr.appendChild(td(r.pctCorrect != null ? r.pctCorrect + "%" : null,
            r.pctCorrect != null ? shadeCell("49, 130, 206", r.pctCorrect, 100) : ""));
          tr.appendChild(td(r.avgRating != null ? r.avgRating.toFixed(1) : null,
            r.avgRating != null ? shadeCell("221, 165, 35", r.avgRating, 6) : ""));
          tr.appendChild(td(r.avgTimeS != null ? Math.round(r.avgTimeS) : null,
            r.avgTimeS != null ? shadeCell("128, 90, 213", r.avgTimeS, maxT) : ""));
          tbody.appendChild(tr);
        });
        table.appendChild(tbody);
        appendProgressTable(table);
        if (axis.rows.length > shown.length) {
          page.appendChild(el("div", { class: "ppq-progress-more" },
            "Showing the " + shown.length + " most-practised of " + axis.rows.length + " categories."));
        }
      });

      if (s.days.length) {
        page.appendChild(el("div", { class: "ppq-progress-subhead" }, "Over time"));
        const recent = s.days.slice(-14);
        const maxDay = recent.reduce(function (m, d) { return Math.max(m, d.attempts); }, 1);
        const table = el("table", { class: "ppq-progress-table" });
        table.appendChild(headerRow(["Day", "Attempts", "Correct %"]));
        const tbody = el("tbody");
        recent.forEach(function (d) {
          const pct = d.attempts ? Math.round(100 * d.correct / d.attempts) : null;
          const tr = el("tr");
          tr.appendChild(td(d.day, "", "ppq-progress-topic"));
          tr.appendChild(td(d.attempts, shadeCell("108, 122, 137", d.attempts, maxDay)));
          tr.appendChild(td(pct != null ? pct + "%" : null, pct != null ? shadeCell("49, 130, 206", pct, 100) : ""));
          tbody.appendChild(tr);
        });
        table.appendChild(tbody);
        appendProgressTable(table);
      }

      const recentAttempts = ((this.store || {}).attempts || []).slice(-40).reverse();
      if (recentAttempts.length) {
        page.appendChild(el("div", { class: "ppq-progress-subhead" },
          "Recent " + esc(this._itemNoun(true)) + " — click one to reopen it"));
        const list = el("div", { class: "ppq-progress-attempts" });
        recentAttempts.forEach(function (row) {
          const q = self._questionById(row.id);
          const item = el("button", { class: "ppq-progress-attempt", type: "button", "data-qid": String(row.id) });
          const bits = [];
          bits.push('<span class="ppq-progress-verdict ' + (row.correct ? "right" : "wrong") + '">' + (row.correct ? "✓" : "✗") + "</span>");
          bits.push("<b>" + esc(q ? cfg.metaLine(q) : String(row.id)) + "</b>");
          const rating = ((self.store || {}).scores || {})[row.id];
          if (rating) bits.push('<span class="ppq-progress-chip">rated ' + rating + "/6</span>");
          const decl = row.pre_guess_declaration || row.post_guess_declaration;
          if (decl && decl.candidate_options && decl.candidate_options.length) {
            bits.push('<span class="ppq-progress-chip">guess: ' + esc(decl.candidate_options.join("/")) + "</span>");
          }
          if (((self.store || {}).flags || {})[row.id]) bits.push('<span class="ppq-progress-chip">flagged</span>');
          if (row.time_ms) bits.push('<span class="ppq-progress-chip">' + Math.round(row.time_ms / 1000) + " s</span>");
          let respN = 0;
          if (row.responses) { for (const k in row.responses) respN += Object.keys(row.responses[k]).length; }
          if (respN) bits.push('<span class="ppq-progress-chip">' + respN + " response" + (respN === 1 ? "" : "s") + "</span>");
          if (q) {
            const ready = self._feedbackReadiness(q);
            bits.push('<span class="ppq-feedback-status ppq-feedback-status-' + ready.code + '">' + esc(ready.label) + "</span>");
          }
          item.innerHTML = bits.join(" ");
          if (row.freeform_reflection) {
            item.appendChild(el("div", { class: "ppq-progress-reflection" }, "“" + esc(row.freeform_reflection) + "”"));
          }
          if (q) item.addEventListener("click", function () { self._jumpToAttempt(row.id); });
          else item.disabled = true;
          list.appendChild(item);
        });
        page.appendChild(list);
      }

      /* Smith, 2026-07-31: "a way to delete historical timings — q, stem, time,
         delete time". A time recorded while you were interrupted is worse than
         no time at all, because it silently drags every average and pace figure
         that reads it. The answer, rating and everything else on the row stay;
         only the clock goes. */
      const timed = ((this.store || {}).attempts || []).filter(function (r) { return r.time_ms != null; });
      if (timed.length) {
        const head = el("div", { class: "ppq-progress-subhead" }, "Recorded times");
        page.appendChild(head);
        page.appendChild(el("div", { class: "ppq-progress-more" },
          "Delete a time that does not reflect the work (interrupted, looked something up, walked away). " +
          "The answer and rating stay; only the time is struck, exactly as “don't record this one” does."));
        const table = el("table", { class: "ppq-progress-table ppq-progress-times" });
        table.appendChild(headerRow([this._itemNoun(false, true), "What it asked", "Time", ""]));
        const tbody = el("tbody");
        timed.slice(-60).reverse().forEach(function (row) {
          const q = self._questionById(row.id);
          const tr = el("tr");
          tr.appendChild(td(q ? cfg.metaLine(q) : String(row.id), "", "ppq-progress-topic"));
          tr.appendChild(td(q ? self._stemSnippet(q) : "", "", "ppq-progress-stem"));
          tr.appendChild(td(self._fmtClock(row.time_ms)));
          const actionTd = el("td");
          const del = el("button", { class: "ppq-btn-mini ppq-time-del", type: "button", title: "Strike this time" }, "delete time");
          del.addEventListener("click", function () {
            self._deleteRecordedTime(row);
            self._renderProgressPage();
          });
          actionTd.appendChild(del);
          tr.appendChild(actionTd);
          tbody.appendChild(tr);
        });
        table.appendChild(tbody);
        page.appendChild(table);
        const delAll = el("button", { class: "ppq-btn ppq-time-del-all", type: "button" },
          "Delete every recorded time (" + timed.length + ")");
        delAll.addEventListener("click", function () {
          if (typeof confirm === "function" && !confirm("Strike the time from all " + timed.length +
            " attempts? Answers and ratings are kept.")) return;
          timed.forEach(function (r) { self._deleteRecordedTime(r, true); });
          if (self._saveStore) self._saveStore();
          self._renderProgressPage();
        });
        page.appendChild(delAll);
      }
    }

    const body = this.q(".ppq-modal-body");
    if (!body) return false;
    body.innerHTML = "";
    body.appendChild(page);
    const reminder = this.q(".ppq-modal-reminder");
    if (reminder) reminder.textContent = "My progress";
    const minBtn = this.q(".ppq-modal-min");
    if (minBtn) minBtn.style.display = "none";
    const badge = this.q(".ppq-modal-feedback-status");
    if (badge) badge.style.display = "none";
    const modalContent = this.q(".ppq-modal-content");
    if (modalContent) modalContent.scrollTop = 0;
    this.q(".ppq-modal").classList.add("show", "ppq-modal-progress");
    return true;
  };

  /* VF-02: drill-down — leave the page, show the exact question (independent of
     the current filters), and reopen its last recorded attempt. */
  Viewer.prototype._jumpToAttempt = function (qid) {
    const q = this._questionById(qid);
    if (!q) return;
    this.closeModal();
    this._histPos = null; this._returnIdx = null;
    this.render(q);
    const row = this._lastAttemptFor(q);
    if (row && this.cfg.modules.postQuestionReview) this._reopenAttempt(row);
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

  Viewer.prototype._practiceMode = function () {
    const mode = ((this.store.prefs || {}).practiceSelection || {}).mode;
    return ["unattempted", "mix", "errors"].includes(mode) ? mode : this.cfg.practiceSelection.defaultMode;
  };
  Viewer.prototype._practiceCandidates = function () {
    const mode = this._practiceMode(), latest = new Map();
    (this.store.attempts || []).forEach((row) => { if (completedAttempt(row)) latest.set(String(row.id), row); });
    return (this._practiceBaseView || []).filter((q) => {
      const row = latest.get(String(this.cfg.idOf(q)));
      return mode === "mix" || (mode === "unattempted" ? !row : !!row && attemptOutcome(row).error);
    });
  };
  Viewer.prototype._updatePracticeCounter = function () {
    const mode = this._practiceMode(), total = (this._practiceBaseView || []).length, n = this._practiceCandidates().length;
    let html = n + (mode === "unattempted" ? " unattempted" : mode === "errors" ? " previous errors" : " in complete mix") + " / " + total + " " + esc(this._itemNoun(true));
    if (this.groupFilter) html += ' · <button class="ppq-filterchip" type="button" title="Clear this topic filter">' + esc(this._groupFilterLabel || this.groupFilter) + " ✕</button>";
    this.q(".ppq-counter").innerHTML = html;
  };
  Viewer.prototype._nextPractice = function () {
    const cfg = this.cfg, base = this._practiceBaseView || [];
    this._histPos = null; this._returnIdx = null;
    this.view = this._practiceCandidates();
    this._updatePracticeCounter();
    if (!this.view.length) {
      this._stopTimer(); this.cur = null; this._marksPending = false;
      this._showEmpty("No " + this._itemNoun(true) + " match this practice selection.");
      if (!base.length) { this.q(".ppq-empty").classList.remove("ppq-practice-empty"); return; }
      const empty = this.q(".ppq-empty"); empty.classList.add("ppq-practice-empty");
      const message = !base.length ? "No questions match these topic filters." : this._practiceMode() === "unattempted" ? "You have attempted every question in this selection." : "No previous errors in this selection.";
      empty.innerHTML = '<h2>' + esc(message) + '</h2><p>Choose how to practise next.</p><button class="ppq-btn ppq-practice-preferences" type="button">Preferences</button> <button class="ppq-btn" data-practice-mode="mix" type="button">Complete mix</button> <button class="ppq-btn" data-practice-mode="errors" type="button">Previous errors</button>';
      empty.querySelector(".ppq-practice-preferences").addEventListener("click", () => this._openTimingPanel());
      empty.querySelectorAll("[data-practice-mode]").forEach((button) => button.addEventListener("click", () => {
        if (!this.store.prefs) this.store.prefs = {};
        this.store.prefs.practiceSelection = { mode: button.dataset.practiceMode }; this._saveStore(); this._nextPractice();
      }));
      return;
    }
    let target = this._practiceResumeId && (!this.cur || cfg.idOf(this.cur) !== this._practiceResumeId) && this.view.find((q) => cfg.idOf(q) === this._practiceResumeId);
    if (!target) {
      const anchor = base.findIndex((q) => cfg.idOf(q) === this._practiceAnchorId), eligible = new Set(this.view.map((q) => cfg.idOf(q)));
      for (let step = 1; step <= base.length; step++) { const q = base[(anchor + step) % base.length]; if (eligible.has(cfg.idOf(q))) { target = q; break; } }
    }
    this._practiceResumeId = null; this._practiceReview = false;
    this._practiceAnchorId = cfg.idOf(target); this.idx = this.view.indexOf(target);
    this.q(".ppq-empty").classList.remove("ppq-practice-empty"); this.render();
  };

  Viewer.prototype.filterQuestions = function () {
    const cfg = this.cfg;
    const self = this;
    /* VF-03: a filter/order change ends any history walk (the history list
       itself survives; only the walk position resets). */
    this._histPos = null;
    this._returnIdx = null;
    const order = this.q(".ppq-order").value || "order";
    const start = parseInt(this.q(".ppq-start").value, 10) || 1;
    this.view = this._collapseLevelTwins(this.questions.filter((qq) => self._matchesQuestionFilters(qq)));
    if (order === "shuffle" || order === "shuffle-parts") {
      if (order === "shuffle" && cfg.shuffleGroupKeyOf) {
        const cmp = cfg.sort || function (a, b) { return String(cfg.idOf(a)).localeCompare(String(cfg.idOf(b)), undefined, { numeric: true, sensitivity: "base" }); };
        this.view.sort(cmp);
        const groups = new Map();
        this.view.forEach((q) => {
          const value = cfg.shuffleGroupKeyOf(q), key = value == null || value === "" ? "item:" + cfg.idOf(q) : "group:" + value;
          if (!groups.has(key)) groups.set(key, []);
          groups.get(key).push(q);
        });
        const shuffled = Array.from(groups.values()); shuffleInPlace(shuffled); this.view = [].concat(...shuffled);
      } else shuffleInPlace(this.view);
      this.idx = -1;
    }
    else {
      const cmp = cfg.sort || function (a, b) { return String(cfg.idOf(a)).localeCompare(String(cfg.idOf(b)), undefined, { numeric: true, sensitivity: "base" }); };
      this.view.sort(cmp);
      this.idx = (start > 1 && start <= this.view.length) ? start - 2 : -1;
    }
    if (cfg.practiceSelection.enabled) {
      this._practiceBaseView = this.view.slice();
      this._practiceAnchorId = this.idx >= 0 ? cfg.idOf(this.view[this.idx]) : null;
      this._practiceResumeId = null;
      this._practiceReview = false;
      this.view = this._practiceCandidates();
    }
    /* QoderWork 2026-07-22: the active topic filter is shown as a removable chip
       (Smith clicked P3 Mechanics, saw "no questions match", and couldn't see the
       filter was stuck or how to undo it). */
    let counterHtml = this.view.length + " " + esc(this._itemNoun(true));
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
    if (cfg.practiceSelection.enabled) this._updatePracticeCounter();
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
    if (filter.focusGuidanceOnSelect) this._focusDashboardGuidance();
  };
  Viewer.prototype._focusDashboardGuidance = function () {
    const guidance = this.q(".ppq-facet-guidance"), dash = this.q(".ppq-dash");
    if (!dash) return;
    dash.scrollTop = 0;
    if (guidance) {
      const heading = guidance.querySelector("summary");
      if (heading) heading.focus({ preventScroll: true });
      const media = typeof window.matchMedia === "function" ? window.matchMedia("(max-width: 820px)") : null;
      if (media && media.matches && typeof guidance.scrollIntoView === "function") guidance.scrollIntoView({ block: "start", behavior: "auto" });
    }
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
  Viewer.prototype._scrollQuestionToTop = function () {
    const hook = this.cfg.questionScrollContainer;
    const target = typeof hook === "function" ? hook(this.root, this) : (hook ? this.q(hook) : null);
    if (target && this.root.contains(target)) { target.scrollTop = 0; target.scrollLeft = 0; }
  };
  /* VF-03 (Claude 2026-07-28): Previous walks the SESSION HISTORY — the
     questions actually attempted this session, in the order they were
     attempted — which survives filter changes and reshuffles. Next walks
     forward through that history and then resumes the live run where it left
     off. With no history yet, both keep their original positional behaviour. */
  Viewer.prototype.next = function () {
    if (this.cfg.practiceSelection.enabled) { this._nextPractice(); return; }
    const hist = this._sessionHistory || [];
    if (this._histPos != null) {
      if (this._histPos < hist.length - 1) { this._histPos++; this._renderHistoryEntry(); return; }
      this._histPos = null;
      const returnIdx = this._returnIdx; this._returnIdx = null;
      if (returnIdx != null && this.view.length) {
        const backTo = Math.min(returnIdx, this.view.length - 1);
        const target = this.view[backTo];
        if (!(target && this.cur && this.cfg.idOf(target) === this.cfg.idOf(this.cur))) {
          this.idx = backTo; this.render(); return;
        }
        /* already showing the resume point (it was the newest attempt): advance */
      }
    }
    if (this.view.length === 0) { this._showEmpty("No " + this._itemNoun(true) + " match these filters."); return; }
    this.idx++; if (this.idx >= this.view.length) this.idx = 0; this.render();
  };
  Viewer.prototype.prev = function () {
    const hist = this._sessionHistory || [];
    if (hist.length) {
      if (this._histPos == null) {
        let p = hist.length - 1;
        const curId = this.cur ? String(this.cfg.idOf(this.cur)) : null;
        if (curId != null && String(hist[p]) === curId) p--; /* step past the question on screen */
        if (p >= 0) { this._returnIdx = this.idx; this._histPos = p; this._renderHistoryEntry(); return; }
      } else if (this._histPos > 0) {
        this._histPos--; this._renderHistoryEntry(); return;
      } else {
        return; /* at the oldest attempted question — nowhere sensible further back */
      }
    }
    if (this.cfg.practiceSelection.enabled) {
      const base = this._practiceBaseView || []; if (!base.length) return;
      const at = base.findIndex((q) => this.cur && this.cfg.idOf(q) === this.cfg.idOf(this.cur));
      this.render(base[(at - 1 + base.length) % base.length]); return;
    }
    if (this.view.length === 0) return;
    this.idx--; if (this.idx < 0) this.idx = this.view.length - 1; this.render();
  };
  Viewer.prototype.skip = function () { this.next(); };
  Viewer.prototype._renderHistoryEntry = function () {
    const id = (this._sessionHistory || [])[this._histPos];
    const q = this._questionById(id);
    if (!q) { this._histPos = null; this._returnIdx = null; return; }
    this.render(q);
  };
  Viewer.prototype._questionById = function (id) {
    for (let i = 0; i < this.questions.length; i++) {
      if (String(this.cfg.idOf(this.questions[i])) === String(id)) return this.questions[i];
    }
    return null;
  };
  /* VF-03: the most recent recorded attempt for a question, from the persisted
     attempts log (so it works across sessions, not just today's). */
  Viewer.prototype._lastAttemptFor = function (q) {
    if (!q) return null;
    const id = String(this.cfg.idOf(q));
    const attempts = ((this.store || {}).attempts) || [];
    for (let i = attempts.length - 1; i >= 0; i--) {
      if (String(attempts[i].id) === id) return attempts[i];
    }
    return null;
  };
  /* VF-02 (Claude 2026-07-29): interrogation responses now PERSIST onto the
     attempt row (they previously left only as report events), so the pupil's
     own progress page can show them and review mode can restore them. */
  Viewer.prototype._attachResponseToAttempt = function (kind, key, value) {
    const attempts = ((this.store || {}).attempts) || [];
    for (let i = attempts.length - 1; i >= 0; i--) {
      if (!this._attemptId || attempts[i].attempt_id === this._attemptId) {
        const row = attempts[i];
        if (!row.responses) row.responses = {};
        if (!row.responses[kind]) row.responses[kind] = {};
        if (value === undefined) delete row.responses[kind][key];
        else row.responses[kind][key] = value;
        if (this._saveStore) this._saveStore();
        return;
      }
    }
  };

  /* VF-03: reopen a previous attempt's verdict, declaration, responses and
     analysis WITHOUT recording anything new. The original attempt_id is
     restored, so edits made while reviewing (reflection, rating, prompt
     responses) attach to the original attempt instead of minting a phantom
     one. No answer event fires on this path — _recordAttempt is never called. */
  Viewer.prototype._reopenAttempt = function (row) {
    if (!row || !this.cur) return;
    this._reviewingAttempt = row;
    if (row.attempt_id) this._attemptId = row.attempt_id;
    this._chosenLabel = row.chosen_option || "";
    this._wasRight = !!row.correct;
    this._preGuessDeclaration = row.pre_guess_declaration || null;
    /* d012: reconstruct a marks-based attempt's outcome so the verdict and the
       what-went-wrong panel review faithfully. */
    this._marksOutcome = row.marks_max != null ? {
      max: row.marks_max,
      awarded: row.marks_awarded != null ? row.marks_awarded : null,
      range: row.marks_range || null,
      sure: row.sure !== false,
      full: !!row.correct
    } : null;
    if (!this._renderInterrogation()) this._reviewingAttempt = null;
  };
  Viewer.prototype.goToId = function (id) {
    if (this.cfg.practiceSelection.enabled && this.byId[id]) { this._histPos = null; this._returnIdx = null; this.render(this.byId[id]); return; }
    const i = this.view.findIndex((q) => this.cfg.idOf(q) === id);
    if (i >= 0) { this.idx = i - 1; this.next(); }
    else { const t = this.q('.ppq-wq-part[data-part-id="' + (window.CSS && CSS.escape ? CSS.escape(id) : id) + '"]'); if (t) t.scrollIntoView({ behavior: "smooth", block: "center" }); }
  };
  Viewer.prototype._showEmpty = function (msg) {
    this._cancelQuestionImages();
    this.q(".ppq-empty").style.display = "block";
    /* QoderWork 2026-07-22: say WHICH filter is stuck and offer one obvious undo
       (Smith: "there's no indication that that should be the case… I don't know
       how to undo it"). */
    let html = "<h2>" + esc(msg) + "</h2>";
    if (this.groupFilter) html += "<p>Topic filter is on: <b>" + esc(this._groupFilterLabel || this.groupFilter) + "</b> — nothing in it matches the other filters.</p>";
    html += '<p><button class="ppq-btn ppq-clear-filters" type="button">Clear all filters</button></p>';
    this.q(".ppq-empty").innerHTML = html;
    this.q(".ppq-card").style.display = "none";
    this._syncSideRating();
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
  Viewer.prototype._preload = function (url, batch) {
    if (typeof url !== "string" || !url) return;
    if (batch) {
      if (batch.has(url) || batch.size >= 80) return;
      batch.add(url);
    }
    if (!this._preloaded) this._preloaded = new Map();
    // Retain one Image per URL; refreshing an entry keeps the current crop warm
    // as older pages fall out of this bounded cache.
    let img = this._preloaded.get(url);
    this._preloaded.delete(url);
    if (!img) { img = new Image(); img.src = url; }
    this._preloaded.set(url, img);
    while (this._preloaded.size > 80) this._preloaded.delete(this._preloaded.keys().next().value);
  };
  Viewer.prototype._prefetch = function (q, batch) {
    if (!q) return;
    batch = batch || new Set();
    const warm = (p) => {
      const cfg = this.cfg;
      [cfg.cropsOf, cfg.contextCropsOf, cfg.msCropsOf, cfg.stemPagesOf].forEach((hook) => {
        if (typeof hook === "function") (hook.call(cfg, p) || []).forEach((s) => this._preload(s, batch));
      });
      this._preload(cfg.stemUrlOf(p), batch);
      this._preload(cfg.answerUrlOf(p), batch);
    };
    warm(q);
    if (this.cfg.modules.structuredPaper) this._blockParts(q).forEach(warm);
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
  /* d011: tri-state of a tree node against the learned set — "all", "some" or
     "none"; a leaf reads the set directly. Self-contained for extraction. */
  function learnedTreeState(node, set) {
    if (!node.children || !node.children.length) return set[node.code] ? "all" : "none";
    let all = true, none = true;
    for (let i = 0; i < node.children.length; i++) {
      const s = learnedTreeState(node.children[i], set);
      if (s !== "all") all = false;
      if (s !== "none") none = false;
    }
    return all ? "all" : (none ? "none" : "some");
  }
  function learnedTreeLeaves(node, out) {
    out = out || [];
    if (!node.children || !node.children.length) { out.push(node.code); return out; }
    for (let i = 0; i < node.children.length; i++) learnedTreeLeaves(node.children[i], out);
    return out;
  }

  /* VF-14r (Smith 2026-07-29): per-question performance score. The most recent
     answer is weighted 4× all earlier ones, so score 1.0 means "right last
     time" with history agreeing, right-then-wrong lands at exactly 0.20, and
     wrong-then-right at 0.80. Attempt values: right = 1, wrong = 0, marks
     attempts = fraction of maximum (a declared range scores its midpoint).
     Self-contained for test extraction. */
  function questionPerfScore(values) {
    if (!values || !values.length) return null;
    const latest = values[values.length - 1];
    let sum = 0;
    for (let i = 0; i < values.length - 1; i++) sum += values[i];
    return (4 * latest + sum) / (4 + values.length - 1);
  }
  /* VF-14r: continuous green-to-red with the pale-yellow anchor at 0.2 (the
     right-then-wrong score). Piecewise linear: 0 red → 0.2 pale yellow →
     1 green. Never banded. Self-contained for test extraction. */
  function perfColour(score) {
    const stops = [[176, 48, 48], [245, 233, 168], [45, 106, 63]];
    const s = Math.max(0, Math.min(1, Number(score)));
    let a, b, t;
    if (s <= 0.2) { a = stops[0]; b = stops[1]; t = s / 0.2; }
    else { a = stops[1]; b = stops[2]; t = (s - 0.2) / 0.8; }
    const mix = a.map(function (c, i) { return Math.round(c + (b[i] - c) * t); });
    return "rgb(" + mix.join(",") + ")";
  }

  /* VF-02 (Claude 2026-07-29): two-tone cell shading, Smith's house style —
     white anchored at zero, one hue per quantity class, smooth (computed per
     value, never banded), darkness capped so black text stays readable.
     Self-contained for test extraction. */
  function shadeCell(rgb, value, max) {
    const v = Number(value);
    if (!max || !(v > 0)) return "";
    const a = Math.min(0.55, 0.55 * (v / max));
    return "background: rgba(" + rgb + ", " + a.toFixed(3) + ");";
  }

  /* Self-contained (no free variables) so test harnesses can extract it. */
  function scanAnalysisRecordForDamage(rec) {
    const PATTERNS = [
      [/�/, "replacement character"],
      [/\?\d/, "'?' fused to a digit (lost minus/times/Delta)"],
      [/\?[A-Za-z]/, "'?' fused to a letter (lost quote, apostrophe or operator)"],
      [/\d\s+\?\s+\d/, "'?' between numbers (lost operator)"],
      [/\?\?+/, "repeated '?' (lost maths/nuclide notation)"],
      [/[A-Za-z0-9]\?s\b/, "'?s' (lost apostrophe)"],
      [/\u202f{2,}/, "adjacent narrow spaces (missing mathematical value or unit)"],
      [/(?:^|[ \t])\u202f(?:[ \t]|$)/, "standalone narrow space (missing mathematical value or unit)"],
      [/\{\{[^{}\r\n]{1,80}\}\}/, "unreplaced template placeholder"],
      [/\b(?:TODO|TBD|FIXME|PLACEHOLDER)\b/i, "unreplaced authoring placeholder"],
      [/â€|Ã—|Ã¢/, "UTF-8 mojibake"]
    ];
    /* Skip asset-reference fields only. "path" used to be in this regex and
       silently exempted `error_path` (pupil-facing diagnosis text!) from the
       scan, which is how Q14's `?not?` corruption survived every sweep
       (found via PACKET_E03, 2026-08-04). Exact key "path" is still skipped. */
    const SKIP_KEYS = /crop|url|src|image|file|href/i;
    const SKIP_EXACT = { path: true, pages: true };
    const found = [];
    const seen = {};
    (function walk(node, key) {
      if (node == null || found.length >= 4) return;
      if (typeof node === "string") {
        if (SKIP_KEYS.test(key || "") || SKIP_EXACT[String(key || "").toLowerCase()]) return;
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

  /* Presence is not readiness. A record must match a supported structural
     shape and contain pupil-facing analysis before it can outrank the safe
     generic review shell. */
  function analysisRecordResolution(rec) {
    const reasons = [];
    if (!rec || typeof rec !== "object" || Array.isArray(rec)) {
      return { resolvable: false, kind: "unknown", reasons: ["record is not an object"] };
    }
    const schema = String(rec.schema_version || "");
    const looksV2 = /^2(?:\.|$)/.test(schema) || !!rec.identity || !!rec.pupil_analysis;
    const arrayFields = ["options", "methods", "self_report_prompts", "feedback"];
    function nonEmpty(value) { return typeof value === "string" && value.trim().length > 0; }
    function containsText(value) {
      if (nonEmpty(value)) return true;
      if (Array.isArray(value)) return value.some(containsText);
      if (!value || typeof value !== "object") return false;
      return Object.keys(value).some(function (key) { return containsText(value[key]); });
    }
    if (looksV2) {
      if (!rec.identity || typeof rec.identity !== "object" || Array.isArray(rec.identity)) {
        reasons.push("deep-v2 identity block is missing");
      } else {
        if (!nonEmpty(rec.identity.id)) reasons.push("deep-v2 identity.id is missing");
        if (!nonEmpty(rec.identity.correct_answer)) reasons.push("deep-v2 identity.correct_answer is missing");
      }
      if (!rec.pupil_analysis || typeof rec.pupil_analysis !== "object" || Array.isArray(rec.pupil_analysis)) {
        reasons.push("deep-v2 pupil_analysis block is missing");
      }
      arrayFields.forEach(function (key) {
        if (rec[key] != null && !Array.isArray(rec[key])) reasons.push("deep-v2 " + key + " must be an array");
      });
      const requirements = rec.requirements || {};
      const pupilFacing = [
        rec.pupil_analysis,
        (Array.isArray(rec.methods) ? rec.methods : []).map(function (method) { return method && [method.title, method.pupil_steps, method.useful_when]; }),
        (Array.isArray(rec.self_report_prompts) ? rec.self_report_prompts : []).map(function (prompt) { return prompt && prompt.prompt; }),
        (Array.isArray(rec.feedback) ? rec.feedback : []).map(function (feedback) { return feedback && feedback.text; }),
        (Array.isArray(requirements.knowledge_atoms) ? requirements.knowledge_atoms : []).map(function (atom) { return atom && atom.statement; }),
        (Array.isArray(requirements.technique_atoms) ? requirements.technique_atoms : []).map(function (atom) { return atom && atom.statement; }),
        (Array.isArray(requirements.principles) ? requirements.principles : []).map(function (principle) { return principle && principle.statement; }),
        (Array.isArray(requirements.post_question_checks) ? requirements.post_question_checks : []).map(function (check) { return check && check.prompt; })
      ];
      if (!containsText(pupilFacing)) reasons.push("deep-v2 record has no pupil-facing analysis text");
      return { resolvable: reasons.length === 0, kind: "deep-v2", reasons: reasons };
    }
    if (!nonEmpty(rec.id)) reasons.push("legacy record id is missing");
    arrayFields.forEach(function (key) {
      if (rec[key] != null && !Array.isArray(rec[key])) reasons.push("legacy " + key + " must be an array");
    });
    const legacyPupilFacing = [
      rec.probe && rec.probe.text,
      (Array.isArray(rec.methods) ? rec.methods : []).map(function (method) { return method && [method.title, method.description, method.pupil_steps, method.useful_when]; }),
      (Array.isArray(rec.self_report_prompts) ? rec.self_report_prompts : []).map(function (prompt) { return prompt && prompt.prompt; }),
      (Array.isArray(rec.feedback) ? rec.feedback : []).map(function (feedback) { return feedback && feedback.text; }),
      (Array.isArray(rec.options) ? rec.options : []).map(function (option) { return option && option.error_path; })
    ];
    if (!containsText(legacyPupilFacing)) reasons.push("legacy record has no pupil-facing analysis text");
    return { resolvable: reasons.length === 0, kind: "legacy", reasons: reasons };
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
    const resolution = analysisRecordResolution(rec);
    if (!resolution.resolvable) {
      resolution.reasons.forEach(function (reason) {
        reasons.push("unresolvable " + resolution.kind + " record: " + reason);
      });
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
    /* Two-key withholding (2026-08-04): a status SOURCE saying withheld is
       itself sufficient to withhold, exactly as a consumer pin is. Before
       this, an analysis-side ledger "withheld" with no matching pin fell
       through to Guided help, so safety depended on the consumer remembering
       to pin. Either authority now suffices; release requires both to clear. */
    if (/^(withheld|invalid|unsafe|damaged)$/.test(raw)) {
      return {
        code: "withheld",
        label: "Solution pending",
        title: "Question-specific feedback for this question is being repaired; guess, reflection and rating still work.",
        withheldReasons: ["status source declares " + raw]
      };
    }
    /* VSAFE-02: Full and Provisional both require content the viewer actually
       resolves. A ledger row, catalogue field or hook string on its own can
       promote nothing — the 18 held launch-only questions stay Solution
       pending no matter what any status estate says about them. */
    if (rec && /^(reviewed|full|full_feedback|full_review|complete|completed)$/.test(raw)) {
      return {
        code: "full",
        label: (this.cfg.presentation && this.cfg.presentation.plainStatusLabels) ? "Detailed help" : "Full feedback",
        title: "This question has a detailed checked explanation."
      };
    }
    if (rec && !/^(pending|feedback_pending|none|missing|not_started)$/.test(raw)) {
      return {
        code: "provisional",
        label: (this.cfg.presentation && this.cfg.presentation.plainStatusLabels) ? "Guided help" : "Provisional feedback",
        title: "This question has a guided explanation and prompts."
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
    if (this.cfg && this.cfg._hasFeedbackSource === false) { node.style.display = "none"; return null; }
    const readiness = this._feedbackReadiness(q || this.cur);
    node.className = "ppq-feedback-status" +
      (extraClass ? " " + extraClass : "") +
      " ppq-feedback-status-" + readiness.code;
    node.textContent = readiness.label;
    node.title = readiness.title || "";
    node.style.display = "";
    return readiness;
  };

  Viewer.prototype._sourceAdvisory = function (q) {
    const hook = this.cfg.sourceAdvisoryOf;
    if (typeof hook !== "function") return null;
    let raw = null;
    try { raw = hook(q || this.cur); } catch (_) { return null; }
    if (!raw) return null;
    if (typeof raw === "string") raw = { message: raw };
    const message = String(raw.message || raw.text || "").trim();
    if (!message) return null;
    return {
      title: String(raw.title || "Source advisory").trim() || "Source advisory",
      message: message
    };
  };

  Viewer.prototype._setSourceAdvisory = function (node, q) {
    if (!node) return null;
    node.innerHTML = "";
    node.style.display = "none";
    const advisory = this._sourceAdvisory(q);
    if (!advisory) return null;
    const title = el("strong", { class: "ppq-source-advisory-title" });
    title.textContent = "⚠ " + advisory.title;
    const message = el("span", { class: "ppq-source-advisory-message" });
    message.textContent = advisory.message;
    node.appendChild(title);
    node.appendChild(message);
    node.style.display = "";
    return advisory;
  };

  Viewer.prototype._sourceAdvisoryEl = function (q) {
    const node = el("div", { class: "ppq-source-advisory ppq-source-advisory-review", role: "note" });
    return this._setSourceAdvisory(node, q) ? node : null;
  };

  Viewer.prototype.render = function (explicitQ) {
    const cfg = this.cfg;
    this._cancelQuestionImages();
    if (cfg.practiceSelection.enabled && explicitQ) {
      if (!this._practiceReview && this.cur && !this.answered) this._practiceResumeId = cfg.idOf(this.cur);
      this._practiceReview = true;
    }
    /* VF-03 (Claude 2026-07-28): render can now show an EXPLICIT question (the
       session-history walk), independent of the current view and its filters.
       Any positional render (live advance, finder jump, filter change) ends the
       history walk. */
    this.cur = explicitQ || this.view[this.idx];
    if (!explicitQ) { this._histPos = null; this._returnIdx = null; }
    this.answered = false;
    this.shownAt = Date.now();
    this._reviewingAttempt = null;
    this._marksOutcome = null; /* d012 */
    this._marksPending = false;
    /* QoderWork 2026-07-22 (analyst handoff): a stable id for THIS displayed
       attempt — session+item is not enough when an item is attempted twice. */
    this._attemptId = "att_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
    this._preGuessDeclaration = null;
    // Learner preferences belong to this visit. Saving a new level or timing
    // choice never changes the target or recorded level of an open attempt.
    this._visitLearnerLevel = cfg.learnerLevel.enabled ? this._learnerLevel() : null;
    this._visitTimingPrefs = cfg.learnerLevel.enabled && cfg.timing ? this._timingPrefs() : null;
    this._visitTimingQuestion = null;
    if (this._visitTimingPrefs) {
      this._visitTimingTargetMs = this._timingTargetMsFor(this.cur);
      this._visitTimingQuestion = this.cur;
    }
    this._startTimer(); /* QoderWork 2026-07-22: exam timer (no-op unless config.timer) */
    if (this._drawOn) this.toggleDraw();
    this.clearCanvas();
    this._curType = cfg.questionType(this.cur) || "imageSelfMark";

    this.q(".ppq-empty").style.display = "none";
    this.q(".ppq-card").style.display = "flex";
    this.q(".ppq-qid").textContent = cfg.metaLine(this.cur) +
      (this._histPos != null ? "  ·  looking back" : "");
    this._renderAttemptHistory();
    this._renderQuestionBadges();
    this._renderAlsoStudied(); // QoderWork 2026-09-14
    /* VF-03: a question with a recorded previous attempt offers a visible way
       back into its verdict, declaration, responses and analysis. */
    const reviewBtn = this.q(".ppq-review-attempt");
    if (reviewBtn) {
      reviewBtn.style.display =
        (cfg.modules.postQuestionReview && this._lastAttemptFor(this.cur)) ? "inline-block" : "none";
    }
    this._setFeedbackStatusBadge(this.q(".ppq-feedback-status"), this.cur);
    this._setSourceAdvisory(this.q(".ppq-card > .ppq-source-advisory"), this.cur);
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
        const labels = cfg.classificationLabels || {};
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
            '<details class="ppq-classification-more"><summary>' + esc(cfg.classificationSummaryLabel) +
            (total ? " (" + total + ")" : "") + '</summary><div class="ppq-classification-panel">' +
            sections.join("") + "</div></details>";
        }
      }
    }

    this._resetAnswerUi();
    this._renderStem(this.cur);
    this._renderAnswerArea(this.cur, this._curType);
    this._watchQuestionImages();

    // restore prior self-rating
    this.qa(".ppq-scale-btn").forEach((b) => b.classList.remove("sel"));
    const prior = this.store.scores[cfg.idOf(this.cur)];
    if (prior) { const sb = this.q('.ppq-scale-btn[data-val="' + prior + '"]'); if (sb) sb.classList.add("sel"); }

    if (cfg.modules.math) this._applyMath(this.q(".ppq-card"));
    if (cfg.questionScrollContainer) this._scrollQuestionToTop();

    const preloadBatch = new Set();
    this._prefetch(this.cur, preloadBatch);
    for (let k = 1; k <= Math.min(cfg.prefetchAhead, this.view.length - 1); k++) { const a = this.view[(this.idx + k) % this.view.length]; if (a && a !== this.cur) this._prefetch(a, preloadBatch); }
  };

  Viewer.prototype._resetAnswerUi = function () {
    this.q(".ppq-answer-line").className = "ppq-answer-line";
    this.q(".ppq-answer-line").textContent = "";
    this.q(".ppq-answer-panel").className = "ppq-answer-panel";
    this.q(".ppq-markscheme").innerHTML = "";
    this.q(".ppq-examiner-body").innerHTML = "";
    const previousMarksBar = this.q(".ppq-marksbar");
    if (previousMarksBar) previousMarksBar.remove();
    this.q(".ppq-competence").classList.remove("show");
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
    this.q(".ppq-modal").classList.remove("show", "ppq-modal-analysis", "ppq-modal-progress");
    this.root.classList.remove("ppq-analysis-open");
    this.q(".ppq-modal-body").innerHTML = "";
    this._syncSideRating();
  };

  Viewer.prototype._syncSideRating = function () {
    const panel = this.q(".ppq-side-rating");
    if (!panel) return;
    const comp = panel.querySelector(".ppq-competence");
    const label = panel.querySelector(".ppq-side-rating-current");
    label.textContent = this.cur ? ((this.cfg.targetPartHeadingOf && this.cfg.targetPartHeadingOf(this.cur)) || this.cfg.metaLine(this.cur) || "Current question") : "";
    const visible = !!(this.cur && this.answered && !this._answerRevealPending && !this._iqOpen &&
      comp && comp.classList.contains("show") && comp.style.display !== "none" && this.q(".ppq-card").style.display !== "none");
    panel.hidden = !visible;
    this.root.classList.toggle("ppq-side-rating-open", visible);
  };

  // --------------------------------------------------------------- stem
  Viewer.prototype._renderStem = function (q) {
    const cfg = this.cfg;
    const stem = this.q(".ppq-stem");
    let html = "";
    const text = cfg.questionTextOf(q);
    /* Order matters (Smith, 2026-08-02, reading top to bottom and finding the
       graph only at the very end): where printed pages exist they are the
       question, so they lead, then the part being asked, then the OCR
       transcription as a labelled cross-check. Consumers with no printed pages
       keep the original order, text first. */
    const pagesFirst = typeof cfg.stemPagesOf === "function" && (cfg.stemPagesOf(q) || []).length > 0;
    /* d020: notices come FIRST, above everything. A pupil who needs to be told
       that a question is off-syllabus, or how to use it anyway, needs telling
       before they spend twenty minutes on it, not in a chip they may not read. */
    const notices = (typeof cfg.noticesOf === "function" ? cfg.noticesOf(q) : null) || [];
    notices.forEach((n) => {
      if (!n || !n.text) return;
      html += '<div class="ppq-notice ppq-notice-' + esc(n.tone === "warn" ? "warn" : "info") + '">' +
        (n.label ? '<b>' + esc(n.label) + "</b> " : "") + esc(n.text) + "</div>";
    });
    const targetHeading = cfg.targetPartHeadingOf && cfg.targetPartHeadingOf(q);
    const compactHeading = cfg.compactQuestionHeader && this.q(".ppq-question-target-row > .ppq-target-part");
    if (compactHeading) {
      compactHeading.textContent = targetHeading || cfg.metaLine(q);
      const marks = typeof cfg.partMarksOf === "function" && cfg.partMarksOf(q);
      if (marks != null && marks !== false) compactHeading.appendChild(el("span", { class: "ppq-target-marks" }, esc(marks) + " mark" + (marks === 1 ? "" : "s")));
    } else if (targetHeading) html += '<h2 class="ppq-target-part">' + esc(targetHeading) + "</h2>";
    if (text && !pagesFirst) html += '<div class="ppq-qtext">' + text + "</div>";
    /* Smith, 2026-07-31: "we're not getting the stem... you get the WORDS of
       the stem, but if there's any maths in the stem you'll be lucky if you can
       understand it. If there's a graph in the stem, you just won't see it."
       Correct, and unfixable from the text: the catalogue has no stem image at
       all, only OCR prose in which display maths is flattened and figures and
       tables vanish outright. What DOES exist is the printed question page, so
       the stem is shown the way chemistry shows a structured question: as the
       page as printed, above the part, open by default. The OCR text stays as
       the cross-check Smith asked for in d015, but it is no longer the only
       account of the stem. */
    const stemPages = (typeof cfg.stemPagesOf === "function" ? cfg.stemPagesOf(q) : null) || [];
    if (stemPages.length) {
      let pg = "";
      stemPages.forEach((s) => { pg += '<img src="' + esc(s) + '" loading="lazy" class="ppq-crop ppq-stem-page" alt="the printed exam page">'; });
      html += '<details class="ppq-stem-pages" open><summary>The whole question as printed, with its stem, tables and figures</summary>' + pg + "</details>";
    }
    /* Smith, 2026-08-02: "no intro to question clippings", "massive size issues
       between them", "hard for someone to realise that they're being given
       9(b)(i)... but oh, they're not, it's 9(b)(i)-(iii)". Every image block now
       says what it is, and the part being asked is named ON the clipping rather
       than only in the meta line above. */
    const crops = cfg.cropsOf(q);
    if (crops.length) {
      const partName = (typeof cfg.partLabelOf === "function" && cfg.partLabelOf(q)) || "";
      const marks = (typeof cfg.partMarksOf === "function" && cfg.partMarksOf(q)) || null;
      const lead = targetHeading
        ? esc(targetHeading) + (marks ? ", " + esc(marks) + " mark" + (marks === 1 ? "" : "s") : "")
        : stemPages.length
        ? ("The part you are answering now" + (partName && partName !== "(whole)" ? ": " + esc(partName) : "") +
           (marks ? ", " + marks + " mark" + (marks === 1 ? "" : "s") : ""))
        : ("This question" + (marks ? ", " + marks + " mark" + (marks === 1 ? "" : "s") : ""));
      if (!compactHeading) html += '<div class="ppq-stem-partlead">' + lead + "</div>";
      else if (text || stemPages.length) html += '<div class="ppq-stem-partlead ppq-current-part-label">Current part</div>';
      crops.forEach((s) => { html += '<img src="' + esc(s) + '" loading="lazy" class="ppq-crop" alt="question clipping">'; });
    }
    if (text && pagesFirst) {
      html += '<details class="ppq-transcript"><summary>The words, transcribed (the printed pages above are the authority)</summary>' +
        '<div class="ppq-qtext">' + text + "</div></details>";
    }
    if (!text && !crops.length && !stemPages.length) html = '<div class="ppq-kb-hint">No stem image on file for this question.</div>';
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

  // Only the current question owns this batch. Cached loads, failed images and
  // late events from a previous selection cannot change a newer loading state.
  Viewer.prototype._cancelQuestionImages = function () {
    const batch = this._questionImageBatch;
    this._questionImageBatch = null;
    if (batch) batch.items.forEach(item => {
      item.image.removeEventListener("load", item.loaded);
      item.image.removeEventListener("error", item.failed);
    });
    const stem = this.q(".ppq-stem"), status = this.q(".ppq-question-loading");
    if (stem) stem.removeAttribute("aria-busy");
    if (status) { status.hidden = true; status.textContent = ""; status.classList.remove("ppq-question-loading-error"); }
  };
  Viewer.prototype._watchQuestionImages = function () {
    if (!this.cfg.questionLoading.enabled) return;
    const stem = this.q(".ppq-stem"), status = this.q(".ppq-question-loading");
    if (!stem || !status) return;
    const images = Array.from(stem.querySelectorAll("img[src]")).filter(im => im.getAttribute("src"));
    const batch = { items: [] };
    this._questionImageBatch = batch;
    const active = () => this._questionImageBatch === batch;
    const paint = () => {
      if (!active()) return;
      const pending = batch.items.filter(item => item.state === "pending").length;
      const failed = batch.items.filter(item => item.state === "failed").length;
      stem.setAttribute("aria-busy", pending ? "true" : "false");
      status.hidden = !pending && !failed;
      status.classList.toggle("ppq-question-loading-error", !pending && !!failed);
      status.textContent = pending ? "Loading question and context… (" + (batch.items.length - pending) + " of " + batch.items.length + ")" :
        failed ? failed + " image" + (failed === 1 ? "" : "s") + " could not be loaded. Use Retry image below." : "";
    };
    images.forEach(image => {
      const item = { image, state: "pending", fallback: null };
      const settle = failed => {
        if (!active() || !image.isConnected || item.state !== "pending") return;
        item.state = failed ? "failed" : "loaded";
        image.classList.remove("ppq-question-image-pending");
        image.hidden = failed;
        if (failed) {
          const fallback = el("div", { class: "ppq-question-image-error", role: "group", ariaLabel: "Image unavailable" });
          fallback.appendChild(el("span", null, (image.closest("details") ? "Context image" : "Question image") + " could not be loaded."));
          const retry = el("button", { type: "button", class: "ppq-btn-mini ppq-image-retry" }, "Retry image");
          retry.addEventListener("click", () => {
            if (!active()) return;
            item.state = "pending"; fallback.remove(); item.fallback = null;
            image.hidden = false; image.classList.add("ppq-question-image-pending"); paint();
            const src = image.getAttribute("src"); image.removeAttribute("src"); image.setAttribute("src", src);
          });
          fallback.appendChild(retry); image.insertAdjacentElement("afterend", fallback); item.fallback = fallback;
        }
        paint();
      };
      item.loaded = () => settle(false); item.failed = () => settle(true);
      image.addEventListener("load", item.loaded); image.addEventListener("error", item.failed);
      // Context may be below the fold, but it belongs to this question. Eager
      // loading avoids waiting indefinitely for a lazy image to enter view.
      image.loading = "eager"; image.classList.add("ppq-question-image-pending");
      batch.items.push(item);
    });
    paint();
    batch.items.forEach(item => { if (item.image.complete) (item.image.naturalWidth ? item.loaded : item.failed)(); });
  };

  // --------------------------------------------------------------- answer area
  Viewer.prototype._renderAnswerArea = function (q, type) {
    if (type === "mcq") return this._renderMCQ(q);
    if (type === "flashcard") return this._renderFlashcard(q);
    if (type === "marksSelfAssess") return this._renderMarksSelfAssess(q);
    return this._renderImageSelfMark(q);
  };

  /* d012 (Claude 2026-07-29): long-form marks-based self-assessment. Work on
     paper, reveal the markscheme, then enter marks out of the part's maximum —
     one click when sure, a two-tap range behind "Not sure?". */
  Viewer.prototype._renderMarksSelfAssess = function (q) {
    this._answerLabels = [];
    this.q(".ppq-options").style.display = "none";
    this.q(".ppq-reveal").style.display = "inline-block";
    this.q(".ppq-kb-hint").textContent = "Enter/R to reveal the markscheme · S skip · ← previous";
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

  /* d012: the marks bar. One row 0..max (max button doubles as "Got it right"),
     one click when sure; "Not sure?" flips to a two-tap lowest/highest range.
     Fewest clicks by design. */
  Viewer.prototype._renderMarksBar = function (q) {
    const self = this;
    const max = Math.max(1, parseInt((typeof this.cfg.marksOf === "function" ? this.cfg.marksOf(q) : q.marks) || 0, 10) || 1);
    const old = this.q(".ppq-marksbar");
    if (old && old.parentNode) old.parentNode.removeChild(old);
    const bar = el("div", { class: "ppq-marksbar" });
    /* Smith 2026-07-29: "how many marks do you award yourself?", and above two
       marks full marks reads "completely right". */
    const prompt = el("div", { class: "ppq-marksbar-prompt" }, "How many marks do you award yourself, out of " + max + "?");
    bar.appendChild(prompt);
    const row = el("div", { class: "ppq-marksbar-row" });
    let unsure = false, lo = null;
    for (let v = 0; v <= max; v++) {
      const label = v === max ? (max + " · " + (max > 2 ? "Got it completely right" : "Got it right")) : String(v);
      const b = el("button", { class: "ppq-mark-btn" + (v === max ? " full" : ""), type: "button", "data-mark": String(v) }, esc(label));
      b.addEventListener("click", () => {
        if (!unsure) { self._commitMarks(q, { max: max, awarded: v, sure: true }); return; }
        if (lo == null) {
          lo = v;
          b.classList.add("lo");
          prompt.textContent = "…and the highest it might be?";
        } else {
          const a = Math.min(lo, v), z = Math.max(lo, v);
          if (a === z) { self._commitMarks(q, { max: max, awarded: a, sure: false }); }
          else { self._commitMarks(q, { max: max, range: [a, z], sure: false }); }
        }
      });
      row.appendChild(b);
    }
    bar.appendChild(row);
    const unsureBtn = el("button", { class: "ppq-marks-unsure", type: "button" }, "Not sure? Give a range");
    unsureBtn.addEventListener("click", () => {
      unsure = !unsure; lo = null;
      row.querySelectorAll(".ppq-mark-btn").forEach((x) => x.classList.remove("lo"));
      unsureBtn.classList.toggle("on", unsure);
      prompt.textContent = unsure
        ? "Tap the lowest plausible mark…"
        : ("How many marks, out of " + max + "?");
    });
    bar.appendChild(unsureBtn);
    const panel = this.q(".ppq-answer-panel");
    panel.appendChild(bar);
    this.q(".ppq-kb-hint").textContent = "Tap your marks (0–" + max + ") · number keys work too";
  };

  /* d012: commit the self-assessed marks as the attempt. `correct` stays the
     derived full-marks boolean so every existing surface keeps working; the
     richer truth (exact/range, sure) rides on the attempt row. */
  Viewer.prototype._commitMarks = function (q, outcome) {
    if (this.answered) return;
    this.answered = true;
    this._marksPending = false;
    const full = outcome.awarded != null
      ? outcome.awarded === outcome.max
      : (outcome.range && outcome.range[0] === outcome.max);
    this._marksOutcome = {
      max: outcome.max,
      awarded: outcome.awarded != null ? outcome.awarded : null,
      range: outcome.range || null,
      sure: outcome.sure !== false,
      full: !!full
    };
    this._chosenLabel = "";
    this._wasRight = !!full;
    this._answerRevealPending = false; /* the markscheme is already open */
    const extras = { marks_max: outcome.max, sure: outcome.sure !== false };
    if (outcome.awarded != null) extras.marks_awarded = outcome.awarded;
    if (outcome.range) extras.marks_range = outcome.range;
    this._recordAttempt("", !!full, extras);
    const bar = this.q(".ppq-marksbar");
    if (bar) {
      bar.querySelectorAll(".ppq-mark-btn").forEach((b) => {
        const mark = Number(b.dataset.mark);
        const selected = outcome.awarded != null ? mark === outcome.awarded :
          !!(outcome.range && mark >= outcome.range[0] && mark <= outcome.range[1]);
        b.classList.remove("lo");
        b.classList.toggle("selected", selected);
        b.setAttribute("aria-pressed", String(selected));
        b.disabled = true;
      });
      const unsureButton = bar.querySelector(".ppq-marks-unsure");
      if (unsureButton) unsureButton.hidden = true;
      const saved = bar.querySelector(".ppq-marksbar-prompt");
      saved.classList.add("ppq-marks-saved");
      saved.setAttribute("role", "status");
      saved.textContent = "Saved: " + (outcome.awarded != null ? outcome.awarded : outcome.range.join("–")) + "/" + outcome.max;
      bar.classList.add("done");
    }
    this._afterAnswer();
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
      const msImgs = (typeof this.cfg.msCropsOf === "function" ? this.cfg.msCropsOf(this.cur) : null) || [];
      if (reveal && msImgs.length) {
        let ms = this._formatMarkscheme(this.cfg.markschemeOf(this.cur));
        const note = (typeof this.cfg.markschemeNoteOf === "function" && this.cfg.markschemeNoteOf(this.cur)) || "";
        if (note) ms = '<div class="ppq-notice ppq-notice-warn">' + esc(note) + "</div>" + ms;
        Array.from(new Set(msImgs)).forEach((src) => { ms += '<img class="ppq-ms-crop" src="' + esc(src) + '" alt="Printed markscheme for this question">'; });
        this.q(".ppq-markscheme").innerHTML = ms;
        this.q(".ppq-answer-panel").classList.add("show");
        this._wireMarkschemeZoom();
        if (this.cfg.modules.math) this._applyMath(this.q(".ppq-answer-panel"));
      }
      this._showExaminer(this.cur);
      this._syncSideRating();
      return;
    }
    const al = this.q(".ppq-answer-line");
    al.className = "ppq-answer-line show";
    al.textContent = reveal
      ? (this._wasRight ? "Correct, " + correct : "Marked wrong, correct answer is " + correct)
      : "Answer saved.";
    this._syncSideRating();
  };

  Viewer.prototype._wireMarkschemeZoom = function () {
    this.qa(".ppq-markscheme img").forEach((img) => {
      img.style.cursor = "zoom-in";
      img.tabIndex = 0;
      img.setAttribute("role", "button");
      img.setAttribute("aria-label", (img.alt || "Markscheme image") + ". Open full size");
      const open = () => this.openModal(img.getAttribute("src"));
      img.addEventListener("click", open);
      img.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); e.stopPropagation(); open(); }
      });
    });
  };

  Viewer.prototype.reveal = function () {
    if (this.answered) return;
    if (this._curType === "marksSelfAssess") {
      /* d012: the clock stops at reveal (marks entry is not working time). The
         attempt is recorded when the marks are committed, not here. */
      if (this._marksPending) return;
      this._marksPending = true;
      this._commitTimer();
      let ms = this._formatMarkscheme(this.cfg.markschemeOf(this.cur));
      const msImgs = (typeof this.cfg.msCropsOf === "function" ? this.cfg.msCropsOf(this.cur) : null) || [];
      /* d020: a scheme written under abolished conventions looks broken to a
         pupil who does not know that. Say so above it, not in a footnote. */
      const msNote = (typeof this.cfg.markschemeNoteOf === "function" && this.cfg.markschemeNoteOf(this.cur)) || "";
      if (msNote) ms = '<div class="ppq-notice ppq-notice-warn">' + esc(msNote) + "</div>" + ms;
      msImgs.forEach((src) => { ms += '<img class="ppq-ms-crop" src="' + esc(src) + '">'; });
      /* VF-15 (Smith, 2026-07-29: "markscheme clearly too short"): cropped
         markschemes can truncate the working, so when the consumer supplies
         full pages they are always one click away — and shown outright when
         there are no crops at all. */
      const msPages = (typeof this.cfg.msPagesOf === "function" ? this.cfg.msPagesOf(this.cur) : null) || [];
      const ansImg = this.cfg.answerUrlOf(this.cur);
      if (msPages.length) {
        let pg = "";
        msPages.forEach((src) => { pg += '<img class="ppq-ms-page" src="' + esc(src) + '">'; });
        /* d016: the consumer may know WHICH pages hold this question, so it
           supplies the wording; the old fixed "complete markscheme pages"
           understated a whole-paper document served from its cover page. */
        const msLabel = (typeof this.cfg.msPagesLabelOf === "function" && this.cfg.msPagesLabelOf(this.cur)) ||
          'Show the complete markscheme pages <span class="ppq-spoiler">(full working; includes other questions)</span>';
        /* d017: a crop can be too short to be the real answer (the consumer may
           know this from its own data), in which case the pages open by
           themselves rather than waiting to be found. */
        const forceOpen = typeof this.cfg.msPagesOpenOf === "function" && this.cfg.msPagesOpenOf(this.cur);
        ms += '<details class="ppq-ms-full"' + (msImgs.length && !forceOpen ? "" : " open") + '><summary>' + msLabel + "</summary>" + pg;
        /* A narrowed page set can clip. The whole document stays one click
           deeper, never as the first thing a pupil meets. */
        const msAll = (typeof this.cfg.msPagesAllOf === "function" ? this.cfg.msPagesAllOf(this.cur) : null) || [];
        if (msAll.length > msPages.length) {
          let all = "";
          msAll.forEach((src) => { all += '<img class="ppq-ms-page" src="' + esc(src) + '">'; });
          ms += '<details class="ppq-ms-rest"><summary>Show every page of this paper\'s markscheme (' + msAll.length + ')</summary>' + all + "</details>";
        }
        ms += "</details>";
      } else if (ansImg && !msImgs.length) {
        ms += '<details class="ppq-ms-full"><summary>Show full markscheme page <span class="ppq-spoiler">(may well contain spoilers for other parts)</span></summary><img src="' + esc(ansImg) + '"></details>';
      }
      this.q(".ppq-markscheme").innerHTML = ms;
      this._wireMarkschemeZoom();
      this.q(".ppq-answer-panel").className = "ppq-answer-panel show";
      this._showExaminer(this.cur);
      this.q(".ppq-reveal").style.display = "none";
      this.q(".ppq-skip").style.display = "none";
      if (this.cfg.modules.math) this._applyMath(this.q(".ppq-answer-panel"));
      this._renderMarksBar(this.cur);
      return;
    }
    if (this._curType === "flashcard") {
      this.answered = true;
      this._commitTimer(); /* QoderWork 2026-07-22: stop the clock on reveal */
      let ms = this._formatMarkscheme(this.cfg.markschemeOf(this.cur));
      const ansImg = this.cfg.answerUrlOf(this.cur);
      // QoderWork 2026-07-22: softened spoiler wording, aligned with the Chemistry viewer
      if (ansImg) ms += '<details class="ppq-ms-full"><summary>Show full markscheme page <span class="ppq-spoiler">(may well contain spoilers for other parts)</span></summary><img src="' + esc(ansImg) + '"></details>';
      this.q(".ppq-markscheme").innerHTML = ms;
      this._wireMarkschemeZoom();
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
    const reviewBtn = this.q(".ppq-review-attempt"); /* VF-03: the live attempt supersedes it */
    if (reviewBtn) reviewBtn.style.display = "none";
    this.q(".ppq-competence").classList.add("show");
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
    this._syncSideRating();
    if (this.cfg.selfReport && this.cfg.selfReport.autoReveal) this._revealInlineRating();
  };

  Viewer.prototype._revealInlineRating = function () {
    if (!this.cfg.selfReport.autoReveal || this.cfg.sideRating.enabled || this._iqOpen || this._answerRevealPending) return;
    const comp = this.q(".ppq-competence.show");
    if (!comp || comp.style.display === "none") return;
    const hook = this.cfg.questionScrollContainer;
    const pane = typeof hook === "function" ? hook(this.root, this) : (hook ? this.q(hook) : null);
    const behavior = this._reducedMotion() ? "auto" : "smooth";
    if (pane && this.root.contains(pane) && pane.clientHeight > 0 && pane.scrollHeight > pane.clientHeight) {
      const frame = pane.getBoundingClientRect(), box = comp.getBoundingClientRect();
      const delta = box.height > pane.clientHeight - 24 ? box.top - frame.top - 12 :
        box.bottom > frame.bottom - 12 ? box.bottom - frame.bottom + 12 :
        box.top < frame.top + 12 ? box.top - frame.top - 12 : 0;
      if (delta) {
        const top = Math.max(0, pane.scrollTop + delta);
        if (typeof pane.scrollTo === "function") pane.scrollTo({top:top, behavior:behavior});
        else pane.scrollTop = top;
      }
    } else if (typeof comp.scrollIntoView === "function") comp.scrollIntoView({block:"nearest", behavior:behavior});
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

  Viewer.prototype._recordAttempt = function (chosen, isRight, extras) {
    const cfg = this.cfg;
    const row = Object.assign({
      learner_id: cfg.learnerId, id: cfg.idOf(this.cur), chosen_option: chosen, correct: !!isRight, is_correct: isRight ? "right" : "wrong",
      /* d013: pause-adjusted spend from the timing system when present; the
         learner's "don't record this one" turns the value into an honest null. */
      time_ms: (this._attemptTimeMs !== undefined ? this._attemptTimeMs : (Date.now() - this.shownAt)),
      timing_mode: cfg.timing ? this._timingModeNow() : cfg.timingMode,
      self_report: null, ts: new Date().toISOString(),
      app_version: cfg.appVersion, context: { view: "viewer", id: cfg.idOf(this.cur), type: this._curType },
      attempt_id: this._attemptId || "" /* QoderWork 2026-07-22 (analyst handoff) */
    }, cfg.attemptFields(this.cur), extras || {} /* d012: marks fields ride on the row */);
    if (cfg.learnerLevel && cfg.learnerLevel.enabled) row.learner_level = this._visitLearnerLevel;
    if (this._timeDiscarded) { row.time_ms = null; row.time_discarded = true; }
    /* QoderWork 2026-07-22 (analyst handoff): attach the pre-answer guess snapshot
       so a later correction can be reconciled with what was declared up front. */
    if (this._preGuessDeclaration) row.pre_guess_declaration = this._preGuessDeclaration;
    this.store.attempts.push(row);
    /* VF-03: the session history records what was actually attempted, in order
       (consecutive duplicates collapsed), for reshuffle-proof Previous. */
    if (!this._sessionHistory) this._sessionHistory = [];
    const histId = String(cfg.idOf(this.cur));
    if (this._sessionHistory[this._sessionHistory.length - 1] !== histId) this._sessionHistory.push(histId);
    this._pendingDashboardPulse = cfg.groupKey(this.cur);
    this._saveStore();
    if (cfg.attemptHistory && cfg.attemptHistory.enabled) this._renderAttemptHistory();
    if (cfg.practiceSelection.enabled) this._updatePracticeCounter();
    /* QoderWork 2026-07-22: report the attempt to the hosting page's callback.
       When the exam timer is on, _commitTimer has stored the time-pressure context
       (time_remaining_ms + time_pressure) so a fast answer can be told apart from a
       guess downstream — fast-with-clock-to-spare vs forced-by-an-expiring-timer. */
    const extra = { correct: !!isRight, time_ms: row.time_ms, attempt_id: this._attemptId || "" };
    if (row.learner_level) extra.learner_level = row.learner_level;
    if (this._preGuessDeclaration) extra.pre_guess_declaration = this._preGuessDeclaration;
    if (this._timerCtx) {
      if (this._timerCtx.time_remaining_ms != null) extra.time_remaining_ms = this._timerCtx.time_remaining_ms;
      if (this._timerCtx.time_pressure) extra.time_pressure = this._timerCtx.time_pressure;
      if (this._timerCtx.target_ms != null) extra.target_ms = this._timerCtx.target_ms; /* d013 */
    }
    if (this._timeDiscarded) extra.time_discarded = true; /* d013 */
    this._fireReport({ status: "answered", picked_id: chosen, level: (this.cur && this.cur.level) || "", extra_json: JSON.stringify(extra) });
  };

  // --------------------------------------------------------------- exam timer (module, QoderWork 2026-07-22)
  /* Silent capture (time_ms) is always on; this is the optional visible clock plus
     time-banking plus the time-pressure context. All methods no-op unless
     config.timer is set. NOTE-TO-SELF: per-question allocation is a single
     perQuestionSec for every question — ESAT may want per-subject/per-paper
     budgets; banking is a simple surplus-carries-forward pool (floored at 0). */
  /* ============================== d013/VF-04: the timing system ============
     Engine-owned: modes, bank, pause, discard, learner prefs, silent capture.
     Subject-supplied: cfg.timing.targetOf (seconds) + defaultMode. */
  /* VF-04r: independent axes, migrated from any old single-mode saved pref.
     clockScale sizes the digits (the bank chip grows with them); ringScale
     sizes the ring on its own. */
  Viewer.prototype._timingPrefs = function () {
    const saved = ((this.store || {}).prefs || {}).timing || {};
    let base;
    if (saved.visibility) base = saved;
    else if (saved.mode && TIMING_MODES.indexOf(saved.mode) >= 0) base = Object.assign(timingModeToAxes(saved.mode), { extraPct: saved.extraPct });
    else base = timingModeToAxes((this.cfg.timing && this.cfg.timing.defaultMode) || "none");
    const num = function (v, d, lo, hi) {
      return (typeof v === "number" && isFinite(v)) ? Math.max(lo, Math.min(hi, v)) : d;
    };
    return {
      direction: base.direction === "down" ? "down" : "up",
      visibility: ["off", "show", "reveal_end"].indexOf(base.visibility) >= 0 ? base.visibility : "show",
      clock: base.clock !== false,
      ring: !!base.ring,
      overtimeReset: base.overtimeReset !== false,
      bank: !!base.bank,
      clockScale: num(base.clockScale, 1, 0.7, 3),
      ringScale: num(base.ringScale, 1, 0.7, 3),
      extraPct: num(base.extraPct, 0, -50, 100)
    };
  };
  Viewer.prototype._setTimingPrefs = function (p) {
    if (!this.store.prefs) this.store.prefs = {};
    this.store.prefs.timing = p;
    this._saveStore();
  };
  /* Compact axes string for attempt rows and reports. */
  Viewer.prototype._timingModeNow = function () {
    const p = this._visitTimingPrefs || this._timingPrefs();
    if (p.visibility === "off") return "off";
    const bits = [p.visibility, p.direction];
    if (p.clock) bits.push("clock");
    if (p.ring) bits.push("ring");
    if (p.bank) bits.push("bank");
    return bits.join("-");
  };
  /* Effective per-question target in ms: subject pacing × the learner's
     extra-time multiplier (25%, 50%, or a negative practice adjustment). */
  Viewer.prototype._timingTargetMsFor = function (q) {
    const t = this.cfg.timing;
    if (!t || !t.targetOf || !q) return null;
    if (this._visitTimingQuestion === q) return this._visitTimingTargetMs;
    const learnerEnabled = this.cfg.learnerLevel && this.cfg.learnerLevel.enabled;
    const context = learnerEnabled ? { learnerLevel: this._visitLearnerLevel || this._learnerLevel() } : {};
    let base = null;
    try { base = t.targetOf(q, context); } catch (_) { base = null; }
    if (base == null || !Number.isFinite(Number(base)) || !(base > 0)) return null;
    const prefs = this._visitTimingPrefs || this._timingPrefs();
    return Math.round(base * 1000 * (1 + prefs.extraPct / 100));
  };
  Viewer.prototype._elapsedTimingMs = function () {
    let ms = Date.now() - this.shownAt - (this._pausedMs || 0);
    if (this._pauseStartedAt) ms -= (Date.now() - this._pauseStartedAt);
    return Math.max(0, ms);
  };
  Viewer.prototype._reducedMotion = function () {
    try { return typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches; }
    catch (_) { return false; }
  };

  Viewer.prototype._startTiming = function () {
    this._stopTimer();
    this._timerCtx = null;
    this._attemptTimeMs = undefined;
    this._timeDiscarded = false;
    this._pausedMs = 0;
    this._pauseStartedAt = null;
    if (this._bankMs == null) this._bankMs = 0;
    if (!this._sessionTimed) this._sessionTimed = { count: 0, totalMs: 0, targetMs: 0 };
    const tel = this.q(".ppq-timer");
    if (!tel) return;
    const prefs = this._visitTimingPrefs || this._timingPrefs();
    tel.className = "ppq-timer ppq-timing";
    /* off / reveal_end: nothing during the question (revealed at commit for
       reveal_end). show: live row. */
    if (prefs.visibility !== "show") {
      tel.style.display = "none";
      return;
    }
    tel.style.display = "";
    /* VF-04r3: the header is ITSELF sticky (z 100), so the chip must pin just
       BELOW it — pinning at the viewport top slid it underneath the bar,
       which read as "scrolling out of sight". Measured live so header
       wrapping keeps the chip clear. */
    const hdr = this.root && this.root.querySelector ? this.root.querySelector(".ppq-header") : null;
    tel.style.top = ((hdr && hdr.offsetHeight ? hdr.offsetHeight : 0) + 8) + "px";
    this._buildTimingRow(tel, prefs);
    const self = this;
    this._tickTiming();
    this._timerInterval = setInterval(function () { self._tickTiming(); }, 500);
  };

  Viewer.prototype._buildTimingRow = function (tel, prefs) {
    const self = this;
    tel.innerHTML = "";
    /* VF-04r: the ring sits FIRST with fixed geometry, and the digits get a
       reserved minimum width, so nothing shifts left/right as numbers change
       size ("distracting"). Ring and clock size independently; the bank chip
       grows with the clock. */
    const useRing = prefs.ring && !this._reducedMotion();
    if (useRing) {
      const R = 9, C = (2 * Math.PI * R).toFixed(2);
      const svgWrap = el("span", { class: "ppq-timing-ringwrap", style: "width:" + (1.5 * prefs.ringScale) + "rem;height:" + (1.5 * prefs.ringScale) + "rem;" });
      svgWrap.innerHTML =
        '<svg class="ppq-timing-ring" viewBox="0 0 24 24" aria-hidden="true">' +
        '<circle class="ppq-timing-ring-track" cx="12" cy="12" r="' + R + '"></circle>' +
        '<circle class="ppq-timing-ring-fill" cx="12" cy="12" r="' + R + '" stroke-dasharray="' + C + '" stroke-dashoffset="' + C + '"></circle>' +
        "</svg>";
      tel.appendChild(svgWrap);
    }
    if (prefs.clock || prefs.ring === false || this._reducedMotion()) {
      tel.appendChild(el("span", { class: "ppq-timing-display", style: "font-size:" + (0.95 * prefs.clockScale) + "rem;" }, ""));
    }
    if (prefs.bank) tel.appendChild(el("span", { class: "ppq-timing-bank", style: "font-size:" + (0.9 * prefs.clockScale) + "rem;" }, ""));
    const pause = el("button", { class: "ppq-timing-pause", type: "button", title: "Pause the clock" }, "❚❚");
    pause.addEventListener("click", function () {
      if (self._pauseStartedAt) {
        self._pausedMs += Date.now() - self._pauseStartedAt;
        self._pauseStartedAt = null;
        pause.textContent = "❚❚"; pause.title = "Pause the clock";
        tel.classList.remove("ppq-timing--paused");
      } else {
        self._pauseStartedAt = Date.now();
        pause.textContent = "▶"; pause.title = "Resume";
        tel.classList.add("ppq-timing--paused");
      }
      self._tickTiming();
    });
    tel.appendChild(pause);
    /* Smith, 2026-07-31: a reset for THIS question's clock. The interruption
       case is the point (someone came in, you looked something up), so it
       restarts the question's elapsed time from zero without touching the
       answer, the bank or anything already recorded: nothing is committed
       until the answer lands, so there is nothing to unwind. Also clears a
       pause in progress, since resuming into a stale pause would freeze a
       clock the pupil has just asked to run again. */
    const reset = el("button", { class: "ppq-timing-reset", type: "button", title: "Start this question's clock again from zero" }, "↺");
    reset.addEventListener("click", function () {
      self.shownAt = Date.now();
      self._pausedMs = 0;
      self._pauseStartedAt = null;
      pause.textContent = "❚❚"; pause.title = "Pause the clock";
      tel.classList.remove("ppq-timing--paused");
      self._tickTiming();
      self._fireReport({ status: "timing_prefs", qtype: "timing", extra_json: JSON.stringify({ time_reset: true }) });
    });
    tel.appendChild(reset);
    const discard = el("button", { class: "ppq-timing-discard", type: "button", title: "Don't keep a record of the time for this one" }, "don't record this one");
    discard.addEventListener("click", function () {
      self._timeDiscarded = !self._timeDiscarded;
      discard.classList.toggle("on", self._timeDiscarded);
      discard.textContent = self._timeDiscarded ? "time won't be recorded ✓" : "don't record this one";
    });
    tel.appendChild(discard);
  };

  Viewer.prototype._tickTiming = function () {
    const tel = this.q(".ppq-timer");
    if (!tel || tel.style.display === "none") return;
    const prefs = this._visitTimingPrefs || this._timingPrefs();
    const elapsed = this._elapsedTimingMs();
    const target = this._timingTargetMsFor(this.cur);
    const disp = tel.querySelector(".ppq-timing-display");
    if (this._pauseStartedAt) {
      if (disp) disp.textContent = "paused";
      return;
    }
    const d = timingDisplayText(prefs, elapsed, target);
    tel.classList.toggle("ppq-timing--over", d.over);
    if (disp) disp.textContent = d.text;
    const fill = tel.querySelector(".ppq-timing-ring-fill");
    if (fill && target != null) {
      const C = 2 * Math.PI * 9;
      const frac = Math.min(1, elapsed / target);
      fill.setAttribute("stroke-dashoffset", (C * (1 - frac)).toFixed(2));
    }
    const bankEl = tel.querySelector(".ppq-timing-bank");
    if (bankEl) {
      const b = this._bankMs || 0;
      bankEl.textContent = "bank " + (b < 0 ? "−" : "+") + this._fmtClock(Math.abs(b));
      bankEl.classList.toggle("neg", b < 0);
    }
  };

  /* Commit for the new system: freeze the pause-adjusted spend, settle the
     bank, reveal per-question timing where that mode asks for it. Analysis
     and reflection time is excluded by construction — the clock is committed
     the moment the answer (or markscheme reveal, for marks questions) lands. */
  Viewer.prototype._commitTiming = function () {
    this._stopTimer();
    if (this._pauseStartedAt) { this._pausedMs += Date.now() - this._pauseStartedAt; this._pauseStartedAt = null; }
    const spent = this._elapsedTimingMs();
    const target = this._timingTargetMsFor(this.cur);
    const prefs = this._visitTimingPrefs || this._timingPrefs();
    this._attemptTimeMs = this._timeDiscarded ? null : spent;
    this._timerCtx = { time_ms: spent };
    if (target != null) {
      this._timerCtx.target_ms = target;
      if (!this._timeDiscarded) {
        this._sessionTimed.count++;
        this._sessionTimed.totalMs += spent;
        this._sessionTimed.targetMs += target;
        if (prefs.bank) this._bankMs = (this._bankMs || 0) + (target - spent);
      }
    } else if (!this._timeDiscarded) {
      this._sessionTimed.count++;
      this._sessionTimed.totalMs += spent;
    }
    /* VF-04r2 (Smith): remember exactly what this commit added, so a
       straight-after-answering discard can unwind it precisely. */
    this._lastCommitTiming = this._timeDiscarded ? null : {
      spent: spent,
      target: target,
      banked: (target != null && prefs.bank) ? (target - spent) : 0
    };
    const tel = this.q(".ppq-timer");
    if (!tel) return;
    if (prefs.visibility !== "off") {
      tel.className = "ppq-timer ppq-timing ppq-timing--reveal";
      tel.style.display = "";
      const hdr2 = this.root && this.root.querySelector ? this.root.querySelector(".ppq-header") : null;
      tel.style.top = ((hdr2 && hdr2.offsetHeight ? hdr2.offsetHeight : 0) + 8) + "px"; /* VF-04r3 */
      tel.innerHTML = "";
      let text = "took " + this._fmtClock(spent);
      if (this._timeDiscarded) text = "time not recorded for this one";
      else if (target != null) {
        text += " · target " + this._fmtClock(target);
        if (prefs.bank) { const b = this._bankMs || 0; text += " · bank " + (b < 0 ? "−" : "+") + this._fmtClock(Math.abs(b)); }
      }
      tel.appendChild(el("span", { class: "ppq-timing-display" }, esc(text)));
      /* VF-04r2: the clock can be ignored AFTER answering too. */
      if (!this._timeDiscarded) {
        const self = this;
        const undo = el("button", { class: "ppq-timing-discard", type: "button", title: "Strike the time just recorded for this question" }, "don't record this one");
        undo.addEventListener("click", function () { self._discardCommittedTime(); });
        tel.appendChild(undo);
      }
    } else {
      tel.style.display = "none";
    }
  };

  /* Smith, 2026-07-31: delete a HISTORICAL time from the progress page, long
     after the attempt. Same effect on the row as the retro discard, but it
     cannot unwind a bank credit that belongs to a finished session, so when the
     row IS this session's last commit it delegates to the exact unwind instead
     of double-counting. `bulk` defers the store write to the caller. */
  Viewer.prototype._deleteRecordedTime = function (row, bulk) {
    if (!row || row.time_ms == null) return;
    const last = this._lastCommitTiming;
    if (last && this._attemptId && row.attempt_id === this._attemptId) {
      this._discardCommittedTime();
      return;
    }
    row.time_ms = null;
    row.time_discarded = true;
    if (!bulk && this._saveStore) this._saveStore();
    this._fireReport({
      status: "timing_prefs", qtype: "timing",
      extra_json: JSON.stringify({ time_deleted_historical: true, attempt_id: row.attempt_id || "", item_id: row.id || "" })
    });
  };

  /* A few words of the question, so a row in the times table is recognisable
     without opening it. Consumer text may be HTML (maths markup), so it is
     stripped rather than trusted. */
  Viewer.prototype._stemSnippet = function (q) {
    let t = "";
    try { t = this.cfg.questionTextOf(q) || ""; } catch (_) { t = ""; }
    t = String(t).replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
    return t.length > 90 ? t.slice(0, 88).replace(/\s+\S*$/, "") + "…" : t;
  };

  /* VF-04r2 (Smith 2026-07-29): retroactive time discard, straight after
     answering. Strikes time_ms on the just-recorded attempt row, unwinds the
     bank credit and the session tally, and says so in the reveal line. The
     answer itself stays recorded — only the clock is ignored. */
  Viewer.prototype._discardCommittedTime = function () {
    const last = this._lastCommitTiming;
    if (!last) return;
    this._lastCommitTiming = null;
    this._timeDiscarded = true;
    this._attemptTimeMs = null;
    this._sessionTimed.count = Math.max(0, this._sessionTimed.count - 1);
    this._sessionTimed.totalMs = Math.max(0, this._sessionTimed.totalMs - last.spent);
    if (last.target != null) this._sessionTimed.targetMs = Math.max(0, this._sessionTimed.targetMs - last.target);
    if (last.banked) this._bankMs = (this._bankMs || 0) - last.banked;
    const attempts = ((this.store || {}).attempts) || [];
    for (let i = attempts.length - 1; i >= 0; i--) {
      if (!this._attemptId || attempts[i].attempt_id === this._attemptId) {
        attempts[i].time_ms = null;
        attempts[i].time_discarded = true;
        if (this._saveStore) this._saveStore();
        break;
      }
    }
    this._fireReport({ status: "timing_prefs", qtype: "timing", extra_json: JSON.stringify({ time_discard_retro: true, attempt_id: this._attemptId || "" }) });
    const tel = this.q(".ppq-timer");
    if (tel && tel.style.display !== "none") {
      tel.innerHTML = "";
      tel.appendChild(el("span", { class: "ppq-timing-display" }, "time not recorded for this one"));
    }
  };

  /* VF-04r: the preferences panel — INDEPENDENT axes with a live preview
     ("they should see a preview of this as they select"). */
  Viewer.prototype._openTimingPanel = function () {
    const self = this;
    const p = this._timingPrefs(); /* mutable working copy */
    const timingBefore = JSON.stringify(p);
    const general = this.cfg.attemptHistory.enabled || this.cfg.practiceSelection.enabled || (this.cfg.learnerLevel && this.cfg.learnerLevel.enabled) || (this.cfg.questionTools && this.cfg.questionTools.resetInPreferences);
    const hasTargets = !!(this.cfg.timing && this.cfg.timing.targetOf);
    const page = el("div", { class: "ppq-progress ppq-timing-panel" });
    page.appendChild(el("div", { class: "ppq-progress-title" }, general ? "Preferences" : "Timing"));
    let historyInput = null, practiceInput = null, learnerInput = null;
    if (this.cfg.learnerLevel && this.cfg.learnerLevel.enabled) {
      const label = el("label", { class: "ppq-learner-level-option" }, "My level ");
      learnerInput = el("select", { class: "ppq-learner-level", ariaLabel: "My level" });
      [["HL", "HL"], ["SL", "SL"]].forEach(([value, text]) => learnerInput.appendChild(el("option", { value }, text)));
      learnerInput.value = this._learnerLevel(); label.appendChild(learnerInput); page.appendChild(label);
      page.appendChild(el("p", { class: "ppq-learner-level-note" }, "Applies from the next question. Your current answer stays open."));
    }
    if (this.cfg.practiceSelection.enabled) {
      const label = el("label", { class: "ppq-practice-selection-option" }, "Questions to practise ");
      practiceInput = el("select", { class: "ppq-practice-selection", ariaLabel: "Questions to practise" });
      [["unattempted", "Not attempted yet"], ["mix", "Complete mix"], ["errors", "Previous errors"]].forEach(([value, text]) => practiceInput.appendChild(el("option", { value }, text)));
      const includeLabel = el("label", { class: "ppq-include-attempted-option" });
      const includeInput = el("input", { class: "ppq-include-attempted-toggle", type: "checkbox", checked: this._practiceMode() !== "unattempted" });
      includeLabel.appendChild(includeInput); includeLabel.appendChild(el("span", null, "Include questions already done"));
      includeInput.addEventListener("change", () => { practiceInput.value = includeInput.checked ? "mix" : "unattempted"; });
      practiceInput.addEventListener("change", () => { includeInput.checked = practiceInput.value !== "unattempted"; });
      page.appendChild(includeLabel);
      practiceInput.value = this._practiceMode(); label.appendChild(practiceInput); page.appendChild(label);
      page.appendChild(el("p", { class: "ppq-practice-selection-note" }, "Applies from the next question. Your current answer stays open."));
    }
    if (this.cfg.attemptHistory.enabled) {
      const label = el("label", { class: "ppq-attempt-history-option" });
      historyInput = el("input", { class: "ppq-attempt-history-toggle", type: "checkbox", checked: this._attemptHistoryVisible() });
      label.appendChild(historyInput); label.appendChild(el("span", null, "Show previous attempts")); page.appendChild(label);
    }
    const timingPage = el("div", { class: "ppq-timing-preferences" });
    if (this.cfg.timing) page.appendChild(timingPage);
    if (this.cfg.timing && this.cfg.timing.description) timingPage.appendChild(el("p", { class: "ppq-timing-description" }, esc(this.cfg.timing.description)));

    const SCALES = [["S", 0.85], ["M", 1], ["L", 1.4], ["XL", 1.9]];
    function nearestScale(v) {
      let best = "M", d = Infinity;
      SCALES.forEach(function (s) { const dd = Math.abs(s[1] - v); if (dd < d) { d = dd; best = s[0]; } });
      return best;
    }
    function scaleOf(k) { let out = 1; SCALES.forEach(function (s) { if (s[0] === k) out = s[1]; }); return out; }

    /* --- live preview ----------------------------------------------------- */
    const preview = el("div", { class: "ppq-timing-preview" });
    function previewRow(labelText, elapsedMs, targetMs) {
      const row = el("div", { class: "ppq-timing-preview-row" });
      row.appendChild(el("span", { class: "ppq-timing-preview-label" }, esc(labelText)));
      if (p.visibility === "off") {
        row.appendChild(el("span", { class: "ppq-timing-preview-note" }, "nothing shows while you work"));
        return row;
      }
      if (p.visibility === "reveal_end") {
        row.appendChild(el("span", { class: "ppq-timing-preview-note" },
          "appears after you answer: “took " + self._fmtClock(elapsedMs) +
          (hasTargets ? " · target " + self._fmtClock(targetMs) : "") + "”"));
        return row;
      }
      const chip = el("span", { class: "ppq-timing ppq-timing--preview" });
      const d = timingDisplayText(p, elapsedMs, hasTargets ? targetMs : null);
      if (d.over) chip.classList.add("ppq-timing--over");
      if (p.ring && !self._reducedMotion()) {
        const R = 9, C = 2 * Math.PI * R;
        const frac = hasTargets ? Math.min(1, elapsedMs / targetMs) : 0;
        const rw = el("span", { class: "ppq-timing-ringwrap", style: "width:" + (1.5 * p.ringScale) + "rem;height:" + (1.5 * p.ringScale) + "rem;" });
        rw.innerHTML = '<svg class="ppq-timing-ring" viewBox="0 0 24 24"><circle class="ppq-timing-ring-track" cx="12" cy="12" r="9"></circle><circle class="ppq-timing-ring-fill" cx="12" cy="12" r="9" stroke-dasharray="' + C.toFixed(2) + '" stroke-dashoffset="' + (C * (1 - frac)).toFixed(2) + '"></circle></svg>';
        chip.appendChild(rw);
      }
      if (p.clock) chip.appendChild(el("span", { class: "ppq-timing-display", style: "font-size:" + (0.95 * p.clockScale) + "rem;" }, esc(d.text)));
      if (p.bank && hasTargets) chip.appendChild(el("span", { class: "ppq-timing-bank", style: "font-size:" + (0.9 * p.clockScale) + "rem;" }, "bank +0:37"));
      row.appendChild(chip);
      return row;
    }
    function redrawPreview() {
      preview.innerHTML = "";
      preview.appendChild(el("b", null, "Preview"));
      preview.appendChild(previewRow("While working", 47000, 90000));
      preview.appendChild(previewRow("Allocation up", 121000, 120000));
    }

    /* --- segmented controls ------------------------------------------------ */
    function seg(labelText, options, currentValue, onPick, disabledNote) {
      const row = el("div", { class: "ppq-timing-seg-row" });
      row.appendChild(el("span", { class: "ppq-timing-seg-label" }, esc(labelText)));
      const group = el("span", { class: "ppq-timing-seg" + (disabledNote ? " off" : "") });
      options.forEach(function (o) {
        const b = el("button", { class: "ppq-timing-seg-btn" + (String(o[0]) === String(currentValue) ? " sel" : ""), type: "button", "data-value": String(o[0]) }, esc(o[1]));
        if (!disabledNote) b.addEventListener("click", function () {
          group.querySelectorAll(".ppq-timing-seg-btn").forEach(function (x) { x.classList.remove("sel"); });
          b.classList.add("sel");
          onPick(o[0]);
          redrawPreview();
        });
        group.appendChild(b);
      });
      row.appendChild(group);
      if (disabledNote) row.appendChild(el("span", { class: "ppq-timing-preview-note" }, esc(disabledNote)));
      return row;
    }
    const needTargets = hasTargets ? null : "Needs pacing targets from the subject setup.";
    timingPage.appendChild(seg("Show it", [["off", "Off"], ["show", "Show while working"], ["reveal_end", "Reveal after answering"]], p.visibility, function (v) { p.visibility = v; }));
    timingPage.appendChild(seg("Direction", [["up", "Count up"], ["down", "Count down"]], p.direction, function (v) { p.direction = v; }, needTargets));
    timingPage.appendChild(seg("Digital clock", [["on", "On"], ["off", "Off"]], p.clock ? "on" : "off", function (v) { p.clock = v === "on"; }));
    timingPage.appendChild(seg("Clock size", SCALES.map(function (s) { return [s[0], s[0]]; }), nearestScale(p.clockScale), function (v) { p.clockScale = scaleOf(v); }));
    timingPage.appendChild(seg("Pacing ring", [["on", "On"], ["off", "Off"]], p.ring ? "on" : "off", function (v) { p.ring = v === "on"; }, needTargets ||
      (this._reducedMotion() ? "Reduced motion is on — the ring shows as numbers instead." : null)));
    timingPage.appendChild(seg("Ring size", SCALES.map(function (s) { return [s[0], s[0]]; }), nearestScale(p.ringScale), function (v) { p.ringScale = scaleOf(v); }, needTargets));
    timingPage.appendChild(seg("When allocation is up", [["reset", "Start from zero (+0:01)"], ["continue", "Keep counting"]], p.overtimeReset ? "reset" : "continue", function (v) { p.overtimeReset = v === "reset"; }, needTargets));
    timingPage.appendChild(seg("Time bank", [["on", "On"], ["off", "Off"]], p.bank ? "on" : "off", function (v) { p.bank = v === "on"; }, needTargets));
    timingPage.appendChild(preview);
    redrawPreview();

    const extraRow = el("div", { class: "ppq-timing-extra" });
    extraRow.appendChild(el("b", null, "Extra time"));
    extraRow.appendChild(el("span", null, "Scales every target. 25% and 50% match access arrangements; a negative number makes practice harder."));
    const extraInput = el("input", { class: "ppq-timing-extra-input", type: "number", step: "5", min: "-50", max: "100", value: String(p.extraPct) });
    ["0", "25", "50"].forEach(function (v) {
      const b = el("button", { class: "ppq-btn-mini ppq-timing-extra-quick", type: "button" }, v + "%");
      b.addEventListener("click", function () { extraInput.value = v; });
      extraRow.appendChild(b);
    });
    extraRow.appendChild(extraInput);
    extraRow.appendChild(el("span", { class: "ppq-timing-extra-pc" }, "%"));
    timingPage.appendChild(extraRow);

    const st = this._sessionTimed || { count: 0, totalMs: 0, targetMs: 0 };
    const sess = el("div", { class: "ppq-timing-session" });
    sess.appendChild(el("b", null, "This session so far"));
    let sessText = st.count
      ? (st.count + " timed question" + (st.count === 1 ? "" : "s") + " · " + this._fmtClock(st.totalMs))
      : "No timed questions yet.";
    if (st.count && st.targetMs) {
      const diff = st.targetMs - st.totalMs;
      sessText += " · vs target " + (diff >= 0 ? "+" : "−") + this._fmtClock(Math.abs(diff));
    }
    if ((this._bankMs || 0) !== 0) {
      const b = this._bankMs;
      sessText += " · bank " + (b < 0 ? "−" : "+") + this._fmtClock(Math.abs(b));
    }
    sess.appendChild(el("span", null, esc(sessText)));
    timingPage.appendChild(sess);

    const save = el("button", { class: "ppq-btn ppq-primary ppq-timing-save", type: "button" }, "Save — remembered on this device");
    save.addEventListener("click", function () {
      let pct = parseFloat(extraInput.value);
      if (!isFinite(pct)) pct = 0;
      p.extraPct = Math.max(-50, Math.min(100, pct));
      if (!self.store.prefs) self.store.prefs = {};
      if (historyInput) self.store.prefs.attemptHistory = { visible: historyInput.checked };
      if (practiceInput) self.store.prefs.practiceSelection = { mode: practiceInput.value };
      if (learnerInput && ["HL", "SL"].includes(learnerInput.value)) self.store.prefs.learnerLevel = learnerInput.value;
      const timingChanged = !!self.cfg.timing && JSON.stringify(p) !== timingBefore;
      if (timingChanged) self.store.prefs.timing = p;
      self._saveStore();
      self._renderAttemptHistory();
      if (timingChanged) self._fireReport({ status: "timing_prefs", qtype: "timing", extra_json: JSON.stringify(p) });
      self.closeModal();
      if (timingChanged && !general) self._startTiming();
      if (!self.cur && self.cfg.practiceSelection.enabled) self._nextPractice();
    });
    page.appendChild(save);

    if (this.cfg.questionTools && this.cfg.questionTools.resetInPreferences) {
      const progressTools = el("details", { class: "ppq-progress-tools" });
      progressTools.appendChild(el("summary", null, "Manage saved progress"));
      progressTools.appendChild(el("p", null, "Clear marks and confidence ratings saved on this device. This cannot be undone."));
      const reset = el("button", { class: "ppq-btn-mini ppq-reset", type: "button" }, "Reset progress");
      reset.addEventListener("click", () => self.reset());
      progressTools.appendChild(reset); page.appendChild(progressTools);
    }

    const body = this.q(".ppq-modal-body");
    if (!body) return false;
    body.innerHTML = "";
    body.appendChild(page);
    const reminder = this.q(".ppq-modal-reminder");
    if (reminder) reminder.textContent = general ? "Preferences" : "Timing";
    const minBtn = this.q(".ppq-modal-min");
    if (minBtn) minBtn.style.display = "none";
    const badge = this.q(".ppq-modal-feedback-status");
    if (badge) badge.style.display = "none";
    this.q(".ppq-modal").classList.add("show", "ppq-modal-progress");
    return true;
  };

  // Published explanations are public; private messages and browser receipt IDs
  // are separate from attempt/progress storage and are never sent as telemetry.
  Viewer.prototype._initTeacherHelp = function () {
    if (!this.cfg.teacherHelp) return;
    this._helpKey = "ppq_teacher_help_" + this.cfg.teacherHelp.project + "_v1";
    this._helpData = { requests: [], drafts: {}, read: {} };
    this._helpSending = new Set();
    this._helpLoad(); this._helpBadge();
    this._helpWake = () => { if (document.visibilityState !== "hidden") { this._helpLoad(); this._helpPoll(); } };
    window.addEventListener("focus", this._helpWake);
    document.addEventListener("visibilitychange", this._helpWake);
    this._helpInterval = setInterval(this._helpWake, 60000);
    this._helpWake();
  };
  Viewer.prototype._helpLoad = function () {
    try {
      const saved = JSON.parse(localStorage.getItem(this._helpKey) || "null");
      if (saved && Array.isArray(saved.requests)) {
        this._helpData = { requests: saved.requests.filter(r => r && typeof r.request_id === "string").slice(-500),
          drafts: saved.drafts || {}, read: saved.read || {} };
      }
    } catch (_) { /* Keep the in-memory mailbox when storage is unavailable. */ }
  };
  Viewer.prototype._helpSave = function () {
    try { localStorage.setItem(this._helpKey, JSON.stringify(this._helpData)); return true; }
    catch (_) { return false; }
  };
  Viewer.prototype._helpBadge = function () {
    const button = this.q(".ppq-teacher-help"); if (!button || !this._helpData) return;
    const unread = this._helpData.requests.filter(r => r.reply && this._helpData.read[r.reply.id] !== r.reply.published_at).length;
    button.innerHTML = esc(this.cfg.teacherHelp.label) + (unread ? ' <span class="ppq-help-unread">' + unread + ' new ' + (unread === 1 ? 'reply' : 'replies') + '</span>' : '');
    button.title = "Ask for clarification and read teacher replies";
    button.setAttribute("aria-live", "polite");
  };
  Viewer.prototype._helpGet = function (action, params) {
    // ContentService redirects cross-origin reads. JSONP is used exclusively for
    // the public, whitelisted reply/receipt endpoints, never the teacher inbox.
    return new Promise((resolve, reject) => {
      const callback = "ppqHelp_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2);
      const url = new URL(this.cfg.teacherHelp.endpoint);
      Object.entries(Object.assign({ action, project: this.cfg.teacherHelp.project, callback }, params)).forEach(([key, value]) => url.searchParams.set(key, value));
      const script = document.createElement("script");
      let timer;
      const finish = (error, value) => {
        clearTimeout(timer); script.remove(); delete window[callback];
        if (error) reject(error); else resolve(value);
      };
      window[callback] = value => value && value.ok === true ? finish(null, value) : finish(new Error("Reply service unavailable"));
      script.onerror = () => finish(new Error("Reply service unavailable"));
      timer = setTimeout(() => finish(new Error("Reply service timed out")), 15000);
      script.src = url.href; document.head.appendChild(script);
    });
  };
  Viewer.prototype._helpPoll = async function () {
    if (this._helpPolling || !this._helpData || !this._helpData.requests.length || this._helpDestroyed) return;
    this._helpPolling = true;
    try {
      const rows = this._helpData.requests;
      for (let i = 0; i < rows.length; i += 40) {
        const batch = rows.slice(i, i + 40);
        const result = await this._helpGet("ppq_help_status", { request_ids: batch.map(r => r.request_id).join(",") });
        if (this._helpDestroyed) return;
        this._helpApplyStatus(result);
      }
      this._helpSave(); this._helpBadge();
      if (this._helpPaintInbox) this._helpPaintInbox();
      if (this._helpPaintForm) this._helpPaintForm();
    } catch (_) { /* Quietly keep pending receipts; an open form gives explicit errors. */ }
    finally { this._helpPolling = false; }
  };
  Viewer.prototype._helpApplyStatus = function (result) {
    (result.requests || []).forEach(receipt => {
      const own = this._helpData.requests.find(r => r.request_id === receipt.request_id);
      if (own && ["pending", "answered", "received", "published"].includes(receipt.status)) own.status = receipt.status;
    });
    (result.replies || []).forEach(reply => {
      const own = this._helpData.requests.find(r => r.request_id === reply.request_id && r.item_id === reply.item_id);
      if (own && reply.project === this.cfg.teacherHelp.project && typeof reply.answer === "string" && typeof reply.question === "string" && reply.id && reply.published_at) {
        own.reply = reply; own.status = "answered";
      }
    });
    Object.keys(this._helpData.drafts).forEach(itemId => {
      const draft = this._helpData.drafts[itemId];
      const own = draft && this._helpData.requests.find(r => r.request_id === draft.request_id);
      if (own && own.status !== "unknown" && !this._helpSending.has(own.request_id)) delete this._helpData.drafts[itemId];
    });
  };
  Viewer.prototype._helpReplyCard = function (reply) {
    const card = el("article", { class: "ppq-help-reply" });
    card.appendChild(el("h4", null, esc(reply.question)));
    card.appendChild(el("p", null, esc(reply.answer)));
    const date = Date.parse(reply.published_at);
    if (Number.isFinite(date)) card.appendChild(el("small", { class: "ppq-help-date" }, "Teacher reply · " + esc(new Date(date).toLocaleDateString())));
    return card;
  };
  Viewer.prototype._openTeacherHelp = function () {
    const cfg = this.cfg.teacherHelp;
    if (!cfg || !this.cur || this._iqOpen || this._reviewingAttempt) return false;
    const current = this.cur, itemId = String(this.cfg.idOf(current));
    const body = this.q(".ppq-modal-body"), modal = this.q(".ppq-modal");
    this._helpLoad();
    let source = itemId, context = {}, sourceUrl = "";
    try { source = String(cfg.sourceLabelOf(current) || itemId); } catch (_) { /* Use the stable ID. */ }
    try { if (cfg.contextOf) context = JSON.parse(JSON.stringify(cfg.contextOf(current) || {})); } catch (_) { /* Optional metadata. */ }
    try {
      const url = new URL(cfg.sourceUrlOf(current) || window.location.href);
      url.search = ""; url.hash = ""; url.searchParams.set("id", itemId);
      if (url.protocol === "https:") sourceUrl = url.href;
    } catch (_) { /* Explain an invalid public source link on explicit Send. */ }
    const panel = el("div", { class: "ppq-help-panel" });
    panel.appendChild(el("h2", null, esc(cfg.label)));
    panel.appendChild(el("p", { class: "ppq-help-note" }, esc(cfg.introduction)));
    panel.appendChild(el("p", { class: "ppq-help-source" }, esc(source)));
    const inbox = el("details", { class: "ppq-help-inbox" });
    const inboxSummary = el("summary", null, "Your questions and replies");
    const inboxList = el("div"); inbox.appendChild(inboxSummary); inbox.appendChild(inboxList); panel.appendChild(inbox);
    const paintInbox = () => {
      if (!panel.isConnected) return;
      inboxList.innerHTML = "";
      const rows = this._helpData.requests.slice().reverse();
      const unread = rows.filter(r => r.reply && this._helpData.read[r.reply.id] !== r.reply.published_at).length;
      inboxSummary.textContent = "Your questions and replies" + (unread ? " · " + unread + " new" : "");
      if (!rows.length) inboxList.appendChild(el("p", { class: "ppq-help-empty" }, "No questions sent from this browser yet."));
      rows.forEach(row => {
        const entry = el("div", { class: "ppq-help-inbox-item" });
        entry.appendChild(el("strong", null, esc(row.source_label || row.item_id)));
        entry.appendChild(el("p", null, esc(row.question)));
        if (row.reply) {
          const read = el("button", { type: "button", class: "ppq-btn-mini ppq-help-read" }, "Read reply" + (this._helpData.read[row.reply.id] !== row.reply.published_at ? " · new" : ""));
          read.addEventListener("click", () => {
            const existing = entry.querySelector(".ppq-help-reply");
            if (!existing) entry.appendChild(this._helpReplyCard(row.reply));
            this._helpData.read[row.reply.id] = row.reply.published_at; this._helpSave(); this._helpBadge();
            read.textContent = "Reply shown"; read.disabled = true;
          });
          entry.appendChild(read);
        } else entry.appendChild(el("small", null, row.status === "unknown" ? "Receipt not confirmed — reopen this question to retry." : "Waiting for a teacher reply."));
        inboxList.appendChild(entry);
      });
    };
    this._helpPaintInbox = paintInbox;
    const history = el("section", { class: "ppq-help-history", ariaLabel: "Previous teacher replies for this question" });
    history.appendChild(el("h3", null, "Previous teacher replies"));
    const historyRows = el("div", { class: "ppq-help-history-rows" }, "Loading replies…"); history.appendChild(historyRows); panel.appendChild(history);
    const form = el("form", { class: "ppq-help-form" });
    const field = el("label", { class: "ppq-help-field" }, "What would you like clarified?");
    let draft = this._helpData.drafts[itemId] || { message: "" };
    this._helpData.drafts[itemId] = draft;
    const message = el("textarea", { class: "ppq-help-message", ariaLabel: "What would you like clarified?", rows: 4, required: true, maxLength: 4000, value: draft.message });
    field.appendChild(message); form.appendChild(field);
    const status = el("p", { class: "ppq-help-status" }); status.setAttribute("role", "status"); form.appendChild(status);
    const actions = el("div", { class: "ppq-help-actions" });
    const send = el("button", { class: "ppq-btn ppq-primary ppq-help-send", type: "submit" }, draft.request_id ? "Retry sending" : "Send question");
    const close = el("button", { class: "ppq-btn", type: "button" }, "Close"); close.addEventListener("click", () => this.closeModal());
    actions.appendChild(send); actions.appendChild(close); form.appendChild(actions); panel.appendChild(form);
    let shownRequestId = draft.request_id || "";
    const paintForm = () => {
      if (!panel.isConnected) return;
      const savedDraft = this._helpData.drafts[itemId];
      shownRequestId = (savedDraft && savedDraft.request_id) || shownRequestId;
      const request = this._helpData.requests.find(r => r.request_id === shownRequestId);
      const pending = this._helpSending.has(shownRequestId);
      const confirmed = request && request.status !== "unknown";
      message.readOnly = !!shownRequestId;
      send.disabled = pending || !!confirmed;
      send.textContent = pending ? "Sending…" : confirmed ? "Question sent" : shownRequestId ? "Retry sending" : "Send question";
      status.textContent = pending ? "Sending your question…" : confirmed ? cfg.receivedText :
        shownRequestId ? "Receipt could not be confirmed. Your question is saved here; retrying will use the same receipt and will not send a duplicate." : "";
      status.classList.toggle("ppq-help-error", !!shownRequestId && !pending && !confirmed);
    };
    this._helpPaintForm = paintForm;
    message.addEventListener("input", () => {
      draft = this._helpData.drafts[itemId] || draft;
      if (draft.request_id) return;
      draft.message = message.value; this._helpData.drafts[itemId] = draft; this._helpSave();
    });
    form.addEventListener("submit", async event => {
      event.preventDefault();
      this._helpLoad(); draft = this._helpData.drafts[itemId] || draft;
      const prior = this._helpData.requests.find(r => r.request_id === (draft.request_id || shownRequestId));
      if ((prior && prior.status !== "unknown") || this._helpSending.has(draft.request_id || shownRequestId)) { paintForm(); return; }
      const text = message.value.trim();
      if (!text || text.length > 4000) { status.textContent = "Please write your question (up to 4000 characters)."; message.focus(); return; }
      if (!sourceUrl) { status.textContent = "A public question link is needed before this preview can send a question."; return; }
      let request = draft.request_id && this._helpData.requests.find(r => r.request_id === draft.request_id);
      if (!request) {
        if (!window.crypto || !window.crypto.getRandomValues) { status.textContent = "This browser cannot create a receipt. Please use an up-to-date browser."; return; }
        const bytes = new Uint8Array(16); window.crypto.getRandomValues(bytes); bytes[6] = (bytes[6] & 15) | 64; bytes[8] = (bytes[8] & 63) | 128;
        const hex = Array.from(bytes, b => b.toString(16).padStart(2, "0")).join("");
        const requestId = hex.slice(0, 8) + "-" + hex.slice(8, 12) + "-" + hex.slice(12, 16) + "-" + hex.slice(16, 20) + "-" + hex.slice(20);
        request = { request_id: requestId, item_id: itemId, question: text, source_label: source, source_url: sourceUrl, source_context: context, status: "unknown", created_at: new Date().toISOString() };
        this._helpData.requests.push(request); draft.request_id = requestId; draft.message = text;
      }
      this._helpData.drafts[itemId] = draft; shownRequestId = request.request_id;
      if (!this._helpSave()) { status.textContent = "Allow this site to save browser data before sending, so your reply can find you."; return; }
      this._helpSending.add(request.request_id); paintForm();
      try {
        const payload = { action: "ppq_help_request", project: cfg.project, request_id: request.request_id, item_id: request.item_id,
          question: request.question, source_label: request.source_label, source_url: request.source_url, source_context: request.source_context };
        try { await window.fetch(cfg.endpoint, { method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(payload) }); } catch (_) { /* Still check an uncertain dispatch for an actual receipt. */ }
        let confirmed = false;
        for (let attempt = 0; attempt < 4 && !confirmed; attempt++) {
          if (attempt) await new Promise(resolve => setTimeout(resolve, 1000));
          const result = await this._helpGet("ppq_help_status", { request_ids: request.request_id });
          this._helpApplyStatus(result);
          const savedRequest = this._helpData.requests.find(r => r.request_id === request.request_id);
          confirmed = !!savedRequest && savedRequest.status !== "unknown";
        }
        if (!confirmed) throw new Error("Receipt unconfirmed");
        if (this._helpData.drafts[itemId] && this._helpData.drafts[itemId].request_id === request.request_id) delete this._helpData.drafts[itemId];
        this._helpSave(); this._helpBadge();
        if (this._helpPaintInbox) this._helpPaintInbox();
      } catch (_) {
        // Keep the exact saved UUID and text for a safe retry after uncertainty.
      } finally { this._helpSending.delete(request.request_id); if (this._helpPaintForm) this._helpPaintForm(); }
    });
    body.innerHTML = ""; body.appendChild(panel); paintInbox(); paintForm();
    this.q(".ppq-modal-reminder").textContent = "Questions and teacher replies";
    this.q(".ppq-modal-min").style.display = "none";
    const badge = this.q(".ppq-modal-feedback-status"); if (badge) badge.style.display = "none";
    modal.classList.remove("minimized", "ppq-modal-analysis"); this.root.classList.remove("ppq-analysis-open");
    modal.classList.add("show", "ppq-modal-progress");
    this._helpGet("ppq_help_list", { item_id: itemId }).then(result => {
      if (!historyRows.isConnected) return;
      historyRows.innerHTML = "";
      const replies = (result.replies || []).filter(r => r.project === cfg.project && r.item_id === itemId && typeof r.question === "string" && typeof r.answer === "string");
      replies.forEach(reply => {
        historyRows.appendChild(this._helpReplyCard(reply));
        if (this._helpData.requests.some(r => r.request_id === reply.request_id)) this._helpData.read[reply.id] = reply.published_at;
      });
      if (!replies.length) historyRows.appendChild(el("p", { class: "ppq-help-empty" }, "No teacher replies for this question yet."));
      this._helpSave(); this._helpBadge();
    }).catch(() => { if (historyRows.isConnected) historyRows.textContent = "Previous replies could not be loaded. Close and reopen to try again."; });
    this._helpPoll(); close.focus(); return true;
  };

  /* d031: what the pupil was looking at, beyond which question. A "wrong question type"
     report cannot be read without the filters that produced the grouping, and an app
     report still needs to say which question was on screen. */
  Viewer.prototype._reportViewContext = function () {
    const cfg = this.cfg, parts = [], values = {};
    (cfg.filters || []).forEach((f, i) => {
      const node = this.q('.ppq-select[data-fidx="' + i + '"]');
      const value = node && node.value ? String(node.value) : "ALL";
      const name = f.label || f.field || String(i);
      values[name] = value;
      if (value !== "ALL") parts.push(name + ": " + ((f.friendlyLabels && f.friendlyLabels[value]) || value));
    });
    if (this.groupFilter) parts.push("question type: " + (this._groupFilterLabel || this.groupFilter));
    return { filters: values, group_filter: this.groupFilter || "", shown: this.view.length,
      summary: parts.length ? "Filters in use: " + parts.join(" · ") : "No filters are in use." };
  };
  Viewer.prototype._openProblemReport = function (reasonCode) {
    const cfg = this.cfg.problemReport;
    if (!cfg || this._iqOpen || this._reviewingAttempt) return false;
    const reason = reasonCode ? cfg.reasons.find((r) => r.code === reasonCode) || null : null;
    const body = this.q(".ppq-modal-body"), modal = this.q(".ppq-modal");
    if (!body || !modal) return false;
    const q = this.cur;
    const itemId = q ? String(this.cfg.idOf(q)) : "";
    if (!this._problemDrafts) this._problemDrafts = Object.create(null);
    /* d031: one draft per question AND reason, so a half-written crop report is not
       overwritten by opening a different reason on the same question. */
    const draftKey = itemId + "|" + (reason ? reason.code : "");
    let draft = this._problemDrafts[draftKey];
    if (!draft) {
      let context = {}, source = "No question is open";
      if (q) {
        try { source = String(cfg.sourceLabelOf(q) || itemId); } catch (_) { source = itemId; }
        if (cfg.contextOf) {
          try {
            const supplied = cfg.contextOf(q);
            if (supplied && typeof supplied === "object" && !Array.isArray(supplied)) context = JSON.parse(JSON.stringify(supplied));
          } catch (_) { /* A broken optional source hook must not block reporting. */ }
        }
      }
      context.item_id = itemId;
      context.source_label = source;
      context.view_context = this._reportViewContext(); /* d031 */
      if (reason) context.reason_code = reason.code;
      draft = this._problemDrafts[draftKey] = { message: "", type: reason ? reason.label : "Bad crop or missing content", source, context, url: window.location.href, state: "draft" };
    }
    const page = el("form", { class: "ppq-progress ppq-problem-form" });
    /* d031: the panel repeats what the pupil was on, because it covers the question.
       That holds for an app report too: "currently viewing" is the useful half of it. */
    page.appendChild(el("h2", { class: "ppq-progress-title" }, esc(reason ? reason.label.replace(/\?\s*$/, "") : "Report a display problem")));
    page.appendChild(el("p", { class: "ppq-problem-thanks" }, "Thanks for taking the time to report."));
    if (reason && reason.hint) page.appendChild(el("p", { class: "ppq-problem-hint" }, esc(reason.hint)));
    page.appendChild(el("p", { class: "ppq-problem-source" }, esc(q ? "Currently viewing " + draft.source : draft.source)));
    if (draft.context.view_context && draft.context.view_context.summary)
      page.appendChild(el("p", { class: "ppq-problem-view" }, esc(draft.context.view_context.summary)));
    page.appendChild(el("p", { class: "ppq-problem-note" }, "The question details and this page are included. Your answers and progress are not included."));
    let type = null;
    if (!reason) {
      const typeLabel = el("label", { class: "ppq-problem-field" }, "What is wrong? ");
      type = el("select", { class: "ppq-problem-type", ariaLabel: "Problem type" });
      const types = ["Bad crop or missing content", "Question image", "Markscheme image", "Answer or marks", "Other"];
      types.forEach((label) => type.appendChild(el("option", { value: label }, esc(label))));
      type.value = draft.type;
      typeLabel.appendChild(type); page.appendChild(typeLabel);
    }
    const messageLabel = el("label", { class: "ppq-problem-field" }, reason
      ? (reason.detail === "invite" ? "Give details below." : "Just press Send, or add more details below.")
      : "Anything to add? (optional) ");
    const message = el("textarea", { class: "ppq-problem-message", ariaLabel: "Anything to add? (optional)", rows: 5, maxLength: 5000, value: draft.message });
    messageLabel.appendChild(message); page.appendChild(messageLabel);
    const status = el("p", { class: "ppq-problem-status" });
    status.setAttribute("role", "status"); status.setAttribute("aria-live", "polite"); page.appendChild(status);
    const actions = el("div", { class: "ppq-problem-actions" });
    const close = el("button", { class: "ppq-btn ppq-problem-close", type: "button" }, "Close");
    const send = el("button", { class: "ppq-btn ppq-primary ppq-problem-send", type: "submit" }, "Send report");
    actions.appendChild(close); actions.appendChild(send); page.appendChild(actions);
    const paint = () => {
      const pending = draft.state === "sending";
      if (type) type.disabled = pending; message.disabled = pending; send.disabled = pending || draft.state === "dispatched";
      send.textContent = pending ? "Sending…" : "Send report";
      status.textContent = draft.state === "error" ? "The report could not be sent. Your text is still here; please try again." :
        draft.state === "dispatched" ? "Thanks for reporting." :
        pending ? "Sending your report…" : "";
      status.classList.toggle("ppq-problem-error", draft.state === "error");
    };
    draft.paint = paint;
    const remember = () => { draft.message = message.value; if (type) draft.type = type.value; if (draft.state !== "sending") { draft.state = "draft"; paint(); } };
    message.addEventListener("input", remember); if (type) type.addEventListener("change", remember);
    close.addEventListener("click", () => this.closeModal());
    page.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (draft.state === "sending" || draft.state === "dispatched") return;
      remember();
      if (draft.message.length > message.maxLength) { status.textContent = "Please keep the optional note to 5000 characters or fewer."; message.focus(); return; }
      if (!types.includes(draft.type)) { status.textContent = "Please choose a problem type."; type.focus(); return; }
      const payload = {
        project: cfg.project, message: draft.type + ": " + (draft.message.trim() || "Please check this question: " + draft.source + "."), name: "", email: "",
        url: draft.url, ts: new Date().toISOString(), context: Object.assign({}, draft.context, { issue_type: draft.type })
      };
      draft.state = "sending"; paint();
      try {
        if (typeof window.fetch !== "function") throw new Error("Feedback unavailable");
        // Estate feedback protocol: text/plain avoids the Apps Script preflight.
        // An opaque no-cors response only confirms dispatch, not Sheet receipt.
        const response = await window.fetch(cfg.endpoint, { method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(payload) });
        if (response && response.type !== "opaque" && response.ok === false) throw new Error("Feedback rejected");
        draft.state = "dispatched";
      } catch (_) { draft.state = "error"; }
      draft.paint(); // Also update a form reopened while its request was pending.
    });
    body.innerHTML = ""; body.appendChild(page);
    const reminder = this.q(".ppq-modal-reminder"); if (reminder) reminder.textContent = "Report a display problem";
    const min = this.q(".ppq-modal-min"); if (min) min.style.display = "none";
    const badge = this.q(".ppq-modal-feedback-status"); if (badge) badge.style.display = "none";
    modal.classList.remove("minimized", "ppq-modal-analysis"); this.root.classList.remove("ppq-analysis-open");
    modal.classList.add("show", "ppq-modal-progress");
    paint(); (send.disabled ? close : send).focus();
    return true;
  };

  Viewer.prototype._startTimer = function () {
    if (this.cfg.timing) return this._startTiming(); /* d013 supersedes */
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
    if (this.cfg.timing) return this._commitTiming(); /* d013 supersedes */
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
    /* QoderWork 2026-07-22 (analyst handoff): per-prompt chosen states drive the
       v2 feedback match; the post-answer guess flag gates guess-aware feedback.
       VF-03/VF-02: when reviewing a previous attempt, the responses persisted on
       that attempt row are restored rather than reset, so the pop-up shows what
       was actually answered. */
    const reviewing = !!this._reviewingAttempt;
    const savedResponses = (reviewing && this._reviewingAttempt.responses) || {};
    this._analysisSelfReports = {};
    if (savedResponses.methods) {
      for (const mk in savedResponses.methods) {
        if (savedResponses.methods[mk] === "used") this._analysisSelfReports[mk] = "used";
      }
    }
    this._thingsUsedStates = Object.assign({}, savedResponses.things || {});
    this._promptStates = Object.assign({}, savedResponses.prompts || {});
    this._postGuessDeclared = reviewing && !!this._preGuessDeclaration;

    const self = this;
    const isV2 = this._isV2(rec);
    const reviewMode = this._analysisReviewMode();
    const iq = el("div", { class: "ppq-iq" });
    const sourceAdvisory = this._sourceAdvisoryEl ? this._sourceAdvisoryEl(this.cur) : null;
    if (sourceAdvisory) iq.appendChild(sourceAdvisory);

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

    if (labels.length >= 2 && !reviewing) {
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
    if (reviewing) {
      /* VF-03: make the mode unmistakable, and recap what was declared. */
      restPage.appendChild(el("div", { class: "ppq-iq-reviewing-note" },
        "Reviewing your earlier answer — nothing here records a new attempt."));
    }
    restPage.appendChild(this._verdictEl(rec, isV2, chosen, correctLetter, this._wasRight, reviewMode));
    if (reviewing) {
      const d = this._preGuessDeclaration;
      if (labels.length >= 2 || d) {
        let recap = "No guess was declared on this attempt.";
        if (d && d.candidate_options && d.candidate_options.length) {
          const pcts = d.candidate_percentages || {};
          recap = "You declared a guess between: " + d.candidate_options.map(function (L) {
            return pcts[L] != null ? (L + " (" + pcts[L] + "%)") : L;
          }).join(", ");
        }
        restPage.appendChild(el("div", { class: "ppq-iq-declaration-recap" }, esc(recap)));
      }
    }
    /* d012: part marks or a zero opens the structured what-went-wrong. */
    if (this._marksOutcome && !this._marksOutcome.full) {
      this._appendErrorTaxonomy(restPage);
    }

    let finishTarget = restPage;
    if (isV2) {
      let diagnosisTarget = restPage;
      let methodsTarget = restPage;
      let checksTarget = restPage;
      if (cfg.presentation && cfg.presentation.guidedReview) {
        diagnosisTarget = el("section", { class: "ppq-iq-section ppq-iq-section-diagnosis", ariaLabel: "What to notice" });
        diagnosisTarget.appendChild(el("h2", { class: "ppq-iq-section-title" }, "What to notice"));
        restPage.appendChild(diagnosisTarget);
        methodsTarget = el("section", { class: "ppq-iq-section ppq-iq-section-methods", ariaLabel: "Ways to solve it" });
        methodsTarget.appendChild(el("h2", { class: "ppq-iq-section-title" }, "Ways to solve it"));
        methodsTarget.appendChild(el("p", { class: "ppq-iq-section-intro" }, "Start with the first route. Open another route only if it helps."));
        restPage.appendChild(methodsTarget);
        checksTarget = el("section", { class: "ppq-iq-section ppq-iq-section-checks", ariaLabel: "Check your understanding" });
        checksTarget.appendChild(el("h2", { class: "ppq-iq-section-title" }, "Check your understanding"));
        restPage.appendChild(checksTarget);
        finishTarget = el("section", { class: "ppq-iq-section ppq-iq-section-finish", ariaLabel: "Reflect and finish" });
        finishTarget.appendChild(el("h2", { class: "ppq-iq-section-title" }, "Reflect and finish"));
        restPage.appendChild(finishTarget);
      }
      /* The pupil sees only the diagnostic question for the option they chose.
         The full reconstructed distractor table is available in review mode. */
      diagnosisTarget.appendChild(el("div", { class: "ppq-iq-selected-diagnostic" }));
      /* --- 3. the pupil insight (first_notice / why_it_matters / next_move) --- */
      this._appendInsightV2(diagnosisTarget, rec);
      /* --- 4. methods + the prompts that sit beside them (handoff #2 + #4) --- */
      const renderedPrompts = this._appendMethodsV2(methodsTarget, rec);
      /* --- 5. remaining self-report: orphan prompts + knowledge checks --- */
      this._appendSelfReportV2(checksTarget, rec, renderedPrompts);
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
    this._appendFreeformReflectionV2(finishTarget, rec);

    /* --- feedback lands here (reacts to the self-report + guess declaration) --- */
    finishTarget.appendChild(el("div", { class: "ppq-iq-feedback" }));

    /* --- the 1-6 self-rating, INSIDE the pop-up (was "back outside") --- */
    const rate = el("div", { class: "ppq-iq-rate" });
    rate.appendChild(el("div", { class: "ppq-iq-rate-prompt" }, esc(cfg.selfReport.prompt)));
    const scale = el("div", { class: "ppq-scale ppq-iq-scale" });
    const meanings = cfg.selfReport.meanings || [];
    for (let v = 1; v <= cfg.selfReport.levels; v++) {
      const lbl = cfg.selfReport.labels ? cfg.selfReport.labels[v - 1] : String(v);
      const meaning = meanings[v - 1] || "";
      /* d012: full marks prompts the 4/5/6 band — highlighted, others clickable. */
      const banded = this._marksOutcome && this._marksOutcome.full && v >= 4 && cfg.selfReport.levels === 6;
      scale.appendChild(el("button", { class: "ppq-scale-btn ppq-iq-scale-btn" + (banded ? " ppq-band" : ""), "data-val": String(v), title: meaning ? (v + " — " + meaning) : "" }, esc(lbl)));
    }
    rate.appendChild(scale);
    if (meanings.length) {
      rate.appendChild(el("div", { class: "ppq-scale-legend" }, meanings.map(function (mm, i) { return '<span class="ppq-scale-legend-item"><b>' + (i + 1) + "</b> " + esc(mm) + "</span>"; }).join("")));
    }
    const prior = this._reviewingAttempt ? this._reviewingAttempt.self_report : this.store.scores[cfg.idOf(this.cur)];
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
        self._saveRating(val);
        self._fireReport({ status: "rated", qtype: "self_report", extra_json: JSON.stringify({ rating: val }) });
      }
      iqNext.style.display = "inline-block"; iqNext.focus();
    });
    rate.appendChild(iqNext);
    finishTarget.appendChild(rate);

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
    if (this._syncAnalysisReminder) this._syncAnalysisReminder(); /* VF-13: includes the declared split */
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
      /* VF-03: reviewing paints nothing on the card behind — the question stays
         cleanly re-attemptable after the pop-up closes. */
      if (!reviewing) this._revealCommittedAnswer();
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
    /* d012: marks-based attempts carry a marks verdict, not a letter verdict. */
    const mo = this._marksOutcome;
    let headText;
    if (mo && !chosen) {
      headText = mo.awarded != null
        ? ("You gave yourself " + mo.awarded + " / " + mo.max +
           (mo.full ? " — got it right" : "") + (mo.sure ? "" : " (not sure)"))
        : ("You gave yourself " + mo.range[0] + "–" + mo.range[1] + " / " + mo.max + " (not sure)");
    } else {
      headText = "You chose " + (chosen || "?") +
        (isRight ? " — the right answer" : (correctLetter ? " — the answer is " + correctLetter : ""));
    }
    op.appendChild(el("div", { class: "ppq-iq-option-head" }, esc(headText)));
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
        if (self._attachResponseToAttempt) self._attachResponseToAttempt("diagnostic", fb.id || "selected_answer", choice[0]);
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
    /* VF-02: persist onto the attempt row, like the pre-verdict declaration. */
    const pgAttempts = ((this.store || {}).attempts) || [];
    for (let i = pgAttempts.length - 1; i >= 0; i--) {
      if (!this._attemptId || pgAttempts[i].attempt_id === this._attemptId) {
        pgAttempts[i].post_guess_declaration = payload;
        if (this._saveStore) this._saveStore();
        break;
      }
    }
    const btn = this._iqBox ? this._iqBox.querySelector(".ppq-iq-postguess-btn") : null;
    if (btn) { btn.textContent = "Recorded: " + payload.candidate_options.join(", ") + " ✓"; btn.classList.add("done"); }
    this._fireReport({ status: "interrogation", qtype: "guess_declaration", extra_json: JSON.stringify(payload) });
    if (this._syncAnalysisReminder) this._syncAnalysisReminder(); /* VF-13 */
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
    if (this._syncAnalysisReminder) this._syncAnalysisReminder(); /* VF-13 */
  };

  /* VF-13 (Smith 2026-07-29): the sticky bar carries everything the pupil
     needs while reading the analysis — question, topic, what they answered
     (letter or self-given marks) and the split they declared ("you should be
     able to see any other percentage that you gave"). One place, always
     current. */
  Viewer.prototype._syncAnalysisReminder = function () {
    const r = this.q(".ppq-modal-reminder");
    if (!r || !this.cur) return;
    const cfg = this.cfg;
    const parts = [cfg.metaLine(this.cur) || ""];
    if (cfg.analysisReminderGroup) {
      let g = "";
      try { g = cfg.groupLabel(this.cur) || ""; } catch (_) { g = ""; }
      if (g) parts.push(g);
    }
    if (this._chosenLabel) parts.push("you chose " + String(this._chosenLabel).toUpperCase());
    else if (this._marksOutcome) {
      const mo = this._marksOutcome;
      parts.push(mo.awarded != null
        ? ("you gave yourself " + mo.awarded + "/" + mo.max)
        : ("you gave yourself " + mo.range[0] + "–" + mo.range[1] + "/" + mo.max));
    }
    const d = this._preGuessDeclaration || this._postGuessDeclaration;
    if (d && d.candidate_options && d.candidate_options.length) {
      const pcts = d.candidate_percentages || {};
      parts.push("your split: " + d.candidate_options.map(function (L) {
        return pcts[L] != null ? (L + " " + pcts[L] + "%") : L;
      }).join(" / "));
    }
    r.textContent = parts.filter(Boolean).join("  ·  ");
  };

  /* QoderWork 2026-07-22 (analyst handoff): the v2 pupil insight, rendered
     faithfully (first_notice / why_it_matters / next_move). Labels are viewer
     chrome; the prose is the analysts' and is not rewritten. */
  Viewer.prototype._appendInsightV2 = function (iq, rec) {
    const pa = rec.pupil_analysis || {};
    if (!pa.first_notice && !pa.why_it_matters && !pa.next_move && !pa.check_prompt) return;
    const box = el("div", { class: "ppq-iq-insight" });
    if (pa.first_notice) box.appendChild(this._insightLine("First thing to notice", pa.first_notice));
    if (pa.why_it_matters) box.appendChild(this._insightLine("Why it matters", pa.why_it_matters));
    if (pa.next_move) box.appendChild(this._insightLine("Next move", pa.next_move));
    /* VF-13 (Smith 2026-07-29): the check_prompt used to float near the bottom
       as a bare question with nothing to click — "it just doesn't make sense".
       It is part of pupil_analysis, so it reads here, once, with the insight. */
    if (pa.check_prompt) box.appendChild(this._insightLine("Check yourself", pa.check_prompt));
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

    /* Phase 1.5 kept single-ref prompts beside their method. VF-13 (Smith
       2026-07-29, "we only ever want anyone to read something once") extends
       that to GROUP prompts: a prompt referencing several methods no longer
       renders once after the group (which forced re-reading the methods to
       answer it); instead EACH referenced method's foot carries a compact ask
       with the prompt's authored states, answered right where that method was
       read. */
    const afterMethod = {};
    const perMethodAsks = {};
    (rec.self_report_prompts || []).forEach((p) => {
      const refs = (p.method_refs || []).filter((r) => indexOf[r] !== undefined);
      if (!refs.length) return; /* orphan — the self-report section picks it up */
      if (refs.length === 1) {
        (afterMethod[indexOf[refs[0]]] = afterMethod[indexOf[refs[0]]] || []).push(p);
      } else {
        refs.forEach((r) => {
          (perMethodAsks[indexOf[r]] = perMethodAsks[indexOf[r]] || []).push(p);
        });
      }
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
      if ((afterMethod[i] || []).length || (perMethodAsks[i] || []).length) block.classList.add("ppq-iq-method-joined");
      let methodTarget = iq;
      if (i > 0 && this.cfg.presentation && this.cfg.presentation.compactAlternativeMethods) {
        const disclosure = el("details", { class: "ppq-iq-method-disclosure", "data-method-id": m.id || "" });
        disclosure.appendChild(el("summary", null,
          "Another " + (m.presentation_kind === "independent_check" ? "check" : "method") +
          ": " + esc(m.title || m.id)));
        methodTarget = el("div", { class: "ppq-iq-method-disclosure-body" });
        disclosure.appendChild(methodTarget);
        iq.appendChild(disclosure);
      }
      methodTarget.appendChild(block);
      (perMethodAsks[i] || []).forEach((p) => methodTarget.appendChild(self._promptMethodAskV2(p, m)));
      (afterMethod[i] || []).forEach((p) => methodTarget.appendChild(self._promptBlockV2(p, "method", true)));
    });

    return rendered;
  };

  /* VF-13: one referenced method's slice of a group prompt — the kind-aware ask
     ("Did you use this route?") with the prompt's AUTHORED states, so the pupil
     answers about the method they just read without re-reading anything. The
     authored combined wording stays available to reviewers. Fires the same
     self_report grammar plus method_ref; the plain prompt-id state is also kept
     current so feedback matching keeps working. */
  Viewer.prototype._promptMethodAskV2 = function (p, m) {
    const self = this;
    const splitKey = p.id + "::" + m.id;
    const box = el("div", {
      class: "ppq-iq-prompt ppq-iq-prompt-attached ppq-iq-prompt-permethod",
      "data-prompt-id": p.id,
      "data-method-ref": m.id,
      title: p.prompt || ""
    });
    if (this._analysisReviewMode()) {
      box.appendChild(el("div", { class: "ppq-iq-permethod-authored" }, analysisMathEsc(p.prompt || "")));
    }
    box.appendChild(el("div", { class: "ppq-iq-prompt-text" },
      esc(this._methodAskText(m.presentation_kind || "route"))));
    const chips = el("div", { class: "ppq-iq-prompt-states" });
    const prior = this._promptStates ? this._promptStates[splitKey] : null;
    (p.states || []).forEach((st) => {
      const chip = el("button", { class: "ppq-iq-state" + (prior === st ? " sel" : ""), type: "button", "data-state": st }, self._stateLabel(st));
      chip.addEventListener("click", () => {
        chips.querySelectorAll(".ppq-iq-state").forEach((c) => c.classList.remove("sel"));
        chip.classList.add("sel");
        self._promptStates[splitKey] = st;
        self._promptStates[p.id] = st; /* latest answer keeps feedback matching live */
        if (self._attachResponseToAttempt) self._attachResponseToAttempt("prompts", splitKey, st);
        self._fireReport({ status: "interrogation", qtype: "self_report", extra_json: JSON.stringify({ prompt_id: p.id, prompt_kind: "method", method_ref: m.id, state: st, attempt_id: self._attemptId || "" }) });
        self._renderInterrogationFeedback(box);
      });
      chips.appendChild(chip);
    });
    box.appendChild(chips);
    return box;
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
        if (self._attachResponseToAttempt) self._attachResponseToAttempt("methods", m.id, state);
        self._fireReport({ status: "interrogation", qtype: "self_report", extra_json: JSON.stringify({ method_id: m.id, method_ref: m.id, state: state }) });
      };
      /* VF-03/VF-02: restore a recorded yes/no on reopen. */
      const priorPick = (self._reviewingAttempt && self._reviewingAttempt.responses &&
        self._reviewingAttempt.responses.methods) ? self._reviewingAttempt.responses.methods[m.id] : null;
      if (priorPick === "used") yes.classList.add("on");
      else if (priorPick === "not_used") no.classList.add("on");
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

    /* VF-13: orphans read as deliberate whole-question asks, not lost furniture.
       (The check_prompt now lives with the insight block — see _appendInsightV2.) */
    const orphans = srps.filter((p) => !renderedIds.has(p.id));
    if (orphans.length) iq.appendChild(el("div", { class: "ppq-iq-subhead" }, "About the whole question"));
    orphans.forEach((p) => iq.appendChild(this._promptBlockV2(p, "method")));

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
      ["knew_but_did_not_need", "Known, but did not need it"],
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
    /* VF-03/VF-02: a state recorded on this attempt preselects explicitly;
       otherwise Known remains the implicit starting point. */
    const priorState = this._thingsUsedStates ? this._thingsUsedStates[item.id] : null;
    this._thingsUsedStatesV2().forEach((state, index) => {
      const cls = priorState
        ? (priorState === state[0] ? " sel" : "")
        : (index === 0 ? " sel implicit" : "");
      const btn = el("button", {
        class: "ppq-iq-thing-state" + cls,
        type: "button",
        "data-state": state[0]
      }, esc(state[1]));
      btn.addEventListener("click", () => {
        states.querySelectorAll(".ppq-iq-thing-state").forEach((b) => b.classList.remove("sel", "implicit"));
        btn.classList.add("sel");
        self._thingsUsedStates[item.id] = state[0];
        if (self._attachResponseToAttempt) self._attachResponseToAttempt("things", item.id, state[0]);
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
    /* VF-13 (Smith 2026-07-29): open by default — "things this question used
       should be expanded"; still collapsible. */
    const collapse = this.cfg.presentation && this.cfg.presentation.collapseKnowledgeChecks;
    const details = el("details", { class: "ppq-iq-things", open: collapse ? false : true });
    details.appendChild(el("summary", null,
      collapse ? ("Knowledge and techniques (" + items.length + ")") : "Things this question used"));
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
    /* VF-03: restore any note already saved on this attempt, so reopening shows
       what was written rather than a blank box. */
    const priorAttempts = (self.store && self.store.attempts) || [];
    for (let i = priorAttempts.length - 1; i >= 0; i--) {
      if (!self._attemptId || priorAttempts[i].attempt_id === self._attemptId) {
        if (priorAttempts[i].freeform_reflection) {
          textarea.value = priorAttempts[i].freeform_reflection;
          lastSaved = textarea.value;
        }
        break;
      }
    }
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

  /* d012 (Claude 2026-07-29): the structured what-went-wrong for marks-based
     attempts that fell short. Config-driven vocabulary (consumer taxonomy),
     the question's own subtopics as one-click weak-area chips (pre-highlighted
     when the consumer marks them weak), multi-select, an Other free text and a
     new-category proposal channel. Selections persist onto the attempt row. */
  Viewer.prototype._appendErrorTaxonomy = function (iq) {
    const self = this;
    const sa = this.cfg.selfAssess || {};
    const attempts = ((this.store || {}).attempts) || [];
    let prior = {};
    for (let i = attempts.length - 1; i >= 0; i--) {
      if (!this._attemptId || attempts[i].attempt_id === this._attemptId) {
        prior = (attempts[i].responses && attempts[i].responses.error_tags) || {};
        break;
      }
    }
    const box = el("div", { class: "ppq-iq-errtax" });
    box.appendChild(el("div", { class: "ppq-iq-errtax-head" }, "What went wrong? Tap everything that applies."));

    function chipRow(groupLabel, chips, kindTag) {
      if (!chips.length) return;
      const g = el("div", { class: "ppq-iq-errtax-group" });
      g.appendChild(el("div", { class: "ppq-iq-errtax-label" }, esc(groupLabel)));
      const row = el("div", { class: "ppq-iq-errtax-chips" });
      chips.forEach(function (c) {
        const value = typeof c === "string" ? c : c.value;
        const label = typeof c === "string" ? c : (c.label || c.value);
        const weak = typeof c === "object" && c.weak;
        const chip = el("button", {
          class: "ppq-iq-state ppq-iq-errtag" + (prior[value] ? " sel" : "") + (weak ? " weak" : ""),
          type: "button",
          "data-tag": value
        }, esc(label));
        chip.addEventListener("click", function () {
          const on = chip.classList.toggle("sel");
          if (self._attachResponseToAttempt) self._attachResponseToAttempt("error_tags", value, on ? true : undefined);
          self._fireReport({ status: "interrogation", qtype: "error_tag", extra_json: JSON.stringify({ tag: value, group: kindTag, on: on, attempt_id: self._attemptId || "" }) });
        });
        row.appendChild(chip);
      });
      g.appendChild(row);
      box.appendChild(g);
    }

    /* weak-area chips: the question's own content, one click to name the gap */
    if (sa.weakAreasOf && this.cur) {
      let areas = [];
      try { areas = sa.weakAreasOf(this.cur) || []; } catch (_) { areas = []; }
      chipRow("Weak area? (this question's content)", areas, "weak_area");
    }
    /* Smith 2026-07-29: a group can declare when(q) so it "only triggers when
       it's really there" (e.g. Stuck algebraically only on algebra content). */
    (sa.taxonomy || []).forEach(function (group) {
      if (typeof group.when === "function") {
        let applies = true;
        try { applies = !!group.when(self.cur); } catch (_) { applies = true; }
        if (!applies) return;
      }
      chipRow(group.group || "", group.tags || [], group.group || "");
    });

    /* escapes — Smith 2026-07-29: the new-category suggestion sits ABOVE Other. */
    const propose = el("div", { class: "ppq-iq-errtax-propose" });
    const proposeInput = el("input", { class: "ppq-iq-errtax-propose-text", type: "text", placeholder: "This list needs another category… (suggest it)" });
    const proposeSend = el("button", { class: "ppq-iq-errtax-save", type: "button" }, "Suggest");
    proposeSend.addEventListener("click", function () {
      const text = String(proposeInput.value || "").trim();
      if (!text) return;
      if (self._attachResponseToAttempt) self._attachResponseToAttempt("error_tags", "proposed_category", text);
      self._fireReport({ status: "interrogation", qtype: "taxonomy_proposal", extra_json: JSON.stringify({ proposal: text, attempt_id: self._attemptId || "" }) });
      proposeSend.textContent = "Sent";
    });
    propose.appendChild(proposeInput);
    propose.appendChild(proposeSend);
    box.appendChild(propose);

    const other = el("div", { class: "ppq-iq-errtax-other" });
    const otherInput = el("textarea", { class: "ppq-iq-errtax-other-text", rows: 2, placeholder: "Other — what happened, in your own words?" });
    if (typeof prior.other === "string") otherInput.value = prior.other;
    const otherSave = el("button", { class: "ppq-iq-errtax-save", type: "button" }, "Save");
    otherSave.addEventListener("click", function () {
      const text = String(otherInput.value || "").trim();
      if (self._attachResponseToAttempt) self._attachResponseToAttempt("error_tags", "other", text || undefined);
      self._fireReport({ status: "interrogation", qtype: "error_tag", extra_json: JSON.stringify({ tag: "other", text: text, attempt_id: self._attemptId || "" }) });
      otherSave.textContent = "Saved";
    });
    other.appendChild(otherInput);
    other.appendChild(otherSave);
    box.appendChild(other);

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
    /* VF-03/VF-02: preselect any state already recorded on this attempt, so a
       reopened question shows what was answered rather than blank chips. */
    const prior = self._promptStates ? self._promptStates[p.id] : null;
    (p.states || []).forEach((st) => {
      const wasPicked = multi
        ? (Array.isArray(prior) && prior.indexOf(st) >= 0)
        : prior === st;
      const chip = el("button", { class: "ppq-iq-state" + (wasPicked ? " sel" : ""), type: "button", "data-state": st }, self._stateLabel(st));
      chip.addEventListener("click", () => {
        if (multi) {
          chip.classList.toggle("sel");
          const sel = Array.prototype.map.call(chips.querySelectorAll(".ppq-iq-state.sel"), (c) => c.dataset.state);
          self._promptStates[p.id] = sel;
          if (self._attachResponseToAttempt) self._attachResponseToAttempt("prompts", p.id, sel.slice());
          self._fireReport({ status: "interrogation", qtype: "self_report", extra_json: JSON.stringify({ prompt_id: p.id, prompt_kind: kind, states: sel, attempt_id: self._attemptId || "" }) });
        } else {
          chips.querySelectorAll(".ppq-iq-state").forEach((c) => c.classList.remove("sel"));
          chip.classList.add("sel");
          self._promptStates[p.id] = st;
          if (self._attachResponseToAttempt) self._attachResponseToAttempt("prompts", p.id, st);
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
      knew_but_did_not_need: "Known, but did not need it",
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
    /* d016: prefer the consumer's own part label — derived ids can be slugged
       ("b_i"), and a pupil must read "(b)(i)". */
    const partLabel = (p) => (typeof cfg.partLabelOf === "function" && cfg.partLabelOf(p)) ||
      String(cfg.idOf(p)).slice(block.length).trim() || "(whole)";
    const partMarks = (p) => (typeof cfg.partMarksOf === "function" ? cfg.partMarksOf(p) : null);
    // mode toggle + chips
    const nav = el("div", { class: "ppq-wq-nav" });
    const questionLabel = cfg.structuredQuestionLabelOf && cfg.structuredQuestionLabelOf(q);
    nav.appendChild(el("span", { class: "ppq-wq-jump" }, cfg.compactQuestionHeader ? "Practise:" : (questionLabel ? esc(questionLabel) : "Question " + esc(block)) + ", jump to part:"));
    parts.forEach((p) => {
      const cur = cfg.idOf(p) === cfg.idOf(q);
      const m = partMarks(p);
      const chip = el("button", { class: "ppq-part-chip" + (cur ? " current" : ""), "data-id": cfg.idOf(p) },
        esc(partLabel(p)) + (m ? ' <span class="ppq-part-chip-marks">' + esc(String(m)) + "</span>" : ""));
      if (m) chip.setAttribute("title", partLabel(p) + ", " + m + " mark" + (m === 1 ? "" : "s"));
      if (cur) chip.setAttribute("aria-current", "step");
      chip.addEventListener("click", () => {
        if (cfg.structuredNavigationOnly && !self.view.some((item) => cfg.idOf(item) === cfg.idOf(p))) self.render(p);
        else self.goToId(chip.dataset.id);
      });
      nav.appendChild(chip);
    });
    // A consumer already showing its context can keep just the useful part
    // navigator, without an additional whole-question stack or mode switch.
    if (cfg.structuredNavigationOnly) { container.appendChild(nav); return; }
    const modeWrap = el("span", { class: "ppq-mode-toggle" });
    ["whole", "part"].forEach((m) => {
      const b = el("button", { class: "ppq-mode-btn" + (this._structMode === m ? " on" : ""), "data-mode": m }, m === "whole" ? "Whole question" : "Part by part");
      b.addEventListener("click", () => { self._structMode = m; localStorage.setItem(cfg.storageKey + "_structmode", m); self.render(); });
      modeWrap.appendChild(b);
    });
    nav.appendChild(modeWrap);
    container.appendChild(nav);

    if (this._structMode === "whole") {
      const details = el("details", { class: "ppq-whole" });
      /* Chemistry's rule, restored 2026-07-31 (it was lost in the Phase 3 port
         and Smith spotted its absence): `openAttr = isFirstPart ? '' : ' open'`
         — the whole question opens BY ITSELF whenever earlier parts exist, so
         from part (b) onwards you are looking at the stem and everything you
         have already been asked, every time, without opening anything. On the
         first part it stays shut, because the stem is right there above it. */
      const first = parts[0] && cfg.idOf(parts[0]) === cfg.idOf(q);
      details.open = !first;
      details.appendChild(el("summary", null,
        first ? ("Whole question (all " + parts.length + " parts)")
              : ("The stem and the earlier parts (all " + parts.length + " parts)")));
      /* Smith, 2026-08-02, on seeing the same pictures four times over: "all of
         this we've had before, some of it many times." When the consumer shows
         the printed pages at the top of the card, EVERY crop here is a second
         copy of something already on screen, so this becomes what it is useful
         as: a map of the question, one row per part with its marks, naming
         where you are. Where there are no printed pages (chemistry) it keeps
         the donor's crop stack unchanged. */
      const pagesShown = typeof cfg.stemPagesOf === "function" && (cfg.stemPagesOf(q) || []).length > 0;
      const wrap = el("div", { class: "ppq-wq-parts" + (pagesShown ? " ppq-wq-map" : "") });
      parts.forEach((p) => {
        const cur = cfg.idOf(p) === cfg.idOf(q);
        const box = el("div", { class: "ppq-wq-part" + (cur ? " current" : ""), "data-part-id": cfg.idOf(p) });
        const pm = partMarks(p);
        box.appendChild(el("div", { class: "ppq-wq-part-label" }, "Part " + esc(partLabel(p)) +
          (pm ? ", " + esc(String(pm)) + " mark" + (pm === 1 ? "" : "s") : "") + (cur ? " (you are here)" : "")));
        if (!pagesShown) cfg.cropsOf(p).forEach((s) => box.appendChild(el("img", { src: s, loading: "lazy" })));
        if (pagesShown) {
          const jump = el("button", { class: "ppq-btn-mini", type: "button", "data-id": cfg.idOf(p) }, cur ? "you are here" : "go to this part");
          if (cur) jump.disabled = true;
          else jump.addEventListener("click", () => self.goToId(cfg.idOf(p)));
          box.appendChild(jump);
        }
        wrap.appendChild(box);
      });
      details.appendChild(wrap);
      container.appendChild(details);
    }

    /* Original exam page(s), with the G:-copy peek-back heuristic (d001 note).
       Skipped entirely when the consumer supplies stemPagesOf, because the card
       now shows those pages at the TOP, open: two copies of the same pages, one
       of them collapsed at the foot of the page beside Reveal, is what led
       Smith to read "Show original exam page(s)" as "show the answer". */
    if (typeof cfg.stemPagesOf === "function" && (cfg.stemPagesOf(q) || []).length) return;
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
    /* VF-14r2 (Smith): the little question boxes live here too — one per
       question in the group, sharing the progress page's performance scores.
       d011: a group entirely outside the learned scope greys out. */
    const qscores = this._questionScores();
    this._availableQuestions().forEach((q) => this._groupKeys(q).forEach((k) => { /* d029: no filter scopes this board, so the whole reachable pool is the right one */
      if (!groups[k]) groups[k] = { label: cfg.groupLabelOf(k, q), total: 0, marks: [], ratings: this._zeroRatings(), qids: [], qscores: qscores, inScope: 0 };
      groups[k].total++;
      groups[k].qids.push(String(cfg.idOf(q)));
      if (this._questionInLearnedScope(q)) groups[k].inScope++;
    }));
    if (this._learnedScopeBiting()) Object.keys(groups).forEach((k) => { groups[k].unlearned = groups[k].inScope === 0; });
    this.store.attempts.forEach((a) => { const q = this.byId[a.id]; if (!q) return; this._groupKeys(q).forEach((key) => { const g = groups[key]; if (g) g.marks.push(a.correct === true || a.is_correct === "right"); }); });
    Object.keys(this.store.scores).forEach((id) => { const q = this.byId[id]; if (!q) return; this._groupKeys(q).forEach((key) => { const g = groups[key]; if (g && g.ratings[this.store.scores[id]] != null) g.ratings[this.store.scores[id]]++; }); });
    const keys = Object.keys(groups).sort((a, b) => { const ua = cfg.isUntagged(a), ub = cfg.isUntagged(b); if (ua !== ub) return ua ? 1 : -1; return a.localeCompare(b); });
    const content = this.q(".ppq-dash-content");
    const panel = content ? content.parentNode : null;
    const title = panel && panel.querySelector("h3");
    const subtitle = panel && panel.querySelector(".ppq-dash-sub");
    if (title) title.textContent = cfg.dashboardTitle;
    if (subtitle) subtitle.textContent = "One box per " + this._itemNoun(false) + " — grey until tried, then green to red by recent performance. Ticks/crosses and rating spread beneath. Click a group to filter.";
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
    /* d029: collapse AFTER filtering, exactly as filterQuestions does. Collapsing the
       whole bundle first and filtering afterwards is not the same operation: where a
       pair's two printings carry different topic tags, the global collapse can drop the
       one inside this topic and keep the one outside it, and the badge then undercounts
       a view that still holds the part. Found by the d029 release check. */
    const source = this._collapseLevelTwins(this.questions.filter((q) => this._matchesQuestionFilters(q, [filter.field])));
    const sourceIds = {};
    source.forEach((q) => { sourceIds[cfg.idOf(q)] = true; });
    const groups = {};
    /* VF-14r2: facet categories carry the little question boxes too. */
    const facetScores = this._questionScores();
    values.forEach((value) => {
      groups[value] = {
        label: (filter.friendlyLabels && filter.friendlyLabels[value]) || value,
        total: 0,
        marks: [],
        ratings: this._zeroRatings(),
        qids: [],
        qscores: facetScores
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
    source.forEach((q) => memberships(q).forEach((value) => { groups[value].total++; groups[value].qids.push(String(cfg.idOf(q))); }));
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
    const parentLabel = (facet.parent.friendlyLabels && facet.parent.friendlyLabels[facet.parentValue]) ||
      (representative ? cfg.groupLabelOf(facet.parentValue, representative) : facet.parentValue);
    const facetNoun = filter.facetNoun || "subtopics";
    if (title) title.textContent = parentLabel + " " + facetNoun;
    if (subtitle) subtitle.textContent = (typeof filter.facetSubtitleOf === "function" ? filter.facetSubtitleOf(facet.parentValue) : null) || filter.facetSubtitle ||
      ("Click a " + facetNoun.replace(/s$/, "") + " to practise it; click it again to show the whole topic.");

    const active = childSel.value || "ALL";
    let html = '<div class="ppq-dash-path"><button class="ppq-dash-back" type="button">All topics</button>' +
      '<span aria-hidden="true">&rsaquo;</span><strong>' + esc(parentLabel) + "</strong></div>" +
      '<div class="ppq-dash-overlap-note"><b>' + source.length + " " + esc(this._itemNoun(true)) + ".</b> " +
      esc((typeof filter.facetNoteOf === "function" ? filter.facetNoteOf(facet.parentValue) : null) || filter.facetNote || ("A " + this._itemNoun(false) + " may appear in more than one subtopic, so the counts below can overlap.")) +
      "</div>";
    if (active !== "ALL") {
      html += '<button class="ppq-facet-clear" type="button">Show all ' + esc(parentLabel) + "</button>";
      if (typeof filter.facetGuidanceOf === "function") {
        const guidance = filter.facetGuidanceOf(active);
        if (guidance && typeof guidance === "object") {
          const summary = typeof guidance.summary === "string" ? guidance.summary : "";
          const checks = Array.isArray(guidance.checks) ? guidance.checks.filter((check) => typeof check === "string" && check.trim()) : [];
          if (summary || checks.length) {
            html += '<details class="ppq-facet-guidance"><summary>Key tips</summary>' +
              (summary ? summary.split(/\n\s*\n/).map((paragraph) => "<p>" + esc(paragraph) + "</p>").join("") : "") +
              (checks.length ? "<ul>" + checks.map((check) => "<li>" + esc(check) + "</li>").join("") + "</ul>" : "") +
              "</details>";
          }
        }
      }
    }
    if (values.length) {
      html += values.map((value) =>
        this._catHtml(value, groups[value], "ribbonHeat", {
          filterIndex: facet.filterIndex,
          active: active === value
        })).join("");
    } else {
      html += '<div class="ppq-facet-empty">No reviewed ' + esc(facetNoun) +
        " are available for this topic yet.</div>";
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
      this._collapseLevelTwins(this.questions.filter((q) => col.includes(q))).forEach((q) => { const k = col.groupKey(q); if (!groups[k]) groups[k] = { label: col.groupLabel(q), total: 0, marks: [], ratings: this._zeroRatings(), seq: [] }; groups[k].total++; }); /* d029: collapse after the column's own scope */
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
      /* VF-14r2 (Smith): the little question boxes — one per question in the
         category, neutral until tried, then the continuous performance colour
         (4×-most-recent weighting, pale yellow at 0.2). */
      if (g.qids && g.qids.length) {
        const qs = g.qscores || {};
        const cap = 240;
        let boxes = "";
        g.qids.slice(0, cap).forEach(function (qid) {
          const s = qs[qid];
          boxes += s == null
            ? '<span class="ppq-qdot untried" title="' + esc(qid) + ' — not tried yet"></span>'
            : '<span class="ppq-qdot" style="background:' + perfColour(s) + '" title="' + esc(qid) + ' — ' + Math.round(s * 100) + '%"></span>';
        });
        if (g.qids.length > cap) boxes += '<span class="ppq-qcluster-more">+' + (g.qids.length - cap) + "</span>";
        inner += '<div class="ppq-qcluster ppq-dash-cluster">' + boxes + "</div>";
      }
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
    /* d011: unlearned categories stay visible but greyed. */
    const unlearned = g.unlearned ? " ppq-cat-unlearned" : "";
    if (facet) {
      const disabled = g.total === 0 ? ' disabled aria-disabled="true"' : "";
      return '<button class="ppq-cat ppq-facet-cat' + active + unlearned + '" type="button" data-fidx="' +
        facet.filterIndex + '" data-value="' + esc(k) + '"' + disabled + ">" +
        inner + "</button>";
    }
    return '<div class="ppq-cat' + active + unlearned + '" data-key="' + esc(k) + '">' + inner + "</div>";
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
    const facets = this.qa(".ppq-facet-cat");
    if (facets.length) {
      // Facet rows use data-value, not the broad topic's data-key. Match the
      // current part through the same projection and scope as their counts.
      // Highlight in place: the question's next step owns any automatic scroll.
      const q = this.cur;
      if (!q) return;
      facets.forEach((row) => {
        const index = Number(row.dataset.fidx), filter = this.cfg.filters[index];
        if (!Number.isInteger(index) || !filter || !filter.dashboardFacet || row.disabled ||
            !this._matchesQuestionFilters(q, [filter.field]) ||
            !this._filterValues(q, filter).includes(String(row.dataset.value))) return;
        clearTimeout(row._ppqPulseTimer);
        row.classList.remove("ppq-cat-fired");
        void row.offsetWidth;
        row.classList.add("ppq-cat-fired");
        row._ppqPulseTimer = setTimeout(function () {
          if (row.isConnected) row.classList.remove("ppq-cat-fired");
        }, 1400);
      });
      return;
    }
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
    this.store.attempts = []; this.store.scores = {}; this._saveStore();
    if (this.cfg.practiceSelection.enabled) { this._sessionHistory = []; this.filterQuestions(); this.renderDashboard(); }
    else if (this.cur) this.render();
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
    /* VF-03: leaving a review restores a clean live state — fresh attempt id
       (so a genuine re-attempt never reuses the reviewed one), no inherited
       declaration, and no verdict painted onto the still-answerable card. */
    const wasReviewing = !!this._reviewingAttempt;
    if (wasReviewing) {
      this._reviewingAttempt = null;
      this._attemptId = "att_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
      this._preGuessDeclaration = null;
      this._postGuessDeclared = false;
      this._chosenLabel = "";
      this._wasRight = false;
      this._marksOutcome = null; /* d012 */
    }
    /* Closing on the guess page is equivalent to skipping it: never strand an
       answered question with its verdict permanently hidden. */
    if (this._iqOpen && !wasReviewing) this._revealCommittedAnswer();
    this.q(".ppq-modal").classList.remove("show", "ppq-modal-analysis", "ppq-modal-progress");
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
    this._syncSideRating();
  };

  // --------------------------------------------------------------- keyboard
  Viewer.prototype._bindGlobalKeys = function () {
    const self = this;
    this._keyHandler = function (e) {
      if (!self._shouldHandleKey(e)) return;
      if (self.q(".ppq-modal").classList.contains("show") && e.key === "Escape") { self.closeModal(); return; }
      if (!self.cur) return;
      if (self.q(".ppq-modal").classList.contains("show") && !self._iqOpen) return;
      if (e.repeat && /^[0-9]$/.test(e.key)) { e.preventDefault(); return; }
      if (e.key === "Enter") {
        const control = e.target && e.target.closest && e.target.closest("button, a, summary");
        // Leave marks entry, preferences and disclosure controls to native activation.
        if (control && !control.matches(".ppq-next, .ppq-reveal, .ppq-iq-next, .ppq-option")) return;
        if (e.repeat) { e.preventDefault(); return; }
      }
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
          if (nb && nb.style.display !== "none") { e.preventDefault(); nb.click(); }
          return;
        }
        if (e.key === "ArrowLeft" || e.key === "ArrowRight") { self.closeModal(); }
      }
      if (e.key === "ArrowLeft") { self.prev(); return; }
      if (e.key === "ArrowRight") { self.next(); return; }
      if (e.key === "s" || e.key === "S") { if (!self.answered) self.skip(); return; }
      /* d012: number keys enter marks while the marks bar is open. */
      if (self._marksPending && /^[0-9]$/.test(e.key)) {
        const btn = self.q('.ppq-marksbar .ppq-mark-btn[data-mark="' + e.key + '"]');
        if (btn && !btn.disabled) btn.click();
        return;
      }
      if (e.key === "r" || e.key === "R") { if (!self.answered && !self._marksPending && (self._curType === "flashcard" || self._curType === "imageSelfMark" || self._curType === "marksSelfAssess")) self.reveal(); return; }
      if (e.key === "Enter") {
        if (self.answered) { e.preventDefault(); self.next(); }
        else if (!self._marksPending && (self._curType === "flashcard" || self._curType === "marksSelfAssess")) { e.preventDefault(); self.reveal(); }
        return;
      }
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
    if (e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey) return false;
    const t = e.target;
    /* QoderWork 2026-07-22 (analyst handoff): while the pupil is editing a field
       (e.g. typing a guess percentage that begins 1-8), do NOT let the global
       answer shortcuts fire. Return false for any editing target, even one inside
       the viewer. */
    if (t && (t.tagName === "INPUT" || t.tagName === "SELECT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return false;
    if (this.root.contains(t)) return true;
    return document.querySelectorAll(".ppq").length <= 1;
  };
  Viewer.prototype.destroy = function () {
    this._cancelQuestionImages();
    this._helpDestroyed = true;
    clearInterval(this._helpInterval);
    if (this._helpWake) {
      window.removeEventListener("focus", this._helpWake);
      document.removeEventListener("visibilitychange", this._helpWake);
    }
    this._helpPaintInbox = null;
    this._helpPaintForm = null;
    if (this._keyHandler) document.removeEventListener("keydown", this._keyHandler);
    if (this._resizeHandler) window.removeEventListener("resize", this._resizeHandler);
    if (this._sideRatingMedia && this._sideRatingMediaHandler) {
      if (this._sideRatingMedia.removeEventListener) this._sideRatingMedia.removeEventListener("change", this._sideRatingMediaHandler);
      else if (this._sideRatingMedia.removeListener) this._sideRatingMedia.removeListener(this._sideRatingMediaHandler);
    }
    this._stopTimer(); this.root.innerHTML = ""; this.root.classList.remove("ppq", "ppq-side-rating-open");
  };

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

  return { mount: function (root, opts) { opts = opts || {}; return new Viewer(root, opts.config, opts.questions, opts.meta, opts.report).init(); }, version: "0.19.0" };
})();
// build: 0.3.0, maintained by Codex
