/* Chemistry wrapper: the catalogue and shared engine own content and practice.
 * Local previews never send attempts; historical browser results are not replayed. */
(function () {
  "use strict";
  var meta = window.CHEMISTRY_META || {}, questions = window.CHEMISTRY_QUESTIONS;
  var root = document.getElementById("ppq-root"), gate = document.getElementById("chem-signin");
  var status = document.getElementById("chem-status"), classes = ["SL", "HL", "Test"];
  var cohortKey = "ppqviewer_chem_cohort_v1", viewer = null, starting = false;
  var live = meta.release === true && window.location.protocol === "https:" &&
    window.location.hostname === "physicalsmithness.github.io" &&
    /^\/chemistrydriller\/ppqviewer(?:\/|$)/.test(window.location.pathname) &&
    !new URLSearchParams(window.location.search).has("preview");
  var preview = !live;
  if (!Array.isArray(questions) || !questions.length || !window.ChemistryViewer || !window.SubjectIdentity || !window.PPQViewer) {
    status.textContent = "The question collection could not load. Reload the page to try again. Your saved progress has not changed.";
    return;
  }
  if (preview) {
    status.textContent = "Local preview · " + questions.length + " parts · saved separately · no teacher reporting";
    document.getElementById("chem-home").hidden = true;
  } else { status.hidden = true; }
  document.getElementById("chem-signin-note").textContent = live
    ? "New answers are sent to your teacher. Progress on this page stays in this browser."
    : "This preview does not send answers to your teacher. Progress is saved separately in this browser.";
  var identity = window.SubjectIdentity.create({ context:"chemistry", localKey:"chemistrydriller_identity_v1" });
  window.chemistryIdentity = identity;
  function valid(person) { return !!(person && person.signed_in && person.display_name && classes.includes(person.cohort)); }
  function mirror(person) {
    try {
      if (valid(person)) localStorage.setItem(cohortKey, person.cohort);
      else localStorage.removeItem(cohortKey);
    } catch (_) {}
  }
  // The old comparison cohort has no owner ID. It may prefill the form, but
  // cannot authenticate the pupil most recently chosen in another subject.
  var person = identity.current();
  if (!valid(person)) {
    try {
      var oldClass = localStorage.getItem(cohortKey);
      if (classes.includes(oldClass)) document.getElementById("chem-class").value = oldClass;
    } catch (_) {}
  }
  var reporter = window.PPQReporting && window.PPQReporting.create({
    enabled:live, projectTag:"ppqviewer_chemistry", reportingVersion:"chemistry-1",
    identity:identity, viewer:function () { return viewer; }, questions:questions
  });
  function show(person) {
    if (!valid(person)) {
      gate.hidden = false; root.hidden = true;
      document.getElementById("chem-name").value = person.display_name || "";
      return;
    }
    mirror(person);
    gate.hidden = true; root.hidden = false;
    document.getElementById("chem-person").textContent = person.display_name + " · " + person.cohort;
    document.getElementById("chem-signout").hidden = false;
    if (viewer || starting) return;
    starting = true;
    try {
      var config = window.ChemistryViewer.createConfig({questions:questions, meta:meta,
        storageKey:preview ? "chemistrydriller_ppq_preview_v1" : "chemistrydriller_ppq_v2",
        learnerLevel:person.cohort === "SL" ? "SL" : "HL"});
      config.learnerId = person.anonymous_id;
      // Preview cannot seed, overwrite or claim ownership of the old live store.
      if (preview) config.migrate = null;
      viewer = window.PPQViewer.mount(root, {config:config, questions:questions, meta:meta,
        report:reporter ? reporter.report : null});
      window.chemistryViewer = viewer;
      var id = new URLSearchParams(window.location.search).get("id");
      if (id && viewer.byId[id]) { viewer.clearAllFilters(); viewer.goToId(id); }
      else if (id) { status.hidden = false; status.textContent = "That question is not in this collection. Choose one of the available questions below."; }
    } catch (error) {
      root.hidden = true; status.hidden = false;
      status.textContent = "The viewer could not start. Reload the page to try again. Your original saved progress has not been changed.";
      console.error(error);
    } finally { starting = false; }
  }
  gate.addEventListener("submit", function (event) {
    event.preventDefault();
    var name = document.getElementById("chem-name").value.trim(), value = document.getElementById("chem-class").value;
    if (!name || !classes.includes(value)) return;
    show(identity.signIn(name, value));
  });
  document.getElementById("chem-signout").addEventListener("click", function () {
    identity.signOut(); mirror({}); window.location.reload();
  });
  // A different person or sign-out in another tab requires a fresh mount so
  // no in-progress answer can become the next pupil's attempt.
  var initial = null;
  identity.subscribe(function (next) {
    var key = [next.anonymous_id, next.display_name, next.cohort, next.signed_in].join("|");
    if (viewer && initial && key !== initial) { root.hidden = true; window.location.reload(); return; }
    initial = key;
    if (!viewer && !starting) show(next);
  });
  initial = [person.anonymous_id, person.display_name, person.cohort, person.signed_in].join("|");
  show(person);
})();
