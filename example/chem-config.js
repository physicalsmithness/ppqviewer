/* Example consumer config: IB Chemistry, expressed in the shared ppqviewer schema.
   Ships alongside chemistry's ppqs.js (window.CHEM_PPQS). Nothing visual here; the
   engine draws all furniture (d003). This is the Phase 3 migration target: chemistry
   drops its bespoke ppq.js/ppq.html and loads the shared engine with this config.

   Storage: a new unified v2 key holding {attempts, scores}. The `migrate` hook seeds
   it from chemistry's existing namespaced keys the first time, so no pupil loses data. */
(function () {
  const DATA_BOOKLET_SECTIONS = [
    "01_some-relevant-equations.png", "02_physical-constants.png", "03_metric-si-multipliers.png",
    "04_unit-conversions-and-standard-conditions.png", "05_electromagnetic-spectrum.png", "06_names-of-the-elements.png",
    "07_periodic-table.png", "08_melting-and-boiling-points.png", "09_ionization-affinity-electronegativity.png",
    "10_atomic-and-ionic-radii.png", "11a_covalent-bond-lengths-single-bonds.png", "11b_covalent-bond-lengths-multiple-bonds.png",
    "12a_bond-enthalpies-single-bonds.png", "12b_bond-enthalpies-multiple-bonds.png", "13_thermodynamic-data-selected-compounds.png",
    "14_enthalpies-of-combustion.png", "15_colour-wheel-visible-spectrum.png", "16_lattice-enthalpies.png",
    "17_triangular-bonding-diagram.png", "18_acid-base-indicators.png", "19_standard-reduction-potentials.png",
    "20_infrared-data.png", "21_proton-nmr-data.png", "22_mass-spectral-fragments-lost.png", "23_uncertainties.png"
  ];

  // resolve the inline crop the way the donor did: file:/// paths only exist on Smith's
  // machine, so rewrite to the bundled local copy.
  function resolveCrop(q) {
    let img = q.crop_url;
    if (img && img.indexOf("file:///") === 0) img = "assets/crops/" + q.id + ".png";
    return img || q.page_url || null;
  }

  window.PPQ_CONFIG = {
    title: "Chemistry Driller, PPQ Viewer",
    versionLabel: "v3 · shared engine",
    appVersion: "ppqviewer-chem-3.0.0",
    storageKey: "chemistrydriller_ppq_v2",
    learnerId: "local",
    timingMode: "none",
    prefetchAhead: 3,

    // migrate pupils' existing progress from the v1 keys
    migrate: function (ls) {
      var scores = {}, attempts = [];
      try { scores = JSON.parse(ls.getItem("chemistrydriller_ppq_v1_scores")) || {}; } catch (e) {}
      var mcq = {};
      try { mcq = JSON.parse(ls.getItem("chemistrydriller_ppq_v1_mcq")) || {}; } catch (e) {}
      Object.keys(mcq).forEach(function (id) {
        attempts.push({ id: id, correct: !!mcq[id], is_correct: mcq[id] ? "right" : "wrong", chosen_option: null, time_ms: null, self_report: null, ts: null, app_version: "migrated-v1", context: { migrated: true } });
      });
      return { attempts: attempts, scores: scores };
    },

    filters: [
      { field: "paper", label: "paper", allLabel: "All papers", values: ["1A", "1B", "2"], friendlyLabels: { "1A": "Paper 1A (MCQ)", "1B": "Paper 1B (data/short)", "2": "Paper 2 (structured)" } },
      { field: "level", label: "level", allLabel: "All levels", values: ["HL", "SL"] }
    ],

    idOf: function (q) { return q.id; },

    // dashboard: preserve chemistry's two-column syllabus split (q05)
    dashboardTitle: "Mastery",
    dashboardLayout: "split",
    dashboardColumns: [
      { title: "Paper 1B Mastery", style: "ratingBoxes", includes: function (q) { return q.paper === "1B" && !!q.category_code; }, groupKey: function (q) { return q.category_code; }, groupLabel: function (q) { return (q.category_code + " " + (q.category_label || "")).trim(); } },
      { title: "Syllabus Overview", style: "ribbonHeat", includes: function (q) { return q.category_code && (q.category_code[0] === "S" || q.category_code[0] === "R"); }, groupKey: function (q) { return q.category_code; }, groupLabel: function (q) { return (q.category_code + " " + (q.category_label || "")).trim(); } }
    ],
    // groupKey used for click-to-filter (both columns key by category_code)
    groupKey: function (q) { return q.category_code || "UT"; },
    groupLabel: function (q) { return (q.category_code || "Untagged") + " " + (q.category_label || ""); },

    metaLine: function (q) { return q.id; },
    tagsOf: function (q) { return ["Paper " + q.paper, q.level + " (" + q.marks + "m)"]; },

    // question types: 1A is auto-marked MCQ, everything else is a reveal-markscheme flashcard
    questionType: function (q) { return q.paper === "1A" ? "mcq" : "flashcard"; },
    questionTextOf: function (q) { return q.question_text || ""; },
    choicesOf: function (q) { return (q.choices && q.choices.length === 4) ? q.choices : (q.choices || []); },
    answerKeyOf: function (q) { return q.answer_key; },
    markschemeOf: function (q) { return q.markscheme_text || ""; },
    examinerOf: function (q) { return q.examiner_report || ""; },
    cropsOf: function (q) { var c = resolveCrop(q); return c ? [c] : []; },
    stemUrlOf: function (q) { return q.page_url || null; },
    answerUrlOf: function (q) { return q.answer_url || null; },

    modules: {
      structuredPaper: true,
      math: true,
      referenceBooklet: { sections: DATA_BOOKLET_SECTIONS, assetPrefix: "assets/", periodicTableSection: 7 }
    },

    headerButtons: [
      { label: "⚛️ Periodic Table", open: "assets/07_periodic-table.png" },
      { label: "📖 Data Booklet", open: "assets/chemistry DataBook2025.pdf" }
    ],

    selfReport: { levels: 6, prompt: "Self-assess your competence (1 = lost, 6 = easy)" }
  };
})();
