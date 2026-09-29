/* Shared, browser-local identity, per SUBJECT (Fields d045).
   OPEN FORK, not a quiet one (chemistrydriller d015, Housing H2 2026-09-27):
   this is Special Relativity's app/physics-identity.js v2, sha256 prefix
   0a7ddcc249a304c3 (8,335 bytes; canonical copy ppqviewer/example/), with ONE
   change: the subject context is an option, create({ context }), defaulting to
   "physics". With the default it behaves exactly as v2. The v2 file hard-codes
   contexts.physics, so a chemistry page taking it verbatim would write its
   class over a pupil's physics class. Offered back upstream as v3.
   Every other line is v2's. Original header:
   Shared, browser-local physics identity. Canonical copy: ppqviewer/example/.
   No network, passwords, progress migration or inferred ownership of old results.
   Keep the estate key and unknown fields; never reuse its ambiguous flat cohort. */
(function (window) {
  "use strict";
  var KEY = "smithics_fields_identity_v1";
  function read(key) {
    try {
      var value = JSON.parse(window.localStorage.getItem(key) || "null");
      return value && typeof value === "object" && !Array.isArray(value) ? value : {};
    } catch (_) { return {}; }
  }
  function write(key, value) {
    try { window.localStorage.setItem(key, JSON.stringify(value)); return true; }
    catch (_) { return false; }
  }
  function clean(value) { return typeof value === "string" ? value.trim().replace(/\s+/g, " ") : ""; }
  function uuid() {
    if (window.crypto && window.crypto.randomUUID) return window.crypto.randomUUID();
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 | 0;
      return (c === "x" ? r : (r & 3 | 8)).toString(16);
    });
  }
  function matchingContext(shared, subject) {
    var context = shared.contexts && shared.contexts[subject];
    return context && context.anonymous_id === shared.anonymous_id &&
      clean(context.display_name) === clean(shared.display_name) ? context : {};
  }
  function samePerson(a, b) {
    return !!(clean(a.anonymous_id) && clean(a.display_name) &&
      clean(a.anonymous_id) === clean(b.anonymous_id) && clean(a.display_name) === clean(b.display_name));
  }
  function create(options) {
    options = options || {};
    var localKey = options.localKey || "";
    // v3: the subject whose class this page holds. v2's physics keys are kept
    // verbatim for physics, so existing physics sign-ins are untouched.
    var SUBJECT = options.context || "physics";
    var SIGNIN_KEY = "smithics_" + SUBJECT + "_signin_v1", EVENT = SUBJECT + "-identity-change";
    var fallback = null, signinFallback = null;
    function sharedRecord() { return fallback || read(KEY); }
    function save(shared) { fallback = write(KEY, shared) ? null : shared; }
    function signinRecord() { return signinFallback || read(SIGNIN_KEY); }
    function remember(shared) {
      var context = matchingContext(shared, SUBJECT), previous = signinRecord();
      if (!clean(shared.anonymous_id) || !clean(shared.display_name) ||
          (shared.signed_in !== false && !(shared.signed_in === true && clean(context.cohort)))) return;
      var record = {
        anonymous_id: clean(shared.anonymous_id), display_name: clean(shared.display_name),
        cohort: clean(context.cohort) || (samePerson(shared, previous) ? clean(previous.cohort) : ""),
        signed_in: shared.signed_in
      };
      if (JSON.stringify(previous) !== JSON.stringify(record)) {
        signinFallback = write(SIGNIN_KEY, record) ? null : record;
      }
    }
    function restoredShared() {
      var shared = sharedRecord(), confirmed = signinRecord();
      // Fields/ECM replace the estate blob with their four legacy fields.
      // Recover only omitted metadata for the exact person already confirmed
      // in physics. A deleted record, changed person or malformed context is
      // never permission to adopt a saved class or sign in.
      var contexts = shared.contexts;
      var contextsValid = contexts == null || (typeof contexts === "object" && !Array.isArray(contexts));
      var missingContext = contextsValid && (!contexts || !Object.prototype.hasOwnProperty.call(contexts, SUBJECT));
      var context = matchingContext(shared, SUBJECT);
      if (shared.signed_in === undefined && samePerson(shared, confirmed) &&
          typeof confirmed.signed_in === "boolean" && clean(confirmed.cohort) &&
          (missingContext || clean(context.cohort))) {
        shared.signed_in = confirmed.signed_in;
        if (missingContext) {
          shared.contexts = Object.assign({}, contexts);
          shared.contexts[SUBJECT] = {
            anonymous_id: shared.anonymous_id, display_name: shared.display_name, cohort: confirmed.cohort
          };
        }
        save(shared);
      }
      // False is also durable: an older writer dropping it must not undo an
      // explicit physics sign-out. Never derive this record from flat cohort.
      remember(shared);
      return shared;
    }
    function mirror(identity) {
      if (!localKey) return;
      var local = read(localKey);
      local.anonymous_id = identity.anonymous_id;
      local.name = identity.display_name;
      local.cohort = identity.cohort;
      local.signed_in = identity.signed_in;
      write(localKey, local);
    }
    function current() {
      var shared = restoredShared(), local = read(localKey || "srd_identity_v1");
      var hasSharedName = !!clean(shared.display_name);
      var context = matchingContext(shared, SUBJECT);
      // A signed-out shared person must not be resurrected from an old page flag.
      var useLocal = !hasSharedName && shared.signed_in !== false;
      return {
        anonymous_id: clean(shared.anonymous_id) || (useLocal ? clean(local.anonymous_id) : ""),
        display_name: hasSharedName ? clean(shared.display_name) : (useLocal ? clean(local.name) : ""),
        cohort: clean(context.cohort),
        signed_in: !!(shared.signed_in === true && hasSharedName && shared.anonymous_id && clean(context.cohort))
      };
    }
    function commit(name, cohort, id) {
      var shared = sharedRecord();
      // A quick name switch cannot authenticate as the previous person's email.
      if (clean(shared.display_name) && clean(shared.display_name) !== name) shared.google_email = "";
      shared.anonymous_id = id;
      shared.display_name = name;
      shared.signed_in = true;
      if (typeof shared.google_email !== "string") shared.google_email = "";
      if (typeof shared.cohort !== "string") shared.cohort = "";
      if (!shared.contexts || typeof shared.contexts !== "object" || Array.isArray(shared.contexts)) shared.contexts = {};
      shared.contexts[SUBJECT] = Object.assign({}, matchingContext(shared, SUBJECT), {
        anonymous_id: id, display_name: name, cohort: cohort
      });
      save(shared);
      var result = current(); mirror(result);
      return result;
    }
    // Upgrade a known, already signed-in SR pupil without another prompt. Never
    // let an old SR identity replace somebody subsequently chosen elsewhere.
    var shared = restoredShared(), legacy = read(localKey || "srd_identity_v1");
    if (!current().signed_in && typeof signinRecord().signed_in !== "boolean" &&
        shared.signed_in !== false && legacy.signed_in &&
        clean(legacy.name) && clean(legacy.cohort) &&
        (!clean(shared.display_name) || clean(shared.display_name) === clean(legacy.name)) &&
        (!clean(shared.anonymous_id) || !clean(legacy.anonymous_id) || shared.anonymous_id === legacy.anonymous_id)) {
      commit(clean(legacy.name), clean(legacy.cohort), clean(shared.anonymous_id) || clean(legacy.anonymous_id) || uuid());
    }
    function announce() { window.dispatchEvent(new window.Event(EVENT)); }
    function signIn(name, cohort) {
      name = clean(name); cohort = clean(cohort);
      if (!name || !cohort) return current();
      var before = current();
      var id = before.display_name === name && before.anonymous_id ? before.anonymous_id : uuid();
      var result = commit(name, cohort, id);
      announce();
      return result;
    }
    function signOut() {
      var shared = restoredShared(); shared.signed_in = false; save(shared);
      mirror(current()); announce();
    }
    function subscribe(listener) {
      var previous = JSON.stringify(current());
      function changed(event) {
        if (event.type === "storage" && event.key !== KEY && event.key !== null) return;
        if (event.type === "storage") { fallback = null; signinFallback = null; }
        var identity = current(), next = JSON.stringify(identity);
        if (next === previous) return;
        previous = next; mirror(identity); listener(identity);
      }
      ["storage", "focus", "pageshow", EVENT].forEach(function (type) { window.addEventListener(type, changed); });
      return function () {
        ["storage", "focus", "pageshow", EVENT].forEach(function (type) { window.removeEventListener(type, changed); });
      };
    }
    mirror(current());
    return { current: current, signIn: signIn, signOut: signOut, subscribe: subscribe };
  }
  // Exposed under a subject-neutral name so it can sit beside v2 on one page.
  window.SubjectIdentity = { create: create, KEY: KEY, version: 3 };
})(window);
