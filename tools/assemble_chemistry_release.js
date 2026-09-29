/* Assemble an explicitly authorised, unchanged chemistry question bank.
 * Writes only workspace release artifacts; never deploys, edits the donor or
 * turns an authorisation into a claim that a licence/test review took place. */
"use strict";
const fs = require("fs"), path = require("path"), vm = require("vm"), crypto = require("crypto"), {isDeepStrictEqual} = require("util");
const {loadCatalogue, assetRequests, resolveAsset, validateBundle, inside, hasLocalPath, hasLocalPathValue, preserveMasteryCategory} = require("./assemble_chemistry_preview");
const ROOT = path.resolve(__dirname, ".."), PARTS = 2465;
const PRODUCTION_URL = "https://physicalsmithness.github.io/chemistrydriller/ppqviewer/";
const RUNTIME = [
  ["example/chemistry.html", "index.html"], ["example/chemistry-page.js", "chemistry-page.js"],
  ["example/chemistry-config.js", "chemistry-config.js"], ["example/subject-identity.js", "subject-identity.js"],
  ["example/physics-reporting.js", "ppq-reporting.js"], ["engine/ppqviewer.js", "ppqviewer.js"], ["engine/ppqviewer.css", "ppqviewer.css"]
];
// Public content fields in the preview contract. Comparing the complete record
// against current source content also detects edits to the preview catalogue.
const FIELDS = ["id", "legacy_id", "part_id", "parent_id", "source_part_id", "label", "part_label", "question_number",
  "year", "session", "timezone", "paper", "level", "marks", "marks_status", "mark_group", "stem_text", "lead_in",
  "question_text", "part_text", "choices", "answer_key", "correct_option", "answer_status", "markscheme_text",
  "examiner_comment", "examiner_report", "examiner_source_type", "examiner_match_note", "current_levels",
  "current_level", "level_availability", "source_group_id", "shared_group", "cross_level_group_id", "topic_codes",
  "primary_codes", "topics", "p1b_skill", "syllabus_codes", "cross_level_group_method", "command_terms", "question_types", "themes", "category_code", "category_label", "subcategory_code", "subcategory_label", "spec_status",
  "usable_if", "marking_note", "marking_differs", "era_note", "has_figure_omitted", "self_mark", "criteria"];
