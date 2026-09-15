/* Physics identity UI only. This adapter has no reporting transport and never
 * reads, writes, clears or rekeys a PPQ progress store. PhysicsIdentity owns
 * the shared person/class contract; the host continues to own the viewer. */
(function () {
  "use strict";

  function mount(opts) {
    var identity = opts.identity, app = opts.appEl, doc = app.ownerDocument;
    if (!identity || typeof identity.current !== "function" || typeof identity.signIn !== "function" || typeof identity.subscribe !== "function") {
      throw new Error("The shared physics identity module is unavailable.");
    }
    var style = doc.getElementById("physics-login-style");
    if (!style) {
      style = doc.createElement("style"); style.id = "physics-login-style";
      style.textContent = ".physics-account{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:.5rem 1rem;padding:.5rem 1rem;border-bottom:1px solid #ded9cd;font:14px/1.4 system-ui,sans-serif}.physics-account a{color:#295b47;font-weight:600}.physics-person{font:inherit;background:transparent;border:1px solid #b6b8ae;border-radius:5px;padding:.25rem .55rem;color:inherit;cursor:pointer}#physics-sign-in-gate{box-sizing:border-box;width:min(100%,30rem);margin:auto;padding:1.5rem;font:16px/1.5 system-ui,sans-serif}#physics-sign-in-gate[hidden],.physics-account [hidden]{display:none!important}#physics-sign-in-gate h1{font-size:1.4rem;margin:0 0 .7rem}#physics-sign-in-gate label{display:block;margin-top:1rem}#physics-sign-in-gate input,#physics-sign-in-gate select{display:block;box-sizing:border-box;width:100%;padding:.55rem;font:inherit;border:1px solid #a9aea3;border-radius:5px;background:white;color:#282b28}#physics-sign-in-gate button{margin:1rem .5rem 0 0;padding:.45rem .9rem;font:inherit;cursor:pointer}#physics-sign-in-gate p{font-size:.9rem;color:#51584e}#physics-sign-in-gate .physics-login-error{color:#962f25}";
      doc.head.appendChild(style);
    }
    var bar = doc.createElement("nav"); bar.className = "physics-account"; bar.setAttribute("aria-label", "Physics account and coverage");
    // A course with nowhere to point must show no link rather than a broken one.
    // opts.coverage === null suppresses it; the default is the IB relativity page.
    var link = opts.coverage === null ? null : (opts.coverage || {
      href: opts.coverageHref || "/SpecialRelativityDriller/app/coverage.html",
      label: "Relativity coverage",
      title: "Galilean and special relativity: coverage across the Driller and past papers"
    });
    var person = doc.createElement("button"); person.type = "button"; person.className = "physics-person"; person.hidden = true;
    if (link && link.href && link.label) {
      var coverage = doc.createElement("a"); coverage.href = link.href; coverage.textContent = link.label;
      if (link.title) coverage.title = link.title;
      bar.appendChild(coverage);
    }
    bar.appendChild(person);
    app.parentNode.insertBefore(bar, app);
    var gate = doc.createElement("section"); gate.id = "physics-sign-in-gate"; gate.setAttribute("aria-labelledby", "physics-sign-in-title");
    gate.innerHTML = '<h1 id="physics-sign-in-title">Sign in to physics practice</h1>' +
      '<p>Use the same name and physics class as the Driller. This is a shared sign-in for this browser, with no password check. Your saved practice stays in this browser; changing the name does not create a separate progress history. ' +
      (opts.trackingEnabled ? 'New attempts, marks, C ratings and timing are sent to your teacher’s tracker under this name and physics class.' : 'This local preview does not send attempts to the teacher tracker.') + '</p>' +
      '<form><label>Name<input id="physics-login-name" autocomplete="name" autocapitalize="words" required></label>' +
      '<label>Class<select id="physics-login-cohort" required></select></label>' +
      '<button type="submit">Start</button><button type="button" class="physics-login-cancel" hidden>Cancel</button>' +
      '<p class="physics-login-error" role="alert" hidden></p></form>';
    app.parentNode.insertBefore(gate, app);
    var name = gate.querySelector("input"), cohort = gate.querySelector("select"), cancel = gate.querySelector(".physics-login-cancel"), error = gate.querySelector(".physics-login-error");
    var placeholder = doc.createElement("option"); placeholder.value = ""; placeholder.textContent = "Pick your class"; cohort.appendChild(placeholder);
    // This is the current SR dropdown; an already-shared physics class is
    // retained exactly even if its value is absent from this local list.
    // Real class names come from the catalogue. Never invent them: an invented list
    // splits one cohort across two spellings and the teacher tracker cannot rejoin them.
    var classes = Array.isArray(opts.classes) && opts.classes.length ? opts.classes : ["Test", "IB27", "IB28"];
    function addClass(value) {
      if (!value || Array.from(cohort.options).some(function (option) { return option.value === value; })) return;
      var option = doc.createElement("option"); option.value = value; option.textContent = value; cohort.appendChild(option);
    }
    classes.forEach(addClass);
    var started = false, editing = false, disposed = false;
    // The viewer owns a document-level keyboard handler. A hidden question
    // must not consume body shortcuts or keys intended for this form.
    function isolateKeys(event) {
      if (gate.hidden) return;
      event.stopImmediatePropagation();
      if (!gate.contains(event.target)) event.preventDefault();
    }
    doc.addEventListener("keydown", isolateKeys, true);
    function valid(current) { return !!(current && current.signed_in && current.anonymous_id && current.display_name && current.cohort); }
    function fill(current) { name.value = current.display_name || ""; addClass(current.cohort); cohort.value = current.cohort || ""; }
    function sync() {
      if (disposed) return;
      var current = identity.current() || {}, signedIn = valid(current);
      if (opts.onIdentityChange) opts.onIdentityChange(current);
      person.hidden = !signedIn;
      person.textContent = signedIn ? current.display_name + " · " + current.cohort + " · Switch" : "";
      person.setAttribute("aria-label", signedIn ? "Switch physics sign-in: " + current.display_name + ", " + current.cohort : "Switch physics sign-in");
      var open = !signedIn || editing;
      gate.hidden = !open; app.hidden = open; app.style.display = open ? "none" : "";
      cancel.hidden = !signedIn;
      if (open) fill(current);
      if (signedIn && !open && !started) {
        if (opts.onEnter) opts.onEnter(current);
        started = true;
      }
    }
    person.addEventListener("click", function () { editing = true; sync(); name.focus(); });
    cancel.addEventListener("click", function () { editing = false; error.hidden = true; sync(); });
    gate.querySelector("form").addEventListener("submit", function (event) {
      event.preventDefault();
      if (!name.value.trim()) { name.focus(); return; }
      if (!cohort.value) { cohort.focus(); return; }
      try {
        editing = false; error.hidden = true;
        identity.signIn(name.value.trim(), cohort.value);
        sync();
      } catch (failure) {
        editing = true; error.textContent = "Your sign-in could not be saved. Check browser storage and try again."; error.hidden = false;
      }
    });
    var unsubscribe = identity.subscribe(sync);
    sync();
    return { identity: identity, refresh: sync, destroy: function () {
      disposed = true; if (typeof unsubscribe === "function") unsubscribe();
      doc.removeEventListener("keydown", isolateKeys, true); bar.remove(); gate.remove();
      app.hidden = false; app.style.display = "";
    } };
  }
  window.PhysicsLogin = { mount: mount };
})();
