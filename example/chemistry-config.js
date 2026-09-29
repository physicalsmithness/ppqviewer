/* Chemistry's shared-viewer adapter. Data and assets are prepared by the
 * assembler; no source-text guessing, ID rewriting or network work happens here.
 * The older chem-config.js remains the donor comparison fixture. */
(function (window) {
  "use strict";

  var DATA_BOOKLET_SECTIONS = [
    "01_some-relevant-equations.png", "02_physical-constants.png", "03_metric-si-multipliers.png",
    "04_unit-conversions-and-standard-conditions.png", "05_electromagnetic-spectrum.png", "06_names-of-the-elements.png",
    "07_periodic-table.png", "08_melting-and-boiling-points.png", "09_ionization-affinity-electronegativity.png",
    "10_atomic-and-ionic-radii.png", "11a_covalent-bond-lengths-single-bonds.png", "11b_covalent-bond-lengths-multiple-bonds.png",
    "12a_bond-enthalpies-single-bonds.png", "12b_bond-enthalpies-multiple-bonds.png", "13_thermodynamic-data-selected-compounds.png",
    "14_enthalpies-of-combustion.png", "15_colour-wheel-visible-spectrum.png", "16_lattice-enthalpies.png",
    "17_triangular-bonding-diagram.png", "18_acid-base-indicators.png", "19_standard-reduction-potentials.png",
    "20_infrared-data.png", "21_proton-nmr-data.png", "22_mass-spectral-fragments-lost.png", "23_uncertainties.png"
  ];
  var own = function (object, key) { return Object.prototype.hasOwnProperty.call(object, key); };
  function list(value) { return Array.isArray(value) ? value : value ? [value] : []; }
  function unique(values) { return values.filter(function (value, index) { return value != null && value !== "" && values.indexOf(value) === index; }); }
  function escapeHtml(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (character) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[character];
    });
  }
  function textHtml(value) { return escapeHtml(value).replace(/\r\n?|\n/g, "<br>"); }

  /* Canonical catalogues may contain parent records with parts[]. Explicit
   * legacy_id preserves the published viewer identity; canonical part_id stays
   * on the record for provenance. Otherwise part_id is the viewer identity.
   * Refuse missing or duplicate IDs rather than manufacture a new identity. */
  function normalizeQuestions(records) {
    var result = [], seen = Object.create(null);
    function append(record) {
      if (typeof record.id !== "string" || !record.id.trim()) throw new Error("Chemistry question is missing a stable ID");
      if (seen[record.id]) throw new Error("Duplicate chemistry question ID: " + record.id);
      seen[record.id] = true;
      result.push(record);
    }
    list(records).forEach(function (record) {
      if (!record || typeof record !== "object") throw new Error("Invalid chemistry question record");
      if (!Array.isArray(record.parts) || !record.parts.length) {
        append(Object.assign({}, record, { id: record.legacy_id || record.id || record.part_id }));
        return;
      }
      record.parts.forEach(function (part) {
        var item = Object.assign({}, record, part, {
          id: part.legacy_id || part.part_id || part.id,
          parent_id: part.parent_id || record.id,
          question_number: part.question_number || record.question_number || record.question,
          stem_text: own(part, "stem_text") ? part.stem_text : (record.stem_text || record.question_text || record.text || ""),
          question_text: own(part, "question_text") ? part.question_text : (part.text || ""),
          marks: own(part, "marks") ? part.marks : null
        });
        delete item.parts;
        // Parent images are context, never silently relabelled as a part crop.
        ["question_images", "crops", "crop_url", "markscheme_images", "ms_crops", "answer_url"].forEach(function (key) {
          if (!own(part, key)) delete item[key];
        });
        // A whole MCQ is represented by one part with the parent's stable ID.
        // No other child may inherit the parent's answers or markscheme text.
        var wholePart = record.parts.length === 1 && item.id === record.id;
        ["markscheme_text", "choices", "answer_key", "correct_option"].forEach(function (key) {
          if (!own(part, key) && !wholePart) delete item[key];
        });
        if (!own(part, "context_images")) item.context_images = record.context_images || record.question_images || [];
        append(item);
      });
    });
    return result;
  }

  function parseLevels(raw) {
    var levels = unique(list(raw).reduce(function (all, value) {
      var text = String(value).trim().toUpperCase();
      if (/^(?:HLSL|SLHL|SL\s*[+/,&]\s*HL|HL\s*[+/,&]\s*SL)$/.test(text)) return all.concat(["SL", "HL"]);
      return /^(SL|HL)$/.test(text) ? all.concat(text) : all;
    }, []));
    return levels.length ? levels : ["UNKNOWN"];
  }
  function currentLevels(q) { return parseLevels(own(q, "current_levels") ? q.current_levels : q.current_level); }
  function originalLevels(q) { return parseLevels(q.level_availability || q.level); }

  function createConfig(options) {
    options = options || {};
    var questions = options.questions || [], meta = options.meta || {};
    var assetBase = options.assetBase || "";
    if (assetBase && !/\/$/.test(assetBase)) assetBase += "/";
    var names = meta.code_names || {};
    function asset(value) {
      if (typeof value !== "string" || !value.trim()) return null;
      value = value.trim();
      // file:/// sources must be copied and rewritten by the assembler first.
      if (/^(?:file:|[a-z]:[\\/]|javascript:|data:)/i.test(value) || /^\\/.test(value)) return null;
      if (/^https?:\/\//i.test(value) || /^\//.test(value)) return value;
      if (/^[a-z][a-z\d+.-]*:/i.test(value)) return null;
      return assetBase + value;
    }
    function assets(q, primary, alternatives) {
      var value = q[primary];
      if (!own(q, primary)) {
        (alternatives || []).some(function (field) {
          if (!own(q, field)) return false;
          value = q[field]; return true;
        });
      }
      return unique(list(value).map(asset).filter(Boolean));
    }
    function questionImages(q) { return assets(q, "question_images", ["crops", "crop_url"]); }
    function contextImages(q) { return assets(q, "context_images", []); }
    function markschemeImages(q) { return assets(q, "markscheme_images", ["ms_crops"]); }
    function marksKnown(q) { return Number.isInteger(q.marks) && q.marks > 0; }
    function answerKey(q) { return String(q.correct_option || q.answer_key || "").toUpperCase(); }
    function isMcq(q) { return /^(?:1A|1)$/.test(String(q.paper)) && /^[A-D]$/.test(answerKey(q)); }
    function partLabel(q) { return q.parent_id === q.id ? "" : q.label || q.part_label || (String(q.id).match(/\(.*$/) || [""])[0]; }
    function parentId(q) { return q.parent_id || String(q.id).split("(")[0].trim(); }
    function topicCodes(q) {
      return unique(list(q.topic_codes || q.topics).concat(q.category_code && /^[SR]/.test(q.category_code) ? q.category_code : []));
    }
    function skillCodes(q) { return unique(list(q.p1b_skill).concat(q.paper === "1B" && q.category_code && !/^[SR]/.test(q.category_code) ? q.category_code : [])); }
    function masteryCode(q) {
      // The assembler preserves the donor's explicit mastery category. Fine
      // skill tags remain searchable without splitting a pupil's old row.
      return q.paper === "1B" && q.category_code && !/^[SR]/.test(q.category_code)
        ? q.category_code : skillCodes(q)[0];
    }
    function groupCodes(q) { return unique(topicCodes(q).concat(skillCodes(q))); }
    function primaryGroup(q) { return (q.paper === "1B" && masteryCode(q)) || groupCodes(q)[0] || "Unclassified"; }
    function topicLabel(code) {
      if (names[code]) return names[code] + " (" + code + ")";
      var q = questions.find(function (item) { return item.category_code === code && item.category_label; });
      return q ? q.category_label + " (" + code + ")" : code;
    }
    function markingNote(q) {
      if (q.marking_differs === false || q.marking_differs === "no") return "";
      if (q.marking_note) return q.marking_note;
      return q.marking_differs === true || q.marking_differs === "yes"
        ? "This markscheme uses older marking conventions." : "";
    }
    var paperValues = unique(questions.map(function (q) { return String(q.paper || ""); }));
    var topicValues = unique(questions.reduce(function (all, q) { return all.concat(topicCodes(q)); }, []));
    var skillValues = unique(questions.reduce(function (all, q) { return all.concat(skillCodes(q)); }, []));
    var topicLabels = {};
    topicValues.forEach(function (code) { topicLabels[code] = topicLabel(code); });
    var filters = [
      { field: "paper", label: "paper", allLabel: "All papers", values: paperValues,
        friendlyLabels: { "1A": "Paper 1A (MCQ)", "1B": "Paper 1B (data/short)", "2": "Paper 2 (structured)" } },
      { field: "level", label: "original paper level", allLabel: "All original paper levels", values: unique(questions.map(function (q) { return q.level; })) }
    ];
    if (questions.some(function (q) { return !!q.level_availability; })) {
      filters.push({ field: "original_availability", label: "available in original papers", allLabel: "All original-paper availability",
        multi: true, values: ["SL", "HL", "UNKNOWN"], valueOf: originalLevels,
        default: options.learnerLevel === "SL" ? ["SL", "UNKNOWN"] : ["SL", "HL", "UNKNOWN"],
        friendlyLabels: { SL: "Available in SL papers", HL: "Available in HL papers", UNKNOWN: "Original availability unknown" } });
    }
    if (topicValues.length) filters.push({ field: "chemistry_topic", label: "topic", allLabel: "All topics",
      values: topicValues, friendlyLabels: topicLabels, valueOf: topicCodes });
    if (skillValues.length) {
      var skillLabels = {};
      skillValues.forEach(function (code) { skillLabels[code] = topicLabel(code); });
      filters.push({ field: "p1b_skill", label: "Paper 1B skill", allLabel: "All Paper 1B skills", values: skillValues,
        friendlyLabels: skillLabels, valueOf: skillCodes });
    }
    // Original printing level and present-day syllabus eligibility are different.
    // Unknown eligibility stays visible and explicitly labelled as unclassified.
    if (questions.some(function (q) { return currentLevels(q)[0] !== "UNKNOWN"; })) {
      filters.push({ field: "current_levels", label: "current syllabus level", allLabel: "All current syllabus levels",
        multi: true, values: ["SL", "HL", "UNKNOWN"], valueOf: currentLevels,
        default: options.learnerLevel === "SL" ? ["SL", "UNKNOWN"] : ["SL", "HL", "UNKNOWN"],
        friendlyLabels: { SL: "Suitable for SL", HL: "Suitable for HL", UNKNOWN: "Level not classified" } });
    }
    if (questions.some(function (q) { return !!q.spec_status; })) {
      filters.push({ field: "spec_status", label: "syllabus", allLabel: "All syllabus statuses", multi: true,
        values: ["current", "close", "mixed", "out", "unknown"], default: ["current", "close"],
        valueOf: function (q) { return q.spec_status || "unknown"; },
        friendlyLabels: { current: "Current syllabus", close: "Close to current syllabus", mixed: "Partly current", out: "Outside current syllabus", unknown: "Not yet reviewed" } });
    }

    return {
      title: meta.title || "Chemistry past-paper practice",
      versionLabel: "Shared PPQ viewer",
      appVersion: "ppqviewer-chemistry-1.0.0",
      storageKey: options.storageKey || "chemistrydriller_ppq_v2",
      learnerId: options.learnerId || "local",
      migrate: function (storage) {
        function readMap(key) {
          try { var value = JSON.parse(storage.getItem(key)); return value && typeof value === "object" && !Array.isArray(value) ? value : {}; }
          catch (_) { return {}; }
        }
        var sourceScores = readMap("chemistrydriller_ppq_v1_scores"), sourceMcq = readMap("chemistrydriller_ppq_v1_mcq");
        var scores = {}, attempts = [];
        Object.keys(sourceScores).forEach(function (id) {
          if (["__proto__", "prototype", "constructor"].indexOf(id) >= 0) return;
          var score = sourceScores[id];
          if (Number.isInteger(score) && score >= 1 && score <= 6) scores[id] = score;
        });
        Object.keys(sourceMcq).forEach(function (id) {
          if (typeof sourceMcq[id] !== "boolean") return;
          attempts.push({ id: id, correct: sourceMcq[id], is_correct: sourceMcq[id] ? "right" : "wrong",
            chosen_option: null, time_ms: null, self_report: null, ts: null,
            app_version: "migrated-v1", context: { migrated: true } });
        });
        // Old browser-local work has no verified learner or attempt timestamp.
        return { scores: scores, attempts: attempts, prefs: {} };
      },
      filters: filters,
      idOf: function (q) { return q.id; },
      groupKey: primaryGroup,
      groupKeysOf: groupCodes,
      groupLabel: function (q) { return topicLabel(primaryGroup(q)); },
      groupLabelOf: topicLabel,
      dashboardTitle: "Your chemistry practice",
      dashboardLayout: "split",
      dashboardColumns: [
        { title: "Paper 1B mastery", style: "ratingBoxes", includes: function (q) { return q.paper === "1B" && skillCodes(q).length > 0; },
          groupKey: masteryCode, groupLabel: function (q) { return topicLabel(masteryCode(q)); } },
        { title: "Syllabus overview", style: "ribbonHeat", includes: function (q) { return topicCodes(q).length > 0; },
          groupKey: function (q) { return topicCodes(q)[0]; }, groupLabel: function (q) { return topicLabel(topicCodes(q)[0]); } }
      ],
      progressAxes: [{ key: "topic", label: "By topic", valuesOf: topicCodes, labelOf: topicLabel },
        { key: "p1b_skill", label: "By Paper 1B skill", valuesOf: skillCodes, labelOf: topicLabel }],
      metaLine: function (q) { return q.source_label || q.id; },
      tagsOf: function (q) { return ["Paper " + q.paper, q.level || ""].filter(Boolean); },
      questionFinder: true,
      finderPreserveFilters: true,
      searchTermsOf: function (q) { return [q.id, q.parent_id, q.question_number, q.label, q.stem_text, q.lead_in, q.question_text].concat(topicCodes(q)); },
      defaultOrder: "ordered",
      shuffleGroupKeyOf: parentId,
      learnerLevel: { enabled: true, defaultValue: options.learnerLevel === "SL" ? "SL" : "HL" },
      levelTwins: { enabled: true, keyOf: function (q) {
        return q.cross_level_group_method === "self" ? null : q.cross_level_group_id || q.source_group_id || q.shared_group || null;
      }, levelOf: function (q) { return q.level; } },
      attemptHistory: { enabled: true, defaultVisible: true },
      practiceSelection: { enabled: true, defaultMode: "mix" },
      presentation: { enabled: true, compactMobileFilters: true, plainGuessLanguage: true, plainStatusLabels: true },
      questionLoading: { enabled: true, transcriptFallback: true },
      questionTools: { dock: true, resetInPreferences: true },
      compactQuestionHeader: true,
      structuredNavBeforeStem: true,
      structuredNavigationOnly: true,
      prefetchAhead: 3,
      timingMode: "none",
      blockKeyOf: parentId,
      partLabelOf: partLabel,
      partMarksOf: function (q) { return marksKnown(q) ? q.marks : null; },
      targetPartHeadingOf: function (q) { return q.question_number ? "Answer question " + q.question_number + partLabel(q) : "Answer " + q.id; },
      questionType: function (q) { return isMcq(q) ? "mcq" : marksKnown(q) ? "marksSelfAssess" : "flashcard"; },
      choicesOf: function (q) { return isMcq(q) ? (Array.isArray(q.choices) && q.choices.length === 4 ? q.choices.map(textHtml) : ["", "", "", ""]) : []; },
      answerKeyOf: answerKey,
      correctOf: answerKey,
      marksOf: function (q) { return marksKnown(q) ? q.marks : null; },
      cropsOf: questionImages,
      contextCropsOf: contextImages,
      msCropsOf: markschemeImages,
      stemUrlOf: function (q) { return asset(q.page_url); },
      answerUrlOf: function (q) { return asset(q.answer_url); },
      questionTextOf: function (q) {
        var html = "", context = contextImages(q).filter(function (src) { return questionImages(q).indexOf(src) < 0; });
        if (context.length) html += '<details class="chemistry-context"><summary>Question context</summary>' + context.map(function (src) {
          return '<img class="ppq-crop" src="' + escapeHtml(src) + '" loading="lazy" alt="Original question context">';
        }).join("") + "</details>";
        var stem = q.stem_text || q.stem || "", lead = q.lead_in || "", body = q.part_text != null ? q.part_text : (q.question_text || q.text || "");
        var transcript = "";
        if (stem) transcript += '<div class="chemistry-stem"><p>' + textHtml(stem) + "</p></div>";
        if (lead && lead !== stem) transcript += '<div class="chemistry-lead-in"><p>' + textHtml(lead) + "</p></div>";
        if (body) transcript += '<div class="chemistry-part-text"><p>' + textHtml(body) + "</p></div>";
        // Printed context and part crops lead; transcription remains available
        // as a cross-check without making the pupil read the same question twice.
        if (transcript) html += questionImages(q).length || context.length
          ? '<details class="chemistry-transcription" data-ppq-loading-transcript><summary>Question transcription</summary>' + transcript + "</details>"
          : transcript;
        return html;
      },
      markschemeOf: function (q) {
        var html = q.markscheme_text ? '<div class="chemistry-markscheme-text">' + textHtml(q.markscheme_text) + "</div>" : "";
        // Flashcards do not invoke the shared engine's image or era-note hooks.
        if (!isMcq(q) && !marksKnown(q)) {
          var note = markingNote(q);
          if (note) html = '<div class="ppq-notice ppq-notice-warn">' + textHtml(note) + "</div>" + html;
          html += markschemeImages(q).map(function (src) { return '<img class="ppq-ms-crop" src="' + escapeHtml(src) + '" alt="Printed markscheme">'; }).join("");
        }
        return html;
      },
      examinerOf: function (q) { return textHtml(q.examiner_comment || q.examiner_report || ""); },
      noticesOf: function (q) {
        var notices = [], labels = { close: "Related practice", mixed: "Partly outside the current syllabus", out: "Outside the current syllabus" };
        if (labels[q.spec_status]) notices.push({ tone: q.spec_status === "out" ? "warn" : "info", label: labels[q.spec_status], text: q.usable_if || "Check the current syllabus before using this question." });
        else if (q.usable_if) notices.push({ tone: "info", label: "Practice focus", text: q.usable_if });
        if (q.era_note) notices.push({ tone: "info", label: "Exam era", text: q.era_note });
        return notices;
      },
      markschemeNoteOf: markingNote,
      questionBadgesOf: function (q) {
        var levels = currentLevels(q);
        var badges = [{ label: "Original: " + (q.level || "unknown"), title: "The level printed on the source paper" }];
        if (q.level_availability) badges.push({ label: "Printings: " + list(q.level_availability).join("/"), title: "Source-paper printing availability; this is not a current-syllabus classification" });
        if (levels[0] !== "UNKNOWN") badges.push({ label: "Current: " + levels.join("/"), title: "Declared current-syllabus eligibility" });
        return badges;
      },
      attemptFields: function (q) { return { parent_id: parentId(q), paper: q.paper, level: q.level, current_levels: currentLevels(q), topic_codes: topicCodes(q) }; },
      selfReport: { levels: 6, prompt: "C", autoReveal: true },
      modules: { structuredPaper: true, math: true, postQuestionReview: false,
        referenceBooklet: { sections: DATA_BOOKLET_SECTIONS.slice(), assetPrefix: assetBase + "assets/", periodicTableSection: 7 } },
      headerButtons: [
        { label: "Periodic Table", open: assetBase + "assets/07_periodic-table.png" },
        { label: "Data Booklet", open: assetBase + "assets/chemistry DataBook2025.pdf" }
      ]
    };
  }

  window.ChemistryViewer = { createConfig: createConfig, normalizeQuestions: normalizeQuestions, currentLevelsOf: currentLevels };
})(window);
