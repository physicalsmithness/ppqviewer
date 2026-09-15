/* Shared, browser-local physics identity. Canonical copy: ppqviewer/example/.
   No network, passwords, progress migration or inferred ownership of old results.
   Keep the estate key and unknown fields; never reuse its ambiguous flat cohort. */
(function (window) {
  "use strict";
  var KEY = "smithics_fields_identity_v1", EVENT = "physics-identity-change";
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
  function matchingContext(shared) {
    var context = shared.contexts && shared.contexts.physics;
    return context && context.anonymous_id === shared.anonymous_id &&
      clean(context.display_name) === clean(shared.display_name) ? context : {};
  }
  function create(options) {
    options = options || {};
    var localKey = options.localKey || "";
    var fallback = null;
    function sharedRecord() { return fallback || read(KEY); }
    function save(shared) { fallback = write(KEY, shared) ? null : shared; }
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
      var shared = sharedRecord(), local = read(localKey || "srd_identity_v1");
      var hasSharedName = !!clean(shared.display_name);
      var context = matchingContext(shared);
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
      shared.contexts.physics = Object.assign({}, matchingContext(shared), {
        anonymous_id: id, display_name: name, cohort: cohort
      });
      save(shared);
      var result = current(); mirror(result);
      return result;
    }
    // Upgrade a known, already signed-in SR pupil without another prompt. Never
    // let an old SR identity replace somebody subsequently chosen elsewhere.
    var shared = sharedRecord(), legacy = read(localKey || "srd_identity_v1");
    if (!current().signed_in && shared.signed_in !== false && legacy.signed_in &&
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
      var shared = sharedRecord(); shared.signed_in = false; save(shared);
      mirror(current()); announce();
    }
    function subscribe(listener) {
      var previous = JSON.stringify(current());
      function changed(event) {
        if (event.type === "storage" && event.key !== KEY && event.key !== null) return;
        if (event.type === "storage") fallback = null;
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
  window.PhysicsIdentity = { create: create, KEY: KEY, version: 1 };
})(window);
