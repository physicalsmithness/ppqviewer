"use strict";
// Trilogy Physics public bundle. Source records, the assessment corpus, the
// exclusion evidence and every withheld parent stay local; only bounded question
// and mark-scheme crops of served parents are written.
//
// The clearance is re-derived here rather than trusted from the built input, so a
// stale or hand-edited trilogy.json cannot carry a flag it has not earned.
const fs = require("fs"), path = require("path"), crypto = require("crypto");
const ROOT = path.resolve(__dirname, "..");
const INPUT = path.resolve(process.env.TRILOGY_INPUT || path.join(ROOT, "dist/physics-inputs/trilogy.json"));
const ASSET_ROOT = path.join(ROOT, "dist/physics-inputs/trilogy-assets");
const CLEARANCE = path.join(ROOT, "reports/trilogy-reviewed-test-exclusions.json");
const SETTINGS = path.join(ROOT, "reports/trilogy-release-settings.json");
const sha = b => crypto.createHash("sha256").update(b).digest("hex");
const read = p => fs.readFileSync(p, "utf8");
const json = p => JSON.parse(read(p));
const ensure = (ok, message) => { if (!ok) throw Error(message); };
const unique = a => [...new Set(a)];
const within = (root, file) => {
  const rel = path.relative(root, path.resolve(file));
  return rel && !rel.startsWith("..") && !path.isAbsolute(rel);
};
// Evidence paths are recorded as the content seat writes them, on Windows. A sandbox
// run rebases them onto PHYSICS_PAPERDB_ROOT; on Smith's machine nothing changes.
const DB_DEFAULT = "C:\\CodexProjects\\PaperDatabases";
function evidenceFile(root, name) {
  const joined = root.replace(/\\/g, "/") + "/" + name;
  const db = process.env.PHYSICS_PAPERDB_ROOT;
  if (db && joined.toLowerCase().startsWith(DB_DEFAULT.replace(/\\/g, "/").toLowerCase()))
    return path.join(db, joined.slice(DB_DEFAULT.length));
  return path.normalize(joined);
}

// Every reason a Trilogy build may not be published, checked before anything is written.
function validateClearance(input, clearance) {
  const meta = input.meta, report = input.report;
  ensure(meta.course === "trilogy", "This assembler builds the Trilogy course only");
  ensure(clearance.complete_test_exclusion_certified === true,
    "The reviewed test exclusions do not certify a complete assessment comparison");
  ensure(meta.exclusion_review_complete === true,
    "The built input does not carry a complete exclusion review. Rebuild it with tools/build_trilogy_physics.py");

  const scope = clearance.certification_scope || {};
  const inputTopics = Object.keys(meta.topics).sort();
  ensure(JSON.stringify([...(scope.topic_codes || [])].sort()) === JSON.stringify(inputTopics),
    "Certified topics " + JSON.stringify(scope.topic_codes) + " do not match the input's topics " + JSON.stringify(inputTopics));
  ensure(JSON.stringify(scope.serving_courses) === JSON.stringify(["Trilogy"]),
    "The certification covers " + JSON.stringify(scope.serving_courses) + ", not Trilogy alone. Widening the award restarts the review");
  const servedTopics = unique(input.questions.flatMap(q => q.topic_codes)).sort();
  ensure(servedTopics.every(t => (scope.topic_codes || []).includes(t)),
    "Served topics " + JSON.stringify(servedTopics) + " fall outside the certified scope");

  ensure(input.questions.length === scope.served_parents,
    "The input serves " + input.questions.length + " parents; the certification covers " + scope.served_parents);
  const servedParts = unique(input.questions.flatMap(q => q.part_ids));
  ensure(servedParts.length === scope.served_parts,
    "The input serves " + servedParts.length + " parts; the certification covers " + scope.served_parts);

  // A reserved parent reaching the public bundle is the failure that matters most.
  const reserved = new Set(clearance.parent_ids || []);
  const leaked = input.questions.filter(q => reserved.has(q.parent_id) || reserved.has(q.id));
  ensure(!leaked.length, "A reserved parent reached the release: " + leaked.map(q => q.id).join(", "));
  const withheld = new Set(report.excluded_parent_ids || []);
  const alsoLeaked = input.questions.filter(q => withheld.has(q.parent_id));
  ensure(!alsoLeaked.length, "A withheld parent reached the release: " + alsoLeaked.map(q => q.id).join(", "));

  ensure(input.questions.every(q => /^\d{4}$/.test(String(q.year)) && Number(q.year) < 2026),
    "A reserved exam year reached the release");
  ensure(!(report.unresolved || []).length, "Unresolved reservations remain: " + JSON.stringify(report.unresolved));
  ensure(!(report.skipped || []).length, "Questions were skipped during the build: " + JSON.stringify(report.skipped));

  // The seat's evidence must still be on disk and unchanged since it was cited.
  const evidence = clearance.certification_evidence || {};
  const files = evidence.files || {};
  const checked = [];
  for (const [name, prefix] of Object.entries(files)) {
    const file = evidenceFile(evidence.root, name);
    ensure(fs.existsSync(file), "The exclusion review evidence is missing: " + file);
    const digest = sha(fs.readFileSync(file));
    ensure(digest.startsWith(prefix), "The exclusion review evidence changed since it was cited: " + file);
    checked.push({ path: file, sha256: digest });
  }
  ensure(checked.length >= 2, "The exclusion review cites too little evidence to verify");
  return { scope, evidence_checked: checked };
}

