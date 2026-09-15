/* Trilogy Physics public bundle: content safety, then a real pupil journey through
   the published files. Synthetic browser state; no network. */
"use strict";
const assert = require("assert/strict"), fs = require("fs"), path = require("path"), crypto = require("crypto"), vm = require("vm");
const { JSDOM } = require("jsdom");
const ROOT = path.resolve(process.env.PPQ_PROJECT_ROOT || path.resolve(__dirname, ".."));
const sha = b => crypto.createHash("sha256").update(b).digest("hex");
const readRoot = p => fs.readFileSync(path.join(ROOT, p), "utf8");
const latestPath = process.env.TRILOGY_RELEASE_LATEST || path.join(ROOT, "dist/trilogy-release/latest.json");
let checks = 0;
function check(label, fn) { fn(); checks++; console.log("ok " + label); }

if (!fs.existsSync(latestPath)) {
  console.log("No assembled Trilogy release yet; build with tools/assemble_trilogy_release.js.");
  process.exit(0);
}
const local = JSON.parse(fs.readFileSync(latestPath, "utf8"));
const RELEASE = path.resolve(process.env.TRILOGY_RELEASE_ROOT || local.root);
const read = p => fs.readFileSync(path.join(RELEASE, p), "utf8");
const settings = JSON.parse(readRoot("reports/trilogy-release-settings.json"));
const clearance = JSON.parse(readRoot("reports/trilogy-reviewed-test-exclusions.json"));

const catalogue = read("data/physics_catalogue.js");
const box = { window: {} };
vm.runInNewContext(catalogue, box, { timeout: 20000 });
// Round-trip out of the vm realm so deepStrictEqual compares values, not prototypes.
const meta = JSON.parse(JSON.stringify(box.window.PHYSICS_META));
const questions = JSON.parse(JSON.stringify(box.window.PHYSICS_QUESTIONS));

