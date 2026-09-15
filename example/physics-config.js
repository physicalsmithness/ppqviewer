/* Shared physics consumer. The assembler supplies only approved question and
   markscheme crops; whole-paper/page fallbacks are deliberately unsupported.
   This file is copied unchanged into each course's local preview folder. */
(function () {
  "use strict";

  var meta = window.PHYSICS_META || {};
  var questions = Array.isArray(window.PHYSICS_QUESTIONS) ? window.PHYSICS_QUESTIONS : [];
  var topics = meta.topics || {};
  var course = /^(ib|trilogy|preib)$/.test(meta.course) ? meta.course : "unknown";
  var analysis = meta.analysis || null;
  var analysisGroups = analysis && Array.isArray(analysis.groups) ? analysis.groups : [];
  var analysisAtoms = analysis && Array.isArray(analysis.atoms) ? analysis.atoms : [];
  var analysisTypes = analysis && Array.isArray(analysis.types) ? analysis.types : [];
  var atomLabels = {}, typeLabels = {};
  analysisAtoms.forEach(function (a) { atomLabels[a.code] = a.label + " (" + (a.display_code || a.code) + ")"; });
  analysisTypes.forEach(function (t) { typeLabels[t.code] = t.label; });
  var analysisByCode = {};
  var analysisGroupLabels = {}, a5GroupNumber = 0;
  // Number the available A5 groups once in authored order. Filtering by year
  // or paper must not renumber them, and the source taxonomy codes stay intact.
  analysisGroups = analysisGroups.filter(function (group) {
    return course !== "ib" || !/^A5\./.test(group.code) || questions.some(function (q) {
      return Array.isArray(q.analysis_groups) && q.analysis_groups.indexOf(group.code) >= 0;
    });
  });
  analysisGroups.forEach(function (group) {
    analysisByCode[group.code] = group;
    analysisGroupLabels[group.code] = (course === "ib" && /^A5\./.test(group.code) ? "A5." + (++a5GroupNumber) + " " : "") + group.label;
  });

  function unique(values) {
    return values.filter(function (value, index, all) {
      return value != null && value !== "" && all.indexOf(value) === index;
    });
  }
  function escapeHtml(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function topicCodes(q) { return Array.isArray(q.topic_codes) ? q.topic_codes : []; }
  function topicLabel(code) {
    if (code === "DATA") return topics[code] || "Data analysis and experimental method";
    if (!topics[code]) return code;
    if (course === "ib" && /^[A-E]\.?\d+$/.test(code)) return code.replace(".", "") + " " + topics[code];
    if (topics[code].toLowerCase() === String(code).toLowerCase() || topics[code] === "Paper " + code) return topics[code];
    return topics[code] + " (" + code + ")";
  }
  function marksKnown(q) { return Number.isInteger(q.marks) && q.marks > 0; }
  function isMcq(q) { return /^1A?$/.test(q.paper || "") && ["reviewed_source_key", "matched_source_key"].indexOf(q.answer_status) >= 0 && /^[A-D]$/.test(q.correct_option || ""); }
  function partLabel(q) { return /^(?:\(?whole\)?|)$/i.test(q.label || "") ? "" : String(q.label).replace(/\)\s+\(/g,")("); }
  function targetHeading(q) { return "Answer question " + (q.question_number || q.id) + partLabel(q); }
  function compareParts(a, b) {
    var left = partLabel(a).toLowerCase().match(/[a-z]+|\d+/g) || [];
    var right = partLabel(b).toLowerCase().match(/[a-z]+|\d+/g) || [];
    function rank(token, depth) {
      if (/^\d+$/.test(token)) return Number(token);
      if (depth > 0 && /^[ivxlcdm]+$/.test(token)) {
        var values = {i:1,v:5,x:10,l:50,c:100,d:500,m:1000}, total = 0;
        for (var n = 0; n < token.length; n++) total += values[token[n]] < (values[token[n + 1]] || 0) ? -values[token[n]] : values[token[n]];
        return total;
      }
      return null;
    }
    for (var i = 0; i < Math.min(left.length, right.length); i++) {
      var l = rank(left[i], i), r = rank(right[i], i);
      var difference = l != null && r != null ? l - r : left[i].localeCompare(right[i], undefined, {numeric:true});
      if (difference) return difference;
    }
    return left.length - right.length || String(a.id).localeCompare(String(b.id), undefined, {numeric:true});
  }
  function images(q, field) { return Array.isArray(q[field]) ? q[field] : []; }
  function valuesFor(field) {
    return unique(questions.map(function (q) { return q[field] == null ? "" : String(q[field]); }))
      .sort(function (a, b) { return a.localeCompare(b, undefined, { numeric: true }); });
  }

  var availableTopics = unique(questions.reduce(function (all, q) { return all.concat(topicCodes(q)); }, []));
  var topicValues = unique(Object.keys(topics).concat(availableTopics)).filter(function (code) {
    return availableTopics.indexOf(code) >= 0;
  });
  var topicLabels = {};
  topicValues.forEach(function (code) { topicLabels[code] = topicLabel(code); });

  // Only launch on topics actually present. Invalid query values cannot produce
  // an inexplicably empty viewer, and A.1 links also work for an A1 catalogue.
  function normalizeCode(code) { return String(code).replace(/[.\s]/g, "").toUpperCase(); }
  var requested = new URLSearchParams(window.location.search).get("topic") || meta.default_topic || "";
  var launchTopics = unique(requested.split(",").map(function (value) {
    if (course === "ib" && normalizeCode(value) === "1B" && topicValues.indexOf("DATA") >= 0) return "DATA";
    return topicValues.find(function (code) { return normalizeCode(code) === normalizeCode(value); });
  }).filter(Boolean));
  var topicFilter = {
    field: "topic_codes", label: "topic", allLabel: "All topics", multi: !analysisGroups.length,
    values: topicValues, friendlyLabels: topicLabels
  };
  if (launchTopics.length) topicFilter.default = topicFilter.multi ? launchTopics : launchTopics[0];
  var filters = [topicFilter];
  function analysisValuesForTopic(entries, topic) {
    return entries.filter(function (entry) { return entryInTopic(entry, topic); })
      .map(function (entry) { return entry.code; });
  }
  // QoderWork 2026-09-14: one topic-attribution rule, shared by the filters and
  // the "also studied" co-strand panel, so a strand's descriptors are exactly the
  // groups/atoms the filters would show for that topic. Non-IB courses, and any
  // topic without a recognisable A-E prefix, keep every entry.
  function entryInTopic(entry, topic) {
    var wanted = /^([A-E])\.?([0-9]+)/.exec(String(topic));
    if (course !== "ib" || !wanted) return true;
    var own = /^([A-E])\.?([0-9]+)/.exec(entry.topic || entry.code);
    return !!(own && own[1] === wanted[1] && own[2] === wanted[2]);
  }
  // Directly assessed type membership is separate from optional/required uses.
  if (analysisAtoms.length) {
    filters.push({field:"analysis_atoms", label:"question type", allLabel:"All question types",
      values:function (source, topic) { return analysisValuesForTopic(analysisAtoms, topic); }, friendlyLabels:atomLabels,
      dependsOn:"topic_codes", hideUntilParent:true, dashboardFacet:true, facetNoun:"question types",
      facetSubtitle:"Choose the question type you want to practise.",
      facetNote:"Counts refer to directly assessed parts. One part may assess more than one type.",
      facetSubtitleOf:function (topic) {
        var counts = (meta.topic_mapping_counts || {})[topic];
        return counts && counts.typed_parts === 0 ? "Practise all questions while question types are being added." : "Choose the question type you want to practise.";
      },
      facetNoteOf:function (topic) {
        var counts = (meta.topic_mapping_counts || {})[topic];
        if (counts && counts.typed_parts === 0) return "Question types are being added. All available questions can be practised now.";
        return "Counts refer to directly assessed parts. One part may assess more than one type." +
          (counts && counts.typed_parts < counts.parts ? " Some questions still need a type. Choose All question types to include them." : "");
      },
      facetGuidanceOf:function (code) { var a = analysisAtoms.find(function (item) { return item.code === code; }); return a ? {summary:[a.summary,a.classification_note].filter(Boolean).join("\n\n"),checks:a.checks || []} : null; }});
    filters.push({field:"analysis_types", label:"detail", allLabel:"All details",
      values:function (source, atom) { return analysisTypes.filter(function (t) { return atom === "ALL" || t.parent_atom === atom; }).map(function (t) { return t.code; }); }, friendlyLabels:typeLabels,
      dependsOn:"analysis_atoms", hideUntilParent:true, dashboardFacet:true, facetNoun:"details"});
  }
  if (analysisGroups.length) {
    filters.push({field:"analysis_groups", label:"question group", allLabel:"All question groups",
      values:function (source, topic) { return analysisValuesForTopic(analysisGroups, topic); }, friendlyLabels:analysisGroupLabels,
      dependsOn:"topic_codes", hideUntilParent:true, dashboardFacet:true, facetNoun:"question groups",
      focusGuidanceOnSelect:course === "ib",
      facetSubtitle:"Choose a group to practise. Your marks and confidence build its progress record.",
      facetNote:"Counts refer to question parts. A part can belong to more than one group.",
      facetGuidanceOf:function (code) {
        var group = analysisByCode[code];
        if (!group) return null;
        // Preserve the authored words while breaking long guidance into short paragraphs.
        var sentences = String(group.summary || "").replace(/([.!?])\s+(?=[A-Z])/g, "$1\n").split("\n");
        var paragraphs = [];
        for (var i = 0; i < sentences.length; i += 2) paragraphs.push(sentences.slice(i, i + 2).join(" "));
        return {summary:paragraphs.join("\n\n"),checks:group.checks || []};
      }
    });
  }
  if (course === "ib") {
    var yearBands = [
      {value:"2004-2009",label:"2004–2009",first:2004,last:2009},
      {value:"2010-2015",label:"2010–2015",first:2010,last:2015},
      {value:"2016-2020",label:"2016–2020",first:2016,last:2020},
      {value:"2021-2025",label:"2021–2025",first:2021,last:2025}
    ];
    var yearBandLabels = {};
    yearBands.forEach(function (band) { yearBandLabels[band.value] = band.label; });
    // These are practice groupings only: original paper/year stay unchanged in
    // the source label, marks, answer type, saved attempts and source records.
    filters.push({field:"practice_paper",label:"paper",allLabel:"All papers",values:["1","2"],
      friendlyLabels:{"1":"Paper 1","2":"Paper 2 (including former Paper 3)"},
      valueOf:function (q) {
        var paper = String(q.paper == null ? "" : q.paper).trim().toUpperCase();
        return /^(1|1A|1B)$/.test(paper) ? "1" : /^(2|3)$/.test(paper) ? "2" : "";
      }
    });
    filters.push({field:"year_range",label:"year range",allLabel:"All year ranges",
      values:yearBands.map(function (band) { return band.value; }),friendlyLabels:yearBandLabels,
      valueOf:function (q) {
        var year = Number(q.year);
        var band = Number.isInteger(year) && yearBands.find(function (candidate) { return year >= candidate.first && year <= candidate.last; });
        return band ? band.value : "";
      }
    });
  }
  (course === "ib" ? ["level"] : ["paper", "year", "level"]).forEach(function (field) {
    var values = valuesFor(field);
    if (!values.length) return;
    var labels = {};
    values.forEach(function (value) {
      labels[value] = field === "paper" ? "Paper " + value : field === "level"
        ? ({ HL: "Higher level", SL: "Standard level", HLSL: "HL and SL", H: "Higher tier", F: "Foundation tier" }[value] || value)
        : value;
    });
    filters.push({ field: field, label: field, allLabel: "All " + (field === "level" ? "levels" : field + "s"), values: values, friendlyLabels: labels });
  });

  // The shared engine discovers siblings from parent(label) IDs. Enable its
  // navigator only when every prefix match really belongs to that parent.
  var siblings = {};
  questions.forEach(function (q) {
    if (q.parent_id) (siblings[q.parent_id] || (siblings[q.parent_id] = [])).push(q);
  });
  var structuredParents = {};
  Object.keys(siblings).forEach(function (parent) {
    var children = siblings[parent];
    var matches = questions.filter(function (q) { return q.id === parent || String(q.id).indexOf(parent + "(") === 0; });
    if (children.length > 1 && matches.length === children.length && matches.every(function (q) {
      return q.parent_id === parent;
    })) structuredParents[parent] = true;
  });

  var identityClient = course === "ib" && window.PhysicsIdentity && typeof window.PhysicsIdentity.create === "function"
    ? (window.physicsIdentity || (window.physicsIdentity = window.PhysicsIdentity.create())) : null;
  // QoderWork 2026-09-14: "also studied" co-strand panel. topic_codes[0] is the
  // part's primary strand (the same one groupKey uses for progress); the rest are
  // co-strands added by review. For each strand, name the topic and, where the
  // reviewed analysis attached one, its family descriptor, so a part reached
  // through a minor strand still states what it mainly assesses. Single-topic
  // parts return null and the panel stays hidden.
  function strandDescriptors(q, topic) {
    var groups = (Array.isArray(q.analysis_groups) ? q.analysis_groups : [])
      .map(function (code) { return analysisByCode[code]; })
      .filter(function (group) { return group && entryInTopic(group, topic); })
      .map(function (group) { return analysisGroupLabels[group.code] || group.label || group.code; });
    if (groups.length) return groups;
    return (Array.isArray(q.analysis_atoms) ? q.analysis_atoms : [])
      .map(function (code) { return analysisAtoms.find(function (atom) { return atom.code === code; }); })
      .filter(function (atom) { return atom && entryInTopic(atom, topic); })
      .map(function (atom) { return atomLabels[atom.code] || atom.label || atom.code; });
  }
  function alsoStudied(q) {
    var codes = topicCodes(q);
    if (codes.length < 2) return null;
    return {
      label: "This part is studied in " + codes.length + " topics",
      items: codes.map(function (code, index) {
        var descriptors = strandDescriptors(q, code);
        return {
          text: (index === 0 ? "Main: " : "Also: ") + topicLabel(code) +
            (descriptors.length ? " — " + descriptors.join("; ") : ""),
          primary: index === 0
        };
      })
    };
  }
  window.PPQ_CONFIG = {
    title: course === "ib" ? "IB Physics past-paper question viewer" : meta.title || "Physics past-paper practice", // QoderWork 2026-09-14
    versionLabel: course === "ib" ? "" : meta.release ? "Past-paper practice" : "Local preview",
    appVersion: "physics-local-1.0.0",
    storageKey: "physics_ppq_" + course + "_v1",
    learnerId: identityClient ? (identityClient.current().anonymous_id || "local") : "local",
    defaultOrder: course === "ib" ? "shuffle" : "ordered",
    shuffleGroupKeyOf: course === "ib" ? function (q) { return q.parent_id || q.id; } : null,
    sideRating: { enabled: false },
    questionTools: { dock: course === "ib", resetInPreferences: course === "ib" },
    compactQuestionHeader: course === "ib",
    questionLoading: { enabled: course === "ib" },
    teacherHelp: course === "ib" ? {
      // Verified deployment of the existing TeacherViewer responses project.
      // An explicit Send includes the pupil's question, reference and public link.
      endpoint: "https://script.google.com/macros/s/AKfycbygTx2TEpXvqECcWT0mbVhn_Jc_emoT3tk1iKD3EkmgJAv__vSW_oixb8RAlEFyjpRt/exec",
      project: "physics-ppq-ib",
      label: "Ask your teacher",
      introduction: "This is experimental. Ask about this question, then check back here for replies. Your teacher may reply directly. Notifications are planned. A teacher may publish the question and answer for everyone, without your name.",
      receivedText: "Your question has been received. This is experimental: check back here for replies. Your teacher may reply directly. Notifications are planned.",
      sourceLabelOf: function (q) {
        return [q.source_label || [q.year, "Paper " + q.paper, q.level].join(" · "),
          "Question " + (q.question_number || q.id) + partLabel(q)].join(" · ");
      },
      sourceUrlOf: function () { return "https://physicalsmithness.github.io/ibphysicsppqs/"; }
    } : null,
    problemReport: {
      // Existing estate feedback service; reporting runs only on Send report.
      endpoint: "https://script.google.com/macros/s/AKfycbwMbhGFHSd2D1IwpnDlYhbVNLqc7IBk88iDUQcjYHZGPLAnNvVLq4QRm6lMFSM8nqrkfQ/exec",
      project: "physics-ppq-" + course,
      sourceLabelOf: function (q) {
        var source = q.source_label || [q.year, q.paper ? "Paper " + q.paper : "", q.level].filter(Boolean).join(" · ");
        return [source, q.question_number ? "Question " + q.question_number + partLabel(q) : q.id].filter(Boolean).join(" · ");
      },
      contextOf: function (q) {
        return { course:course, source_part_id:q.source_part_id || "", parent_id:q.parent_id || "", year:q.year,
          paper:q.paper, source_level:q.level, question_number:q.question_number, part_label:q.label,
          topic_codes:topicCodes(q), analysis_groups:q.analysis_groups || [],
          question_images:images(q,"question_images"), context_images:images(q,"context_images"), markscheme_images:images(q,"markscheme_images") };
      }
    },
    prefetchAhead: 3,
    questionScrollContainer: ".ppq-centre",
    structuredNavBeforeStem: true,
    structuredNavigationOnly: true,
    structuredQuestionLabelOf: function (q) { return "Question " + (q.question_number || ""); },
    targetPartHeadingOf: targetHeading,
    questionFinder: true,
    finderPreserveFilters: true,
    attemptHistory: { enabled: course === "ib", defaultVisible: true },
    practiceSelection: { enabled: course === "ib", defaultMode: "mix" },
    learnerLevel: { enabled: course === "ib", defaultValue: "HL" },
    questionBadgesOf: course === "ib" ? function (q) {
      var badges = [];
      if (topicCodes(q).indexOf("A.5") >= 0) badges.push({ label:"Current: HL", level:"HL", title:"A5 is higher-level content in the current IB syllabus." });
      var currentLevels = unique(Object.keys(q.current_topic_levels || {}).filter(function (topic) { return topicCodes(q).indexOf(topic) >= 0; }).map(function (topic) { return q.current_topic_levels[topic]; }));
      if (topicCodes(q).indexOf("A.5") < 0 && currentLevels.length === 1) badges.push({label:"Current: " + (currentLevels[0] === "HLSL" ? "HL/SL" : currentLevels[0]),level:currentLevels[0],title:"Current syllabus level from the reviewed topic classification."});
      if (/^(HL|SL|HLSL)$/.test(q.level || "")) badges.push({ label:"Original paper: " + (q.level === "HLSL" ? "HL/SL" : q.level), level:q.level, title:"The level printed on this original exam paper; historical option-paper levels can differ from the current syllabus." });
      return badges;
    } : null,
    itemNoun: course === "ib" ? "part" : "question",
    filters: filters,
    presentation: { enabled: true, compactMobileFilters: true, plainGuessLanguage: true, plainStatusLabels: true },
    // Current practice pace, rather than the duration of a historical paper.
    // Evidence and original 2025 cover checks: reports/ib-physics-timing-evidence.md.
    timing: {
      defaultMode: "none",
      description: course === "ib" ? "Current IB practice pace: Paper 1 and data analysis, 2 minutes per mark; written questions, HL 1 minute 40 seconds or SL 1 minute 48 seconds per mark. Extra time applies to these targets." : "",
      targetOf: course === "ib" ? function (q, context) {
        if (!marksKnown(q)) return null;
        var paperOne = /^(1|1A|1B)$/.test(q.paper || "") || topicCodes(q).indexOf("DATA") >= 0;
        var secondsPerMark = paperOne ? 120 : context && context.learnerLevel === "SL" ? 108 : 100;
        return q.marks * secondsPerMark;
      } : null
    },
    idOf: function (q) { return q.id; },
    sort: function (a, b) {
      return Number(b.year || 0) - Number(a.year || 0) ||
        String(a.paper || "").localeCompare(String(b.paper || ""), undefined, { numeric: true }) ||
        String(a.parent_id || a.id).localeCompare(String(b.parent_id || b.id), undefined, { numeric: true }) ||
        compareParts(a, b);
    },
    groupKey: function (q) { return topicCodes(q)[0] || "UT_physics"; },
    groupKeysOf: topicCodes,
    groupLabelOf: function (code) { return topicLabel(code); },
    groupLabel: function (q) { return topicCodes(q).length ? topicLabel(topicCodes(q)[0]) : "Topic not assigned"; },
    dashboardTitle: "Your physics practice",
    dashboardLayout: "single",
    progressAxes: [{ key: "topic", label: "By topic", valuesOf: topicCodes, labelOf: topicLabel }].concat(analysisGroups.length ? [{
      key:"question_group", label:"By question group", valuesOf:function (q) { return q.analysis_groups || []; },
      labelOf:function (code) { return analysisGroupLabels[code] || code; }
    }] : []).concat(analysisAtoms.length ? [
      {key:"question_type",label:"By question type",valuesOf:function(q){return q.analysis_atoms || [];},labelOf:function(c){return atomLabels[c] || c;}},
      {key:"question_detail",label:"By detail",valuesOf:function(q){return q.analysis_types || [];},labelOf:function(c){return typeLabels[c] || c;}}
    ] : []),
    metaLine: function (q) {
      var source = q.source_label || [q.year, q.paper ? "Paper " + q.paper : "", q.level].filter(Boolean).join(" · ");
      return [source,
        q.question_number ? "Question " + q.question_number : "", q.label,
        marksKnown(q) ? q.marks + " mark" + (q.marks === 1 ? "" : "s") : ""]
        .filter(Boolean).join(" · ");
    },
    tagsOf: function (q) { return topicCodes(q).map(topicLabel); },
    alsoStudiedOf: alsoStudied, // QoderWork 2026-09-14: co-strand panel, main strand first
    searchTermsOf: function (q) {
      return [q.id, q.parent_id, q.source_label, q.year, q.paper, q.level, q.question_number, q.label, q.question_text]
        .concat(topicCodes(q), topicCodes(q).map(topicLabel)).filter(Boolean);
    },
    questionType: function (q) { return isMcq(q) ? "mcq" : marksKnown(q) ? "marksSelfAssess" : "flashcard"; },
    choicesOf: function (q) { return isMcq(q) ? ["", "", "", ""] : []; },
    correctOf: function (q) { return isMcq(q) ? q.correct_option : ""; },
    answerKeyOf: function (q) { return isMcq(q) ? q.correct_option : ""; },
    marksOf: function (q) { return marksKnown(q) ? q.marks : null; },
    cropsOf: function (q) { return images(q, "question_images"); },
    msCropsOf: function (q) { return images(q, "markscheme_images"); },
    contextCropsOf: function (q) { return images(q, "context_images"); },
    stemUrlOf: function () { return null; },
    answerUrlOf: function () { return null; },
    questionTextOf: function (q) {
      var context = images(q, "context_images").filter(function (src) {
        return images(q, "question_images").indexOf(src) < 0;
      });
      var html = context.length ? '<details class="physics-context" open><summary>Context for question ' + escapeHtml(q.question_number || "") + '</summary><div class="physics-context-images">' + context.map(function (src) {
        return '<img class="ppq-crop" src="' + escapeHtml(src) + '" loading="lazy" alt="Original question context, including its figures">';
      }).join("") + "</div></details>" : "";
      if (q.question_text) {
        var text = '<div class="physics-transcription">' + escapeHtml(q.question_text) + "</div>";
        html += images(q, "question_images").length ? '<details><summary>Question transcription</summary>' + text + "</details>" : text;
      }
      return html;
    },
    noticesOf: function (q) {
      return (Array.isArray(q.practice_scope_notes) ? q.practice_scope_notes : [])
        .filter(function (text) { return typeof text === "string" && text.trim(); })
        .map(function (text) { return { tone: "info", label: "Practice focus", text: text.trim() }; });
    },
    markschemeOf: function (q) {
      var crops = images(q, "markscheme_images"), html = "";
      if (q.markscheme_text) {
        html = '<div class="physics-transcription">' + escapeHtml(q.markscheme_text) + "</div>";
        if (crops.length) html = '<details><summary>Markscheme transcription</summary>' + html + "</details>";
      }
      // Flashcard reveal does not call msCropsOf; append the approved images
      // here for records whose mark allocation is unknown.
      if (!marksKnown(q)) html += crops.map(function (src) {
        return '<img class="ppq-ms-crop" src="' + escapeHtml(src) + '" alt="Printed markscheme for this question">';
      }).join("");
      return html || (crops.length ? "" : "The markscheme for this question is not available in this preview.");
    },
    blockKeyOf: function (q) { return structuredParents[q.parent_id] ? q.parent_id : null; },
    partLabelOf: function (q) { return partLabel(q) || "Whole question"; },
    partMarksOf: function (q) { return marksKnown(q) ? q.marks : null; },
    attemptFields: function (q) {
      return { course: course, parent_id: q.parent_id, topic_codes: topicCodes(q), analysis_groups:q.analysis_groups || [], analysis_atoms:q.analysis_atoms || [], year: q.year, paper: q.paper, level: q.level };
    },
    selfAssess: { taxonomy: [], weakAreasOf: function (q) {
      return topicCodes(q).map(function (code) { return { value: code, label: topicLabel(code), weak: false }; });
    } },
    selfReport: { levels: 6, prompt: "C", autoReveal: course === "ib", meanings: [
      "No idea",
      "Only half understand",
      "Mostly understand",
      "Fully understand, but I might miss it tomorrow",
      "Fully understand, comfortable with this",
      "Trivial — never need to see this again"
    ] },
    modules: { structuredPaper: true, postQuestionReview: false }
  };
})();