const ensure = (condition, message) => { if (!condition) throw new Error(message); };
const hash = bytes => crypto.createHash("sha256").update(bytes).digest("hex");
const fileHash = file => hash(fs.readFileSync(file));
const readJson = file => JSON.parse(fs.readFileSync(file, "utf8"));
const unique = values => [...new Set(values)];
function safeRelative(value) {
  return typeof value === "string" && !!value && !/[\\:%?#\x00-\x1f]/.test(value) &&
    !value.startsWith("/") && value.split("/").every(piece => piece && piece !== "." && piece !== "..");
}
function containedFile(root, relative) {
  ensure(safeRelative(relative), "Unsafe public relative path: " + relative);
  const file = path.resolve(root, relative);
  ensure(inside(root, file) && fs.existsSync(file) && fs.statSync(file).isFile(), "Missing public file: " + relative);
  ensure(inside(fs.realpathSync(root), fs.realpathSync(file)), "Public file escapes through a symlink: " + relative);
  return file;
}
function publicValue(value) {
  if (typeof value === "string") return hasLocalPath(value) ? undefined : value;
  if (Array.isArray(value)) return value.map(publicValue).filter(item => item !== undefined);
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value)
    .filter(([key]) => !hasLocalPath(key) && !["__proto__", "constructor", "prototype"].includes(key))
    .map(([key, item]) => [key, publicValue(item)]).filter(([, item]) => item !== undefined));
  return value;
}
function loadAdapter(repositoryRoot) {
  const box = vm.createContext({window:Object.create(null)}, {codeGeneration:{strings:false, wasm:false}});
  vm.runInContext(fs.readFileSync(path.join(repositoryRoot, "example/chemistry-config.js"), "utf8"), box, {timeout:10000});
  return box.window.ChemistryViewer;
}
function assertImage(bytes, extension) {
  const valid = extension === ".png" ? bytes.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]))
    : extension === ".jpg" || extension === ".jpeg" ? bytes[0] === 255 && bytes[1] === 216
    : extension === ".gif" ? /^GIF8[79]a/.test(bytes.subarray(0, 6).toString())
    : extension === ".webp" ? bytes.subarray(0, 4).toString() === "RIFF" && bytes.subarray(8, 12).toString() === "WEBP" : false;
  ensure(valid, "Invalid image bytes for " + extension);
}
function assemble(options = {}) {
  const repositoryRoot = path.resolve(options.repositoryRoot || ROOT);
  const latestPath = path.resolve(options.latestPath || path.join(ROOT, "dist/chemistry-preview/latest.json"));
  const verificationPath = path.resolve(options.verificationPath || path.join(ROOT, "CHEMISTRY_VERIFICATION.json"));
  const settingsPath = path.resolve(options.settingsPath || path.join(ROOT, "CHEMISTRY_RELEASE_SETTINGS.json"));
  const outputRoot = path.resolve(options.outputRoot || path.join(ROOT, "dist/chemistry-release"));
  ensure(inside(ROOT, outputRoot), "Release output must stay inside the ppqviewer workspace");
  const settings = readJson(settingsPath), verification = readJson(verificationPath), latest = readJson(latestPath);
  ensure(settings.authorization === "authorized" && typeof settings.authorization_quote === "string" && settings.authorization_quote.trim(), "Release needs explicit recorded publication authorization");
  ensure(settings.production_url === PRODUCTION_URL, "Release production URL must be the canonical Chemistry subpath");
  ensure(/^[a-f\d]{64}$/.test(settings.catalogue_sha256 || "") && /^[a-f\d]{64}$/.test(settings.legacy_catalogue_sha256 || ""), "Authorization must pin both catalogue hashes");
  const previewRoot = path.resolve(latest.root), previewParent = path.dirname(latestPath);
  ensure(inside(previewParent, previewRoot) && inside(ROOT, previewRoot) && fs.existsSync(previewRoot), "Preview root must be a workspace preview build");
  ensure(inside(fs.realpathSync(previewParent), fs.realpathSync(previewRoot)), "Preview root escapes through a symlink");
  ensure(inside(previewParent, path.resolve(latest.report)) && !inside(previewRoot, path.resolve(latest.report)), "Preview report must stay outside public files");
  const report = readJson(latest.report);
  ensure(latest.release === false && report.release === false && verification.release === false, "Expected a verified local preview");
  ensure(latest.build_id === verification.build_id && report.build_id === latest.build_id, "Stale preview verification build ID");
  for (const item of [latest, report, verification]) ensure(item.parts === PARTS, "Release is pinned to the existing 2465-part bank");
  ensure(verification.legacy_ids_retained === PARTS && verification.originals === PARTS && verification.text_only === 0, "Preview must retain all IDs and originals");
  ensure(Array.isArray(report.issues) && report.issues.length === 0 && [report.issue_counts, verification.issues].every(counts => counts && ["missing", "remote", "unsafe"].every(key => counts[key] === 0)), "Preview contains unresolved asset issues");
  ensure(Array.isArray(verification.source_fingerprints) && verification.source_fingerprints.length === RUNTIME.length, "All seven runtime fingerprints are required");
  const snapshots = new Map([settingsPath, verificationPath, latestPath, latest.report].map(file => [file, fileHash(file)]));
  function checkedBytes(file) { const bytes = fs.readFileSync(file); snapshots.set(file, hash(bytes)); return bytes; }
  for (const [source, target] of RUNTIME) {
    const matching = verification.source_fingerprints.filter(item => item.source === source);
    ensure(matching.length === 1, "Missing or duplicate runtime fingerprint: " + source);
    const original = path.join(repositoryRoot, source), bundled = containedFile(previewRoot, target), fingerprint = matching[0];
    const sourceHash = hash(checkedBytes(original)), assembledHash = hash(checkedBytes(bundled));
    ensure(sourceHash === fingerprint.sha256 && assembledHash === fingerprint.assembled_sha256 && sourceHash === assembledHash, "Stale runtime fingerprint: " + source);
  }
  const source = loadCatalogue(report.catalogue), legacyPath = path.join(report.source_roots.legacy, "ppqs.js"), legacy = loadCatalogue(legacyPath);
  ensure(source.sha256 === settings.catalogue_sha256 && source.sha256 === report.catalogue_sha256 && source.sha256 === verification.catalogue_sha256, "Source catalogue changed or was not authorized");
  ensure(legacy.sha256 === settings.legacy_catalogue_sha256, "Legacy donor catalogue changed or was not authorized");
  snapshots.set(report.catalogue, source.sha256); snapshots.set(legacyPath, legacy.sha256);
  const previewCataloguePath = containedFile(previewRoot, "chemistry-catalogue.js"), preview = loadCatalogue(previewCataloguePath);
  snapshots.set(previewCataloguePath, preview.sha256);
  ensure(preview.meta.release === false && preview.meta.local_preview === true && preview.meta.reporting_enabled === false && preview.meta.build_id === latest.build_id, "Invalid preview catalogue flags");
  const expectedMeta = {release:false, local_preview:true, build_id:latest.build_id, asset_layout:"bundled", source_kind:"catalogue",
    part_count:PARTS, original_count:PARTS, text_only_count:0, reporting_enabled:false};
  for (const key of ["code_names", "text_tokens", "paper_reports"]) if (source.meta[key]) expectedMeta[key] = publicValue(source.meta[key]);
  ensure(isDeepStrictEqual(preview.meta, expectedMeta), "Preview metadata differs from the public catalogue contract");
  const adapter = loadAdapter(repositoryRoot), normalized = JSON.parse(JSON.stringify(adapter.normalizeQuestions(source.records)));
  const donorIds = legacy.records.map(q => q.id), ids = preview.records.map(q => q.id), normalizedIds = normalized.map(q => q.id);
  const donorById = new Map(legacy.records.map(q => [q.id, q]));
  ensure(donorIds.length === PARTS && ids.length === PARTS && normalizedIds.length === PARTS && new Set(donorIds).size === PARTS && new Set(ids).size === PARTS, "Release scope must retain 2465 unique legacy IDs");
  ensure(isDeepStrictEqual([...ids].sort(), [...donorIds].sort()) && isDeepStrictEqual(ids, normalizedIds), "Release widens or changes the legacy question selection");
  ensure(normalized.every(q => Number.isInteger(Number(q.year)) && Number(q.year) >= 2016 && Number(q.year) <= 2025), "Release is limited to the existing 2016-2025 bank; 2026 is not authorized");
  const sourceById = new Map();
  for (const record of source.records) {
    if (Array.isArray(record.parts) && record.parts.length) for (const part of record.parts) sourceById.set(part.legacy_id || part.part_id || part.id, {record:part, parent:record});
    else sourceById.set(record.legacy_id || record.id || record.part_id, {record, parent:null});
  }
  const resolver = {legacyRoot:report.source_roots.legacy, assetsRoot:report.source_roots.assets, assetLayout:source.meta.asset_layout};
  const assetHashes = new Map(), questionAssets = new Map();
  function originalReference(request, role) {
    const result = resolveAsset(request.reference, resolver, role, request.preview, request.kind);
    ensure(!result.error, "Source asset no longer resolves: " + request.reference);
    if (!assetHashes.has(result.file)) {
      const bytes = checkedBytes(result.file), extension = path.extname(result.file).toLowerCase(); assertImage(bytes, extension);
      assetHashes.set(result.file, "assets/questions/" + hash(bytes) + extension);
    }
    const reference = assetHashes.get(result.file);
    if (!questionAssets.has(reference)) {
      const bundled = containedFile(previewRoot, reference), bytes = checkedBytes(bundled);
      ensure(hash(bytes) === reference.match(/\/([a-f\d]{64})\./)[1], "Bundled image hash mismatch: " + reference);
      questionAssets.set(reference, bundled);
    }
    return reference;
  }
  for (let i = 0; i < normalized.length; i++) {
    const item = normalized[i], expected = {};
    for (const key of FIELDS) if (Object.hasOwn(item, key)) { const value = publicValue(item[key]); if (value !== undefined) expected[key] = value; }
    preserveMasteryCategory(expected, donorById.get(item.id));
    expected.parent_id = expected.parent_id || expected.id.split("(")[0].trim();
    expected.label = expected.label || expected.part_label || (expected.id.match(/\(.*$/) || [""])[0];
    expected.stem_text = expected.stem_text || ""; expected.lead_in = expected.lead_in || "";
    expected.question_text = expected.question_text || expected.part_text || publicValue(item.text) || "";
    const marks = item.marks == null || item.marks === "" ? NaN : Number(item.marks);
    expected.marks = Number.isInteger(marks) && marks >= 0 ? marks : null;
    const original = sourceById.get(item.id); ensure(original, "Missing original source question: " + item.id);
    for (const [role, requests] of Object.entries(assetRequests(original.record, original.parent))) expected[role] = unique(requests.map(request => originalReference(request, role)));
    ensure(expected.question_images.length || expected.context_images.length, "Question has no original: " + item.id);
    expected.original_status = "available";
    ensure(isDeepStrictEqual(expected, preview.records[i]), "Preview question differs from current source: " + item.id);
  }
  ensure(!hasLocalPathValue({meta:preview.meta, questions:preview.records}), "Private filesystem path in public catalogue");
  const config = adapter.createConfig({questions:[], meta:{release:false}}), booklet = config.modules.referenceBooklet;
  const booklets = unique([...booklet.sections.map(file => booklet.assetPrefix + file), ...config.headerButtons.map(button => button.open)]);
  for (const relative of booklets) {
    const bundled = containedFile(previewRoot, relative), original = containedFile(report.source_roots.legacy, relative);
    ensure(hash(checkedBytes(bundled)) === hash(checkedBytes(original)), "Booklet differs from current donor: " + relative);
  }
  const staticFiles = RUNTIME.map(([, target]) => target).concat(booklets);
  validateBundle(previewRoot, preview.records, staticFiles);
  const redirect = checkedBytes(path.join(repositoryRoot, "example/chemistry-redirect.html"));
  ensure(!hasLocalPath(redirect.toString("utf8")), "Private filesystem path in redirect");
  // All validation happens before creating a candidate. A failed run never
  // replaces latest.json, and no directory is removed or overwritten.
  let existingAncestor = outputRoot;
  while (!fs.existsSync(existingAncestor)) existingAncestor = path.dirname(existingAncestor);
  const realWorkspace = fs.realpathSync(ROOT), realAncestor = fs.realpathSync(existingAncestor);
  ensure(realAncestor === realWorkspace || inside(realWorkspace, realAncestor), "Release output escapes workspace through a symlink");
  fs.mkdirSync(outputRoot, {recursive:true});
  ensure(inside(fs.realpathSync(ROOT), fs.realpathSync(outputRoot)), "Release output escapes workspace through a symlink");
  const buildId = new Date().toISOString().replace(/[:.]/g, "-") + "_" + crypto.randomBytes(4).toString("hex");
  const root = path.join(outputRoot, buildId), publicRoot = path.join(root, "ppqviewer");
  fs.mkdirSync(publicRoot, {recursive:true});
  const assets = [];
  function put(relative, bytes) {
    ensure(safeRelative(relative), "Unsafe release path");
    const target = path.join(root, relative); fs.mkdirSync(path.dirname(target), {recursive:true}); fs.writeFileSync(target, bytes, {flag:"wx"});
    assets.push({path:relative, sha256:hash(bytes), bytes:bytes.length});
  }
  for (const relative of unique(staticFiles.concat([...questionAssets.keys()]))) put("ppqviewer/" + relative, fs.readFileSync(containedFile(previewRoot, relative)));
  const meta = {...preview.meta, release:true, local_preview:false, reporting_enabled:true, build_id:buildId};
  put("ppqviewer/chemistry-catalogue.js", Buffer.from("window.CHEMISTRY_META = " + JSON.stringify(meta, null, 2) + ";\nwindow.CHEMISTRY_QUESTIONS = " + JSON.stringify(preview.records, null, 2) + ";\n"));
  put("ppq.html", redirect);
  const publicInfo = {schema_version:1, build_id:buildId, release:true, production_url:PRODUCTION_URL, parts:PARTS, assets};
  fs.writeFileSync(path.join(publicRoot, "build-info.json"), JSON.stringify(publicInfo, null, 2) + "\n", {flag:"wx"});
  validateBundle(publicRoot, preview.records, staticFiles.concat("chemistry-catalogue.js", "build-info.json"));
  const assembled = loadCatalogue(path.join(publicRoot, "chemistry-catalogue.js"));
  ensure(isDeepStrictEqual(assembled.records, preview.records) && isDeepStrictEqual(assembled.meta, meta), "Release changed preview data");
  for (const [file, fingerprint] of snapshots) ensure(fileHash(file) === fingerprint, "Input changed during release assembly: " + path.basename(file));
  for (const asset of assets) ensure(fileHash(containedFile(root, asset.path)) === asset.sha256, "Release asset changed during assembly");
  const privateReport = {schema_version:1, build_id:buildId, release:true, preview_build_id:latest.build_id, preview_root:previewRoot,
    catalogue:report.catalogue, catalogue_sha256:source.sha256, legacy_catalogue:legacyPath, legacy_catalogue_sha256:legacy.sha256,
    authorization:settings, parts:PARTS, originals:PARTS, unique_question_assets:questionAssets.size,
    source_fingerprints:verification.source_fingerprints, files:assets.length + 1, public_info_sha256:fileHash(path.join(publicRoot, "build-info.json"))};
  const reportPath = path.join(outputRoot, buildId + "-report.json");
  fs.writeFileSync(reportPath, JSON.stringify(privateReport, null, 2) + "\n", {flag:"wx"});
  const result = {root, public_root:publicRoot, build_id:buildId, release:true, report:reportPath, parts:PARTS, production_url:PRODUCTION_URL};
  const pointer = path.join(outputRoot, buildId + "-latest.tmp"); fs.writeFileSync(pointer, JSON.stringify(result, null, 2) + "\n", {flag:"wx"});
  fs.renameSync(pointer, path.join(outputRoot, "latest.json"));
  return {latest:result, report:privateReport, meta, questions:preview.records, buildInfo:publicInfo};
}
function parseArgs(args) {
  const options = {}, flags = {"--latest":"latestPath", "--verification":"verificationPath", "--settings":"settingsPath", "--output-root":"outputRoot"};
  for (let i = 0; i < args.length; i++) {
    ensure(flags[args[i]], "Unknown release assembly option: " + args[i]);
    ensure(args[i + 1] && !args[i + 1].startsWith("--"), "Missing option value: " + args[i]); options[flags[args[i]]] = args[++i];
  }
  return options;
}
if (require.main === module) {
  try { console.log(JSON.stringify(assemble(parseArgs(process.argv.slice(2))).latest, null, 2)); }
  catch (error) { console.error(error.message); process.exitCode = 1; }
}
module.exports = {assemble, parseArgs, safeRelative, RUNTIME, PRODUCTION_URL, PARTS};