try {
  check("the published bundle carries exactly the files a Pages site needs", () => {
    for (const file of [".nojekyll", "build-info.json", "index.html", "physics-config.js",
      "physics-identity.js", "physics-login.js", "physics-reporting.js",
      "data/physics_catalogue.js", "engine/ppqviewer.js", "engine/ppqviewer.css"])
      assert(fs.existsSync(path.join(RELEASE, file)), file + " is published");
    assert(read("index.html").trimEnd().endsWith("</html>"), "the page is not truncated");
  });

  check("the shared viewer sources are the ones the build recorded", () => {
    assert(Array.isArray(local.shared_files) && local.shared_files.length, "shared fingerprints exist");
    for (const file of local.shared_files)
      assert.equal(sha(readRoot(file.path)), file.sha256, file.path + " changed after assembly");
    for (const name of ["physics-config.js", "physics-identity.js", "physics-login.js", "physics-reporting.js"])
      assert.equal(read(name), readRoot("example/" + name), name + " is the current shared copy");
    for (const name of ["ppqviewer.js", "ppqviewer.css"])
      assert.equal(read("engine/" + name), readRoot("engine/" + name), name + " is the current shared engine");
  });

  check("the exclusion review is certified and still says what the build claims", () => {
    assert.equal(clearance.complete_test_exclusion_certified, true);
    assert.equal(sha(readRoot("reports/trilogy-reviewed-test-exclusions.json")), local.clearance.sha256,
      "the clearance changed after assembly");
    assert.deepEqual([...clearance.certification_scope.serving_courses], ["Trilogy"],
      "the certification must cover Trilogy alone");
    assert.deepEqual([...clearance.certification_scope.topic_codes].sort(), Object.keys(meta.topics).sort(),
      "the certified topics must be the served topics");
    assert.equal(questions.length, clearance.certification_scope.served_parents);
  });

  check("no reserved or withheld parent reached the public catalogue", () => {
    const reserved = new Set(clearance.parent_ids || []);
    const withheld = new Set(local.withheld_parent_ids || []);
    assert(withheld.size, "the build must record what it withheld");
    for (const q of questions) {
      assert(!reserved.has(q.parent_id) && !reserved.has(q.id), "reserved parent served: " + q.id);
      assert(!withheld.has(q.parent_id), "withheld parent served: " + q.id);
    }
    // The two questions the closing pass newly evidenced, and the two Synergy parents
    // reserved ahead of scope, must all be absent however the matcher behaves.
    for (const id of ["trilogy_2018_p1h::Q06", "trilogy_2022_p2f::Q07", "trilogy_2022_p2h::Q02",
      "synergy_specimen_set2_4f::Q08", "synergy_specimen_set2_4h::Q01"])
      assert(!questions.some(q => q.parent_id === id || q.id === id), id + " must not be served");
  });

  check("no reserved exam year and no Synergy paper is published", () => {
    for (const q of questions) {
      assert.match(String(q.year), /^\d{4}$/);
      assert(Number(q.year) < 2026, "2026 papers are reserved for mocks: " + q.id);
      assert(/^trilogy_/.test(q.parent_id), "only Trilogy parents may be served: " + q.parent_id);
    }
  });

  check("nothing local, private or evidential survives into the published catalogue", () => {
    for (const pattern of [/C:\\/, /CodexProjects/i, /PaperDatabases/i, /Shared drives/i,
      /aqa_extraction/i, /exclusion/i, /assessment/i, /withheld/i, /\.pdf/i, /sha256/i])
      assert(!pattern.test(catalogue), "the catalogue leaks " + pattern);
    for (const q of questions)
      for (const image of [...q.question_images, ...q.markscheme_images])
        assert.match(image, /^assets\/[0-9a-f]{64}\.png$/, "images must be content-addressed: " + image);
  });

  check("every published asset is referenced and every reference is published", () => {
    const referenced = new Set(questions.flatMap(q => [...q.question_images, ...q.markscheme_images]));
    const onDisk = new Set(fs.readdirSync(path.join(RELEASE, "assets")).map(name => "assets/" + name));
    assert.deepEqual([...referenced].sort(), [...onDisk].sort(), "assets and references must agree exactly");
    assert.equal(onDisk.size, local.assets);
  });

  check("the estate analytics blocks are on the published page", () => {
    const page = read("index.html");
    assert(page.includes("G-WKYGJYERSR"), "GA4 measurement id");
    assert(page.includes("xdr2tsc688"), "Clarity project for physicalsmithness.github.io");
    assert(page.includes("<title>" + meta.title + "</title>"), "the tab title names this course");
  });

  check("the sign-in position matches the settings, and a gate never invents a class list", () => {
    assert.equal(meta.sign_in, settings.sign_in.enabled, "the built gate must match the declared position");
    if (meta.sign_in) {
      assert(Array.isArray(meta.classes) && meta.classes.length, "a gate needs real class names");
      assert.deepEqual(meta.classes, settings.sign_in.classes);
      assert(!meta.classes.some(name => /^IB\d/.test(name)), "an IB class list must not reach a GCSE site");
      assert(meta.classes.includes("Test"), "the Test class stays available");
      assert(meta.classes.filter(n => n !== "Test").every(n => /Trilogy/i.test(n)),
        "every real class on this site is a Trilogy class");
    } else {
      assert(!Object.hasOwn(meta, "classes") || !meta.classes, "an ungated build ships no class list");
    }
  });

  // --- pupil journey through the published files ---
  const page = read("index.html");
  const opened = [];
  function open(query) {
    const dom = new JSDOM(page, { url: "https://physicalsmithness.github.io/trilogyphysicsppqs/" + query,
      runScripts: "outside-only", pretendToBeVisual: true });
    const w = dom.window, network = [];
    w.fetch = (...a) => { network.push(a); throw Error("Unexpected network request"); };
    w.XMLHttpRequest = function () { network.push("XHR"); throw Error("Unexpected XHR"); };
    w.navigator.sendBeacon = (...a) => { network.push(a); return false; };
    w.eval(catalogue);
    w.eval(read("engine/ppqviewer.js"));
    w.eval(read("physics-identity.js"));
    w.eval(read("physics-login.js"));
    w.eval(read("physics-reporting.js"));
    w.eval(read("physics-config.js"));
    w.PPQ_CONFIG.prefetchAhead = 0; w.PPQ_CONFIG.defaultOrder = "ordered";
    for (const match of page.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g))
      if (match[1].includes("window.physicsViewer =")) w.eval(match[1]);
    const p = { w, dom, root: w.document.getElementById("ppq-root"), network };
    opened.push(p);
    return p;
  }
  // A gated site shows the chooser to anyone, then asks who you are before practice.
  function signIn(p, cohort) {
    const gate = p.w.document.getElementById("physics-sign-in-gate");
    assert(gate, "the sign-in gate is shown before any question");
    gate.querySelector("input").value = "Fixture Pupil";
    gate.querySelector("select").value = cohort || meta.classes[1];
    gate.querySelector("form").dispatchEvent(new p.w.Event("submit", { bubbles: true, cancelable: true }));
    return p;
  }
  const enter = query => meta.sign_in ? signIn(open(query)) : open(query);

  check("the site opens on a topic chooser naming both topics and no others as available", () => {
    const p = open("");
    assert(p.root.querySelector(".physics-topic-home"), "the chooser is shown");
    assert(!p.w.physicsViewer, "no question is revealed before a topic is chosen");
    const links = [...p.w.document.querySelectorAll("a[href]")]
      .filter(a => new URL(a.href).searchParams.has("topic"));
    assert.deepEqual(links.map(a => new URL(a.href).searchParams.get("topic")).sort(), ["electricity", "forces"]);
    assert.equal(p.w.document.title, meta.title);
    assert.equal(p.root.querySelector('h1 a[href="./"]').textContent, meta.title);
    assert(!/Relativity coverage|SpecialRelativityDriller/i.test(p.root.innerHTML),
      "a GCSE site must not link the IB relativity coverage page");
    assert(!/exclusion|assessment|reserved|mock/i.test(p.root.textContent),
      "the chooser must not narrate the review to a pupil");
  });

  check("the remaining AQA topics are named as not yet available and cannot be opened", () => {
    const p = open("");
    const text = p.root.textContent;
    for (const label of ["Energy", "Particle model of matter", "Atomic structure", "Waves", "Magnetism and electromagnetism"])
      assert(text.includes(label), label + " is named");
    const disabled = [...p.root.querySelectorAll('[aria-disabled="true"]')];
    assert.equal(disabled.length, 5);
    assert(disabled.every(el => /Not yet available/i.test(el.textContent) && !el.querySelector("a[href]")));
  });

  check("a pupil must say who they are before any question is shown", () => {
    if (!meta.sign_in) { assert(!open("?topic=forces").w.document.getElementById("physics-sign-in-gate")); return; }
    const p = open("?topic=forces");
    assert(!p.w.physicsViewer, "no question is mounted before sign-in");
    const options = [...p.w.document.querySelectorAll("#physics-login-cohort option")]
      .map(o => o.value).filter(Boolean);
    assert.deepEqual(options, meta.classes, "the class list is exactly the one the school uses");
    assert(!options.some(name => /^IB\d/.test(name)), "no IB class may appear on a GCSE site");
    signIn(p);
    assert(p.w.physicsViewer, "signing in starts practice");
    assert.equal(p.w.physicsIdentity.current().cohort, meta.classes[1]);
  });

  check("choosing a topic starts practice on that topic's questions alone", () => {
    for (const topic of Object.keys(meta.topics)) {
      const p = enter("?topic=" + topic);
      assert(p.w.physicsViewer, topic + " mounts the viewer");
      const shown = p.w.physicsViewer.view;
      assert(shown.length, topic + " has questions");
      assert(shown.every(q => q.topic_codes.includes(topic)), topic + " shows only its own questions");
      assert.equal(p.network.length, 0, "the page makes no network request");
    }
  });

  check("a question renders its crops and reveals its mark scheme, not before", () => {
    const p = enter("?topic=forces");
    const v = p.w.physicsViewer;
    const first = v.view[0];
    v.goToId(first.id);
    const shownImages = [...p.w.document.querySelectorAll('img[src^="assets/"]')].map(i => i.getAttribute("src"));
    assert(shownImages.length, "the question crop is on the page");
    assert(first.markscheme_images.every(src => !shownImages.includes(src)), "the mark scheme is not shown unasked");
    assert(first.question_images.every(src => shownImages.includes(src)), "every question crop is shown");
  });

  check("paper, tier and a year RANGE are filterable; no individual year is offered", () => {
    const p = enter("?topic=forces");
    const controls = p.w.document.querySelector(".ppq-filters");
    assert(controls, "the filter bar is present");
    const text = controls.textContent.toLowerCase();
    for (const field of ["paper", "year range", "level"]) assert(text.includes(field), field + " is filterable");
    // A year whose questions are all withheld would show as a gap, and the gap names
    // the papers a current test drew from. Bands only. Smith's rule, 2026-09-13.
    const offered = [...controls.querySelectorAll("option")].map(o => o.value);
    const bare = offered.filter(v => /^(19|20)\d{2}$/.test(v));
    assert(!bare.length, "individual years must not be offered as filter values: " + bare.join(", "));
    const bands = (meta.year_bands || []).map(b => b.value);
    assert(bands.length && bands.every(v => offered.includes(v)), "every declared band is offered");
    for (const q of questions)
      assert((meta.year_bands || []).some(b => Number(q.year) >= b.first && Number(q.year) <= b.last),
        "every served year falls inside a band: " + q.year);
  });

  check("the publication ruling is recorded in Smith's own words, not inherited", () => {
    const ruling = settings.publication_ruling;
    assert.equal(ruling.granted, true, "the AQA ruling must be granted before this build is staged");
    assert(ruling.granted_on, "the ruling carries a date");
    assert(typeof ruling.wording === "string" && ruling.wording.trim().length > 20,
      "the ruling is recorded in words a later reader can check");
    assert(!/inherit|d014|q12/i.test(ruling.wording.replace(/does not inherit[^.]*\./i, "")) ||
      /IB Maths/i.test(ruling.wording), "the ruling names its own terms");
  });

  check("the build record agrees with what is actually published", () => {
    const info = JSON.parse(read("build-info.json"));
    assert.equal(info.build_id, local.build_id);
    assert.equal(info.parents, questions.length);
    assert.equal(info.parts, new Set(questions.flatMap(q => q.part_ids)).size);
    assert.equal(info.sign_in, meta.sign_in);
    assert.deepEqual(info.topics.sort(), Object.keys(meta.topics).sort());
    // The published build record must not enumerate served years either: that list is
    // the gap map the band filter exists to hide.
    assert(!Object.hasOwn(info, "years"), "build-info.json must not list the served years");
    assert.deepEqual(info.year_bands, (meta.year_bands || []).map(b => b.value));
    // build-info.json is served from the site. Governance records are not for visitors.
    for (const key of ["publication_ruling", "exclusion_review_certified_on", "withheld_parent_ids",
      "clearance", "settings", "input", "evidence_verified", "shared_files", "root"])
      assert(!Object.hasOwn(info, key), "build-info.json must not publish " + key);
    assert(!/ruling|exclusion|withheld|assessment|Smith|CodexProjects/i.test(read("build-info.json")),
      "build-info.json must not carry governance or evidence text");
    // The same record, kept locally, is where the evidence does live.
    assert(local.publication_ruling && local.publication_ruling.granted === true);
    assert(local.exclusion_review_certified_on, "the local record keeps the review date");
    for (const [topic, counts] of Object.entries(info.topic_counts))
      assert.equal(counts.parents, questions.filter(q => q.topic_codes.includes(topic)).length, topic + " parent count");
  });

  check("no published file carries a governance record or an internal name", () => {
    for (const file of ["index.html", "build-info.json", "data/physics_catalogue.js",
      "physics-config.js", "physics-identity.js", "physics-login.js", "physics-reporting.js"])
      assert(!/CodexProjects|PaperDatabases|Shared drives|publication_ruling|trilogy-reviewed-test-exclusions/i.test(read(file)),
        file + " carries an internal reference");
  });

  for (const p of opened) p.dom.window.close();
  console.log("\n" + checks + " Trilogy release checks passed; " + questions.length + " parents, " +
    new Set(questions.flatMap(q => q.part_ids)).size + " parts, " + local.assets + " crops");
} catch (error) {
  console.error("FAIL after " + checks + " checks");
  console.error(error && error.message);
  process.exitCode = 1;
}
