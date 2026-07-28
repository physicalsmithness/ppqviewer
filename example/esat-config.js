/* Example consumer config: ESAT, expressed in the shared ppqviewer schema.
   This is what the ESAT app ships (alongside its esat_catalogue.js) once it migrates
   onto the shared engine (Phase 3). Nothing visual lives here: only field mappings,
   labels, grouping and which modules are on. The engine draws all furniture (d003).

   Storage key kept as the existing "esat_ppq_v1" so pupils' current scores survive
   (the shared store shape {attempts, scores} matches ESAT's own, so no data is orphaned). */
(function () {
  const META = window.ESAT_META || {};
  const topicName = {};
  (META.topics || []).forEach((t) => { topicName[t.code] = t.name; });
  const subjectLabels = { maths: "Maths", physics: "Physics", chemistry: "Chemistry", biology: "Biology" };
  const topicFriendly = {};
  (META.topics || []).forEach((t) => { topicFriendly[t.code] = t.code + " " + t.name; });

  window.PPQ_CONFIG = {
    title: "ESAT Prep, Past-Paper Viewer",
    versionLabel: "v2 · shared engine",
    appVersion: "ppqviewer-esat-2.0.0",
    storageKey: "esat_ppq_v1",
    learnerId: "local",
    timingMode: "none",
    prefetchAhead: 3,

    filters: [
      { field: "subject", label: "subject", allLabel: "All subjects", values: META.subjects, friendlyLabels: subjectLabels },
      { field: "assessment", label: "paper", allLabel: "All papers", values: META.assessments },
      { field: "topic_code", label: "topic", allLabel: "All topics", values: (META.topics || []).map((t) => t.code), friendlyLabels: topicFriendly },
      { field: "esat_in_spec", label: "spec", allLabel: "All In", values: META.specs, friendlyLabels: { in_spec: "In spec", out_of_spec: "Out of Spec" } }
    ],

    idOf: function (q) { return q.id; },
    sort: function (a, b) {
      return a.slug.localeCompare(b.slug) ||
        (parseInt(a.question_number, 10) - parseInt(b.question_number, 10)) ||
        String(a.part).localeCompare(String(b.part));
    },

    groupKey: function (q) { return q.topic_code ? q.topic_code : ("UT_" + q.subject); },
    groupLabel: function (q) {
      if (q.topic_code) return q.topic_code + " " + (q.topic || topicName[q.topic_code] || "");
      return "Untagged · " + (subjectLabels[q.subject] || q.subject);
    },
    isUntagged: function (k) { return String(k).indexOf("UT_") === 0; },

    dashboardTitle: "Topic mastery",
    dashboardLayout: "single",

    metaLine: function (q) {
      const m = (q.slug.match(/_s(\d+)$/) || [])[1];
      return q.assessment + " " + q.year + (m ? (" · S" + m) : "") + " · Q" + q.question_number + (q.part ? (" (" + q.part + ")") : "");
    },
    tagsOf: function (q) {
      const t = [subjectLabels[q.subject] || q.subject];
      if (q.topic) t.push(q.topic_code + " " + q.topic);
      if (q.q_type) t.push(q.q_type);
      if (q.esat_in_spec) t.push(q.esat_in_spec === "in_spec" ? "In spec" : "Out of Spec");
      return t;
    },

    // image-only stem with bare A..H labels (from q.option_labels / option_count)
    options: { mode: "labels" },
    correctOf: function (q) { return q.correct_answer || ""; },

    // keep ESAT's engine-ready flat attempt row fields
    attemptFields: function (q) {
      return { slug: q.slug, question_number: q.question_number, part: q.part, subject: q.subject, topic_code: q.topic_code };
    },

    // self-report: 1-to-6 default (d006); ESAT keeps the default scheme
    selfReport: { levels: 6, prompt: "How did that feel? (1 = lost, 6 = easy)" },

    modules: { postQuestionReview: false } // switched on in a later phase
  };
})();