function publicMeta(input, settings) {
  const signIn = settings.sign_in || {};
  ensure(typeof signIn.enabled === "boolean", "trilogy-release-settings.json must state sign_in.enabled");
  // The q08 rule, enforced rather than remembered.
  ensure(!signIn.enabled || (Array.isArray(signIn.classes) && signIn.classes.length),
    "A sign-in gate needs the real class names. Fill sign_in.classes in reports/trilogy-release-settings.json, or set enabled false");
  return {
    course: "trilogy",
    title: settings.title || input.meta.title,
    release: true,
    topics: input.meta.topics,
    topic_chooser: true,
    workspace_chrome: true,
    sign_in: signIn.enabled,
    classes: signIn.enabled ? signIn.classes : undefined,
    // GCSE has no Driller coverage page to point at; show no link rather than a broken one.
    account_link: null,
    upcoming_topics: settings.upcoming_topics || null
    // The exclusion review stays out of the public catalogue. It is the evidence for
    // what was withheld, and naming it to a pupil narrates the questions they cannot
    // see. Its record lives in dist/trilogy-release/latest.json, which is local.
  };
}

function assemble() {
  const input = json(INPUT), clearance = json(CLEARANCE), settings = json(SETTINGS);
  const verified = validateClearance(input, clearance);
  const meta = publicMeta(input, settings);

  const assetFiles = unique(input.questions.flatMap(q => [...q.question_images, ...q.markscheme_images]));
  const assets = new Map();
  for (const file of assetFiles) {
    ensure(within(ASSET_ROOT, file), "Only crops beneath the Trilogy asset folder may be published: " + file);
    ensure(/-(question|markscheme)-p\d+-[0-9a-f]+\.png$/i.test(path.basename(file)),
      "Only attributed question and mark-scheme crops may be published: " + file);
    const bytes = fs.readFileSync(file);
    assets.set(file, { url: "assets/" + sha(bytes) + ".png", bytes });
  }

  const publicQuestions = input.questions.map(q => ({
    id: q.id, parent_id: q.parent_id, topic_codes: q.topic_codes, year: q.year, paper: q.paper,
    level: q.level, question_number: q.question_number, label: q.label, marks: q.marks,
    source_label: q.source_label, source_series: q.source_series,
    // q.specimen is provenance: the source PDF's absolute path, its sha256 and page.
    // Neither the engine nor the config reads it, and source_label already says
    // "Specimen 2018 set 1", so the public record carries the printed date alone.
    specimen: q.specimen ? { printed_date: q.specimen.printed_date, set: q.specimen.set } : null,
    part_ids: q.part_ids, topic_part_ids: q.topic_part_ids,
    question_images: q.question_images.map(f => assets.get(f).url),
    context_images: [],
    markscheme_images: q.markscheme_images.map(f => assets.get(f).url)
  }));
  // Nothing local may survive the projection.
  const serialised = JSON.stringify(publicQuestions);
  ensure(!/C:\\\\|CodexProjects|PaperDatabases|Shared drives|aqa_extraction/i.test(serialised),
    "A local path or source reference reached the public catalogue");

  const tracking = read(path.join(ROOT, "deploy/ibmathsppqs/index.html"))
    .match(/<!-- GA4[\s\S]*?<\/script>\s*<!-- Microsoft Clarity[\s\S]*?<\/script>/);
  ensure(tracking && tracking[0].includes("G-WKYGJYERSR") && tracking[0].includes("xdr2tsc688"),
    "Estate analytics blocks are missing");

  const shared = ["engine/ppqviewer.js", "engine/ppqviewer.css", "example/physics.html", "example/physics-config.js",
    "example/physics-identity.js", "example/physics-login.js", "example/physics-reporting.js",
    "tools/assemble_trilogy_release.js", "tools/build_trilogy_physics.py", "tools/trilogy_reviewed_topics.py"];

  const catalogue = "window.PHYSICS_META=" + JSON.stringify(meta) + ";\nwindow.PHYSICS_QUESTIONS=" + JSON.stringify(publicQuestions) + ";\n";
  const buildId = sha(catalogue + sha(read(CLEARANCE)) + sha(read(SETTINGS)) +
    shared.map(f => sha(read(path.join(ROOT, f)))).join("|") + tracking[0]).slice(0, 16);
  const out = path.join(ROOT, "dist/trilogy-release", buildId + "-" + Date.now());
  for (const folder of ["assets", "engine", "data"]) fs.mkdirSync(path.join(out, folder), { recursive: true });
  for (const { url, bytes } of assets.values()) fs.writeFileSync(path.join(out, url), bytes);
  for (const name of ["ppqviewer.js", "ppqviewer.css"]) fs.copyFileSync(path.join(ROOT, "engine", name), path.join(out, "engine", name));
  fs.copyFileSync(path.join(ROOT, "example/physics-config.js"), path.join(out, "physics-config.js"));
  for (const name of ["physics-identity.js", "physics-login.js", "physics-reporting.js"])
    fs.copyFileSync(path.join(ROOT, "example", name), path.join(out, name));

  let page = read(path.join(ROOT, "example/physics.html"));
  const titled = page.replace(/<title>[^<]*<\/title>/, "<title>" + meta.title + "</title>");
  ensure(titled !== page, "The wrapper title could not be replaced");
  page = titled.replace("</head>", tracking[0] + "\n</head>");
  ensure(page.includes("G-WKYGJYERSR") && page.trimEnd().endsWith("</html>"), "The published page is incomplete");
  fs.writeFileSync(path.join(out, "index.html"), page);
  fs.writeFileSync(path.join(out, "data/physics_catalogue.js"), catalogue);
  fs.writeFileSync(path.join(out, ".nojekyll"), "");

  const topicCounts = Object.fromEntries(Object.keys(meta.topics).map(topic => [topic, {
    parents: publicQuestions.filter(q => q.topic_codes.includes(topic)).length,
    parts: unique(publicQuestions.filter(q => q.topic_codes.includes(topic))
      .flatMap(q => (q.topic_part_ids && q.topic_part_ids[topic]) || q.part_ids)).length
  }]));
  const info = {
    build_id: buildId, built_at: new Date().toISOString(), course: "trilogy", title: meta.title,
    topics: Object.keys(meta.topics), topic_counts: topicCounts,
    parents: publicQuestions.length, parts: unique(publicQuestions.flatMap(q => q.part_ids)).length,
    assets: new Set([...assets.values()].map(a => a.url)).size,
    sign_in: meta.sign_in, years: unique(publicQuestions.map(q => q.year)).sort(),
    tiers: Object.fromEntries(unique(publicQuestions.map(q => q.level)).sort()
      .map(level => [level, publicQuestions.filter(q => q.level === level).length])),
    exclusion_review_certified_on: clearance.closing_pass_on,
    publication_ruling: settings.publication_ruling || { granted: false }
  };
  fs.writeFileSync(path.join(out, "build-info.json"), JSON.stringify(info, null, 2) + "\n");
  const local = {
    ...info, root: out,
    clearance: { path: CLEARANCE, sha256: sha(read(CLEARANCE)) },
    settings: { path: SETTINGS, sha256: sha(read(SETTINGS)) },
    input: { path: INPUT, sha256: sha(read(INPUT)) },
    evidence_verified: verified.evidence_checked,
    withheld_parent_ids: input.report.excluded_parent_ids,
    shared_files: shared.map(f => ({ path: f, sha256: sha(read(path.join(ROOT, f))) }))
  };
  fs.mkdirSync(path.join(ROOT, "dist/trilogy-release"), { recursive: true });
  fs.writeFileSync(path.join(ROOT, "dist/trilogy-release/latest.json"), JSON.stringify(local, null, 2) + "\n");
  console.log(JSON.stringify(info, null, 2));
  return local;
}

if (require.main === module) assemble();
module.exports = { assemble, validateClearance, publicMeta };
